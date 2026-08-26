'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { getRtsMisDashboardData } from '@/lib/api/rts/rtsmisdashboard.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getRtsApplicationByNo } from '@/lib/api/rts/rtsapplication.service';
import {
  getApplicationDashboardCards,
  getApprovalApplicationDetails,
  getApprovalApplicationsPaged,
  getApprovalApplicationStages,
  getApprovalApplicationVerification,
  rejectApprovalApplication,
  revertApprovalApplication,
  verifyAndCorrectApproval,
  verifyAndSendToApprove,
  verifyApprovalDocuments,
} from '@/lib/api/rts/rts-application-approval.service';
import {
  getCurrentApprovalOfficerUserId,
  hasApprovalOfficerAccess,
} from '@/lib/utils/rts/approval-officer-access';
import { getUsernameFromCookieStore } from '@/lib/utils/cookie';
import { submitApplicationWorkflowAction } from '@/lib/api/rts/rts-workflow.service';
import type {
  RtsApplicationApprovalStage,
  RtsApplicationApprovalActionPayload,
  RtsApplicationApprovalFieldValuePayload,
  RtsApplicationApprovalStagesItem,
  RtsApplicationDocumentItem,
  RtsApplicationVerificationItem,
  RtsApplicationViewDetailsItem,
} from '@/types/rts/application-approval.types';
import {
  computeOverdueDays,
  computeRemainingDays,
} from '@/lib/utils/rts/application-grid';
import type { RtsMisDashboardResponse } from '@/types/rts/rtsmisdashboard.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';
import type { ApplicationWorkflowState, RtsApprovalFlowStageApiItem, WorkflowActionType } from '@/types/rts/workflow.types';
import type { ApplicationAnswerGroup, ApplicationAnswerItem } from '@/lib/utils/rts/application-answers';

export async function getRtsApplicationServicesAction(): Promise<RtsServiceApiItem[]> {
  try {
    return await getAllRtsServices();
  } catch (error) {
    console.error('Failed to fetch RTS application services:', error);
    return [];
  }
}

export async function getUserMisDashboardAction(): Promise<RtsMisDashboardResponse> {
  try {
    return await getRtsMisDashboardData({
      Flag: 'user',
      UpicId: 'AKLMC000010',
    });
  } catch (error) {
    console.error('Failed to fetch User MIS Dashboard:', error);

    return {
      status: false,
      message: 'Failed to fetch dashboard data.',
      data: {
        serviceWiseData: [],
        departmentWiseData: [],
        userApplicationDashboardData: [],
      },
    };
  }
}


export interface RtsApplicationDetailData {
  applicationNo: string;
  departmentId: number;
  departmentName: string | null;
  serviceId: number;
  serviceName: string | null;
  applicationStatus: string;
  answerGroups: ApplicationAnswerGroup[];
  workflow: ApplicationWorkflowState | null;
  approvalFlowStages?: RtsApprovalFlowStageApiItem[];
  approvalStages?: RtsApplicationApprovalStage[];
  completedStages?: number;
  totalApprovalStages?: number;
  documents?: RtsApplicationDocumentItem[];
  verification?: RtsApplicationVerificationItem | null;
}

export interface RtsApplicationProcessData {
  currentUserId: number | null;
  currentUserName: string | null;
  details: RtsApplicationViewDetailsItem | null;
  stages: RtsApplicationApprovalStagesItem | null;
  verification: RtsApplicationVerificationItem | null;
  errors: {
    details: string | null;
    stages: string | null;
    verification: string | null;
  };
}

export interface RtsApplicationFullDetailData {
  details: RtsApplicationViewDetailsItem | null;
  stages: RtsApplicationApprovalStagesItem | null;
  errors: {
    details: string | null;
    stages: string | null;
  };
}

export interface RtsApplicationApprovalActionResult {
  success: boolean;
  message?: string;
  errorCode?: 'OFFICER_ACCESS_DENIED';
}

type ApprovalActorResolution =
  | { authorized: true; updatedBy: number }
  | { authorized: false; result: RtsApplicationApprovalActionResult };

function getProcessSectionResult<T>(result: PromiseSettledResult<T>): { data: T | null; error: string | null } {
  if (result.status === 'fulfilled') {
    return { data: result.value, error: null };
  }

  return {
    data: null,
    error: result.reason instanceof Error ? result.reason.message : 'Unable to load this section.',
  };
}

/** Loads the three approval API responses needed by the read-only process drawer. */
export async function getRtsApplicationProcessDataAction(
  applicationId: number
): Promise<RtsApplicationProcessData> {
  const cookieStore = await cookies();
  const currentUserId = getCurrentApprovalOfficerUserId(cookieStore);
  const currentUserName = getUsernameFromCookieStore(cookieStore) ?? null;

  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return {
      currentUserId,
      currentUserName,
      details: null,
      stages: null,
      verification: null,
      errors: {
        details: 'Invalid application ID.',
        stages: 'Invalid application ID.',
        verification: 'Invalid application ID.',
      },
    };
  }

  const [detailsResult, stagesResult, verificationResult] = await Promise.allSettled([
    getApprovalApplicationDetails(applicationId),
    getApprovalApplicationStages(applicationId),
    getApprovalApplicationVerification(applicationId),
  ]);

  const details = getProcessSectionResult(detailsResult);
  const stages = getProcessSectionResult(stagesResult);
  const verification = getProcessSectionResult(verificationResult);

  return {
    currentUserId,
    currentUserName,
    details: details.data,
    stages: stages.data,
    verification: verification.data,
    errors: {
      details: details.error,
      stages: stages.error,
      verification: verification.error,
    },
  };
}

/** Loads read-only application details and workflow stages without officer permissions. */
export async function getRtsApplicationFullDetailDataAction(
  applicationId: number
): Promise<RtsApplicationFullDetailData> {
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return {
      details: null,
      stages: null,
      errors: {
        details: 'Invalid application ID.',
        stages: 'Invalid application ID.',
      },
    };
  }

  const [detailsResult, stagesResult] = await Promise.allSettled([
    getApprovalApplicationDetails(applicationId),
    getApprovalApplicationStages(applicationId),
  ]);
  const details = getProcessSectionResult(detailsResult);
  const stages = getProcessSectionResult(stagesResult);

  return {
    details: details.data,
    stages: stages.data,
    errors: {
      details: details.error,
      stages: stages.error,
    },
  };
}

async function resolveApprovalActor(applicationId: number): Promise<ApprovalActorResolution> {
  const cookieStore = await cookies();
  const currentUserId = getCurrentApprovalOfficerUserId(cookieStore);

  if (!currentUserId) {
    return {
      authorized: false,
      result: { success: false, errorCode: 'OFFICER_ACCESS_DENIED' },
    };
  }

  const verification = await getApprovalApplicationVerification(applicationId);
  if (!hasApprovalOfficerAccess(currentUserId, verification.officerId)) {
    return {
      authorized: false,
      result: { success: false, errorCode: 'OFFICER_ACCESS_DENIED' },
    };
  }

  return { authorized: true, updatedBy: currentUserId };
}

async function submitApprovalDecision(
  applicationId: number,
  remark: string,
  submit: (payload: RtsApplicationApprovalActionPayload) => Promise<{ message: string }>,
  status: string
): Promise<RtsApplicationApprovalActionResult> {
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return { success: false, message: 'Invalid application ID.' };
  }

  const normalizedRemark = remark.trim();
  if (!normalizedRemark) {
    return { success: false, message: 'Officer remark is required.' };
  }

  try {
    const actor = await resolveApprovalActor(applicationId);
    if (!actor.authorized) return actor.result;

    const result = await submit({
      isActive: true,
      updatedBy: actor.updatedBy,
      remark: normalizedRemark,
      status,
    });

    revalidatePath('/rts/dashboard/rts-applications');
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to update the application.',
    };
  }
}

export async function verifyApprovalDocumentsAction(
  applicationId: number,
  remark: string
): Promise<RtsApplicationApprovalActionResult> {
  return submitApprovalDecision(
    applicationId,
    remark,
    (payload) => verifyApprovalDocuments(applicationId, payload),
    'Verified'
  );
}

export async function verifyAndSendToApproveAction(
  applicationId: number,
  remark: string
): Promise<RtsApplicationApprovalActionResult> {
  return submitApprovalDecision(
    applicationId,
    remark,
    (payload) => verifyAndSendToApprove(applicationId, payload),
    'Approved'
  );
}

export async function rejectApprovalApplicationAction(
  applicationId: number,
  remark: string
): Promise<RtsApplicationApprovalActionResult> {
  return submitApprovalDecision(
    applicationId,
    remark,
    (payload) => rejectApprovalApplication(applicationId, payload),
    'Rejected'
  );
}

export async function revertApprovalApplicationAction(
  applicationId: number,
  remark: string
): Promise<RtsApplicationApprovalActionResult> {
  return submitApprovalDecision(
    applicationId,
    remark,
    (payload) => revertApprovalApplication(applicationId, payload),
    'Reverted'
  );
}

export async function verifyAndCorrectApprovalAction(
  applicationId: number,
  remark: string,
  fieldValue: RtsApplicationApprovalFieldValuePayload[]
): Promise<RtsApplicationApprovalActionResult> {
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return { success: false, message: 'Invalid application ID.' };
  }

  const normalizedRemark = remark.trim();
  if (!normalizedRemark) {
    return { success: false, message: 'Officer remark is required.' };
  }

  if (fieldValue.length === 0) {
    return { success: false, message: 'Update at least one field before submitting.' };
  }

  try {
    const actor = await resolveApprovalActor(applicationId);
    if (!actor.authorized) return actor.result;

    const result = await verifyAndCorrectApproval(applicationId, {
      isActive: true,
      updatedBy: actor.updatedBy,
      remark: normalizedRemark,
      status: 'Corrected',
      fieldValue: fieldValue.map((field) => ({ ...field, updatedBy: actor.updatedBy })),
    });

    revalidatePath('/rts/dashboard/rts-applications');
    return { success: true, message: result.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unable to update the application fields.',
    };
  }
}

/**
 * Fetches the application header + submitted answers (joined against field
 * definitions) + resolved workflow state for the "process application" screen.
 *
 * `GET /RTSApplication/{no}/workflow` is a spec'd backend endpoint that does not
 * exist yet, so that part degrades gracefully to a read-only view (no actions
 * available) rather than failing the whole page.
 */
export async function getApplicationDetailAction(
  applicationNo: string
): Promise<RtsApplicationDetailData | null> {
  const numericId = parseInt(applicationNo.replace(/\D/g, ''), 10);

  if (Number.isFinite(numericId) && numericId > 0) {
    try {
      const [viewDetails, stageDetails] = await Promise.all([
        getApprovalApplicationDetails(numericId).catch(() => null),
        getApprovalApplicationStages(numericId).catch(() => null),
      ]);

      if (viewDetails && viewDetails.applicationDetails && viewDetails.applicationDetails.length > 0) {
        const groupMap = new Map<string, ApplicationAnswerItem[]>();
        for (const field of viewDetails.applicationDetails) {
          const groupName = field.fieldGroup || 'General Details';
          if (!groupMap.has(groupName)) {
            groupMap.set(groupName, []);
          }
          groupMap.get(groupName)!.push({
            fieldDefinitionId: field.fieldDefinitionId,
            fieldCode: field.fieldCode,
            label: field.fieldLabel,
            fieldType: field.fieldType,
            displayValue: field.value ?? '—',
            documentGuid: null,
            displayOrder: field.displayOrder,
          });
        }

        const answerGroups: ApplicationAnswerGroup[] = Array.from(groupMap.entries()).map(
          ([groupTitle, answers]) => ({
            groupTitle,
            answers,
          })
        );

        let approvalFlowStages: RtsApprovalFlowStageApiItem[] = [];
        if (stageDetails && stageDetails.approvalStages.length > 0) {
          approvalFlowStages = stageDetails.approvalStages.map((stg) => ({
            id: stg.approvalFlowStageId,
            approvalFlowId: 0,
            stageOrder: stg.stageOrder,
            stageName: stg.stageName,
            employeeTypeId: 0,
            slaDays: 7,
            canVerifyDocument: true,
            canApprove: true,
            canReject: true,
            canReturn: true,
            canPay: false,
            isFinalStage: stg.stageOrder === stageDetails.totalApprovalStages,
            isActive: true,
            createdDate: '',
            updatedDate: null,
          }));
        }

        let applicationHeader = null;
        try {
          applicationHeader = await getRtsApplicationByNo(applicationNo);
        } catch {
          applicationHeader = null;
        }

        return {
          applicationNo,
          departmentId: applicationHeader?.departmentId ?? 0,
          departmentName: null,
          serviceId: applicationHeader?.serviceId ?? 0,
          serviceName: null,
          applicationStatus: applicationHeader?.applicationStatus ?? 'pending',
          answerGroups,
          workflow: null,
          approvalFlowStages,
          approvalStages: stageDetails?.approvalStages ?? [],
          completedStages: stageDetails?.completedStages ?? 0,
          totalApprovalStages: stageDetails?.totalApprovalStages ?? 0,
          documents: viewDetails.documents ?? [],
          verification: null,
        };
      }

      // If viewDetails was null (e.g. ID not found in ViewApplicationDetails API), return live stages if present without mock fallback
      return {
        applicationNo,
        departmentId: 0,
        departmentName: null,
        serviceId: 0,
        serviceName: null,
        applicationStatus: 'pending',
        answerGroups: [],
        workflow: null,
        approvalFlowStages: [],
        approvalStages: stageDetails?.approvalStages ?? [],
        completedStages: stageDetails?.completedStages ?? 0,
        totalApprovalStages: stageDetails?.totalApprovalStages ?? 0,
        documents: [],
        verification: null,
      };
    } catch (err) {
      console.error(`Error in getApplicationDetailAction for ${applicationNo}:`, err);
    }
  }

  return {
    applicationNo,
    departmentId: 0,
    departmentName: null,
    serviceId: 0,
    serviceName: null,
    applicationStatus: 'pending',
    answerGroups: [],
    workflow: null,
    approvalFlowStages: [],
    approvalStages: [],
    completedStages: 0,
    totalApprovalStages: 0,
    documents: [],
  };
}

export interface SubmitApplicationActionResult {
  success: boolean;
  message?: string;
  workflow?: ApplicationWorkflowState;
}

export interface ApplicationsDashboardKpis {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  overdue: number;
  reverted: number;
  today: number;
  dueToday: number;
  inProgress: number;
  pendingPercentage?: number;
  approvedPercentage?: number;
  rejectedPercentage?: number;
  revertedPercentage?: number;
  todayPercentage?: number;
  dueTodayPercentage?: number;
  overduePercentage?: number;
  /** Whether total/pending/approved/rejected/overdue came from the real admin API (vs. all-zero fallback). */
  isLive: boolean;
}

export interface AdminApplicationGridRow {
  applicationId: number;
  applicationNo: string;
  applicationDate: string;
  applicantName: string;
  serviceName: string;
  departmentName: string;
  currentStatus: string;
  currentStageName: string;
  remarks: string;
  expectedSlaDays: number;
  remainingDays: number | null;
  dueDays: number | null;
  overdueDays: number | null;
  lastUpdatedDate: string;
  assignedTo: string;
  assignedToName: string;
  assignedToRole: string;
}

export interface RtsApplicationsDashboardResult {
  kpis: ApplicationsDashboardKpis;
  rows: AdminApplicationGridRow[];
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface RtsApplicationsDashboardFilters {
  pageNumber: number;
  departmentId?: number;
  serviceId?: number;
  applicationNo?: string;
  status?: string;
}

function parseSlaDays(sla: string | number | undefined | null): number {
  if (typeof sla === 'number') return sla;
  if (!sla) return 7;
  const parsed = parseInt(String(sla), 10);
  return Number.isNaN(parsed) ? 7 : parsed;
}

/**
 * Real API combined dashboard action — fetches aggregated KPIs and full application grid
 * from GET /api/RTSApplication.
 */
export async function getRtsApplicationsDashboardAction(
  filters: RtsApplicationsDashboardFilters = { pageNumber: 1 }
): Promise<RtsApplicationsDashboardResult> {
  try {
    const [approvalRes, cards] = await Promise.all([
      getApprovalApplicationsPaged({
        pageNumber: filters.pageNumber,
        departmentId: filters.departmentId,
        serviceId: filters.serviceId,
        applicationNo: filters.applicationNo,
        status: filters.status,
      }).catch((err) => {
        console.error('Failed to fetch approval applications list:', err);
        return null;
      }),
      getApplicationDashboardCards().catch((err) => {
        console.error('Failed to fetch RTS application dashboard cards API:', err);
        return null;
      }),
    ]);

    const kpis: ApplicationsDashboardKpis = {
      total: cards?.totalApplications ?? approvalRes?.totalCount ?? 0,
      pending: cards?.pending ?? 0,
      approved: cards?.approved ?? 0,
      rejected: cards?.rejected ?? 0,
      overdue: cards?.overdueApplications ?? 0,
      reverted: cards?.reverted ?? 0,
      today: cards?.todayApplications ?? 0,
      dueToday: cards?.dueToday ?? 0,
      inProgress: 0,
      pendingPercentage: cards?.pendingPercentage ?? 0,
      approvedPercentage: cards?.approvedPercentage ?? 0,
      rejectedPercentage: cards?.rejectedPercentage ?? 0,
      revertedPercentage: cards?.revertedPercentage ?? 0,
      todayPercentage: cards?.todayPercentage ?? 0,
      dueTodayPercentage: cards?.dueTodayPercentage ?? 0,
      overduePercentage: cards?.overduePercentage ?? 0,
      isLive: true,
    };

    const rawApps = approvalRes?.applications ?? [];
    const rows: AdminApplicationGridRow[] = rawApps.map((app) => {
      const slaDays = parseSlaDays(app.sla);
      const isActionable =
        app.applicationStatus.toLowerCase() === 'pending' ||
        app.applicationStatus.toLowerCase() === 'submitted';

      const remainingDays =
        app.remainingDays != null
          ? app.remainingDays
          : isActionable
            ? computeRemainingDays(app.createdDate, slaDays)
            : null;

      const dueDays = app.dueDays ?? null;

      const overdueDays =
        app.overdueDays != null
          ? app.overdueDays
          : isActionable
            ? computeOverdueDays(app.createdDate, slaDays)
            : null;

      const remarks = app.remark || '—';
      const currentStageName = app.applicationStatus
        ? app.applicationStatus.charAt(0).toUpperCase() + app.applicationStatus.slice(1)
        : 'Pending';
      const assignedToName = app.userName?.trim() || '—';
      const assignedToStr = assignedToName;
      const assignedToRole = '';

      return {
        applicationId: app.id,
        applicationNo: app.applicationNo,
        applicationDate: app.createdDate,
        applicantName: app.applicantName?.trim() || '—',
        serviceName: app.serviceName || 'Unknown Service',
        departmentName: app.departmentName || 'Unknown Department',
        currentStatus: app.applicationStatus,
        currentStageName,
        remarks,
        expectedSlaDays: slaDays,
        remainingDays,
        dueDays,
        overdueDays,
        lastUpdatedDate: app.updatedDate || app.createdDate,
        assignedTo: assignedToStr,
        assignedToName,
        assignedToRole,
      };
    });

    return {
      kpis,
      rows,
      pagination: {
        pageNumber: approvalRes?.pageNumber ?? filters.pageNumber,
        pageSize: 10,
        totalCount: approvalRes?.totalCount ?? 0,
        totalPages: approvalRes?.totalPages ?? 1,
      },
    };
  } catch (error) {
    console.error('Failed to fetch RTS applications dashboard:', error);

    return {
      kpis: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        overdue: 0,
        reverted: 0,
        today: 0,
        dueToday: 0,
        inProgress: 0,
        isLive: false,
      },
      rows: [],
      pagination: { pageNumber: filters.pageNumber, pageSize: 10, totalCount: 0, totalPages: 1 },
    };
  }
}

export async function getApplicationsDashboardKpisAction(): Promise<ApplicationsDashboardKpis> {
  const result = await getRtsApplicationsDashboardAction();
  return result.kpis;
}

export async function getAdminApplicationsGridAction(): Promise<AdminApplicationGridRow[]> {
  const result = await getRtsApplicationsDashboardAction();
  return result.rows;
}

export async function getRtsApplicationFilterOptionsAction() {
  const [departments, services] = await Promise.all([
    getAllRtsDepartments(),
    getAllRtsServices(),
  ]);

  return { departments, services };
}

export async function submitApplicationActionAction(
  applicationNo: string,
  actionType: WorkflowActionType,
  remark: string
): Promise<SubmitApplicationActionResult> {
  try {
    const workflow = await submitApplicationWorkflowAction(applicationNo, {
      actionType,
      remark,
    });

    revalidatePath(`/rts/dashboard/rts-applications/${applicationNo}`);
    revalidatePath('/rts/dashboard/rts-applications');

    return { success: true, workflow };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit workflow action',
    };
  }
}

export async function getCertificatePreviewAction(
  applicationId: number,
  officerInputs?: Record<string, string>,
  customConditions?: string
) {
  try {
    const { getCertificatePreview } = await import('@/lib/api/rts/rtscertificate.service');
    const result = await getCertificatePreview({
      applicationId,
      officerInputs,
      customConditions,
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to generate certificate preview:', error);
    return { success: false, error: error?.message || 'Failed to generate preview' };
  }
}

export async function issueCertificateAction(
  applicationId: number,
  officerInputs?: Record<string, string>,
  customConditions?: string,
  actionRemark?: string,
  signAndApprove: boolean = true
) {
  try {
    const { issueCertificate } = await import('@/lib/api/rts/rtscertificate.service');
    const result = await issueCertificate({
      applicationId,
      officerInputs,
      customConditions,
      actionRemark,
      signAndApprove,
    });

    revalidatePath('/rts/dashboard/rts-applications');
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to issue certificate:', error);
    return { success: false, error: error?.message || 'Failed to issue certificate' };
  }
}

export async function getIssuedCertificateAction(applicationNo: string) {
  try {
    const { getIssuedCertificateByApplicationNo } = await import('@/lib/api/rts/rtscertificate.service');
    const result = await getIssuedCertificateByApplicationNo(applicationNo);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to fetch issued certificate:', error);
    return { success: false, error: error?.message || 'Certificate not found' };
  }
}

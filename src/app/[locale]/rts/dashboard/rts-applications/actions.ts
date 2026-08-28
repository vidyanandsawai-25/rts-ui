'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
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
import { getPaymentStatus, type PaymentStatusResult } from '@/lib/api/rts/rtspayment.service';
import type {
  RtsApplicationApprovalStage,
  RtsApplicationApprovalActionPayload,
  RtsApplicationApprovalFieldValuePayload,
  RtsApplicationApprovalStagesItem,
  RtsApplicationDocumentItem,
  RtsApprovalApplicationListItem,
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
  payment: PaymentStatusResult | null;
  errors: {
    details: string | null;
    stages: string | null;
    payment: string | null;
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
      payment: null,
      errors: {
        details: 'Invalid application ID.',
        stages: 'Invalid application ID.',
        payment: 'Invalid application ID.',
      },
    };
  }

  const [detailsResult, stagesResult, paymentResult] = await Promise.allSettled([
    getApprovalApplicationDetails(applicationId),
    getApprovalApplicationStages(applicationId),
    getPaymentStatus(applicationId),
  ]);
  const details = getProcessSectionResult(detailsResult);
  const stages = getProcessSectionResult(stagesResult);
  const payment = getProcessSectionResult(paymentResult);

  if (!payment.data) {
    console.error(`Failed to load payment status for full application detail ${applicationId}.`, payment.error);
  }

  return {
    details: details.data,
    stages: stages.data,
    payment: payment.data,
    errors: {
      details: details.error,
      stages: stages.error,
      payment: payment.error,
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
  source: 'approval' | 'mis';
  applicationId: number;
  applicationNo: string;
  applicationDate: string;
  applicantName: string;
  serviceName: string;
  serviceNameLocal: string | null;
  departmentName: string;
  departmentNameLocal: string | null;
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
  departmentName?: string;
  serviceId?: number;
  serviceName?: string;
  applicationNo?: string;
  status?: string;
  sortBy?: 'applicationNo' | 'CreatedDate' | 'ApplicantName' | 'ApplicationStatus' | 'UpdatedDate';
  sortOrder?: 'asc' | 'desc';
}

async function getAllApprovalApplications(
  filters: RtsApplicationsDashboardFilters
): Promise<{ applications: RtsApprovalApplicationListItem[]; totalCount: number } | null> {
  const requestPage = (pageNumber: number) => getApprovalApplicationsPaged({
    pageNumber,
    departmentId: filters.departmentId,
    serviceId: filters.serviceId,
    applicationNo: filters.applicationNo,
    status: filters.status,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const firstPage = await requestPage(1);
  const applications = [...firstPage.applications];

  // Keep concurrent backend requests bounded when a filter matches many pages.
  for (let startPage = 2; startPage <= firstPage.totalPages; startPage += 10) {
    const endPage = Math.min(startPage + 9, firstPage.totalPages);
    const pageNumbers = Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
    const pages = await Promise.all(pageNumbers.map(requestPage));
    pages.forEach((page) => applications.push(...page.applications));
  }

  return { applications, totalCount: firstPage.totalCount };
}

function compareNullable<T>(
  left: T | null | undefined,
  right: T | null | undefined,
  compare: (a: T, b: T) => number
): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return compare(left, right);
}

function sortDashboardRows(
  rows: AdminApplicationGridRow[],
  sortBy?: RtsApplicationsDashboardFilters['sortBy'],
  sortOrder?: RtsApplicationsDashboardFilters['sortOrder']
): AdminApplicationGridRow[] {
  const direction = sortBy ? (sortOrder === 'desc' ? -1 : 1) : -1;

  return [...rows].sort((left, right) => {
    let comparison = 0;
    switch (sortBy) {
      case 'applicationNo':
        comparison = left.applicationNo.localeCompare(right.applicationNo, undefined, { numeric: true });
        break;
      case 'ApplicantName':
        comparison = left.applicantName.localeCompare(right.applicantName, undefined, { sensitivity: 'base' });
        break;
      case 'ApplicationStatus':
        comparison = left.currentStatus.localeCompare(right.currentStatus, undefined, { sensitivity: 'base' });
        break;
      case 'UpdatedDate':
        comparison = compareNullable(left.lastUpdatedDate || null, right.lastUpdatedDate || null, (a, b) =>
          new Date(a).getTime() - new Date(b).getTime()
        );
        break;
      case 'CreatedDate':
      default:
        comparison = new Date(left.applicationDate).getTime() - new Date(right.applicationDate).getTime();
        break;
    }

    if (comparison !== 0) return comparison * direction;
    return right.applicationNo.localeCompare(left.applicationNo, undefined, { numeric: true });
  });
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
    const [approvalRes, cards, misResponse] = await Promise.all([
      getAllApprovalApplications(filters).catch((err) => {
        console.error('Failed to fetch approval applications list:', err);
        return null;
      }),
      getApplicationDashboardCards().catch((err) => {
        console.error('Failed to fetch RTS application dashboard cards API:', err);
        return null;
      }),
      getRtsMisDashboardData({
        Flag: 'RTSApplicationDashboard',
        UpicId: null,
        ApplicationNo: filters.applicationNo ?? null,
        DeparmentId: filters.departmentId ?? null,
        DeparmentName: filters.departmentName ?? null,
        ServiceName: filters.serviceName ?? null,
        ModuleName: null,
        FromDate: null,
        ToDate: null,
        pageNumber: 0,
        pageSize: 0,
        ApplicationStatus: filters.status ?? null,
      }).catch(() => null),
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
    const approvalRows: AdminApplicationGridRow[] = rawApps.map((app) => {
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
        source: 'approval',
        applicationId: app.id,
        applicationNo: app.applicationNo,
        applicationDate: app.createdDate,
        applicantName: app.applicantName?.trim() || '—',
        serviceName: app.serviceName || 'Unknown Service',
        serviceNameLocal: app.serviceNameLocal?.trim() || null,
        departmentName: app.departmentName || 'Unknown Department',
        departmentNameLocal: app.departmentNameLocal?.trim() || null,
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

    const misItems = misResponse?.status && Array.isArray(misResponse.data?.rtsApplicationDashboardDetails)
      ? misResponse.data.rtsApplicationDashboardDetails
      : [];
    const misRows: AdminApplicationGridRow[] = misItems.map((app) => ({
      source: 'mis',
      applicationId: 0,
      applicationNo: app.applicationNo,
      applicationDate: app.createdDate,
      applicantName: app.applicantName?.trim() || '—',
      serviceName: app.serviceName || 'Unknown Service',
      serviceNameLocal: app.serviceNameLocal?.trim() || null,
      departmentName: app.departmentName || 'Unknown Department',
      departmentNameLocal: app.departmentNameLocal?.trim() || null,
      currentStatus: app.applicationStatus || 'Pending',
      currentStageName: app.applicationStatus || 'Pending',
      remarks: app.remark?.trim() || '—',
      expectedSlaDays: typeof app.sla === 'number' ? app.sla : parseInt(String(app.sla ?? '0'), 10) || 0,
      remainingDays: app.remainingDays,
      dueDays: app.dueDays,
      overdueDays: app.overdueDays,
      lastUpdatedDate: app.updatedDate || app.createdDate,
      assignedTo: app.userName?.trim() || '—',
      assignedToName: app.userName?.trim() || '—',
      assignedToRole: '',
    }));

    const rowsByApplicationNo = new Map<string, AdminApplicationGridRow>();
    approvalRows.forEach((row) => rowsByApplicationNo.set(row.applicationNo.trim().toLowerCase(), row));
    misRows.forEach((row) => {
      const key = row.applicationNo.trim().toLowerCase();
      if (!rowsByApplicationNo.has(key)) rowsByApplicationNo.set(key, row);
    });

    const sortedRows = sortDashboardRows(
      Array.from(rowsByApplicationNo.values()),
      filters.sortBy,
      filters.sortOrder
    );
    const pageSize = 10;
    const totalCount = sortedRows.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const pageNumber = Math.min(Math.max(filters.pageNumber, 1), totalPages);
    const pageStart = (pageNumber - 1) * pageSize;
    const rows = sortedRows.slice(pageStart, pageStart + pageSize);

    return {
      kpis,
      rows,
      pagination: {
        pageNumber,
        pageSize,
        totalCount,
        totalPages,
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
    const { getCertificatePreview, getCertificateTemplateByServiceId } = await import('@/lib/api/rts/rtscertificate.service');
    const { getPaymentReceipt } = await import('@/lib/api/rts/rtspayment.service');

    const [previewRes, verificationRes, appDetailsRes, stagesRes, paymentReceiptRes] = await Promise.allSettled([
      getCertificatePreview({ applicationId, officerInputs, customConditions }),
      getApprovalApplicationVerification(applicationId),
      getApprovalApplicationDetails(applicationId),
      getApprovalApplicationStages(applicationId),
      getPaymentReceipt(applicationId),
    ]);

    const previewData = previewRes.status === 'fulfilled' ? previewRes.value : null;
    const verification = verificationRes.status === 'fulfilled' ? verificationRes.value : null;
    const appDetails = appDetailsRes.status === 'fulfilled' ? appDetailsRes.value : null;
    const stages = stagesRes.status === 'fulfilled' ? stagesRes.value : null;
    const paymentReceipt = paymentReceiptRes.status === 'fulfilled' ? paymentReceiptRes.value : null;

    const serviceId = verification?.serviceId;
    let template = null;
    if (serviceId) {
      try {
        template = await getCertificateTemplateByServiceId(serviceId);
      } catch (err) {
        console.warn("Could not fetch master template for preview service:", err);
      }
    }

    if (template && template.bodyContent) {
      let merged = template.bodyContent;
      const todayFormatted = new Date().toLocaleDateString('en-GB');
      const applicationNo = verification?.applicationNo || (appDetails as any)?.applicationNo || `RTS${applicationId}`;
      const serviceName = verification?.serviceName || template.serviceName || "आर.टी.एस. सेवा";
      const departmentName = template.departmentName || "लोकसेवा हक्क विभाग";

      // 1. Standard Core Application Metadata
      merged = merged.replace(/{{ApplicationNo}}/g, applicationNo);
      merged = merged.replace(/{{ApplicationDate}}/g, todayFormatted);
      merged = merged.replace(/{{ApprovalDate}}/g, todayFormatted);
      merged = merged.replace(/{{AppliedDate}}/g, todayFormatted);
      merged = merged.replace(/{{IssueDate}}/g, todayFormatted);
      merged = merged.replace(/{{CertificateNo}}/g, previewData?.sampleCertificateNo || `CERT/${applicationNo}`);
      merged = merged.replace(/{{ApplicantName}}/g, (previewData?.citizenAutoValues?.ApplicantName) || (appDetails as any)?.applicantName || "");
      merged = merged.replace(/{{ApplicantMobile}}/g, (previewData?.citizenAutoValues?.ApplicantMobile) || "");
      merged = merged.replace(/{{ServiceTitle}}/g, serviceName);
      merged = merged.replace(/{{ServiceName}}/g, serviceName);
      merged = merged.replace(/{{DepartmentName}}/g, departmentName);
      merged = merged.replace(/{{OfficerName}}/g, "सक्षम प्राधिकारी / सह. आयुक्त");
      merged = merged.replace(/{{ApprovedByOfficer}}/g, "सक्षम प्राधिकारी");
      merged = merged.replace(/{{OfficerDesignation}}/g, "सक्षम प्राधिकारी");

      // 2. Dynamic Form Fields (from rts.FieldValue & rts.FieldDefinition)
      let applicantAddress = "";
      if (appDetails?.applicationDetails && Array.isArray(appDetails.applicationDetails)) {
        for (const field of appDetails.applicationDetails) {
          const code = field.fieldCode;
          const val = field.value ?? "";

          if (code) {
            merged = merged.replace(new RegExp(`{{Field:${code}}}`, 'gi'), val);
            merged = merged.replace(new RegExp(`{{${code}}}`, 'gi'), val);
            merged = merged.replace(new RegExp(`\\[\\[${code}\\]\\]`, 'gi'), val);

            const lowerCode = code.toLowerCase();
            if (
              !applicantAddress &&
              (lowerCode.includes("address") || lowerCode.includes("patt") || lowerCode.includes("location") || lowerCode.includes("area"))
            ) {
              applicantAddress = val;
            }
          }

          if (field.fieldLabel) {
            merged = merged.replace(new RegExp(`{{${field.fieldLabel}}}`, 'gi'), val);
          }
          if (field.fieldLabelLocal) {
            merged = merged.replace(new RegExp(`{{${field.fieldLabelLocal}}}`, 'gi'), val);
          }
        }
      }

      merged = merged.replace(/{{ApplicantAddress}}/g, applicantAddress || "");

      // 3. Dynamic Officer Inputs & Workflow Data
      const officerData = officerInputs || {};
      const realPaymentReceiptNo =
        paymentReceipt?.receiptNo ||
        verification?.receiptNo ||
        officerData.ChallanNo ||
        officerData.ReceiptNo ||
        (verification?.isPaid || paymentReceipt ? `REC-${applicationNo}` : (verification?.feesRequired === false ? "शुल्क लागू नाही (विनामूल्य)" : "—"));

      const realOfficerStageRemark =
        stages?.approvalStages?.filter((s) => s.remark && s.remark.trim().length > 0)?.slice(-1)[0]?.remark ||
        officerData.InspectionRemark ||
        officerData.Remark ||
        "";

      if (!officerData.InspectionRemark && realOfficerStageRemark) {
        officerData.InspectionRemark = realOfficerStageRemark;
      }

      const orderNo = officerData.OrderNo || officerData.OutwardNo || `मनपा/आर.टी.एस./२०२६/${applicationNo}`;
      const validityPeriod = officerData.ValidityPeriod || "";

      merged = merged.replace(/\[\[OrderNo\]\]/g, orderNo);
      merged = merged.replace(/\[\[ValidityPeriod\]\]/g, validityPeriod || "—");
      merged = merged.replace(/\[\[ChallanNo\]\]/g, realPaymentReceiptNo);
      // Special Conditions Injection
      if (customConditions && customConditions.trim().length > 0) {
        if (merged.includes("[[SpecialConditions]]")) {
          merged = merged.replace(/\[\[SpecialConditions\]\]/g, customConditions);
        } else {
          const conditionLines = customConditions.split(/[\r\n]+/).filter(c => c.trim().length > 0);
          const formattedConditions = conditionLines.map(c => `<li>${c.trim()}</li>`).join("");

          if (merged.includes("</ol>")) {
            merged = merged.replace("</ol>", `${formattedConditions}</ol>`);
          } else if (merged.includes("</ul>")) {
            merged = merged.replace("</ul>", `${formattedConditions}</ul>`);
          } else {
            const extraBox = `
              <div class='extra-conditions-box my-2 p-2.5 bg-amber-50/70 border border-amber-300 rounded text-xs text-slate-800'>
                <div class='font-bold text-amber-900 mb-1'>विशेष अटी व शर्ती (Special Conditions):</div>
                <ul class='list-disc pl-5 space-y-0.5'>${formattedConditions}</ul>
              </div>
            `;
            if (merged.includes("{{DigitalSignature}}")) {
              merged = merged.replace("{{DigitalSignature}}", `${extraBox}\n{{DigitalSignature}}`);
            } else {
              merged += extraBox;
            }
          }
        }
      } else {
        merged = merged.replace(/\[\[SpecialConditions\]\]/g, "");
      }

      const standardLabels: Record<string, string> = {
        OrderNo: "जावक / आदेश क्र.",
        OutwardNo: "जावक क्र.",
        ValidityPeriod: "वैधता मुदत",
        ChallanNo: "शुल्क पावती क्र.",
        ReceiptNo: "पावती क्र.",
        InspectionRemark: "पडताळणी शेरा",
        Remark: "शेरा",
        SurveyNo: "सीटीएस / सर्व्हे क्र.",
        ZoneType: "मंजूर झोन",
      };

      const dynamicOfficerItems: { label: string; value: string }[] = [];
      const renderedKeys = new Set<string>();

      if (Object.keys(officerData).length > 0) {
        for (const [k, v] of Object.entries(officerData)) {
          if (v && typeof v === "string" && v.trim().length > 0 && !renderedKeys.has(k.toLowerCase())) {
            const lbl = standardLabels[k] || k;
            const finalVal = k.toLowerCase().includes("challan") || k.toLowerCase().includes("receipt") ? realPaymentReceiptNo : v;
            dynamicOfficerItems.push({ label: lbl, value: finalVal });
            renderedKeys.add(k.toLowerCase());
          }
        }
      }

      if (dynamicOfficerItems.length > 0) {
        const officerEntriesHtml = `
          <div class='officer-dynamic-entries my-2 p-2.5 bg-amber-50/90 border border-amber-400 rounded-md space-y-1 relative z-10 text-xs'>
            <div class='font-bold text-amber-950 flex items-center gap-1 text-[11px]'>
              <span>📝</span> <span>अधिकारी निर्णय व तपासणी तपशील (Officer Inputs & Decision):</span>
            </div>
            <div class='grid grid-cols-1 md:grid-cols-2 gap-1.5 pt-1'>
              ${dynamicOfficerItems
                .map(
                  (item) => `
                <div><span class='font-bold text-slate-800'>${item.label}:</span> <span class='text-slate-950 font-semibold'>${item.value}</span></div>
              `
                )
                .join("")}
            </div>
          </div>
        `;

        if (merged.includes("{{OfficerFieldsBlock}}")) {
          merged = merged.replace(/{{OfficerFieldsBlock}}/g, officerEntriesHtml);
        } else if (merged.includes("{{DigitalSignature}}")) {
          merged = merged.replace("{{DigitalSignature}}", `${officerEntriesHtml}\n{{DigitalSignature}}`);
        } else {
          merged += officerEntriesHtml;
        }
      } else {
        merged = merged.replace(/{{OfficerFieldsBlock}}/g, "");
      }

      // 4. Dynamic Scannable QR Code
      let dynamicDomain = "";
      try {
        const headerList = await headers();
        const host = headerList.get("x-forwarded-host") || headerList.get("host") || "localhost:3000";
        const protocol = headerList.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
        dynamicDomain = `${protocol}://${host}`;
      } catch {
        dynamicDomain = process.env.NEXT_PUBLIC_APP_URL || "";
      }

      const qrPayload = `${dynamicDomain}/mr/service/verify-certificate/${encodeURIComponent(applicationNo)}`;
      const qrCodeBlock = `
        <div class='inline-flex flex-col items-center justify-center p-1 bg-white border border-slate-300 rounded shadow-xs text-center' style='width: 76px;' title='${qrPayload}'>
          <div style='width: 60px; height: 60px;' class='flex items-center justify-center bg-white'>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrPayload)}" alt="QR Verification" class="w-full h-full object-contain" />
          </div>
          <span class='text-slate-700 mt-0.5 font-bold' style='font-size: 7px;'>Scan to Verify</span>
        </div>
      `;
      merged = merged.replace(/<div[^>]*class=['"][^'"]*inline-flex flex-col items-center[^'"]*['"][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, qrCodeBlock);
      merged = merged.replace(/{{QRCodeText}}/g, qrCodeBlock);
      merged = merged.replace(/{{QRCode}}/g, qrCodeBlock);

      merged = merged.replace(/{{Field:([^}]+)}}/g, '—');
      merged = merged.replace(/{{CustomConditionsList}}/g, '');

      return {
        success: true,
        data: {
          hasTemplate: true,
          templateId: template.id,
          templateName: template.templateName,
          mergedHtml: merged,
          citizenAutoValues: previewData?.citizenAutoValues || {},
          requiredOfficerFields: template.officerFields?.length ? template.officerFields : (previewData?.requiredOfficerFields || []),
          defaultConditions: template.defaultConditions?.length ? template.defaultConditions : (previewData?.defaultConditions || []),
          sampleCertificateNo: previewData?.sampleCertificateNo,
        },
      };
    }

    if (previewData) {
      return { success: true, data: previewData };
    }

    return { success: false, error: 'Failed to generate preview' };
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
    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error('Failed to issue certificate:', error);
    return { success: false, error: error?.message || 'Failed to issue certificate' };
  }
}

export async function getIssuedCertificateAction(applicationNo: string) {
  try {
    const { getIssuedCertificateByApplicationNo, getCertificateTemplateByServiceId } = await import('@/lib/api/rts/rtscertificate.service');
    const result = await getIssuedCertificateByApplicationNo(applicationNo);

    if (result && result.serviceId) {
      try {
        const { getPaymentReceipt } = await import('@/lib/api/rts/rtspayment.service');
        const [masterTemplate, appProcessData, verificationData, stagesData, paymentReceiptData] = await Promise.allSettled([
          getCertificateTemplateByServiceId(result.serviceId),
          result.applicationId ? getApprovalApplicationDetails(result.applicationId) : Promise.resolve(null),
          result.applicationId ? getApprovalApplicationVerification(result.applicationId) : Promise.resolve(null),
          result.applicationId ? getApprovalApplicationStages(result.applicationId) : Promise.resolve(null),
          result.applicationId ? getPaymentReceipt(result.applicationId) : Promise.resolve(null),
        ]);

        const template = masterTemplate.status === 'fulfilled' ? masterTemplate.value : null;
        const appDetails = appProcessData.status === 'fulfilled' ? appProcessData.value : null;
        const verification = verificationData.status === 'fulfilled' ? verificationData.value : null;
        const stages = stagesData.status === 'fulfilled' ? stagesData.value : null;
        const paymentReceipt = paymentReceiptData.status === 'fulfilled' ? paymentReceiptData.value : null;

        if (template && template.bodyContent) {
          let merged = template.bodyContent;
          const issueDateFormatted = result.issuedAt
            ? new Date(result.issuedAt).toLocaleDateString('en-GB')
            : new Date().toLocaleDateString('en-GB');

          // 1. Standard Core Application Metadata
          merged = merged.replace(/{{ApplicationNo}}/g, result.applicationNo || applicationNo);
          merged = merged.replace(/{{ApplicationDate}}/g, issueDateFormatted);
          merged = merged.replace(/{{ApprovalDate}}/g, issueDateFormatted);
          merged = merged.replace(/{{AppliedDate}}/g, issueDateFormatted);
          merged = merged.replace(/{{IssueDate}}/g, issueDateFormatted);
          merged = merged.replace(/{{CertificateNo}}/g, result.certificateNo || `CERT/${result.applicationNo}`);
          merged = merged.replace(/{{ApplicantName}}/g, result.applicantName || "");
          merged = merged.replace(/{{ApplicantMobile}}/g, result.applicantMobile || "");
          merged = merged.replace(/{{ServiceTitle}}/g, result.serviceName || "");
          merged = merged.replace(/{{ServiceName}}/g, result.serviceName || "");
          merged = merged.replace(/{{DepartmentName}}/g, result.departmentName || "");
          merged = merged.replace(
            /{{OfficerName}}/g,
            result.issuedByUserName
              ? `${result.issuedByUserName} (${result.issuedByOfficerDesignation || "सक्षम प्राधिकारी"})`
              : "सक्षम प्राधिकारी"
          );
          merged = merged.replace(/{{ApprovedByOfficer}}/g, result.issuedByUserName || "सक्षम प्राधिकारी");
          merged = merged.replace(/{{OfficerDesignation}}/g, result.issuedByOfficerDesignation || "सक्षम प्राधिकारी");

          // 2. Dynamic Form Fields (from rts.FieldValue & rts.FieldDefinition)
          let applicantAddress = "";
          if (appDetails?.applicationDetails && Array.isArray(appDetails.applicationDetails)) {
            for (const field of appDetails.applicationDetails) {
              const code = field.fieldCode;
              const val = field.value ?? "";

              if (code) {
                // Replace all variants: {{Field:Code}}, {{Code}}, [[Code]]
                merged = merged.replace(new RegExp(`{{Field:${code}}}`, 'gi'), val);
                merged = merged.replace(new RegExp(`{{${code}}}`, 'gi'), val);
                merged = merged.replace(new RegExp(`\\[\\[${code}\\]\\]`, 'gi'), val);

                // Detect address fields dynamically
                const lowerCode = code.toLowerCase();
                if (
                  !applicantAddress &&
                  (lowerCode.includes("address") || lowerCode.includes("patt") || lowerCode.includes("location") || lowerCode.includes("area"))
                ) {
                  applicantAddress = val;
                }
              }

              if (field.fieldLabel) {
                merged = merged.replace(new RegExp(`{{${field.fieldLabel}}}`, 'gi'), val);
              }
              if (field.fieldLabelLocal) {
                merged = merged.replace(new RegExp(`{{${field.fieldLabelLocal}}}`, 'gi'), val);
              }
            }
          }

          merged = merged.replace(/{{ApplicantAddress}}/g, applicantAddress || "");

          // 3. Dynamic Officer Inputs & Workflow Data (from officer approval + payment records + stages)
          let officerInputsData: Record<string, string> = {};
          if (result.digitalSignatureInfo) {
            try {
              const parsedSig = JSON.parse(result.digitalSignatureInfo);
              if (parsedSig && typeof parsedSig === "object") {
                officerInputsData = parsedSig.officerInputs || parsedSig;
              }
            } catch {
              // Plain text or legacy signature string
            }
          }

          // Real Receipt No from payment receipts table / verification
          const realPaymentReceiptNo =
            paymentReceipt?.receiptNo ||
            verification?.receiptNo ||
            officerInputsData.ChallanNo ||
            officerInputsData.ReceiptNo ||
            (verification?.isPaid || paymentReceipt ? `REC-${result.applicationNo}` : (verification?.feesRequired === false ? "शुल्क लागू नाही (विनामूल्य)" : "—"));

          // Real Officer Inspection Remark from approval workflow stages
          const realOfficerStageRemark =
            stages?.approvalStages?.filter((s) => s.remark && s.remark.trim().length > 0)?.slice(-1)[0]?.remark ||
            officerInputsData.InspectionRemark ||
            officerInputsData.Remark ||
            "";

          const orderNo = officerInputsData.OrderNo || officerInputsData.OutwardNo || result.certificateNo || result.applicationNo;
          const validityPeriod = officerInputsData.ValidityPeriod || "";

          merged = merged.replace(/\[\[OrderNo\]\]/g, orderNo);
          merged = merged.replace(/\[\[ValidityPeriod\]\]/g, validityPeriod || "—");
          merged = merged.replace(/\[\[ChallanNo\]\]/g, realPaymentReceiptNo);
          merged = merged.replace(/\[\[SpecialConditions\]\]/g, officerInputsData.SpecialConditions || "");

          // Dynamically map all officer fields from actual inputs
          const standardLabels: Record<string, string> = {
            OrderNo: "जावक / आदेश क्र.",
            OutwardNo: "जावक क्र.",
            ValidityPeriod: "वैधता मुदत",
            ChallanNo: "शुल्क पावती क्र.",
            ReceiptNo: "पावती क्र.",
            InspectionRemark: "पडताळणी शेरा",
            Remark: "शेरा",
          };

          const dynamicOfficerItems: { label: string; value: string }[] = [];
          const renderedKeys = new Set<string>();

          if (Object.keys(officerInputsData).length > 0) {
            for (const [k, v] of Object.entries(officerInputsData)) {
              if (v && typeof v === "string" && !renderedKeys.has(k.toLowerCase())) {
                const lbl = standardLabels[k] || k;
                const finalVal = k.toLowerCase().includes("challan") || k.toLowerCase().includes("receipt") ? realPaymentReceiptNo : v;
                dynamicOfficerItems.push({ label: lbl, value: finalVal });
                renderedKeys.add(k.toLowerCase());
              }
            }
          }

          // If no specific custom inputs, populate only existing dynamic values
          if (dynamicOfficerItems.length === 0) {
            if (orderNo) dynamicOfficerItems.push({ label: "जावक / आदेश क्र.", value: orderNo });
            if (validityPeriod) dynamicOfficerItems.push({ label: "वैधता मुदत", value: validityPeriod });
            if (realPaymentReceiptNo && realPaymentReceiptNo !== "—") dynamicOfficerItems.push({ label: "शुल्क पावती क्र.", value: realPaymentReceiptNo });
            if (realOfficerStageRemark) dynamicOfficerItems.push({ label: "पडताळणी शेरा", value: realOfficerStageRemark });
          }

          // Construct rich, official Officer Inputs Block if template has {{OfficerFieldsBlock}}
          if (dynamicOfficerItems.length > 0) {
            const officerEntriesHtml = `
              <div class='officer-dynamic-entries my-2 p-3 bg-amber-50/90 border border-amber-400 rounded-md space-y-1.5 relative z-10'>
                <div class='font-bold text-amber-950 flex items-center gap-1'>
                  <span>📝</span> <span>अधिकारी निर्णय व पडताळणी तपशील (Officer Inputs & Remarks):</span>
                </div>
                <div class='grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1'>
                  ${dynamicOfficerItems
                    .map(
                      (item) => `
                    <div><span class='font-bold text-slate-900'>${item.label}:</span> <span class='text-slate-950'>${item.value}</span></div>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `;
            merged = merged.replace(/{{OfficerFieldsBlock}}/g, officerEntriesHtml);
          } else {
            merged = merged.replace(/{{OfficerFieldsBlock}}/g, "");
          }

          // 4. Dynamic 100% Real Scannable QR Code linking to our internal verification page
          let dynamicDomain = "";
          try {
            const headerList = await headers();
            const host = headerList.get("x-forwarded-host") || headerList.get("host") || "localhost:3000";
            const protocol = headerList.get("x-forwarded-proto") || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
            dynamicDomain = `${protocol}://${host}`;
          } catch {
            dynamicDomain = process.env.NEXT_PUBLIC_APP_URL || "";
          }

          const certLookupKey = result.certificateGuid || result.applicationNo || applicationNo;
          const qrPayload = result.qrCodePayload || `${dynamicDomain}/mr/service/verify-certificate/${encodeURIComponent(certLookupKey)}`;

          const qrCodeBlock = `
            <div class='inline-flex flex-col items-center justify-center p-1 bg-white border border-slate-300 rounded shadow-xs text-center' style='width: 76px;' title='${qrPayload}'>
              <div style='width: 60px; height: 60px;' class='flex items-center justify-center bg-white'>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrPayload)}" alt="QR Verification" class="w-full h-full object-contain" />
              </div>
              <span class='text-slate-700 mt-0.5 font-bold' style='font-size: 7px;'>Scan to Verify</span>
            </div>
          `;
          merged = merged.replace(/<div[^>]*class=['"][^'"]*inline-flex flex-col items-center[^'"]*['"][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, qrCodeBlock);
          merged = merged.replace(/{{QRCodeText}}/g, qrCodeBlock);
          merged = merged.replace(/{{QRCode}}/g, qrCodeBlock);

          // Clean up any remaining unreplaced placeholder tags
          merged = merged.replace(/{{Field:([^}]+)}}/g, '—');
          merged = merged.replace(/{{CustomConditionsList}}/g, '');

          result.mergedHtmlContent = merged;
        }
      } catch (tmplErr) {
        console.warn("Could not load master template for issued cert, using stored mergedHtmlContent:", tmplErr);
      }
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Failed to fetch issued certificate:', error);
    return { success: false, error: error?.message || 'Certificate not found' };
  }
}

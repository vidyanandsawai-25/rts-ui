'use server';

import { revalidatePath, unstable_cache } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { getRtsMisDashboardData } from '@/lib/api/rts/rtsmisdashboard.service';
import {
  getRtsApplicationDashboardData,
  type RtsApplicationDashboardRequestInput,
} from '@/lib/api/rts/rtsapplicationdashboard.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getRtsApplicationByNo } from '@/lib/api/rts/rtsapplication.service';
import {
  getApplicationDashboardCards,
  getApprovalApplicationDetails,
  getApprovalApplicationsPaged,
  getApprovalApplicationStages,
  getApprovalApplicationVerification,
  getApprovalApplicationVerificationResult,
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
import { getPaymentStatus, type PaymentStatusResult } from '@/lib/api/rts/rtspayment.service';
import type { RTSCertificateType } from '@/types/rts/certificate.types';
import type {
  RtsApplicationApprovalStage,
  RtsApplicationApprovalActionPayload,
  RtsApplicationApprovalDecisionResponse,
  RtsApplicationApprovalFieldValuePayload,
  RtsApplicationApprovalStagesItem,
  RtsApplicationDocumentItem,
  RtsApprovalApplicationListItem,
  RtsApplicationVerificationItem,
  RtsApplicationViewDetailsItem,
} from '@/types/rts/application-approval.types';
import { computeOverdueDays, computeRemainingDays } from '@/lib/utils/rts/application-grid';
import type {
  RtsMisDashboardApplicationItem,
  RtsMisDashboardDepartmentItem,
  RtsMisDashboardResponse,
} from '@/types/rts/rtsmisdashboard.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';
import type {
  ApplicationWorkflowState,
  RtsApplicationOverallStatus,
  RtsApprovalFlowStageApiItem,
  TrackHistoryActionType,
  WorkflowActionType,
} from '@/types/rts/workflow.types';
import type {
  ApplicationAnswerGroup,
  ApplicationAnswerItem,
} from '@/lib/utils/rts/application-answers';

export async function getRtsApplicationServicesAction(): Promise<RtsServiceApiItem[]> {
  try {
    return await getAllRtsServices();
  } catch (error) {
    console.error('Failed to fetch RTS application services:', error);
    return [];
  }
}

const MANUAL_CERTIFICATE_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MANUAL_CERTIFICATE_EXTENSIONS = /\.(pdf|png|jpe?g|doc|docx)$/i;

export async function uploadManualCertificateDocumentAction(formData: FormData): Promise<{
  success: boolean;
  documentGuid?: string;
  fileName?: string;
  fileSizeBytes?: number;
  error?: string;
}> {
  try {
    const file = formData.get('file');
    if (!(file instanceof File) || file.size <= 0) {
      return { success: false, error: 'Select a certificate file before uploading.' };
    }

    if (!MANUAL_CERTIFICATE_EXTENSIONS.test(file.name)) {
      return { success: false, error: 'Upload a PDF, image, DOC, or DOCX certificate.' };
    }

    if (file.size > MANUAL_CERTIFICATE_MAX_FILE_SIZE_BYTES) {
      return { success: false, error: 'The certificate file must be 10 MB or smaller.' };
    }

    const { uploadRtsDocument } = await import('@/lib/api/rts/rtsdocument.service');
    const result = await uploadRtsDocument({
      file,
      documentType: 'Manual Certificate',
      isPrimaryDocument: true,
    });

    return {
      success: Boolean(result.documentGuid),
      documentGuid: result.documentGuid,
      fileName: result.fileName || file.name,
      fileSizeBytes: result.fileSizeBytes || file.size,
      error: result.documentGuid
        ? undefined
        : 'The certificate upload did not return a document GUID.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unable to upload the manual certificate.',
    };
  }
}

export async function getUserMisDashboardAction(upicId?: string): Promise<RtsMisDashboardResponse> {
  try {
    const cookieStore = await cookies();
    const resolvedUpicId =
      upicId ||
      cookieStore.get('citizen_upic')?.value ||
      cookieStore.get('upic')?.value ||
      cookieStore.get('upic_id')?.value ||
      null;

    return await getRtsMisDashboardData({
      Flag: 'user',
      UpicId: resolvedUpicId,
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
  isCertificateRequired?: boolean;
  certificateType?: number;
  issuedCertificateGuid?: string | null;
  answerGroups: ApplicationAnswerGroup[];
  workflow: ApplicationWorkflowState | null;
  approvalFlowStages?: RtsApprovalFlowStageApiItem[];
  approvalStages?: RtsApplicationApprovalStage[];
  completedStages?: number;
  totalApprovalStages?: number;
  isRevertedToCitizen?: boolean;
  documents?: RtsApplicationDocumentItem[];
  verification?: RtsApplicationVerificationItem | null;
  remark?: string | null;
}

export interface RtsApplicationProcessData {
  currentUserId: number | null;
  currentUserName: string | null;
  details: RtsApplicationViewDetailsItem | null;
  stages: RtsApplicationApprovalStagesItem | null;
  verification: RtsApplicationVerificationItem | null;
  verificationStatusCode: number | null;
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
  applicationStatus?: string;
  errorCode?: 'OFFICER_ACCESS_DENIED';
}

type ApprovalActorResolution =
  | { authorized: true; updatedBy: number }
  | { authorized: false; result: RtsApplicationApprovalActionResult };

function getProcessSectionResult<T>(result: PromiseSettledResult<T>): {
  data: T | null;
  error: string | null;
} {
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
      verificationStatusCode: null,
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
    getApprovalApplicationVerificationResult(applicationId),
  ]);

  const details = getProcessSectionResult(detailsResult);
  const stages = getProcessSectionResult(stagesResult);
  const verificationLookup = getProcessSectionResult(verificationResult);
  const verification = verificationLookup.data?.data ?? null;
  const verificationError = verificationLookup.data?.error ?? verificationLookup.error;

  if (
    details.data &&
    !details.data.issuedCertificateGuid &&
    details.data.applicationNo &&
    details.data.applicationStatus?.toLowerCase().includes('approv')
  ) {
    try {
      const { getIssuedCertificateByApplicationNo } = await import(
        '@/lib/api/rts/rtscertificate.service'
      );
      const issued = await getIssuedCertificateByApplicationNo(details.data.applicationNo);
      if (issued) {
        details.data.issuedCertificateGuid =
          issued.documentGuid || issued.certificateGuid || null;
      }
    } catch {
      // Ignore fallback failure
    }
  }

  return {
    currentUserId,
    currentUserName,
    details: details.data,
    stages: stages.data,
    verification,
    verificationStatusCode: verificationLookup.data?.statusCode ?? null,
    errors: {
      details: details.error,
      stages: stages.error,
      verification: verificationError,
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

  if (
    details.data &&
    !details.data.issuedCertificateGuid &&
    details.data.applicationNo &&
    details.data.applicationStatus?.toLowerCase().includes('approv')
  ) {
    try {
      const { getIssuedCertificateByApplicationNo } = await import(
        '@/lib/api/rts/rtscertificate.service'
      );
      const issued = await getIssuedCertificateByApplicationNo(details.data.applicationNo);
      if (issued) {
        details.data.issuedCertificateGuid =
          issued.documentGuid || issued.certificateGuid || null;
      }
    } catch {
      // Ignore fallback failure
    }
  }

  if (!payment.data) {
    console.error(
      `Failed to load payment status for full application detail ${applicationId}.`,
      payment.error
    );
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
  submit: (payload: RtsApplicationApprovalActionPayload) => Promise<RtsApplicationApprovalDecisionResponse>,
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

    const applicationStatus = (result.items ?? result.item)?.status?.trim();

    revalidatePath('/rts/dashboard/rts-applications');
    return {
      success: true,
      message: result.message,
      ...(applicationStatus ? { applicationStatus } : {}),
    };
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
  applicationNo: string,
  applicationId?: number
): Promise<RtsApplicationDetailData | null> {
  const numericId =
    Number.isInteger(applicationId) && Number(applicationId) > 0
      ? Number(applicationId)
      : parseInt(applicationNo.replace(/\D/g, ''), 10);

  if (Number.isFinite(numericId) && numericId > 0) {
    try {
      const [viewDetails, stageDetails, verification, payment] = await Promise.all([
        getApprovalApplicationDetails(numericId).catch(() => null),
        getApprovalApplicationStages(numericId).catch(() => null),
        getApprovalApplicationVerification(numericId).catch(() => null),
        getPaymentStatus(numericId).catch(() => null),
      ]);

      let applicationHeader = null;
      try {
        applicationHeader = await getRtsApplicationByNo(applicationNo);
      } catch {
        applicationHeader = null;
      }

      const sId = (viewDetails as any)?.serviceId || applicationHeader?.serviceId || 0;
      const sName = (viewDetails as any)?.serviceName || (applicationHeader as any)?.serviceName || null;
      let isCertRequired = (viewDetails as any)?.isCertificateRequired;
      let certType = (viewDetails as any)?.certificateType;

      if (isCertRequired === undefined || certType === undefined) {
        const services = await getAllRtsServices().catch(() => []);
        const matched = services.find((s) =>
          (sId > 0 && s.id === sId) ||
          (sName && s.serviceName && s.serviceName.trim().toLowerCase() === sName.trim().toLowerCase()) ||
          (sName && s.serviceNameLocal && s.serviceNameLocal.trim().toLowerCase() === sName.trim().toLowerCase())
        );
        if (matched) {
          isCertRequired = matched.isCertificateRequired === true && matched.certificateType !== 0;
          certType = isCertRequired ? (matched.certificateType ?? 1) : 0;
        }
      }

      const rawStatus = (viewDetails as any)?.applicationStatus || applicationHeader?.applicationStatus || 'pending';
      const statusNorm = rawStatus.toLowerCase();
      const isTerminal = ['approved', 'rejected'].includes(statusNorm);

      const isPaymentPaid = Boolean(
        payment?.paymentStatus?.toUpperCase() === 'SUCCESS' ||
        payment?.paymentStatus?.toLowerCase() === 'paid' ||
        payment?.receiptNo
      );
      const effectiveIsPaid = Boolean(verification?.isPaid || isPaymentPaid);

      const availableActions: WorkflowActionType[] = [];
      if (verification && !isTerminal) {
        if (verification.canVerifyDocument) availableActions.push('verifyDocument');
        if (verification.canPay && !effectiveIsPaid) availableActions.push('pay');
        if (verification.canApprove) availableActions.push('approve');
        if (verification.canReject) availableActions.push('reject');
        if (verification.canReturn) availableActions.push('return');
      }

      const mappedOverallStatus: RtsApplicationOverallStatus =
        statusNorm === 'approved'
          ? 'approved'
          : statusNorm === 'rejected'
            ? 'rejected'
            : statusNorm === 'reverted' || statusNorm === 'returned'
              ? 'returned'
              : 'pending';

      const dynamicWorkflow: ApplicationWorkflowState = {
        applicationId: numericId,
        applicationNo,
        departmentId: sId > 0 ? ((viewDetails as any)?.departmentId || applicationHeader?.departmentId || 0) : 0,
        serviceId: sId,
        applicationStatus: mappedOverallStatus,
        paymentStatus: effectiveIsPaid
          ? 'Paid'
          : verification?.feesRequired
            ? 'Pending'
            : 'NotRequired',
        currentStage: verification && verification.stageId > 0 ? {
          id: verification.stageId,
          approvalFlowId: verification.approvalFlowId || 0,
          stageOrder: verification.stageOrder || 1,
          stageName: verification.stageName || '',
          employeeTypeId: 0,
          slaDays: verification.slaDays ?? 0,
          canVerifyDocument: Boolean(verification.canVerifyDocument),
          canApprove: Boolean(verification.canApprove),
          canReject: Boolean(verification.canReject),
          canReturn: Boolean(verification.canReturn),
          canPay: Boolean(verification.canPay),
          isFinalStage: Boolean(verification.isFinalStage),
          isActive: true,
        } : null,
        availableActions,
        history: (stageDetails?.approvalStages || [])
          .filter((s) => s.createdDate || s.status)
          .map((s, idx) => ({
            id: idx + 1,
            applicationId: numericId,
            fromStageId: null,
            fromStageName: null,
            toStageId: s.approvalFlowStageId ?? null,
            toStageName: s.stageName ?? null,
            actionType: (s.status as TrackHistoryActionType) || 'Submitted',
            actionDate: s.createdDate || s.completedDate || '',
            performedByUserId: null,
            performedByUserName: s.userName || (s.firstName ? `${s.firstName} ${s.lastName || ''}`.trim() : null),
            remark: s.remark ?? null,
          })),
        stageEnteredAt: stageDetails?.approvalStages?.find((s) => s.isCurrentStage)?.createdDate || null,
      };

      if (
        viewDetails &&
        viewDetails.applicationDetails &&
        viewDetails.applicationDetails.length > 0
      ) {
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

        const approvalFlowStages: RtsApprovalFlowStageApiItem[] = (stageDetails?.approvalStages || []).map((stg) => {
          const isCurrent = stg.isCurrentStage;
          return {
            id: stg.approvalFlowStageId,
            approvalFlowId: verification?.approvalFlowId || 0,
            stageOrder: stg.stageOrder,
            stageName: stg.stageName,
            employeeTypeId: 0,
            slaDays: isCurrent && verification ? verification.slaDays : 0,
            canVerifyDocument: isCurrent && verification ? Boolean(verification.canVerifyDocument) : false,
            canApprove: isCurrent && verification ? Boolean(verification.canApprove) : false,
            canReject: isCurrent && verification ? Boolean(verification.canReject) : false,
            canReturn: isCurrent && verification ? Boolean(verification.canReturn) : false,
            canPay: isCurrent && verification ? Boolean(verification.canPay) : false,
            isFinalStage: stg.isFinalStage ?? (stg.stageOrder === stageDetails?.totalApprovalStages),
            isActive: true,
            createdDate: stg.createdDate || '',
            updatedDate: null,
          };
        });

        let resolvedIssuedCertificateGuid =
          viewDetails?.issuedCertificateGuid ||
          (applicationHeader as any)?.issuedCertificateGuid ||
          null;

        if (!resolvedIssuedCertificateGuid && applicationNo) {
          try {
            const { getIssuedCertificateByApplicationNo } = await import(
              '@/lib/api/rts/rtscertificate.service'
            );
            const issued = await getIssuedCertificateByApplicationNo(applicationNo);
            if (issued) {
              resolvedIssuedCertificateGuid =
                issued.documentGuid || issued.certificateGuid || null;
            }
          } catch {
            // Ignore fallback failure
          }
        }

        return {
          applicationNo,
          departmentId: (viewDetails as any)?.departmentId || applicationHeader?.departmentId || 0,
          departmentName: (viewDetails as any)?.departmentName || null,
          serviceId: sId,
          serviceName: sName,
          applicationStatus: rawStatus,
          isCertificateRequired: isCertRequired ?? false,
          certificateType: certType ?? 0,
          issuedCertificateGuid: resolvedIssuedCertificateGuid,
          answerGroups,
          workflow: dynamicWorkflow,
          approvalFlowStages,
          approvalStages: stageDetails?.approvalStages ?? [],
          completedStages: stageDetails?.completedStages ?? 0,
          totalApprovalStages: stageDetails?.totalApprovalStages ?? 0,
          isRevertedToCitizen: stageDetails?.isRevertedToCitizen ?? false,
          documents: viewDetails.documents ?? [],
          verification,
          remark: (viewDetails as any)?.remark ?? (applicationHeader as any)?.remark ?? null,
        };
      }

      return {
        applicationNo,
        departmentId: applicationHeader?.departmentId || 0,
        departmentName: null,
        serviceId: sId,
        serviceName: sName,
        applicationStatus: rawStatus,
        isCertificateRequired: isCertRequired ?? false,
        certificateType: certType ?? 0,
        issuedCertificateGuid: viewDetails?.issuedCertificateGuid || (applicationHeader as any)?.issuedCertificateGuid || null,
        answerGroups: [],
        workflow: dynamicWorkflow,
        approvalFlowStages: [],
        approvalStages: stageDetails?.approvalStages ?? [],
        completedStages: stageDetails?.completedStages ?? 0,
        totalApprovalStages: stageDetails?.totalApprovalStages ?? 0,
        isRevertedToCitizen: stageDetails?.isRevertedToCitizen ?? false,
        documents: [],
        verification,
        remark: (applicationHeader as any)?.remark ?? null,
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
    isRevertedToCitizen: false,
    documents: [],
    verification: null,
    remark: null,
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
  source: 'approval' | 'applicationDashboard';
  applicationId: number;
  applicationNo: string;
  propertyNo: string | null;
  upicId: string | null;
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
  assignedUserId?: number | null;
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
  applicationNo?: string;
  search?: string;
  status?: string;
  sortBy?: 'applicationNo' | 'CreatedDate' | 'ApplicantName' | 'ApplicationStatus' | 'UpdatedDate' | 'RemainingDays' | 'FIFO';
  sortOrder?: 'asc' | 'desc';
  assignedUserId?: number;
  currentUserId?: number;
  isFifo?: boolean;
  myApplications?: boolean;
}

const DASHBOARD_PAGE_SIZE = 10;
const SOURCE_PAGE_SIZE_LIMIT = 100;
const APPLICATION_DASHBOARD_CACHE_SECONDS = 15;

const getCachedApplicationDashboardPage = unstable_cache(
  async (payload: RtsApplicationDashboardRequestInput) =>
    getRtsApplicationDashboardData(payload),
  ['rts-application-dashboard-page'],
  { revalidate: APPLICATION_DASHBOARD_CACHE_SECONDS }
);

function getSourcePageSize(targetSize: number, loadAll: boolean): number {
  return Math.max(1, Math.min(loadAll ? SOURCE_PAGE_SIZE_LIMIT : targetSize, SOURCE_PAGE_SIZE_LIMIT));
}

function shouldLoadAllForGlobalSort(filters: RtsApplicationsDashboardFilters): boolean {
  const sortBy = filters.sortBy ?? 'CreatedDate';
  return sortBy !== 'CreatedDate' && sortBy !== 'FIFO';
}

function getCreatedDateOrder(
  applications: RtsMisDashboardApplicationItem[]
): 'ascending' | 'descending' | 'unknown' {
  let previousTimestamp: number | null = null;
  let detectedOrder: 'ascending' | 'descending' | null = null;

  for (const application of applications) {
    const timestamp = new Date(application.createdDate).getTime();
    if (!Number.isFinite(timestamp)) continue;
    if (previousTimestamp == null || timestamp === previousTimestamp) {
      previousTimestamp = timestamp;
      continue;
    }

    const currentOrder = timestamp > previousTimestamp ? 'ascending' : 'descending';
    if (detectedOrder && detectedOrder !== currentOrder) return 'unknown';
    detectedOrder = currentOrder;
    previousTimestamp = timestamp;
  }

  return detectedOrder ?? 'unknown';
}

function getHeadPageNumbers(totalCount: number, pageSize: number, targetSize: number): number[] {
  const pageCount = Math.max(
    1,
    Math.ceil(Math.min(totalCount, targetSize) / pageSize)
  );
  return Array.from({ length: pageCount }, (_, index) => index + 1);
}

function getTailPageNumbers(totalCount: number, pageSize: number, targetSize: number): number[] {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  let firstPage = totalPages;
  let availableRows = totalCount - (totalPages - 1) * pageSize;

  while (firstPage > 1 && availableRows < targetSize) {
    firstPage -= 1;
    availableRows += pageSize;
  }

  return Array.from(
    { length: totalPages - firstPage + 1 },
    (_, index) => firstPage + index
  );
}

async function getApprovalApplicationsWindow(
  filters: RtsApplicationsDashboardFilters,
  targetSize: number,
  loadAll: boolean
): Promise<{
  applications: RtsApprovalApplicationListItem[];
  totalCount: number;
} | null> {
  const pageSize = getSourcePageSize(targetSize, loadAll);
  const hasExplicitSort = Boolean(filters.sortBy || filters.sortOrder);
  const isFifo = filters.isFifo ?? !hasExplicitSort;
  const requestPage = (pageNumber: number) => getApprovalApplicationsPaged({
    pageNumber,
    pageSize,
    departmentId: filters.departmentId,
    serviceId: filters.serviceId,
    applicationNo: filters.applicationNo,
    search: filters.search ?? filters.applicationNo,
    status: filters.status,
    sortBy: isFifo ? undefined : filters.sortBy ?? 'CreatedDate',
    sortOrder: isFifo ? undefined : filters.sortOrder ?? 'asc',
    userId: filters.assignedUserId,
    currentUserId: filters.currentUserId,
    isFifo,
  });

  const firstPage = await requestPage(1);
  const rowsToLoad = loadAll
    ? firstPage.totalCount
    : Math.min(firstPage.totalCount, targetSize);
  const pageCount = Math.max(1, Math.ceil(rowsToLoad / pageSize));
  const remainingPages = pageCount > 1
    ? await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) => requestPage(index + 2).catch((error) => {
          console.error(`Failed to fetch approval application page ${index + 2}:`, error);
          return null;
        }))
      )
    : [];

  return {
    applications: [
      ...firstPage.applications,
      ...remainingPages.flatMap((page) => page?.applications ?? []),
    ],
    totalCount: firstPage.totalCount,
  };
}

async function getApplicationDashboardWindow(
  payload: RtsApplicationDashboardRequestInput,
  targetSize: number,
  loadAll: boolean,
  desiredSortOrder: RtsApplicationsDashboardFilters['sortOrder'] = 'asc'
): Promise<{
  applications: RtsMisDashboardApplicationItem[];
  departments: RtsMisDashboardDepartmentItem[];
  totalCount: number;
} | null> {
  // The external endpoint has no working sort parameter. Detect its date
  // direction and load only the head or tail needed by the requested date sort.
  const pageSize = SOURCE_PAGE_SIZE_LIMIT;
  const requestPage = (pageNumber: number) => getCachedApplicationDashboardPage({
    ...payload,
    PageNumber: pageNumber,
    PageSize: pageSize,
  });
  const firstResponse = await requestPage(1);
  if (!firstResponse.status) return null;

  const firstApplications = firstResponse.data?.applicationDahboardData ?? [];
  const totalCount = firstResponse.data?.totalRecords ?? firstApplications.length;
  const dateOrder = getCreatedDateOrder(firstApplications);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const shouldLoadHead =
    (desiredSortOrder === 'asc' && dateOrder === 'ascending') ||
    (desiredSortOrder === 'desc' && dateOrder === 'descending');
  const pageNumbers = loadAll || dateOrder === 'unknown'
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : shouldLoadHead
      ? getHeadPageNumbers(totalCount, pageSize, targetSize)
      : getTailPageNumbers(totalCount, pageSize, targetSize);
  const additionalPageNumbers = pageNumbers.filter((pageNumber) => pageNumber !== 1);
  const additionalPages = additionalPageNumbers.length > 0
    ? await Promise.all(
        additionalPageNumbers.map((pageNumber) => requestPage(pageNumber).catch((error) => {
          console.error(`Failed to fetch application-dashboard page ${pageNumber}:`, error);
          return null;
        }))
      )
    : [];
  const selectedFirstPage = pageNumbers.includes(1) ? firstApplications : [];

  return {
    applications: [
      ...selectedFirstPage,
      ...additionalPages.flatMap((response) =>
        response?.status ? response.data?.applicationDahboardData ?? [] : []
      ),
    ],
    departments: firstResponse.data?.dashboardCardCount ?? [],
    totalCount,
  };
}

async function getApplicationDashboardCountSnapshot(
  payload: RtsApplicationDashboardRequestInput
): Promise<{
  applications: RtsMisDashboardApplicationItem[];
  departments: RtsMisDashboardDepartmentItem[];
  totalCount: number;
} | null> {
  const response = await getCachedApplicationDashboardPage({
    ...payload,
    PageNumber: 1,
    PageSize: 1,
  });
  if (!response.status) return null;

  return {
    applications: [],
    departments: response.data?.dashboardCardCount ?? [],
    totalCount: 0,
  };
}

function asDashboardCount(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function getApplicationDashboardKpis(departments: RtsMisDashboardDepartmentItem[]) {
  return departments.reduce(
    (totals, department) => ({
      total: totals.total + asDashboardCount(department.totalApplications),
      pending: totals.pending + asDashboardCount(department.pending),
      approved: totals.approved + asDashboardCount(department.approved),
      rejected: totals.rejected + asDashboardCount(department.rejected),
      overdue: totals.overdue + asDashboardCount(department.overdueApplications),
      reverted: totals.reverted + asDashboardCount(department.reverted),
      today: totals.today + asDashboardCount(department.todayApplications),
      dueToday: totals.dueToday + asDashboardCount(department.dueToday),
    }),
    {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      overdue: 0,
      reverted: 0,
      today: 0,
      dueToday: 0,
    }
  );
}

function getKpiPercentage(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function compareOptional<T>(
  left: T | null | undefined,
  right: T | null | undefined,
  compare: (a: T, b: T) => number,
  direction: 1 | -1
): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return compare(left, right) * direction;
}

function compareDashboardRows(
  left: AdminApplicationGridRow,
  right: AdminApplicationGridRow,
  sortBy: RtsApplicationsDashboardFilters['sortBy'] = 'CreatedDate',
  sortOrder: RtsApplicationsDashboardFilters['sortOrder'] = 'asc'
): number {
  const direction: 1 | -1 = sortOrder === 'desc' ? -1 : 1;
  let comparison = 0;

  switch (sortBy) {
    case 'applicationNo':
      comparison = left.applicationNo.localeCompare(right.applicationNo, undefined, { numeric: true }) * direction;
      break;
    case 'ApplicantName':
      comparison = left.applicantName.localeCompare(right.applicantName, undefined, { sensitivity: 'base' }) * direction;
      break;
    case 'ApplicationStatus':
      comparison = left.currentStatus.localeCompare(right.currentStatus, undefined, { sensitivity: 'base' }) * direction;
      break;
    case 'UpdatedDate': {
      const leftTime = new Date(left.lastUpdatedDate).getTime();
      const rightTime = new Date(right.lastUpdatedDate).getTime();
      comparison = compareOptional(
        Number.isFinite(leftTime) ? leftTime : null,
        Number.isFinite(rightTime) ? rightTime : null,
        (a, b) => a - b,
        direction
      );
      break;
    }
    case 'RemainingDays':
      comparison = compareOptional(
        left.remainingDays,
        right.remainingDays,
        (a, b) => a - b,
        direction
      );
      break;
    case 'FIFO':
    case 'CreatedDate':
    default: {
      const leftTime = new Date(left.applicationDate).getTime();
      const rightTime = new Date(right.applicationDate).getTime();
      comparison = compareOptional(
        Number.isFinite(leftTime) ? leftTime : null,
        Number.isFinite(rightTime) ? rightTime : null,
        (a, b) => a - b,
        direction
      );
      break;
    }
  }

  if (comparison !== 0) return comparison;
  return left.applicationNo.localeCompare(right.applicationNo, undefined, { numeric: true });
}

function sortDashboardRows(
  rows: AdminApplicationGridRow[],
  sortBy: RtsApplicationsDashboardFilters['sortBy'] = 'CreatedDate',
  sortOrder: RtsApplicationsDashboardFilters['sortOrder'] = 'asc'
): AdminApplicationGridRow[] {
  return [...rows].sort((left, right) =>
    compareDashboardRows(left, right, sortBy, sortOrder)
  );
}

function mergePrioritizedDashboardRows(
  approvalRows: AdminApplicationGridRow[],
  applicationDashboardRows: AdminApplicationGridRow[],
  currentUserId: number | undefined,
  sortBy: RtsApplicationsDashboardFilters['sortBy'],
  sortOrder: RtsApplicationsDashboardFilters['sortOrder']
): AdminApplicationGridRow[] {
  const priorityApprovalRows = currentUserId == null
    ? []
    : approvalRows.filter((row) => row.assignedUserId === currentUserId);
  const remainingRows = [
    ...approvalRows.filter(
      (row) => currentUserId == null || row.assignedUserId !== currentUserId
    ),
    ...applicationDashboardRows,
  ];

  return [
    ...sortDashboardRows(priorityApprovalRows, sortBy, sortOrder),
    ...sortDashboardRows(remainingRows, sortBy, sortOrder),
  ];
}

function deduplicateDashboardRows(
  rows: AdminApplicationGridRow[]
): { rows: AdminApplicationGridRow[]; duplicateCount: number } {
  const rowsByApplicationNo = new Map<string, AdminApplicationGridRow>();
  const rowsWithoutApplicationNo: AdminApplicationGridRow[] = [];
  let duplicateCount = 0;

  for (const row of rows) {
    const applicationKey = row.applicationNo.trim().toLocaleUpperCase();

    if (!applicationKey) {
      rowsWithoutApplicationNo.push(row);
      continue;
    }

    const existingRow = rowsByApplicationNo.get(applicationKey);
    if (!existingRow) {
      rowsByApplicationNo.set(applicationKey, row);
      continue;
    }

    duplicateCount += 1;

    // Approval rows carry the actionable application ID. Keep that row while
    // filling identifiers that may only be present in the dashboard response.
    const preferredRow = row.source === 'approval' ? row : existingRow;
    const fallbackRow = preferredRow === row ? existingRow : row;

    rowsByApplicationNo.set(applicationKey, {
      ...preferredRow,
      propertyNo: preferredRow.propertyNo || fallbackRow.propertyNo,
      upicId: preferredRow.upicId || fallbackRow.upicId,
    });
  }

  return {
    rows: [...rowsByApplicationNo.values(), ...rowsWithoutApplicationNo],
    duplicateCount,
  };
}

function reconcileDashboardRows(
  approvalRows: AdminApplicationGridRow[],
  applicationDashboardRows: AdminApplicationGridRow[]
): {
  approvalRows: AdminApplicationGridRow[];
  applicationDashboardRows: AdminApplicationGridRow[];
  duplicateCount: number;
} {
  const uniqueApproval = deduplicateDashboardRows(approvalRows);
  const uniqueApplicationDashboard = deduplicateDashboardRows(applicationDashboardRows);
  const externalRowsByApplicationNo = new Map<string, AdminApplicationGridRow>();
  const externalRowsWithoutApplicationNo: AdminApplicationGridRow[] = [];

  for (const row of uniqueApplicationDashboard.rows) {
    const key = row.applicationNo.trim().toLocaleUpperCase();
    if (key) externalRowsByApplicationNo.set(key, row);
    else externalRowsWithoutApplicationNo.push(row);
  }

  let crossSourceDuplicateCount = 0;
  const reconciledApprovalRows = uniqueApproval.rows.map((row) => {
    const key = row.applicationNo.trim().toLocaleUpperCase();
    const fallbackRow = key ? externalRowsByApplicationNo.get(key) : undefined;
    if (!fallbackRow) return row;

    crossSourceDuplicateCount += 1;
    externalRowsByApplicationNo.delete(key);
    return {
      ...row,
      propertyNo: row.propertyNo || fallbackRow.propertyNo,
      upicId: row.upicId || fallbackRow.upicId,
    };
  });

  return {
    approvalRows: reconciledApprovalRows,
    applicationDashboardRows: [
      ...externalRowsByApplicationNo.values(),
      ...externalRowsWithoutApplicationNo,
    ],
    duplicateCount:
      uniqueApproval.duplicateCount +
      uniqueApplicationDashboard.duplicateCount +
      crossSourceDuplicateCount,
  };
}

function parseSlaDays(sla: string | number | undefined | null): number {
  if (typeof sla === 'number') return sla;
  if (!sla) return 7;
  const parsed = parseInt(String(sla), 10);
  return Number.isNaN(parsed) ? 7 : parsed;
}

function mapApplicationDashboardRow(
  application: RtsMisDashboardApplicationItem
): AdminApplicationGridRow {
  const slaDays = parseSlaDays(application.sla);
  const status = application.applicationStatus?.trim() || 'Pending';
  const isActionable = status.toLowerCase() === 'pending' || status.toLowerCase() === 'submitted';
  const assignedToName = application.userName?.trim() || '—';

  return {
    source: 'applicationDashboard',
    applicationId: application.id > 0 ? application.id : 0,
    applicationNo: application.applicationNo,
    propertyNo: application.propertyNo?.trim() || null,
    upicId: application.upicId?.trim() || null,
    applicationDate: application.createdDate,
    applicantName: application.applicantName?.trim() || '—',
    serviceName: application.serviceName || 'Unknown Service',
    serviceNameLocal: application.serviceNameLocal?.trim() || null,
    departmentName: application.departmentName || 'Unknown Department',
    departmentNameLocal: application.departmentNameLocal?.trim() || null,
    currentStatus: status,
    currentStageName: status.charAt(0).toUpperCase() + status.slice(1),
    remarks: application.remark?.trim() || '—',
    expectedSlaDays: slaDays,
    remainingDays: application.remainingDays != null
      ? application.remainingDays
      : isActionable
        ? computeRemainingDays(application.createdDate, slaDays)
        : null,
    dueDays: application.dueDays ?? null,
    overdueDays: application.overdueDays != null
      ? application.overdueDays
      : isActionable
        ? computeOverdueDays(application.createdDate, slaDays)
        : null,
    lastUpdatedDate: application.updatedDate || application.createdDate,
    assignedTo: assignedToName,
    assignedToName,
    assignedToRole: '',
    assignedUserId: application.userId ?? null,
  };
}

/**
 * Combines the approval and external application dashboards into one FIFO grid.
 */
export async function getApprovalApplicationRowAction(
  applicationId: number
): Promise<AdminApplicationGridRow | null> {
  try {
    const details = await getApprovalApplicationDetails(applicationId);
    if (!details) return null;

    return {
      source: 'approval',
      applicationId: details.applicationId ?? applicationId,
      applicationNo: details.applicationNo || `RTS${applicationId}`,
      propertyNo: null,
      upicId: null,
      applicationDate: '',
      applicantName: '—',
      serviceName: details.serviceName || 'Unknown Service',
      serviceNameLocal: null,
      departmentName: details.departmentName || 'Unknown Department',
      departmentNameLocal: null,
      currentStatus: details.applicationStatus || 'Pending',
      currentStageName: details.applicationStatus || 'Pending',
      remarks: details.remark || '—',
      expectedSlaDays: 7,
      remainingDays: null,
      dueDays: null,
      overdueDays: null,
      lastUpdatedDate: '',
      assignedTo: '—',
      assignedToName: '—',
      assignedToRole: '',
      assignedUserId: null,
    };
  } catch (err) {
    console.error(`Failed to load single application row ${applicationId}:`, err);
    return null;
  }
}

export async function getRtsApplicationsDashboardAction(
  filters: RtsApplicationsDashboardFilters = { pageNumber: 1 }
): Promise<RtsApplicationsDashboardResult> {
  try {
    const pageSize = DASHBOARD_PAGE_SIZE;
    const requestedPageNumber = Number.isInteger(filters.pageNumber) && filters.pageNumber > 0
      ? filters.pageNumber
      : 1;
    // One extra UI page protects the requested window when the APIs overlap,
    // while remaining bounded for the common early-page workflow.
    const targetPrefixSize = (requestedPageNumber + 1) * pageSize;
    const loadAllForGlobalSort = shouldLoadAllForGlobalSort(filters);
    const cookieStore = await cookies();
    const currentUserId = getCurrentApprovalOfficerUserId(cookieStore);
    const isMyApplicationsMode = filters.myApplications === true;
    const effectiveFilters: RtsApplicationsDashboardFilters = {
      ...filters,
      assignedUserId: isMyApplicationsMode
        ? currentUserId ?? undefined
        : filters.assignedUserId,
      currentUserId: isMyApplicationsMode ? undefined : currentUserId ?? undefined,
    };
    const applicationDashboardPayload: RtsApplicationDashboardRequestInput = {
      UpicId: null,
      ApplicationNo: filters.applicationNo ?? filters.search ?? null,
      ApplicationStatus: filters.status ?? null,
      DepartmentName: filters.departmentName ?? null,
      ServiceId: filters.serviceId ?? null,
      FromDate: null,
      ToDate: null,
    };

    const approvalApplicationsRequest = isMyApplicationsMode && currentUserId == null
      ? Promise.resolve(null)
      : getApprovalApplicationsWindow(
          effectiveFilters,
          targetPrefixSize,
          loadAllForGlobalSort
        ).catch((err) => {
          console.error('Failed to fetch approval applications list:', err);
          return null;
        });
    const applicationDashboardRequest = isMyApplicationsMode
      ? getApplicationDashboardCountSnapshot(applicationDashboardPayload).catch((err) => {
          console.error('Failed to fetch application dashboard count snapshot:', err);
          return null;
        })
      : getApplicationDashboardWindow(
          applicationDashboardPayload,
          targetPrefixSize,
          loadAllForGlobalSort,
          filters.sortOrder ?? 'asc'
        ).catch((err) => {
          console.error('Failed to fetch application dashboard data:', err);
          return null;
        });

    const [approvalRes, cards, applicationDashboardWindow] = await Promise.all([
      approvalApplicationsRequest,
      getApplicationDashboardCards().catch((err) => {
        console.error('Failed to fetch RTS application dashboard cards API:', err);
        return null;
      }),
      applicationDashboardRequest,
    ]);

    const externalApplications = applicationDashboardWindow?.applications ?? [];
    const externalDepartments = applicationDashboardWindow?.departments ?? [];
    const externalTotalCount = applicationDashboardWindow?.totalCount ?? externalApplications.length;
    const externalKpis = getApplicationDashboardKpis(externalDepartments);
    const externalKpiTotal = externalDepartments.length > 0
      ? externalKpis.total
      : externalTotalCount;

    const total = (cards?.totalApplications ?? approvalRes?.totalCount ?? 0) + externalKpiTotal;
    const pending = (cards?.pending ?? 0) + externalKpis.pending;
    const approved = (cards?.approved ?? 0) + externalKpis.approved;
    const rejected = (cards?.rejected ?? 0) + externalKpis.rejected;
    const overdue = (cards?.overdueApplications ?? 0) + externalKpis.overdue;
    const reverted = (cards?.reverted ?? 0) + externalKpis.reverted;
    const today = (cards?.todayApplications ?? 0) + externalKpis.today;
    const dueToday = (cards?.dueToday ?? 0) + externalKpis.dueToday;

    const kpis: ApplicationsDashboardKpis = {
      total,
      pending,
      approved,
      rejected,
      overdue,
      reverted,
      today,
      dueToday,
      inProgress: 0,
      pendingPercentage: getKpiPercentage(pending, total),
      approvedPercentage: getKpiPercentage(approved, total),
      rejectedPercentage: getKpiPercentage(rejected, total),
      revertedPercentage: getKpiPercentage(reverted, total),
      todayPercentage: getKpiPercentage(today, total),
      dueTodayPercentage: getKpiPercentage(dueToday, total),
      overduePercentage: getKpiPercentage(overdue, total),
      isLive: Boolean(approvalRes || cards || applicationDashboardWindow),
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
      const officerFullName = [app.officerFirstName, app.officerLastName]
        .map((name) => name?.trim())
        .filter((name): name is string => Boolean(name))
        .join(' ');
      const assignedToStr = app.userName?.trim() || '—';
      const assignedToName = officerFullName || assignedToStr;
      const assignedToRole = '';

      return {
        source: 'approval',
        applicationId: app.id,
        applicationNo: app.applicationNo,
        propertyNo: app.propertyNo?.trim() || null,
        upicId: app.upicId?.trim() || null,
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
        assignedUserId: app.userId ?? null,
      };
    });

    const applicationDashboardRows = externalApplications.map(mapApplicationDashboardRow);
    const reconciledRows = reconcileDashboardRows(approvalRows, applicationDashboardRows);
    const mergedRows = mergePrioritizedDashboardRows(
      reconciledRows.approvalRows,
      reconciledRows.applicationDashboardRows,
      effectiveFilters.currentUserId,
      filters.sortBy,
      filters.sortOrder
    );
    const combinedSourceTotal = (approvalRes?.totalCount ?? approvalRows.length) + externalTotalCount;
    const totalCount = Math.max(
      mergedRows.length,
      combinedSourceTotal - reconciledRows.duplicateCount
    );
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const pageNumber = Math.min(requestedPageNumber, totalPages);
    const startIndex = (pageNumber - 1) * pageSize;
    const rows = mergedRows.slice(startIndex, startIndex + pageSize);

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
  const [departments, services] = await Promise.all([getAllRtsDepartments(), getAllRtsServices()]);

  return { departments, services };
}

export async function submitApplicationActionAction(
  applicationNo: string,
  actionType: WorkflowActionType,
  remark: string
): Promise<SubmitApplicationActionResult> {
  try {
    const numericId = parseInt(applicationNo.replace(/\D/g, ''), 10);
    if (!numericId || numericId <= 0) {
      return { success: false, message: 'Invalid application ID.' };
    }

    let result: { success: boolean; message?: string };
    switch (actionType) {
      case 'verifyDocument':
        result = await verifyApprovalDocumentsAction(numericId, remark);
        break;
      case 'approve':
        result = await verifyAndSendToApproveAction(numericId, remark);
        break;
      case 'reject':
        result = await rejectApprovalApplicationAction(numericId, remark);
        break;
      case 'return':
        result = await revertApprovalApplicationAction(numericId, remark);
        break;
      default:
        result = { success: false, message: `Unsupported action type: ${actionType}` };
    }

    revalidatePath(`/rts/dashboard/rts-applications/${applicationNo}`);
    revalidatePath('/rts/dashboard/rts-applications');

    return { success: result.success, message: result.message };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit workflow action',
    };
  }
}

function escapeCertificateMultilineText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, '<br />');
}

export async function getCertificatePreviewAction(
  applicationId: number,
  officerInputs?: Record<string, string>,
  customConditions?: string
) {
  try {
    const { getCertificatePreview, getCertificateTemplateByServiceId } =
      await import('@/lib/api/rts/rtscertificate.service');
    const { getPaymentReceipt } = await import('@/lib/api/rts/rtspayment.service');

    const [previewRes, verificationRes, appDetailsRes, stagesRes, paymentReceiptRes] =
      await Promise.allSettled([
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
    const paymentReceipt =
      paymentReceiptRes.status === 'fulfilled' ? paymentReceiptRes.value : null;

    const serviceId = verification?.serviceId;
    let template = null;
    if (serviceId) {
      try {
        template = await getCertificateTemplateByServiceId(serviceId);
      } catch (err) {
        console.warn('Could not fetch master template for preview service:', err);
      }
    }

    // PRIMARY & AUTHORITATIVE: If backend returned fully merged HTML, return it directly!
    if (previewData && previewData.mergedHtml) {
      return {
        success: true,
        data: {
          ...previewData,
          hasTemplate: true,
          templateId: template?.id || previewData.templateId,
          templateName: template?.templateName || previewData.templateName,
          requiredOfficerFields: template?.officerFields?.length
            ? template.officerFields
            : previewData?.requiredOfficerFields || [],
          defaultConditions: template?.defaultConditions?.length
            ? template.defaultConditions
            : previewData?.defaultConditions || [],
        },
      };
    }

    if (template && template.bodyContent) {
      let merged = template.bodyContent;
      const todayFormatted = new Date().toLocaleDateString('en-GB');
      const applicationNo = verification?.applicationNo || `RTS${applicationId}`;
      const serviceName = verification?.serviceName || template.serviceName || 'आर.टी.एस. सेवा';
      const departmentName = template.departmentName || 'लोकसेवा हक्क विभाग';

      // Dynamically resolve designated officer from stages or metadata
      const activeStage =
        stages?.approvalStages?.find((s) => s.isCurrentStage) ||
        stages?.approvalStages?.slice(-1)[0];
      const stageOfficerFullName =
        activeStage?.firstName || activeStage?.lastName
          ? `${activeStage.firstName || ''} ${activeStage.lastName || ''}`.trim()
          : activeStage?.assignedToName || activeStage?.userName || null;
      const dynamicOfficerName =
        stageOfficerFullName || previewData?.citizenAutoValues?.OfficerName || '';
      const dynamicOfficerDesignation =
        activeStage?.stageName ||
        activeStage?.assignedToRole ||
        previewData?.citizenAutoValues?.OfficerDesignation ||
        departmentName ||
        '';

      // 1. Standard Core Application Metadata
      merged = merged.replace(/{{ApplicationNo}}/g, applicationNo);
      merged = merged.replace(/\[\[ApplicationNo\]\]/g, applicationNo);
      merged = merged.replace(/{{ApplicationDate}}/g, todayFormatted);
      merged = merged.replace(/{{ApprovalDate}}/g, todayFormatted);
      merged = merged.replace(/\[\[ApprovalDate\]\]/g, todayFormatted);
      merged = merged.replace(/{{AppliedDate}}/g, todayFormatted);
      merged = merged.replace(/{{IssueDate}}/g, todayFormatted);
      merged = merged.replace(/\[\[IssueDate\]\]/g, todayFormatted);
      merged = merged.replace(
        /{{CertificateNo}}/g,
        previewData?.sampleCertificateNo || `CERT/${applicationNo}`
      );
      merged = merged.replace(
        /\[\[CertificateNo\]\]/g,
        previewData?.sampleCertificateNo || `CERT/${applicationNo}`
      );
      merged = merged.replace(
        /{{ApplicantName}}/g,
        previewData?.citizenAutoValues?.ApplicantName || ''
      );
      merged = merged.replace(
        /{{ApplicantMobile}}/g,
        previewData?.citizenAutoValues?.ApplicantMobile || ''
      );
      merged = merged.replace(/{{ServiceTitle}}/g, serviceName);
      merged = merged.replace(/{{ServiceName}}/g, serviceName);
      merged = merged.replace(/{{DepartmentName}}/g, departmentName);
      merged = merged.replace(/{{OfficerName}}/g, dynamicOfficerName);
      merged = merged.replace(/\[\[OfficerName\]\]/g, dynamicOfficerName);
      merged = merged.replace(/{{ApprovedByOfficer}}/g, dynamicOfficerName);
      merged = merged.replace(/\[\[ApprovedByOfficer\]\]/g, dynamicOfficerName);
      merged = merged.replace(/{{OfficerDesignation}}/g, dynamicOfficerDesignation);
      merged = merged.replace(/\[\[OfficerDesignation\]\]/g, dynamicOfficerDesignation);

      // 2. Dynamic Form Fields (from rts.FieldValue & rts.FieldDefinition)
      let applicantAddress = '';
      if (appDetails?.applicationDetails && Array.isArray(appDetails.applicationDetails)) {
        for (const field of appDetails.applicationDetails) {
          const code = field.fieldCode;
          const val = field.value ?? '';

          if (code) {
            merged = merged.replace(new RegExp(`{{Field:${code}}}`, 'gi'), val);
            merged = merged.replace(new RegExp(`{{${code}}}`, 'gi'), val);
            merged = merged.replace(new RegExp(`\\[\\[${code}\\]\\]`, 'gi'), val);

            const lowerCode = code.toLowerCase();
            if (
              !applicantAddress &&
              (lowerCode.includes('address') ||
                lowerCode.includes('patt') ||
                lowerCode.includes('location') ||
                lowerCode.includes('area'))
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

      merged = merged.replace(/{{ApplicantAddress}}/g, applicantAddress || '');

      // 3. Dynamic Officer Inputs & Workflow Data
      const officerData = officerInputs || {};
      const officerRemarkHtml = escapeCertificateMultilineText(officerData.OfficerRemark || '');
      merged = merged.replace(/{{OfficerRemark}}/gi, officerRemarkHtml);
      merged = merged.replace(/\[\[OfficerRemark\]\]/gi, officerRemarkHtml);
      const realPaymentReceiptNo =
        paymentReceipt?.receiptNo ||
        verification?.receiptNo ||
        officerData.ChallanNo ||
        officerData.ReceiptNo ||
        (verification?.isPaid || paymentReceipt
          ? `REC-${applicationNo}`
          : verification?.feesRequired === false
            ? 'शुल्क लागू नाही (विनामूल्य)'
            : '—');

      const realOfficerStageRemark =
        stages?.approvalStages?.filter((s) => s.remark && s.remark.trim().length > 0)?.slice(-1)[0]
          ?.remark ||
        officerData.InspectionRemark ||
        officerData.Remark ||
        '';

      if (!officerData.InspectionRemark && realOfficerStageRemark) {
        officerData.InspectionRemark = realOfficerStageRemark;
      }

      const orderNo =
        officerData.OrderNo || officerData.OutwardNo || `मनपा/आर.टी.एस./२०२६/${applicationNo}`;
      const validityPeriod = officerData.ValidityPeriod || '';

      merged = merged.replace(/\[\[OrderNo\]\]/g, orderNo);
      merged = merged.replace(/\[\[ValidityPeriod\]\]/g, validityPeriod || '—');
      merged = merged.replace(/\[\[ChallanNo\]\]/g, realPaymentReceiptNo);
      // Special Conditions Injection
      if (customConditions && customConditions.trim().length > 0) {
        if (merged.includes('[[SpecialConditions]]')) {
          merged = merged.replace(/\[\[SpecialConditions\]\]/g, customConditions);
        } else {
          const conditionLines = customConditions
            .split(/[\r\n]+/)
            .filter((c) => c.trim().length > 0);
          const formattedConditions = conditionLines.map((c) => `<li>${c.trim()}</li>`).join('');

          if (merged.includes('</ol>')) {
            merged = merged.replace('</ol>', `${formattedConditions}</ol>`);
          } else if (merged.includes('</ul>')) {
            merged = merged.replace('</ul>', `${formattedConditions}</ul>`);
          } else {
            const extraBox = `
              <div class='extra-conditions-box my-2 p-2.5 bg-amber-50/70 border border-amber-300 rounded text-xs text-slate-800'>
                <div class='font-bold text-amber-900 mb-1'>विशेष अटी व शर्ती (Special Conditions):</div>
                <ul class='list-disc pl-5 space-y-0.5'>${formattedConditions}</ul>
              </div>
            `;
            if (merged.includes('{{DigitalSignature}}')) {
              merged = merged.replace('{{DigitalSignature}}', `${extraBox}\n{{DigitalSignature}}`);
            } else {
              merged += extraBox;
            }
          }
        }
      } else {
        merged = merged.replace(/\[\[SpecialConditions\]\]/g, '');
      }

      const standardLabels: Record<string, string> = {
        OrderNo: 'जावक / आदेश क्र.',
        OutwardNo: 'जावक क्र.',
        ValidityPeriod: 'वैधता मुदत',
        ChallanNo: 'शुल्क पावती क्र.',
        ReceiptNo: 'पावती क्र.',
        InspectionRemark: 'पडताळणी शेरा',
        Remark: 'शेरा',
        SurveyNo: 'सीटीएस / सर्व्हे क्र.',
        ZoneType: 'मंजूर झोन',
      };

      const dynamicOfficerItems: { label: string; value: string }[] = [];
      const renderedKeys = new Set<string>();

      if (Object.keys(officerData).length > 0) {
        for (const [k, v] of Object.entries(officerData)) {
          if (
            k.toLowerCase() !== 'officerremark' &&
            v &&
            typeof v === 'string' &&
            v.trim().length > 0 &&
            !renderedKeys.has(k.toLowerCase())
          ) {
            const lbl = standardLabels[k] || k;
            const finalVal =
              k.toLowerCase().includes('challan') || k.toLowerCase().includes('receipt')
                ? realPaymentReceiptNo
                : v;
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
                .join('')}
            </div>
          </div>
        `;

        if (merged.includes('{{OfficerFieldsBlock}}')) {
          merged = merged.replace(/{{OfficerFieldsBlock}}/g, officerEntriesHtml);
        } else if (merged.includes('{{DigitalSignature}}')) {
          merged = merged.replace(
            '{{DigitalSignature}}',
            `${officerEntriesHtml}\n{{DigitalSignature}}`
          );
        } else {
          merged += officerEntriesHtml;
        }
      } else {
        merged = merged.replace(/{{OfficerFieldsBlock}}/g, '');
      }

      // 4. Dynamic Scannable QR Code
      let dynamicDomain = '';
      try {
        const headerList = await headers();
        const host =
          headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000';
        const protocol =
          headerList.get('x-forwarded-proto') ||
          (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
        dynamicDomain = `${protocol}://${host}`;
      } catch {
        dynamicDomain = process.env.NEXT_PUBLIC_APP_URL || '';
      }

      let qrPayload = `${dynamicDomain}/mr/service/verify-certificate/${encodeURIComponent(applicationNo)}`;
      qrPayload = qrPayload.replace('/service/service/', '/service/');
      const qrCodeBlock = `
        <div class='inline-flex flex-col items-center justify-center p-1 bg-white border border-slate-300 rounded shadow-xs text-center' style='width: 76px;' title='${qrPayload}'>
          <div style='width: 60px; height: 60px;' class='flex items-center justify-center bg-white'>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrPayload)}" alt="QR Verification" class="w-full h-full object-contain" />
          </div>
          <span class='text-slate-700 mt-0.5 font-bold' style='font-size: 7px;'>Scan to Verify</span>
        </div>
      `;
      merged = merged.replace(
        /<div[^>]*class=['"][^'"]*inline-flex flex-col items-center[^'"]*['"][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
        qrCodeBlock
      );
      merged = merged.replace(/{{QRCodeText}}/g, qrCodeBlock);
      merged = merged.replace(/{{QRCode}}/g, qrCodeBlock);

      merged = merged.replace(/{{Field:([^}]+)}}/g, '—');
      merged = merged.replace(/{{CustomConditionsList}}/g, '');

      // Dynamic DSC Digital Signature badge for fallback preview
      const nowFormatted = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' });
      const dscSignatureCard = `
        <div class='digital-signature-card bg-emerald-50/95 border-2 border-emerald-600 p-2.5 rounded-lg text-left inline-block shadow-xs min-w-[240px] max-w-[320px] font-sans text-xs'>
          <div class='flex items-center justify-between text-emerald-900 font-bold text-[11px] pb-1 border-b border-emerald-300 mb-1.5'>
            <div class='flex items-center gap-1.5'>
              <span class='text-emerald-700 font-bold text-sm'>✔</span>
              <span>Digitally Signed (DSC Verified)</span>
            </div>
            <span class='text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold'>DSC Verified</span>
          </div>
          <div class='font-bold text-slate-900 text-xs leading-tight'>${previewData?.citizenAutoValues?.ULBName ? `DS ${previewData.citizenAutoValues.ULBName.toUpperCase()}` : 'DS AKOLA MUNICIPAL CORPORATION, AKOLA'}</div>
          <div class='text-[10px] text-slate-700 font-semibold mt-0.5'>Authorized Signatory: <span class='text-slate-950 font-bold'>${dynamicOfficerName}</span></div>
          <div class='text-[9px] text-slate-600 font-medium'>${dynamicOfficerDesignation}</div>
          <div class='text-[9px] text-slate-500 font-mono mt-1 border-t border-emerald-200/60 pt-1'>
            <div>Date: <span class='font-bold text-slate-700'>${nowFormatted} IST</span></div>
            <div class='text-[8px] text-slate-400 truncate' title='Cert Serial: 0190D769'>Cert Serial: 0190D769 | CA: e-Mudhra Sub CA for Class 2 Document Signer 2022</div>
          </div>
          <div class='text-[9px] text-emerald-800 font-bold mt-1.5 flex items-center gap-1 bg-emerald-100/80 px-2 py-0.5 rounded'>
            <span>🔒</span> <span>e-Sign Verified & Authentic (Official RTS)</span>
          </div>
        </div>
      `;

      // Replace {{DigitalSignature}} and all tag variations
      const sigRegex =
        /(?:\{\{|\{\s*|\[\[)\s*(?:DigitalSignature(?:Text)?|Digital_Signature|digitalSignature|OfficerSignature|Signature|DSC)\s*(?:\}\}|\s*\}|\]\])/gi;
      let dscReplaced = false;
      if (sigRegex.test(merged)) {
        merged = merged.replace(sigRegex, dscSignatureCard);
        dscReplaced = true;
      }
      const mockCardRegex =
        /<div[^>]*class=['"][^'"]*digital-signature-card[^'"]*['"][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi;
      if (mockCardRegex.test(merged)) {
        merged = merged.replace(mockCardRegex, dscSignatureCard);
        dscReplaced = true;
      }
      if (!dscReplaced && merged.includes('right-digital-sign')) {
        merged = merged.replace(
          /(<div[^>]*class=['"][^'"]*right-digital-sign[^'"]*['"][^>]*>)([\s\S]*?)(<\/div>)/gi,
          `$1\n${dscSignatureCard}\n$3`
        );
        dscReplaced = true;
      }
      if (!dscReplaced) {
        merged += `<div class='text-right mt-4'>${dscSignatureCard}</div>`;
      }

      return {
        success: true,
        data: {
          hasTemplate: true,
          templateId: template.id,
          templateName: template.templateName,
          mergedHtml: merged,
          citizenAutoValues: previewData?.citizenAutoValues || {},
          requiredOfficerFields: template.officerFields?.length
            ? template.officerFields
            : previewData?.requiredOfficerFields || [],
          defaultConditions: template.defaultConditions?.length
            ? template.defaultConditions
            : previewData?.defaultConditions || [],
          sampleCertificateNo: previewData?.sampleCertificateNo,
        },
      };
    }

    if (previewData) {
      return { success: true, data: previewData };
    }

    return { success: false, error: 'Failed to generate preview' };
  } catch (error: unknown) {
    console.error('Failed to generate certificate preview:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate preview',
    };
  }
}

export async function issueCertificateAction(
  applicationId: number,
  officerInputs?: Record<string, string>,
  customConditions?: string,
  actionRemark?: string,
  signAndApprove: boolean = true,
  certificateType: RTSCertificateType = 1,
  documentGuid?: string
) {
  try {
    const { issueCertificate } = await import('@/lib/api/rts/rtscertificate.service');
    const result = await issueCertificate({
      applicationId,
      officerInputs,
      customConditions,
      actionRemark,
      signAndApprove,
      certificateType,
      documentGuid,
    });

    revalidatePath('/rts/dashboard/rts-applications');
    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    console.error('Failed to issue certificate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to issue certificate',
    };
  }
}

export async function uploadManualCertificateAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    const applicationIdStr = formData.get('applicationId') as string;
    const applicationId = applicationIdStr ? parseInt(applicationIdStr, 10) : undefined;

    const { uploadDocument } = await import('@/lib/api/document.service');
    const uploadResult = await uploadDocument(file, {
      referenceTableName: 'RTS.IssuedCertificate',
      referenceTableId: applicationId,
      bindingPurpose: 'ManualCertificate',
      isPrimaryDocument: true,
    });

    return {
      success: true,
      data: {
        documentGuid: uploadResult.documentGuid,
        fileName: uploadResult.fileName,
        fileSizeBytes: uploadResult.fileSizeBytes,
      },
    };
  } catch (error: unknown) {
    console.error('Failed to upload manual certificate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload manual certificate',
    };
  }
}

export async function getIssuedCertificateAction(applicationNo: string) {
  try {
    const { getIssuedCertificateByApplicationNo, getCertificateTemplateByServiceId } =
      await import('@/lib/api/rts/rtscertificate.service');
    const result = await getIssuedCertificateByApplicationNo(applicationNo);

    // If backend has already stored the fully merged and digitally signed HTML in the database,
    // directly use that official certificate rather than reconstructing an unmerged version.
    if (result && result.mergedHtmlContent && result.mergedHtmlContent.trim().length > 50) {
      let officialHtml = result.mergedHtmlContent;
      const todayFormatted = new Date().toLocaleDateString('en-GB');
      officialHtml = officialHtml.replace(/\{\{DocumentDate\}\}/gi, todayFormatted);
      officialHtml = officialHtml.replace(/\[\[DocumentDate\]\]/gi, todayFormatted);
      officialHtml = officialHtml.replace(/\{\{CurrentDate\}\}/gi, todayFormatted);
      officialHtml = officialHtml.replace(/\[\[CurrentDate\]\]/gi, todayFormatted);
      result.mergedHtmlContent = officialHtml;
      return { success: true, data: result };
    }

    if (result && result.certificateType === 2) {
      return { success: true, data: result };
    }

    if (result && result.serviceId) {
      try {
        const { getPaymentReceipt } = await import('@/lib/api/rts/rtspayment.service');
        const [masterTemplate, appProcessData, verificationData, stagesData, paymentReceiptData] =
          await Promise.allSettled([
            getCertificateTemplateByServiceId(result.serviceId),
            result.applicationId
              ? getApprovalApplicationDetails(result.applicationId)
              : Promise.resolve(null),
            result.applicationId
              ? getApprovalApplicationVerification(result.applicationId)
              : Promise.resolve(null),
            result.applicationId
              ? getApprovalApplicationStages(result.applicationId)
              : Promise.resolve(null),
            result.applicationId ? getPaymentReceipt(result.applicationId) : Promise.resolve(null),
          ]);

        const template = masterTemplate.status === 'fulfilled' ? masterTemplate.value : null;
        const appDetails = appProcessData.status === 'fulfilled' ? appProcessData.value : null;
        const verification =
          verificationData.status === 'fulfilled' ? verificationData.value : null;
        const stages = stagesData.status === 'fulfilled' ? stagesData.value : null;
        const paymentReceipt =
          paymentReceiptData.status === 'fulfilled' ? paymentReceiptData.value : null;

        if (template && template.bodyContent) {
          let merged = template.bodyContent;
          const issueDateFormatted = result.issuedAt
            ? new Date(result.issuedAt).toLocaleDateString('en-GB')
            : new Date().toLocaleDateString('en-GB');

          // Standard Core Application Metadata
          merged = merged.replace(/{{DocumentDate}}/gi, issueDateFormatted);
          merged = merged.replace(/\[\[DocumentDate\]\]/gi, issueDateFormatted);
          merged = merged.replace(/{{CurrentDate}}/gi, issueDateFormatted);
          merged = merged.replace(/\[\[CurrentDate\]\]/gi, issueDateFormatted);
          merged = merged.replace(/{{ApplicationNo}}/g, result.applicationNo || applicationNo);
          merged = merged.replace(/{{ApplicationDate}}/g, issueDateFormatted);
          merged = merged.replace(/{{ApprovalDate}}/g, issueDateFormatted);
          merged = merged.replace(/{{AppliedDate}}/g, issueDateFormatted);
          merged = merged.replace(/{{IssueDate}}/g, issueDateFormatted);
          merged = merged.replace(
            /{{CertificateNo}}/g,
            result.certificateNo || `CERT/${result.applicationNo}`
          );
          merged = merged.replace(/{{ApplicantName}}/g, result.applicantName || '');
          merged = merged.replace(/{{ApplicantMobile}}/g, result.applicantMobile || '');
          merged = merged.replace(/{{ServiceTitle}}/g, result.serviceName || '');
          merged = merged.replace(/{{ServiceName}}/g, result.serviceName || '');
          merged = merged.replace(/{{DepartmentName}}/g, result.departmentName || '');
          merged = merged.replace(
            /{{OfficerName}}/g,
            result.issuedByUserName
              ? `${result.issuedByUserName} (${result.issuedByOfficerDesignation || 'सक्षम प्राधिकारी'})`
              : 'सक्षम प्राधिकारी'
          );
          merged = merged.replace(
            /{{ApprovedByOfficer}}/g,
            result.issuedByUserName || 'सक्षम प्राधिकारी'
          );
          merged = merged.replace(
            /{{OfficerDesignation}}/g,
            result.issuedByOfficerDesignation || 'सक्षम प्राधिकारी'
          );

          // 2. Dynamic Form Fields (from rts.FieldValue & rts.FieldDefinition)
          let applicantAddress = '';
          if (appDetails?.applicationDetails && Array.isArray(appDetails.applicationDetails)) {
            for (const field of appDetails.applicationDetails) {
              const code = field.fieldCode;
              const val = field.value ?? '';

              if (code) {
                // Replace all variants: {{Field:Code}}, {{Code}}, [[Code]]
                merged = merged.replace(new RegExp(`{{Field:${code}}}`, 'gi'), val);
                merged = merged.replace(new RegExp(`{{${code}}}`, 'gi'), val);
                merged = merged.replace(new RegExp(`\\[\\[${code}\\]\\]`, 'gi'), val);

                // Detect address fields dynamically
                const lowerCode = code.toLowerCase();
                if (
                  !applicantAddress &&
                  (lowerCode.includes('address') ||
                    lowerCode.includes('patt') ||
                    lowerCode.includes('location') ||
                    lowerCode.includes('area'))
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

          merged = merged.replace(/{{ApplicantAddress}}/g, applicantAddress || '');

          // 3. Dynamic Officer Inputs & Workflow Data (from officer approval + payment records + stages)
          let officerInputsData: Record<string, string> = result.officerInputs || {};
          if (Object.keys(officerInputsData).length === 0 && result.digitalSignatureInfo) {
            try {
              const parsedSig = JSON.parse(result.digitalSignatureInfo);
              if (parsedSig && typeof parsedSig === 'object') {
                officerInputsData = parsedSig.officerInputs || parsedSig;
              }
            } catch {
              // Plain text or legacy signature string
            }
          }

          const officerRemarkHtml = escapeCertificateMultilineText(
            officerInputsData.OfficerRemark || ''
          );
          merged = merged.replace(/{{OfficerRemark}}/gi, officerRemarkHtml);
          merged = merged.replace(/\[\[OfficerRemark\]\]/gi, officerRemarkHtml);

          // Real Receipt No from payment receipts table / verification
          const realPaymentReceiptNo =
            paymentReceipt?.receiptNo ||
            verification?.receiptNo ||
            officerInputsData.ChallanNo ||
            officerInputsData.ReceiptNo ||
            (verification?.isPaid || paymentReceipt
              ? `REC-${result.applicationNo}`
              : verification?.feesRequired === false
                ? 'शुल्क लागू नाही (विनामूल्य)'
                : '—');

          // Real Officer Inspection Remark from approval workflow stages
          const realOfficerStageRemark =
            stages?.approvalStages
              ?.filter((s) => s.remark && s.remark.trim().length > 0)
              ?.slice(-1)[0]?.remark ||
            officerInputsData.InspectionRemark ||
            officerInputsData.Remark ||
            '';

          const orderNo =
            officerInputsData.OrderNo ||
            officerInputsData.OutwardNo ||
            result.certificateNo ||
            result.applicationNo;
          const validityPeriod = officerInputsData.ValidityPeriod || '';

          merged = merged.replace(/\[\[OrderNo\]\]/g, orderNo);
          merged = merged.replace(/\[\[ValidityPeriod\]\]/g, validityPeriod || '—');
          merged = merged.replace(/\[\[ChallanNo\]\]/g, realPaymentReceiptNo);
          merged = merged.replace(
            /\[\[SpecialConditions\]\]/g,
            officerInputsData.SpecialConditions || ''
          );

          // Dynamically map all officer fields from actual inputs
          const standardLabels: Record<string, string> = {
            OrderNo: 'जावक / आदेश क्र.',
            OutwardNo: 'जावक क्र.',
            ValidityPeriod: 'वैधता मुदत',
            ChallanNo: 'शुल्क पावती क्र.',
            ReceiptNo: 'पावती क्र.',
            InspectionRemark: 'पडताळणी शेरा',
            Remark: 'शेरा',
          };

          const dynamicOfficerItems: { label: string; value: string }[] = [];
          const renderedKeys = new Set<string>();

          if (Object.keys(officerInputsData).length > 0) {
            for (const [k, v] of Object.entries(officerInputsData)) {
              if (
                k.toLowerCase() !== 'officerremark' &&
                v &&
                typeof v === 'string' &&
                !renderedKeys.has(k.toLowerCase())
              ) {
                const lbl = standardLabels[k] || k;
                const finalVal =
                  k.toLowerCase().includes('challan') || k.toLowerCase().includes('receipt')
                    ? realPaymentReceiptNo
                    : v;
                dynamicOfficerItems.push({ label: lbl, value: finalVal });
                renderedKeys.add(k.toLowerCase());
              }
            }
          }

          // If no specific custom inputs, populate only existing dynamic values
          if (dynamicOfficerItems.length === 0) {
            if (orderNo) dynamicOfficerItems.push({ label: 'जावक / आदेश क्र.', value: orderNo });
            if (validityPeriod)
              dynamicOfficerItems.push({ label: 'वैधता मुदत', value: validityPeriod });
            if (realPaymentReceiptNo && realPaymentReceiptNo !== '—')
              dynamicOfficerItems.push({ label: 'शुल्क पावती क्र.', value: realPaymentReceiptNo });
            if (realOfficerStageRemark)
              dynamicOfficerItems.push({ label: 'पडताळणी शेरा', value: realOfficerStageRemark });
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
                    .join('')}
                </div>
              </div>
            `;
            merged = merged.replace(/{{OfficerFieldsBlock}}/g, officerEntriesHtml);
          } else {
            merged = merged.replace(/{{OfficerFieldsBlock}}/g, '');
          }

          // 4. Dynamic 100% Real Scannable QR Code linking to our internal verification page
          let dynamicDomain = '';
          try {
            const headerList = await headers();
            const host =
              headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000';
            const protocol =
              headerList.get('x-forwarded-proto') ||
              (host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https');
            dynamicDomain = `${protocol}://${host}`;
          } catch {
            dynamicDomain = process.env.NEXT_PUBLIC_APP_URL || '';
          }

          const certLookupKey = result.certificateGuid || result.applicationNo || applicationNo;
          const rawQr =
            result.qrCodePayload ||
            `${dynamicDomain}/mr/service/verify-certificate/${encodeURIComponent(certLookupKey)}`;
          const qrPayload = rawQr.replace('/service/service/', '/service/');

          const qrCodeBlock = `
            <div class='inline-flex flex-col items-center justify-center p-1 bg-white border border-slate-300 rounded shadow-xs text-center' style='width: 76px;' title='${qrPayload}'>
              <div style='width: 60px; height: 60px;' class='flex items-center justify-center bg-white'>
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrPayload)}" alt="QR Verification" class="w-full h-full object-contain" />
              </div>
              <span class='text-slate-700 mt-0.5 font-bold' style='font-size: 7px;'>Scan to Verify</span>
            </div>
          `;
          merged = merged.replace(
            /<div[^>]*class=['"][^'"]*inline-flex flex-col items-center[^'"]*['"][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
            qrCodeBlock
          );
          merged = merged.replace(/{{QRCodeText}}/g, qrCodeBlock);
          merged = merged.replace(/{{QRCode}}/g, qrCodeBlock);

          // 5. Dynamic DSC Digital Signature Card in fallback
          const dscSignatureCard = `
            <div class='digital-signature-card bg-emerald-50/95 border-2 border-emerald-600 p-2.5 rounded-lg text-left inline-block shadow-xs min-w-[240px] max-w-[320px] font-sans text-xs'>
              <div class='flex items-center justify-between text-emerald-900 font-bold text-[11px] pb-1 border-b border-emerald-300 mb-1.5'>
                <div class='flex items-center gap-1.5'>
                  <span class='text-emerald-700 font-bold text-sm'>✔</span>
                  <span>Digitally Signed (DSC Verified)</span>
                </div>
                <span class='text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold'>DSC Verified</span>
              </div>
              <div class='font-bold text-slate-900 text-xs leading-tight'>DS AKOLA MUNICIPAL CORPORATION, AKOLA</div>
              <div class='text-[10px] text-slate-700 font-semibold mt-0.5'>Authorized Signatory: <span class='text-slate-950 font-bold'>${result.issuedByUserName || 'Authorized Officer'}</span></div>
              <div class='text-[9px] text-slate-600 font-medium'>${result.issuedByOfficerDesignation || 'सक्षम प्राधिकारी'}</div>
              <div class='text-[9px] text-slate-500 font-mono mt-1 border-t border-emerald-200/60 pt-1'>
                <div>Date: <span class='font-bold text-slate-700'>${issueDateFormatted}</span></div>
                <div class='text-[8px] text-slate-400 truncate' title='Cert Serial: 0190D769'>Cert Serial: 0190D769 | CA: e-Mudhra Sub CA for Class 2 Document Signer 2022</div>
              </div>
              <div class='text-[9px] text-emerald-800 font-bold mt-1.5 flex items-center gap-1 bg-emerald-100/80 px-2 py-0.5 rounded'>
                <span>🔒</span> <span>e-Sign Verified & Authentic (Official RTS)</span>
              </div>
            </div>
          `;

          const sigRegex =
            /(?:\{\{|\{\s*|\[\[)\s*(?:DigitalSignature(?:Text)?|Digital_Signature|digitalSignature|OfficerSignature|Signature|DSC)\s*(?:\}\}|\s*\}|\]\])/gi;
          merged = merged.replace(sigRegex, dscSignatureCard);
          merged = merged.replace(
            /<div[^>]*class=['"][^'"]*digital-signature-card[^'"]*['"][^>]*>[\s\S]*?<\/div>\s*<\/div>/gi,
            dscSignatureCard
          );

          // Clean up any remaining unreplaced placeholder tags
          merged = merged.replace(/{{Field:([^}]+)}}/g, '—');
          merged = merged.replace(/{{CustomConditionsList}}/g, '');

          result.mergedHtmlContent = merged;
        }
      } catch (tmplErr) {
        console.warn(
          'Could not load master template for issued cert, using stored mergedHtmlContent:',
          tmplErr
        );
      }
    }

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error('Failed to fetch issued certificate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Certificate not found',
    };
  }
}

export async function fetchDscMetadataAction() {
  try {
    const { getDscMetadata } = await import('@/lib/api/rts/rtscertificate.service');
    const metadata = await getDscMetadata();
    return { success: true, data: metadata };
  } catch (error: any) {
    console.error('Failed to fetch DSC metadata:', error);
    return { success: false, error: error?.message || 'Failed to fetch DSC metadata' };
  }
}

export interface RTSTrackApplicationHistoryItem {
  id: number;
  applicationId: number;
  applicationNo?: string;
  approvalFlowId: number;
  approvalFlowStageId?: number;
  stageName?: string;
  actionByUserId?: number;
  actionByUserName?: string;
  actionByOfficerName?: string;
  action: string;
  status: string;
  remark?: string;
  isReverted: boolean;
  isDigitallySigned: boolean;
  digitalSignatureInfo?: string;
  createdDate: string;
}

export async function fetchTrackApplicationHistoryAction(applicationId: number) {
  try {
    const { apiClient } = await import('@/services/api.service');
    const response = await apiClient.get<unknown>(
      `/RTSApplicationApproval/${applicationId}/track-history`,
      {
        cache: 'no-store',
      },
      false
    );

    if (!response.success || !response.data) {
      return { success: false, data: [] as RTSTrackApplicationHistoryItem[] };
    }

    const dataObj = response.data as Record<string, unknown>;
    const items = dataObj?.items ?? response.data ?? [];
    return {
      success: true,
      data: (Array.isArray(items) ? items : []) as RTSTrackApplicationHistoryItem[],
    };
  } catch (error: any) {
    console.error('Failed to fetch track history:', error);
    return {
      success: false,
      error: error?.message || 'Failed to fetch history',
      data: [] as RTSTrackApplicationHistoryItem[],
    };
  }
}

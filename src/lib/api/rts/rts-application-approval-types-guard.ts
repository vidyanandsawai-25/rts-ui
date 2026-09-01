import type {
  RtsApplicationApprovalStage,
  RtsApplicationApprovalStagesItem,
  RtsApplicationDashboardCardsItem,
  RtsApplicationViewDetailField,
  RtsApplicationViewDetailsItem,
  RtsApplicationVerificationItem,
  RtsApprovalApplicationListItem,
} from '@/types/rts/application-approval.types';

/**
 * Type guard for RTS Application Dashboard Cards response item.
 */
export function isRtsApplicationDashboardCardsItemShape(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return 'totalApplications' in obj || 'pending' in obj || 'approved' in obj;
}

function parseNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function parseNullableNumber(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseString(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (val != null) return String(val);
  return fallback;
}

function parseNullableString(val: unknown): string | null {
  if (val == null) return null;
  return String(val);
}

/**
 * Normalizes API response object into a clean RtsApplicationDashboardCardsItem.
 */
export function normalizeRtsApplicationDashboardCardsItem(
  data: Record<string, unknown>
): RtsApplicationDashboardCardsItem {
  return {
    totalApplications: parseNumber(data.totalApplications),
    pending: parseNumber(data.pending),
    approved: parseNumber(data.approved),
    rejected: parseNumber(data.rejected),
    reverted: parseNumber(data.reverted),
    todayApplications: parseNumber(data.todayApplications),
    overdueApplications: parseNumber(data.overdueApplications),
    dueToday: parseNumber(data.dueToday),
    pendingPercentage: parseNumber(data.pendingPercentage),
    approvedPercentage: parseNumber(data.approvedPercentage),
    rejectedPercentage: parseNumber(data.rejectedPercentage),
    revertedPercentage: parseNumber(data.revertedPercentage),
    todayPercentage: parseNumber(data.todayPercentage),
    dueTodayPercentage: parseNumber(data.dueTodayPercentage),
    overduePercentage: parseNumber(data.overduePercentage),
  };
}

/**
 * Type guard for RTS Approval Application list item.
 */
export function isRtsApprovalApplicationListItemShape(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return 'applicationNo' in obj || 'id' in obj;
}

/**
 * Normalizes a list item object into RtsApprovalApplicationListItem.
 */
export function normalizeRtsApprovalApplicationListItem(
  data: Record<string, unknown>
): RtsApprovalApplicationListItem {
  const rawDetails = Array.isArray(data.applicantDetails) ? data.applicantDetails : [];
  const applicantDetails = rawDetails.map((det) => {
    const d = (det ?? {}) as Record<string, unknown>;
    return {
      fieldLabel: parseString(d.fieldLabel),
      fieldValue: parseNullableString(d.fieldValue),
    };
  });

  return {
    id: parseNumber(data.id),
    departmentId: parseNumber(data.departmentId),
    serviceId: parseNumber(data.serviceId),
    applicationNo: parseString(data.applicationNo),
    applicationStatus: parseString(data.applicationStatus, 'pending'),
    applicantName: parseNullableString(data.applicantName),
    applicantMobileNo: parseNullableString(data.applicantMobileNo),
    remark: parseNullableString(data.remark),
    createdDate: parseString(data.createdDate),
    updatedDate: parseNullableString(data.updatedDate),
    userId: parseNullableNumber(data.userId),
    userName: parseNullableString(data.userName),
    action: parseNumber(data.action),
    sessionId: parseNullableString(data.sessionId),
    ownerId: parseNullableNumber(data.ownerId),
    departmentName: parseString(data.departmentName),
    departmentNameLocal: parseNullableString(data.departmentNameLocal),
    citizenName: parseNullableString(data.citizenName),
    serviceName: parseString(data.serviceName),
    serviceNameLocal: parseNullableString(data.serviceNameLocal),
    sla: parseNullableString(data.sla),
    remainingDays: parseNullableNumber(data.remainingDays),
    dueDays: parseNullableNumber(data.dueDays),
    overdueDays: parseNullableNumber(data.overdueDays),
    applicantDetails,
  };
}

/**
 * Type guard for RTS View Application details item.
 */
export function isRtsApplicationViewDetailsItemShape(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return 'applicationDetails' in obj || 'documents' in obj;
}

/**
 * Normalizes View Application details API item.
 */
export function normalizeRtsApplicationViewDetailsItem(
  data: Record<string, unknown>
): RtsApplicationViewDetailsItem {
  const rawDetails = Array.isArray(data.applicationDetails) ? data.applicationDetails : [];
  const applicationDetails: RtsApplicationViewDetailField[] = rawDetails.map((field) => {
    const f = (field ?? {}) as Record<string, unknown>;
    return {
      fieldDefinitionId: parseNumber(f.fieldDefinitionId),
      fieldCode: parseString(f.fieldCode),
      fieldLabel: parseString(f.fieldLabel),
      fieldLabelLocal: parseNullableString(f.fieldLabelLocal),
      fieldType: parseString(f.fieldType, 'text'),
      fieldGroup: parseString(f.fieldGroup, 'General Details'),
      value: parseNullableString(f.value),
      displayOrder: parseNumber(f.displayOrder),
      isRequired: Boolean(f.isRequired),
    };
  });

  const rawDocs = Array.isArray(data.documents) ? data.documents : [];
  const documents = rawDocs.map((doc) => {
    const d = (doc ?? {}) as Record<string, unknown>;
    return {
      fieldDefinitionId: parseNumber(d.fieldDefinitionId),
      documentId: parseNumber(d.documentId),
      documentName: parseString(d.documentName, 'Document'),
      documentGuid: parseString(d.documentGuid),
      documentUrl: parseNullableString(d.documentUrl),
      storagePath: parseNullableString(d.storagePath),
      fileSizeBytes: parseNullableNumber(d.fileSizeBytes) ?? 0,
      isRequired: Boolean(d.isRequired),
      isUploaded: Boolean(d.isUploaded),
    };
  });

  return {
    documents,
    applicationDetails,
  };
}

/**
 * Type guard for Application Approval Stages item.
 */
export function isRtsApplicationApprovalStagesItemShape(
  value: unknown
): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return 'approvalStages' in obj || 'totalApprovalStages' in obj;
}

/**
 * Normalizes Application Approval Stages item.
 */
export function normalizeRtsApplicationApprovalStagesItem(
  data: Record<string, unknown>
): RtsApplicationApprovalStagesItem {
  const rawStages = Array.isArray(data.approvalStages) ? data.approvalStages : [];
  const approvalStages: RtsApplicationApprovalStage[] = rawStages.map((stg) => {
    const s = (stg ?? {}) as Record<string, unknown>;
    return {
      approvalFlowStageId: parseNumber(s.approvalFlowStageId),
      stageOrder: parseNumber(s.stageOrder),
      stageName: parseString(s.stageName),
      status: parseString(s.status, 'Pending'),
      remark: parseNullableString(s.remark),
      userName: parseNullableString(s.userName),
      firstName: parseNullableString(s.firstName),
      lastName: parseNullableString(s.lastName),
      createdDate: parseNullableString(s.createdDate),
      isCurrentStage: Boolean(s.isCurrentStage),
      assignedToName: parseNullableString(s.assignedToName),
      assignedToRole: parseNullableString(s.assignedToRole),
      completedDate: parseNullableString(s.completedDate),
    };
  });

  return {
    totalApprovalStages: parseNumber(data.totalApprovalStages),
    completedStages: parseNumber(data.completedStages),
    isRevertedToCitizen: Boolean(data.isRevertedToCitizen),
    approvalStages,
  };
}

export function normalizeRtsApplicationVerificationItem(
  data: Record<string, unknown>
): RtsApplicationVerificationItem {
  return {
    applicationId: parseNumber(data.applicationId),
    applicationNo: parseString(data.applicationNo),
    applicationStatus: parseString(data.applicationStatus),
    approvalFlowId: parseNumber(data.approvalFlowId),
    stageId: parseNumber(data.stageId),
    stageName: parseString(data.stageName),
    stageOrder: parseNumber(data.stageOrder),
    slaDays: parseNumber(data.slaDays),
    isFinalStage: Boolean(data.isFinalStage),
    officerId: parseNullableNumber(data.officerId),
    officerName: parseNullableString(data.officerName),
    firstName: parseNullableString(data.firstName),
    lastName: parseNullableString(data.lastName),
    officerEmail: parseNullableString(data.officerEmail),
    isAssignedOfficer: Boolean(data.isAssignedOfficer),
    canVerifyDocument: Boolean(data.canVerifyDocument ?? data.CanVerifyDocument),
    canApprove: Boolean(data.canApprove ?? data.CanApprove),
    canReject: Boolean(data.canReject ?? data.CanReject),
    canReturn: Boolean(data.canReturn ?? data.CanReturn),
    canPay: Boolean(data.canPay ?? data.CanPay),
    canEdit: Boolean(data.canEdit ?? data.CanEdit),
    canViewNoteSheet: Boolean(data.canViewNoteSheet ?? data.CanViewNoteSheet),
    serviceId: parseNullableNumber(data.serviceId ?? data.ServiceId),
    serviceName: parseNullableString(data.serviceName ?? data.ServiceName),
    serviceFees: parseNullableNumber(data.serviceFees ?? data.ServiceFees),
    feesRequired: Boolean(data.feesRequired ?? data.FeesRequired),
    isPaid: Boolean(data.isPaid ?? data.IsPaid),
    paymentStatus: parseNullableString(data.paymentStatus ?? data.PaymentStatus),
    receiptNo: parseNullableString(data.receiptNo ?? data.ReceiptNo),
  };
}

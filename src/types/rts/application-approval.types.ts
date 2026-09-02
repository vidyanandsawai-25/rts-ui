/**
 * Types for RTS Application Approval API endpoints.
 * Backed by:
 * 1. GET /api/RTSApplicationApproval/dashboard-cards
 * 2. GET /api/RTSApplicationApproval
 * 3. GET /api/RTSApplicationApproval/{applicationId}/details
 * 4. GET /api/RTSApplicationApproval/{applicationId}/approval-stages
 * 5. GET /api/RTSApplicationApproval/{applicationId}/approval-officer
 * 6. PUT /api/RTSApplicationApproval/{applicationId}/verify-documents
 * 7. PUT /api/RTSApplicationApproval/{applicationId}/process-approval
 * 8. PUT /api/RTSApplicationApproval/{applicationId}/verify-and-correct
 * 9. PUT /api/RTSApplicationApproval/{applicationId}/Rejected-Application
 */

export interface RtsApplicationApprovalSuccessResponse<T> {
  success?: boolean;
  status?: boolean;
  message: string;
  items?: T;
  item?: T;
  errors?: string[] | null;
  correlationId?: string | null;
}

export interface RtsApplicationDashboardCardsItem {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  reverted: number;
  todayApplications: number;
  overdueApplications: number;
  dueToday: number;
  pendingPercentage: number;
  approvedPercentage: number;
  rejectedPercentage: number;
  revertedPercentage: number;
  todayPercentage: number;
  dueTodayPercentage: number;
  overduePercentage: number;
}

export type RtsApplicationDashboardCardsApiResponse =
  RtsApplicationApprovalSuccessResponse<RtsApplicationDashboardCardsItem>;

export interface RtsApprovalApplicantDetail {
  fieldLabel: string;
  fieldValue: string | null;
}

export interface RtsApprovalApplicationListItem {
  id: number;
  departmentId: number;
  serviceId: number;
  applicationNo: string;
  applicationStatus: string;
  applicantName: string | null;
  applicantMobileNo: string | null;
  remark: string | null;
  createdDate: string;
  updatedDate: string | null;
  userId: number | null;
  userName: string | null;
  action?: number;
  sessionId: string | null;
  ownerId: number | null;
  departmentName: string;
  departmentNameLocal: string | null;
  citizenName: string | null;
  serviceName: string;
  serviceNameLocal: string | null;
  sla: string | null;
  remainingDays: number | null;
  dueDays: number | null;
  overdueDays: number | null;
  applicantDetails: RtsApprovalApplicantDetail[];
}

export interface RtsApprovalApplicationListPagedItem {
  items: RtsApprovalApplicationListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface RtsApprovalApplicationListApiResponse {
  success?: boolean;
  status?: boolean;
  message: string;
  item?: RtsApprovalApplicationListPagedItem;
  // New approval-list responses place the paginated payload in `items`.
  // Keep the legacy array shape during the API rollout.
  items?: RtsApprovalApplicationListPagedItem | RtsApprovalApplicationListItem[];
  totalCount?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
  errors?: unknown;
  correlationId?: string | null;
}

export interface RtsApplicationViewDetailField {
  fieldDefinitionId: number;
  fieldCode: string;
  fieldLabel: string;
  fieldLabelLocal: string | null;
  fieldType: string;
  fieldGroup: string;
  value: string | null;
  displayOrder: number;
  isRequired: boolean;
}

export interface RtsApplicationDocumentItem {
  fieldDefinitionId?: number;
  documentId?: number;
  documentName?: string;
  documentGuid?: string;
  documentUrl?: string | null;
  storagePath?: string | null;
  fileSizeBytes?: number;
  isRequired?: boolean;
  isUploaded?: boolean;
}

export interface RtsApplicationViewDetailsItem {
  documents: RtsApplicationDocumentItem[];
  applicationDetails: RtsApplicationViewDetailField[];
}

export type RtsApplicationViewDetailsApiResponse =
  RtsApplicationApprovalSuccessResponse<RtsApplicationViewDetailsItem>;

export interface RtsApplicationApprovalStage {
  approvalFlowStageId: number;
  stageOrder: number;
  stageName: string;
  status: string;
  remark: string | null;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdDate?: string | null;
  isCurrentStage: boolean;
  isFinalStage?: boolean;
  assignedToName?: string | null;
  assignedToRole?: string | null;
  completedDate?: string | null;
}

export interface RtsApplicationApprovalStagesItem {
  totalApprovalStages: number;
  completedStages: number;
  isRevertedToCitizen: boolean;
  approvalStages: RtsApplicationApprovalStage[];
}

export type RtsApplicationApprovalStagesApiResponse =
  RtsApplicationApprovalSuccessResponse<RtsApplicationApprovalStagesItem>;

export interface RtsApplicationVerificationItem {
  applicationId: number;
  applicationNo: string;
  applicationStatus: string;
  approvalFlowId: number;
  stageId: number;
  stageName: string;
  stageOrder: number;
  slaDays: number;
  isFinalStage: boolean;
  officerId: number | null;
  officerName: string | null;
  firstName: string | null;
  lastName: string | null;
  officerEmail: string | null;
  isAssignedOfficer: boolean;
  canVerifyDocument: boolean;
  canApprove: boolean;
  canReject: boolean;
  canReturn: boolean;
  canPay: boolean;
  canEdit: boolean;
  canViewNoteSheet: boolean;
  serviceId?: number | null;
  serviceName?: string | null;
  serviceFees?: number | null;
  feesRequired?: boolean;
  isPaid?: boolean;
  paymentStatus?: string | null;
  receiptNo?: string | null;
}

export type RtsApplicationVerificationApiResponse =
  RtsApplicationApprovalSuccessResponse<RtsApplicationVerificationItem>;

export interface RtsApplicationApprovalFieldValuePayload {
  isActive: boolean;
  updatedBy: number;
  fieldDefinitionId: number;
  textValue: string | null;
  numberValue: number | null;
  dateValue: string | null;
  booleanValue: boolean | null;
  documentGuid: string | null;
}

export interface RtsApplicationApprovalActionPayload {
  isActive: boolean;
  updatedBy: number;
  remark: string;
  status: string;
}

export interface RtsApplicationApprovalFieldUpdatePayload
  extends RtsApplicationApprovalActionPayload {
  fieldValue: RtsApplicationApprovalFieldValuePayload[];
}

export interface RtsApplicationApprovalDecisionItem {
  status: string;
  remark: string | null;
  applicationId: number;
  applicationNo: string;
}

export type RtsApplicationApprovalDecisionResponse =
  RtsApplicationApprovalSuccessResponse<RtsApplicationApprovalDecisionItem>;

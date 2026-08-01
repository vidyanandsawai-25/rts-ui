export interface RtsApplicationApprovalApplicantDetail {
  fieldLabel: string;
  fieldValue: string | null;
}

export interface RtsApplicationApprovalDashboardCards {
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

export interface RtsApplicationApprovalListItem {
  id: number;
  departmentId: number;
  serviceId: number;
  applicationNo: string;
  applicationStatus: string;
  remark: string | null;
  createdDate: string | null;
  updatedDate: string | null;
  assignedTo: number | string | null;
  action: number | null;
  sessionId: string | null;
  ownerId: number | null;
  departmentName: string | null;
  citizenName: string | null;
  serviceName: string | null;
  sla: string | number | null;
  remainingDays: number | null;
  dueDays: number | null;
  overdueDays: number | null;
  applicantDetails: RtsApplicationApprovalApplicantDetail[] | null;
}

export interface RtsApplicationApprovalListPayload {
  items: RtsApplicationApprovalListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface RtsApplicationApprovalListResponse {
  status: boolean;
  message: string;
  item: RtsApplicationApprovalListPayload;
}

export interface RtsApplicationApprovalCardsResponse {
  status: boolean;
  message: string;
  item: RtsApplicationApprovalDashboardCards;
}

export interface RtsApplicationApprovalStage {
  approvalFlowStageId: number;
  stageOrder: number;
  stageName: string;
  status: string;
  remark: string | null;
  isCurrentStage: boolean;
}

export interface RtsApplicationApprovalDocument {
  fieldDefinitionId: number;
  documentName: string;
  documentGuid: string | null;
  isRequired: boolean;
  isUploaded: boolean;
}

export interface RtsApplicationApprovalDetails {
  totalApprovalStages: number;
  completedStages: number;
  approvalStages: RtsApplicationApprovalStage[];
  documents: RtsApplicationApprovalDocument[];
}

export interface RtsApplicationApprovalDetailsResponse {
  status: boolean;
  message: string;
  item: RtsApplicationApprovalDetails;
}

export interface GetRtsApplicationApprovalsParams {
  pageNumber?: number;
  pageSize?: number;
  departmentId?: number;
  serviceId?: number;
  applicationNo?: string;
  applicationStatus?: string;
}

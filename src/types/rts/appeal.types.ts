/**
 * RTS Appeal Management Types
 * Corresponding to Maharashtra Right to Public Services Act (MRTSA 2015)
 * Appellate Authority Subsystem.
 */

export interface RTSAppealTypeDto {
  id: number;
  appealTypeName: string;
  code: string;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export interface RTSAppealLevelCheckResultDto {
  applicationNo: string;
  appealLevel: string; // "1st Appeal" | "2nd Appeal"
  isSecondAppeal: boolean;
  existingAppealsCount: number;
  suggestedAppealNo: string;
  canFileAppeal: boolean;
  blockReason?: string | null;
  firstAppealStatus?: string | null;
  firstAppealNo?: string | null;
  filingCategory: string; // "Normal" | "Delayed"
  requiresDelayJustification: boolean;
  triggerDate?: string | null;
  triggerReason?: string | null;
  elapsedDays?: number | null;
  serviceSlaDays: number;
  serviceSlaExpiryDate?: string | null;
  deemedDelayDate?: string | null;
}

export interface RTSAppealDynamicFieldDto {
  fieldId: number;
  fieldName: string;
  fieldLabel: string;
  fieldValue: string;
  displayValue: string;
}

export interface RTSAppealDocumentDto {
  documentId: number;
  documentName: string;
  documentType: string;
  documentPath: string;
  isMandatory: boolean;
}

export interface RTSAppealTimelineItemDto {
  id: number;
  stageName?: string | null;
  action: string;
  actionByName?: string | null;
  status: string;
  remark: string;
  actionDate: string;
}

export interface RTSAppealApplicationSummaryDto {
  applicationId: number;
  applicationNo: string;
  serviceName: string;
  departmentName: string;
  applicantName: string;
  applicantMobile: string;
  applicantEmail?: string;
  status: string;
  appliedDate: string;
  rejectionDate?: string | null;
  rejectionReason?: string | null;
  dynamicFields: RTSAppealDynamicFieldDto[];
  documents: RTSAppealDocumentDto[];
  timeline: RTSAppealTimelineItemDto[];
}

export interface CreateRTSAppealApplicationDto {
  applicationNo: string;
  appealTypeId: number;
  reasonForAppeal: string;
  delayJustification?: string;
  mobileNo?: string;
  email?: string;
}

export interface RTSAppealApplicationResultDto {
  success: boolean;
  message: string;
  appealNo: string;
  appealLevel: string;
}

export interface RTSAppealDashboardCardsCountDto {
  totalAppeals: number;
  pendingAppeals: number;
  approvedAppeals: number;
  rejectedAppeals: number;
  returnedAppeals: number;
  firstAppeals: number;
  secondAppeals: number;
  delayedAppeals: number;
  overdueAppeals?: number;
  todayAppeals?: number;
  resolvedAppeals?: number;
}

export interface RTSAppealDashboardDetailsDto {
  id: number;
  appealNo: string;
  applicationId: number;
  applicationNo: string;
  applicantName: string;
  serviceName: string;
  departmentName?: string;
  appealLevel: number;
  appealLevelDisplay: string;
  appealTypeId: number;
  appealTypeName: string;
  appealStatus: string;
  filingDate: string;
  actionDate?: string | null;
  mobileNumber?: string;
  reasonForComplaint?: string;
  actionRemarks?: string;
  isDelayed?: boolean;
}

export interface RTSAppealHistoryItemDto {
  id: number;
  appealLevel: number;
  stageName?: string | null;
  action: string;
  actionByName?: string | null;
  status: string;
  remark: string;
  createdDate: string;
}

export interface RTSAppealPreviousSummaryDto {
  appealId: number;
  appealNo: string;
  appealLevel: number;
  status: string;
  filingDate: string;
  decisionDate?: string | null;
  actionRemarks?: string | null;
}

export interface RTSAppealProcessDetailsDto {
  appealId: number;
  appealNo: string;
  appealLevel: number;
  appealLevelDisplay?: string;
  appealLevelLabel?: string;
  appealStatus: string;
  appealType?: string;
  appealTypeName?: string;
  reasonForComplaint?: string;
  delayJustification?: string;
  filingDate?: string;
  actionRemarks?: string;
  actionDate?: string | null;
  actionByName?: string | null;
  actionByUserName?: string | null;
  applicationId?: number;
  applicationNo?: string;
  serviceId?: number;
  serviceName?: string;
  departmentId?: number;
  departmentName?: string;
  applicantName?: string;
  applicantMobile?: string;
  applicantEmail?: string;
  mobileNumber?: string;
  application?: RTSAppealApplicationSummaryDto;
  appealDetails?: RTSAppealApplicationSummaryDto;
  dynamicFields?: RTSAppealDynamicFieldDto[];
  documents?: RTSAppealDocumentDto[];
  timeline?: RTSAppealHistoryItemDto[];
  history?: RTSAppealHistoryItemDto[];
  previousAppeals?: RTSAppealPreviousSummaryDto[];
  canApprove?: boolean;
  canReject?: boolean;
  canReturn?: boolean;
}

export interface ProcessRTSAppealActionDto {
  appealId: number;
  action: 'Approve' | 'Reject' | 'Return' | 'Allowed' | 'Dismissed';
  remarks: string;
}

export interface RTSAppealQueryParameters {
  searchTerm?: string;
  appealStatus?: string;
  appealLevel?: number;
  appealTypeId?: number;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

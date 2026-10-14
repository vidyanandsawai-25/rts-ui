export interface RtsDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
  label?: string;
  fileName?: string;
}

export interface RtsTimelineStep {
  id?: string;
  title: string;
  role: string;
  officerName: string;
  status: "completed" | "active" | "pending" | "current" | string;
  timestamp?: string;
  remarks?: string;
}

export interface RtsApplication {
  id: string;
  applicationNo?: string;
  serviceId: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  citizenName: string;
  mobile: string;
  email: string;
  aadhaar: string;
  status: string;
  currentStage: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  slaLimitDays: number;
  daysRemaining: number;
  remainingDays: number;
  submittedAt: string;
  submissionDate?: string;
  appliedDate?: string;
  trackingId?: string;
  applicantName?: string;
  mobileNumber?: string;
  citizenPhone?: string;
  citizenEmail?: string;
  aadhaarNumber?: string;
  address?: string;
  citizenAddress?: string;
  slaDays?: number;
  source?: string;
  priority?: string;
  fieldValues: Record<string, unknown>;
  documents: RtsDocument[];
  timeline: RtsTimelineStep[];
  [key: string]: unknown;
}

export interface RtsOfficer {
  id: string;
  employeeId?: string;
  name: string;
  email?: string;
  mobile?: string;
  role: string;
  designation?: string;
  departmentId: string;
  departmentName?: string;
  activeCasesCount?: number;
  status?: string;
}

export interface RtsApplicationApiDetail {
  departmentId: number;
  serviceId: number;
  sessionId: string | null;
  ownerId: number | null;
  applicationNo: string;
  applicationStatus: string;
  fieldValues: Array<{
    applicationId: number;
    fieldDefinitionId: number;
    textValue: string | null;
    numberValue: number | null;
    dateValue: string | null;
    booleanValue: boolean | null;
    documentGuid: string | null;
  }>;
}

export interface RtsApplicationFieldValuePayload {
  isActive?: boolean;
  createdBy?: number;
  fieldDefinitionId: number;
  textValue?: string | null;
  numberValue?: number | null;
  dateValue?: string | null;
  booleanValue?: boolean | null;
  documentGuid?: string | null;
}

/**
 * A field value submitted while resubmitting a reverted RTS application.
 * The update endpoint uses audit fields from UpdateBaseDtos rather than the
 * create-only `createdBy` field.
 */
export interface UpdateRtsApplicationFieldValuePayload {
  isActive?: boolean;
  updatedBy?: number;
  fieldDefinitionId: number;
  textValue?: string | null;
  numberValue?: number | null;
  dateValue?: string | null;
  booleanValue?: boolean | null;
  documentGuid?: string | null;
}

export interface CreateRtsApplicationPayload {
  isActive?: boolean;
  createdBy?: number;
  departmentId?: number;
  serviceId?: number;
  applicantName: string;
  applicantMobileNo: string;
  approvalFlowId: number;
  currentApprovalFlowStageId: number;
  currentStageOrder: number;
  userId?: number;
  sessionId: string;
  ownerId?: number;
  applicationStatus?: string | null;
  remark?: string | null;
  fieldValues: RtsApplicationFieldValuePayload[];
  tdToken?: string | null;
}

/** Request body for PUT /api/RTSApplication/{id}. */
export interface UpdateRtsApplicationPayload {
  isActive?: boolean;
  updatedBy?: number;
  serviceId: number;
  approvalFlowId: number;
  currentApprovalFlowStageId: number;
  currentStageOrder: number;
  applicantName?: string | null;
  applicantMobileNo?: string | null;
  userId?: number | null;
  sessionId?: string | null;
  applicationStatus: string;
  remark?: string | null;
  fieldValues: UpdateRtsApplicationFieldValuePayload[];
}

/**
 * Persisted workflow values supplied by the resubmit page. The update API
 * remains authoritative for the application workflow; these values complete
 * its request contract without deriving them in the browser.
 */
export interface RtsApplicationResubmitContext {
  serviceId: number;
  approvalFlowId: number;
  currentApprovalFlowStageId: number;
  currentStageOrder: number;
  userId?: number | null;
  applicationStatus: string;
  sessionId?: string | null;
}

export interface CreateRtsApplicationFieldValueResponse {
  applicationId: number;
  fieldDefinitionId: number;
  textValue: string | null;
  numberValue: number | null;
  dateValue: string | null;
  booleanValue: boolean | null;
  documentGuid: string | null;
  id: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateRtsApplicationResponseItem {
  id: number;
  departmentId: number;
  serviceId: number;
  sessionId: string | null;
  ownerId: number | null;
  applicationNo: string;
  applicationStatus: string;
  fieldValues: CreateRtsApplicationFieldValueResponse[];
  paymentTransactionId?: number | null;
  paymentRequiredFee?: number;
  paymentStatus?: string | null;
}

export interface UpdateRtsApplicationResponseItem extends CreateRtsApplicationResponseItem {
  applicantName?: string | null;
  applicantMobileNo?: string | null;
  approvalFlowId?: number;
  currentApprovalFlowStageId?: number;
  currentStageOrder?: number;
  userId?: number | null;
  remark?: string | null;
}

export interface CreateRtsApplicationResponse {
  success: boolean;
  message: string;
  items: CreateRtsApplicationResponseItem;
  errors: unknown;
  correlationId: string | null;
}

/** API envelope returned by PUT /api/RTSApplication/{id}. */
export interface UpdateRtsApplicationResponse {
  success: boolean;
  message: string;
  items: UpdateRtsApplicationResponseItem;
  errors: unknown;
  correlationId: string | null;
}

export interface RtsApplicationApiApplicantDetail {
  fieldLabel: string;
  fieldValue: string | null;
}

export interface GetRtsApplicationApprovalListParams {
  pageNumber?: number;
  pageSize?: number;
  departmentId?: number;
  serviceId?: number;
  applicationNo?: string;
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'applicationNo' | 'CreatedDate' | 'ApplicantName' | 'ApplicationStatus' | 'UpdatedDate' | 'RemainingDays' | 'FIFO';
  sortOrder?: 'asc' | 'desc';
  userId?: number;
  currentUserId?: number;
  isFifo?: boolean;
}

export interface UploadRtsDocumentPayload {
  file: File;
  documentType?: string;
  departmentId?: number;
  moduleId?: number;
  isPrimaryDocument?: boolean;
}

export interface UploadRtsDocumentItem {
  documentGuid: string;
  documentId: number;
  documentBindingId: number | null;
  fileName: string;
  fileSizeBytes: number;
  storagePath: string;
}

export interface UploadRtsDocumentResponse {
  success: boolean;
  message: string;
  items: UploadRtsDocumentItem;
  errors: unknown;
  correlationId: string | null;
}

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
}

export interface CreateRtsApplicationResponse {
  success: boolean;
  message: string;
  items: CreateRtsApplicationResponseItem;
  errors: unknown;
  correlationId: string | null;
}

export interface RtsApplicationApiApplicantDetail {
  fieldLabel: string;
  fieldValue: string | null;
}

export interface GetRtsApplicationApprovalListParams {
  pageNumber?: number;
  departmentId?: number;
  serviceId?: number;
  applicationNo?: string;
  status?: string;
  sortBy?: 'applicationNo' | 'CreatedDate' | 'ApplicantName' | 'ApplicationStatus' | 'UpdatedDate';
  sortOrder?: 'asc' | 'desc';
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

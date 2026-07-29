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

export interface RtsApplicationApiApplicantDetail {
  fieldLabel: string;
  fieldValue: string | null;
}

export interface RtsApplicationApiDashboard {
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

export interface RtsApplicationApiListItem {
  id: number;
  departmentId: number;
  serviceId: number;
  applicationNo: string;
  applicationStatus: string;
  createdDate: string;
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
  remark: string | null;
  applicantDetails: RtsApplicationApiApplicantDetail[] | null;
}

export interface RtsApplicationsApiListPayload {
  dashboard: RtsApplicationApiDashboard | null;
  applications: RtsApplicationApiListItem[] | null;
}

export interface RtsApplicationsApiListResponse {
  items: RtsApplicationsApiListPayload[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
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

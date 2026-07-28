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
  fieldValues: Record<string, any>;
  documents: RtsDocument[];
  timeline: RtsTimelineStep[];
  [key: string]: any;
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

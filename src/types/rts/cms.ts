export interface CmsDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
}

export interface CmsTimelineStep {
  id: string;
  title: string;
  role: string;
  officerName: string;
  status: "completed" | "active" | "pending";
  timestamp?: string;
  remarks?: string;
}

export interface CmsApplication {
  id: string;
  applicationNo: string;
  serviceId: string;
  serviceName: string;
  departmentId: string;
  departmentName: string;
  citizenName: string;
  mobile: string;
  email: string;
  aadhaar: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Returned";
  currentStage: string;
  assignedOfficerId: string;
  assignedOfficerName: string;
  slaLimitDays: number;
  daysRemaining: number;
  remainingDays: number;
  submittedAt: string;
  fieldValues: Record<string, any>;
  documents: CmsDocument[];
  timeline: CmsTimelineStep[];
}

export interface CmsOfficer {
  id: string;
  name: string;
  role: string;
  designation?: string;
  departmentId: string;
  departmentName?: string;
}

export interface RtsApplicationDashboardDepartmentItem {
  departmentId: number;
  departmentName: string;
  totalServices: number | null;
  totalApplications: number | null;
  pending: number | null;
  approved: number | null;
  rejected: number | null;
  overdueCount: number | null;
  sla: number | null;
  reverted?: number | null;
  todayApplications?: number | null;
  overdueApplications?: number | null;
  dueToday?: number | null;
  fromAapleSarkar?: number | null;
  fromRTS?: number | null;
  rtsOnline?: number | null;
  rtsOffline?: number | null;
}

export interface RtsApplicationDashboardApplicationItem {
  id: number;
  departmentId: number;
  serviceId: number;
  applicationNo: string;
  applicationStatus: string;
  applicantName: string | null;
  applicantMobileNo: string | null;
  propertyNo: string | null;
  upicId: string | null;
  remark: string | null;
  createdDate: string;
  updatedDate: string | null;
  userId: number | null;
  userName: string | null;
  sessionId: string | null;
  ownerId: number | null;
  departmentName: string;
  departmentNameLocal: string | null;
  serviceName: string;
  serviceNameLocal: string | null;
  sla: string | number | null;
  remainingDays: number | null;
  dueDays: number | null;
  overdueDays: number | null;
}

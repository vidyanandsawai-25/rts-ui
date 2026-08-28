export interface RtsMisDashboardServiceItem {
  serviceName: string;
  departmentId?: number;
  departmentName?: string;
  totalApplications: number | null;
  pending: number | null;
  approved: number | null;
  rejected: number | null;
  overdueCount: number | null;
  sla: number | null;
  // Older deployments can include source counts; the updated API may omit them.
  aapleSarkarApplications?: number | null;
  rtsApplications?: number | null;
}

export interface RtsMisDashboardDepartmentItem {
  departmentId: number;
  departmentName: string;
  totalServices: number | null;
  totalApplications: number | null;
  pending: number | null;
  approved: number | null;
  rejected: number | null;
  overdueCount: number | null;
  sla: number | null;
  // Older deployments can include source counts; the updated API may omit them.
  fromAapleSarkar?: number | null;
  fromRTS?: number | null;
  rtsOnline?: number | null;
  rtsOffline?: number | null;
}

export interface RtsMisDashboardUserApplicationItem {
  serviceName: string;
  serviceNameLocal?: string | null;
  applicationNo: string;
  sla: number;
  submittedDate: string;
  status: string;
  remark?: string | null;
}

export interface RtsMisDashboardApplicationItem {
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

export interface RtsMisDashboardData {
  serviceWiseData: RtsMisDashboardServiceItem[] | null;
  departmentWiseData: RtsMisDashboardDepartmentItem[] | null;
  userApplicationDashboardData: RtsMisDashboardUserApplicationItem[] | null;
  rtsApplicationDashboardDetails?: RtsMisDashboardApplicationItem[] | null;
}

export interface RtsMisDashboardResponse {
  status: boolean;
  message: string;
  data: RtsMisDashboardData;
}

export type RtsMisDashboardFlag = 'admin' | 'user' | 'RTSApplicationDashboard';

export type RtsMisDashboardInputFlag = RtsMisDashboardFlag | 'Admin' | 'User';

// These values are case-sensitive backend contract values.
export type RtsMisDashboardModuleName = '' | 'RTS' | 'AapleSarkar' | 'Offline';

export interface RtsMisDashboardRequest {
  Flag: RtsMisDashboardFlag;
  UpicId: string | null;
  ApplicationNo: string | null;
  // The backend contract uses this spelling, so preserve it in the request type.
  DeparmentId: number | null;
  DeparmentName: string | null;
  ServiceName?: string | null;
  ModuleName: RtsMisDashboardModuleName | null;
  FromDate: string | null;
  ToDate: string | null;
  pageNumber?: number;
  pageSize?: number;
  ApplicationStatus?: string | null;
}

export type RtsMisDashboardRequestInput =
  Partial<Omit<RtsMisDashboardRequest, 'Flag'>> & {
    Flag?: RtsMisDashboardInputFlag;
  };

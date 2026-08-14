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

export interface RtsMisDashboardData {
  serviceWiseData: RtsMisDashboardServiceItem[];
  departmentWiseData: RtsMisDashboardDepartmentItem[];
  userApplicationDashboardData: RtsMisDashboardUserApplicationItem[];
}

export interface RtsMisDashboardResponse {
  status: boolean;
  message: string;
  data: RtsMisDashboardData;
}

export type RtsMisDashboardFlag = 'admin' | 'user';

export type RtsMisDashboardInputFlag = RtsMisDashboardFlag | 'Admin' | 'User';

// These values are case-sensitive backend contract values.
export type RtsMisDashboardModuleName = '' | 'RTS' | 'AapleSarkar' | 'Offline';

export interface RtsMisDashboardRequest {
  Flag: RtsMisDashboardFlag;
  UpicId: string;
  ApplicationNo: string;
  // The backend contract uses this spelling, so preserve it in the request type.
  DeparmentId: number | null;
  DeparmentName: string;
  ModuleName: RtsMisDashboardModuleName;
}

export type RtsMisDashboardRequestInput =
  Partial<Omit<RtsMisDashboardRequest, 'Flag'>> & {
    Flag?: RtsMisDashboardInputFlag;
  };

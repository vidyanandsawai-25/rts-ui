export interface RtsMisDashboardServiceItem {
  serviceName: string;
  departmentId?: string | number;
  departmentName?: string;
  totalApplications: number;
  aapleSarkarApplications: number;
  rtsApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  overdueCount: number;
  sla: number;
}

export interface RtsMisDashboardDepartmentItem {
  departmentId: string | number;
  departmentName: string;
  totalServices: number;
  totalApplications: number;
  fromAapleSarkar: number;
  fromRTS: number;
  rtsOnline: number;
  rtsOffline: number;
  pending: number;
  approved: number;
  rejected: number;
  overdueCount: number;
  sla: number;
}

export interface RtsMisDashboardUserApplicationItem {
  serviceName: string;
  serviceNameLocal: string;
  applicationNo: string;
  sla: number;
  submittedDate: string;
  status: string;
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

export type RtsMisDashboardFlag = 'Admin' | 'User';

// Retained while existing callers migrate to the API's title-cased values.
export type RtsMisDashboardInputFlag = RtsMisDashboardFlag | 'admin' | 'user';

export interface RtsMisDashboardRequest {
  Flag: RtsMisDashboardInputFlag;
  UpicId: string;
  // The backend contract uses this spelling, so preserve it in the request type.
  DeparmentId?: number;
  DeparmentName?: string;
}

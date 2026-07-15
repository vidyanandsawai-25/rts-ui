export interface CmsMisDashboardServiceItem {
  serviceName: string;
  totalApplications: number;
  aapleSarkarApplications: number;
  rtsApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  overdueCount: number;
  sla: number;
}

export interface CmsMisDashboardDepartmentItem {
  departmentName: string;
  totalServices: number;
  totalApplications: number;
  fromAapleSarkar: number;
  fromRTS: number;
  pending: number;
  approved: number;
  rejected: number;
  overdueCount: number;
  sla: number;
}

export interface CmsMisDashboardUserApplicationItem {
  serviceName: string;
  serviceNameLocal: string;
  applicationNo: string;
  sla: number;
  submittedDate: string;
  status: string;
}

export interface CmsMisDashboardData {
  serviceWiseData: CmsMisDashboardServiceItem[];
  departmentWiseData: CmsMisDashboardDepartmentItem[];
  userApplicationDashboardData: CmsMisDashboardUserApplicationItem[];
}

export interface CmsMisDashboardResponse {
  status: boolean;
  message: string;
  data: CmsMisDashboardData;
}
export type CmsMisDashboardFlag = 'admin' | 'user';

export interface CmsMisDashboardRequest {
  Flag: CmsMisDashboardFlag;
  UpicId: string;
}

import type { RtsMisDashboardUserApplicationItem } from './rtscitizendashboard.types';
import type {
  RtsApplicationDashboardApplicationItem,
  RtsApplicationDashboardDepartmentItem,
} from './rtsapplicationdashboard.types';

// Compatibility aliases for existing MIS consumers. The application-dashboard
// contract itself is defined in rtsapplicationdashboard.types.ts.
export type RtsMisDashboardApplicationItem = RtsApplicationDashboardApplicationItem;
export type RtsMisDashboardDepartmentItem = RtsApplicationDashboardDepartmentItem;

export interface RtsMisDashboardServiceItem {
  serviceName: string;
  departmentId?: number;
  departmentName?: string;
  totalApplications: number | null;
  pending: number | null;
  approved: number | null;
  rejected: number | null;
  reverted?: number | null;
  overdueCount: number | null;
  sla: number | null;
  // Older deployments can include source counts; the updated API may omit them.
  aapleSarkarApplications?: number | null;
  rtsApplications?: number | null;
}

export interface RtsMisDashboardData {
  serviceWiseData: RtsMisDashboardServiceItem[] | null;
  departmentWiseData: RtsMisDashboardDepartmentItem[] | null;
  userApplicationDashboardData: RtsMisDashboardUserApplicationItem[] | null;
  rtsApplicationDashboardDetails?: RtsMisDashboardApplicationItem[] | null;
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface RtsMisDashboardResponse {
  status: boolean;
  message: string;
  data: RtsMisDashboardData;
}

export interface CitizenLandingApplicationCounts {
  received: number;
  delivered: number;
}

export type RtsMisDashboardFlag = 'admin';

export type RtsMisDashboardInputFlag = RtsMisDashboardFlag | 'Admin';

// These values are case-sensitive backend contract values.
export type RtsMisDashboardModuleName = '' | 'RTS' | 'AapleSarkar' | 'Offline';

export interface RtsMisDashboardRequest {
  Flag: RtsMisDashboardFlag;
  UpicId: string | null;
  ApplicationNo: string | null;
  // The backend contract intentionally uses the misspelled "Deparment" keys.
  DeparmentId: number | null;
  DeparmentName: string | null;
  ServiceId?: number | null;
  ModuleName: RtsMisDashboardModuleName | null;
  FromDate: string | null;
  ToDate: string | null;
  pageNumber?: number | null;
  pageSize?: number | null;
  ApplicationStatus?: string | null;
}

export type RtsMisDashboardRequestInput =
  Partial<Omit<RtsMisDashboardRequest, 'Flag'>> & {
    Flag?: RtsMisDashboardInputFlag;
  };

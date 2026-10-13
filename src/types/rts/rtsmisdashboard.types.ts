import type { RtsMisDashboardUserApplicationItem } from './rtscitizendashboard.types';
import type {
  RtsApplicationDashboardApplicationItem,
  RtsApplicationDashboardDepartmentItem,
} from './rtsapplicationdashboard.types';

// The application item contract is shared with the application dashboard.
// MIS service/department rows add their localized display-name fields here.
export type RtsMisDashboardApplicationItem = RtsApplicationDashboardApplicationItem;
export interface RtsMisDashboardDepartmentItem extends RtsApplicationDashboardDepartmentItem {
  /** Marathi/Hindi display name supplied by the MIS backend. */
  departmentNameLocal?: string | null;
}

export interface RtsMisDashboardServiceItem {
  serviceName: string;
  /** Marathi/Hindi display name supplied by the MIS backend. */
  serviceNameLocal?: string | null;
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

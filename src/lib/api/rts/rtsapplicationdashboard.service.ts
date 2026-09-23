import 'server-only';

import type {
  RtsMisDashboardApplicationItem,
  RtsMisDashboardDepartmentItem,
} from '@/types/rts/rtsmisdashboard.types';

export interface RtsApplicationDashboardRequest {
  UpicId: string | null;
  ApplicationNo: string | null;
  ApplicationStatus: string | null;
  DepartmentName: string | null;
  ServiceId: number | null;
  FromDate: string | null;
  ToDate: string | null;
  PageNumber: number | null;
  PageSize: number | null;
}

export type RtsApplicationDashboardRequestInput = Partial<RtsApplicationDashboardRequest>;

export interface RtsApplicationDashboardData {
  dashboardCardCount: RtsMisDashboardDepartmentItem[] | null;
  // The API contract currently returns this key with the "Dahboard" spelling.
  applicationDahboardData: RtsMisDashboardApplicationItem[] | null;
  totalRecords: number | null;
  pageSize: number | null;
  pageNumber: number | null;
}

export interface RtsApplicationDashboardResponse {
  status: boolean;
  message: string;
  data: RtsApplicationDashboardData;
}

function getOneSolutionBaseUrl(): string {
  const baseUrl =
    process.env.AKOLA_ONESOLUTION_BASE_URL?.trim() ||
    process.env.RTS_MIS_DASHBOARD_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error(
      'AKOLA_ONESOLUTION_BASE_URL is not configured in environment variables. Please check your .env file.'
    );
  }

  return baseUrl.replace(/\/+$/, '');
}

/** Fetches paged application-dashboard data and its department summary-card counts. */
export async function getRtsApplicationDashboardData(
  payload: RtsApplicationDashboardRequestInput = {}
): Promise<RtsApplicationDashboardResponse> {
  const endpointUrl =
    process.env.RTS_APPLICATION_DASHBOARD_URL?.trim() ||
    `${getOneSolutionBaseUrl()}/PropertyTaxMicroservice/PropertyTaxApi/AapleSarkar/GetApplicationDashboardData`;

  const requestPayload: RtsApplicationDashboardRequest = {
    UpicId: payload.UpicId?.trim() || null,
    ApplicationNo: payload.ApplicationNo?.trim() || null,
    ApplicationStatus: payload.ApplicationStatus?.trim() || null,
    DepartmentName: payload.DepartmentName?.trim() || null,
    ServiceId: payload.ServiceId ?? null,
    FromDate: payload.FromDate?.trim() || null,
    ToDate: payload.ToDate?.trim() || null,
    PageNumber: payload.PageNumber ?? null,
    PageSize: payload.PageSize ?? null,
  };

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestPayload),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch application dashboard data: ${response.status}`);
  }

  return (await response.json()) as RtsApplicationDashboardResponse;
}

import 'server-only';

import type {
  RtsApplicationDashboardApplicationItem,
  RtsApplicationDashboardDepartmentItem,
} from '@/types/rts/rtsapplicationdashboard.types';

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
  dashboardCardCount: RtsApplicationDashboardDepartmentItem[] | null;
  // The API contract currently returns this key with the "Dahboard" spelling.
  applicationDahboardData: RtsApplicationDashboardApplicationItem[] | null;
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
  try {
    let endpointUrl: string;
    try {
      endpointUrl =
        process.env.RTS_APPLICATION_DASHBOARD_URL?.trim() ||
        `${getOneSolutionBaseUrl()}/PropertyTaxMicroservice/PropertyTaxApi/AapleSarkar/GetApplicationDashboardData`;
    } catch {
      return {
        status: false,
        message: 'External OneSolution base URL is not configured.',
        data: {
          totalRecords: 0,
          dashboardCardCount: [],
          applicationDahboardData: [],
          pageSize: null,
          pageNumber: null,
        },
      };
    }

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
      console.warn(
        `[RTS Dashboard] External dashboard endpoint returned ${response.status} (${endpointUrl}). Falling back to local data.`
      );
      return {
        status: false,
        message: `External endpoint returned ${response.status}`,
        data: {
          totalRecords: 0,
          dashboardCardCount: [],
          applicationDahboardData: [],
          pageSize: null,
          pageNumber: null,
        },
      };
    }

    return (await response.json()) as RtsApplicationDashboardResponse;
  } catch (err) {
    console.warn('[RTS Dashboard] Failed to fetch external application dashboard data:', err);
    return {
      status: false,
      message: err instanceof Error ? err.message : 'Failed to fetch dashboard data',
      data: {
        totalRecords: 0,
        dashboardCardCount: [],
        applicationDahboardData: [],
        pageSize: null,
        pageNumber: null,
      },
    };
  }
}

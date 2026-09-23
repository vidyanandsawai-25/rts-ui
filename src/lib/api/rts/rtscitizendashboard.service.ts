import type { RtsMisDashboardUserApplicationItem } from '@/types/rts/rtsmisdashboard.types';

export interface RtsCitizenDashboardRequest {
  UpicId: string | null;
  ApplicationNo: string | null;
  ApplicationStatus: string | null;
  FromDate: string | null;
  ToDate: string | null;
  pageNumber: number | null;
  pageSize: number | null;
}

export type RtsCitizenDashboardRequestInput = Partial<RtsCitizenDashboardRequest>;

export interface RtsCitizenDashboardAsyncResult {
  result: RtsMisDashboardUserApplicationItem[] | null;
  id: number | null;
  exception: unknown | null;
  status: number | null;
  isCanceled: boolean;
  isCompleted: boolean;
  isCompletedSuccessfully: boolean;
  creationOptions: number | null;
  asyncState: unknown | null;
  isFaulted: boolean;
}

export interface RtsCitizenDashboardResponse {
  status: boolean;
  message: string;
  data: RtsCitizenDashboardAsyncResult;
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

/** Fetches applications linked only to the supplied citizen UPIC. */
export async function getRtsCitizenDashboardData(
  payload: RtsCitizenDashboardRequestInput = {}
): Promise<RtsCitizenDashboardResponse> {
  const endpointUrl =
    process.env.RTS_CITIZEN_DASHBOARD_URL?.trim() ||
    `${getOneSolutionBaseUrl()}/PropertyTaxMicroservice/PropertyTaxApi/AapleSarkar/GetCitizenDashboardData`;

  const requestPayload: RtsCitizenDashboardRequest = {
    UpicId: payload.UpicId?.trim() || null,
    ApplicationNo: payload.ApplicationNo?.trim() || null,
    ApplicationStatus: payload.ApplicationStatus?.trim() || null,
    FromDate: payload.FromDate?.trim() || null,
    ToDate: payload.ToDate?.trim() || null,
    pageNumber: payload.pageNumber ?? null,
    pageSize: payload.pageSize ?? null,
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
    throw new Error(`Failed to fetch citizen dashboard data: ${response.status}`);
  }

  return (await response.json()) as RtsCitizenDashboardResponse;
}

'use server';

import type {
  RtsMisDashboardRequestInput,
  RtsMisDashboardRequest,
  RtsMisDashboardResponse,
  RtsMisDashboardFlag,
} from '@/types/rts/rtsmisdashboard.types';

function getOneSolutionBaseUrl(): string {
  const url =
    process.env.AKOLA_ONESOLUTION_BASE_URL?.trim() ||
    process.env.RTS_MIS_DASHBOARD_BASE_URL?.trim();

  if (!url) {
    throw new Error(
      'AKOLA_ONESOLUTION_BASE_URL is not configured in environment variables. Please check your .env file.'
    );
  }

  return url.replace(/\/+$/, '');
}

export async function getRtsMisDashboardData(
  payload: RtsMisDashboardRequestInput = {}
): Promise<RtsMisDashboardResponse> {
  const baseUrl = getOneSolutionBaseUrl();
  const endpointUrl =
    process.env.RTS_MIS_DASHBOARD_URL?.trim() ||
    `${baseUrl}/PropertyTaxMicroservice/PropertyTaxApi/AapleSarkar/GetMISDashboardData`;

  const normalizedFlag = payload.Flag?.trim().toLowerCase();
  const resolvedFlag: RtsMisDashboardFlag =
    normalizedFlag === 'rtsapplicationdashboard'
      ? 'RTSApplicationDashboard'
      : normalizedFlag === 'user'
        ? 'user'
        : 'admin';

  const requestPayload: RtsMisDashboardRequest = {
    Flag: resolvedFlag,
    UpicId: payload.UpicId?.trim() || null,
    ApplicationNo: payload.ApplicationNo?.trim() || null,
    DeparmentId: payload.DeparmentId ?? null,
    DeparmentName: payload.DeparmentName?.trim() || null,
    ModuleName: payload.ModuleName ?? null,
    // The backend binds these as nullable DateTime values; empty strings cause a 400.
    FromDate: payload.FromDate?.trim() || null,
    ToDate: payload.ToDate?.trim() || null,
    ServiceId: payload.ServiceId ?? null,
    pageNumber: payload.pageNumber ?? null,
    pageSize: payload.pageSize ?? null,
    ApplicationStatus: payload.ApplicationStatus?.trim() || null,
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
    throw new Error(`Failed to fetch RTS MIS dashboard data: ${response.status}`);
  }

  return (await response.json()) as RtsMisDashboardResponse;
}

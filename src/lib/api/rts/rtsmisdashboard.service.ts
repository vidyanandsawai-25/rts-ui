'use server';

import type {
  RtsMisDashboardRequestInput,
  RtsMisDashboardRequest,
  RtsMisDashboardResponse,
} from '@/types/rts/rtsmisdashboard.types';

const RTS_MIS_DASHBOARD_URL =
  `${process.env.RTS_MIS_DASHBOARD_BASE_URL}/PropertyTaxMicroservice/PropertyTaxApi/AapleSarkar/GetMISDashboardData`;

export async function getRtsMisDashboardData(
  payload: RtsMisDashboardRequestInput = {}
): Promise<RtsMisDashboardResponse> {
  const normalizedFlag = payload.Flag?.trim().toLowerCase();
  const isApplicationDashboard = normalizedFlag === 'rtsapplicationdashboard';
  const requestPayload: RtsMisDashboardRequest = {
    Flag: isApplicationDashboard
      ? 'RTSApplicationDashboard'
      : normalizedFlag === 'user' ? 'user' : 'admin',
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

  const response = await fetch(RTS_MIS_DASHBOARD_URL, {
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

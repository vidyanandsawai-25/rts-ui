'use server';

import type {
  RtsMisDashboardRequest,
  RtsMisDashboardResponse,
} from '@/types/rts/rtsmisdashboard.types';

const RTS_MIS_DASHBOARD_URL =
  'https://onesolutionakola.tabamc.in/PropertyTaxMicroservice/PropertyTaxApi/AapleSarkar/GetMISDashboardData';

export async function getRtsMisDashboardData(
  payload: RtsMisDashboardRequest = { Flag: 'Admin', UpicId: '' }
): Promise<RtsMisDashboardResponse> {
  const requestPayload: RtsMisDashboardRequest = {
    ...payload,
    Flag: payload.Flag.toLowerCase() === 'user' ? 'User' : 'Admin',
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

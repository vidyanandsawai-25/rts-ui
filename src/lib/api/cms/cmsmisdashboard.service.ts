'use server';

import type {
  CmsMisDashboardRequest,
  CmsMisDashboardResponse,
} from '@/types/cms/cmsmisdashboard.types';

const CMS_MIS_DASHBOARD_URL =
  'https://onesolutionakola.tabamc.in/PropertyTaxMicroservice/PropertyTaxApi/AapleSarkar/GetMISDashboardData';

export async function getCmsMisDashboardData(
  payload: CmsMisDashboardRequest = { Flag: 'admin', UpicId: '' }
): Promise<CmsMisDashboardResponse> {
  const response = await fetch(CMS_MIS_DASHBOARD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CMS MIS dashboard data: ${response.status}`);
  }

  return (await response.json()) as CmsMisDashboardResponse;
}

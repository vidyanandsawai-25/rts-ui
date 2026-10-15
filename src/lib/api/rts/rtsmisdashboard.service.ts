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
  try {
    let endpointUrl: string;
    try {
      const baseUrl = getOneSolutionBaseUrl();
      endpointUrl =
        process.env.RTS_MIS_DASHBOARD_URL?.trim() ||
        `${baseUrl}/PropertyTaxMicroservice/PropertyTaxApi/AapleSarkar/GetMISDashboardData`;
    } catch {
      return {
        status: false,
        message: 'External OneSolution base URL is not configured.',
        data: {
          departmentWiseData: [],
          serviceWiseData: [],
          userApplicationDashboardData: [],
          rtsApplicationDashboardDetails: [],
          totalRecords: 0,
        },
      };
    }

  // Application-dashboard requests use rtsapplicationdashboard.service.ts.
  // The MIS integration now supports the admin response only.
  const resolvedFlag: RtsMisDashboardFlag = 'admin';

    const requestPayload: RtsMisDashboardRequest = {
      Flag: resolvedFlag,
      UpicId: payload.UpicId?.trim() || null,
      ApplicationNo: payload.ApplicationNo?.trim() || null,
      DeparmentId: payload.DeparmentId ?? null,
      DeparmentName: payload.DeparmentName?.trim() || null,
      ModuleName: payload.ModuleName ?? null,
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
      console.warn(
        `[RTS MIS] External MIS dashboard endpoint returned ${response.status} (${endpointUrl}). Falling back to local data.`
      );
      return {
        status: false,
        message: `External endpoint returned ${response.status}`,
        data: {
          departmentWiseData: [],
          serviceWiseData: [],
          userApplicationDashboardData: [],
          rtsApplicationDashboardDetails: [],
          totalRecords: 0,
        },
      };
    }

    return (await response.json()) as RtsMisDashboardResponse;
  } catch (err) {
    console.warn('[RTS MIS] Failed to fetch external MIS dashboard data:', err);
    return {
      status: false,
      message: err instanceof Error ? err.message : 'Failed to fetch MIS dashboard data',
      data: {
        departmentWiseData: [],
        serviceWiseData: [],
        userApplicationDashboardData: [],
        rtsApplicationDashboardDetails: [],
        totalRecords: 0,
      },
    };
  }
}

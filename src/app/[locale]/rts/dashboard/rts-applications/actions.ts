'use server';

import { getCmsMisDashboardData } from '@/lib/api/rts/rtsmisdashboard.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import type { CmsMisDashboardResponse } from '@/types/rts/rtsmisdashboard.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

export async function getRtsApplicationServicesAction(): Promise<RtsServiceApiItem[]> {
  try {
    return await getAllRtsServices();
  } catch (error) {
    console.error('Failed to fetch RTS application services:', error);
    return [];
  }
}

export async function getUserMisDashboardAction(): Promise<CmsMisDashboardResponse> {
  try {
    return await getCmsMisDashboardData({
      Flag: 'user',
      UpicId: 'AKLMC000010',
    });
  } catch (error) {
    console.error('Failed to fetch User MIS Dashboard:', error);

    return {
      status: false,
      message: 'Failed to fetch dashboard data.',
      data: {
        serviceWiseData: [],
        departmentWiseData: [],
        userApplicationDashboardData: [],
      },
    };
  }
}

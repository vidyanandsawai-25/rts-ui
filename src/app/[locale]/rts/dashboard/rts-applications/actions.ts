'use server';

import { getCmsMisDashboardData } from '@/lib/api/rts/rtsmisdashboard.service';
import type { CmsMisDashboardResponse } from '@/types/rts/rtsmisdashboard.types';

export async function getUserMisDashboardAction(): Promise<CmsMisDashboardResponse> {
  try {
    return await getCmsMisDashboardData({
      Flag: 'user',
      UpicId: 'AKLMC000008',
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
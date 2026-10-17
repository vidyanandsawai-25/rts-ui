'use server';

import { getRtsMisDashboardData } from '@/lib/api/rts/rtsmisdashboard.service';
import type {
  CitizenLandingApplicationCounts,
  RtsMisDashboardDepartmentItem,
} from '@/types/rts/rtsmisdashboard.types';

const REQUIRED_DEPARTMENT_ID = 1;
const REQUIRED_DEPARTMENT_NAME = 'Property Tax';

function getCount(value: number | null | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

function sumDepartmentCounts(
  departments: RtsMisDashboardDepartmentItem[] | null | undefined
): CitizenLandingApplicationCounts {
  return (departments ?? []).reduce<CitizenLandingApplicationCounts>(
    (totals, department) => ({
      received:
        totals.received +
        getCount(department.pending) +
        getCount(department.approved) +
        getCount(department.rejected) +
        getCount(department.reverted),
      delivered: totals.delivered + getCount(department.approved),
    }),
    { received: 0, delivered: 0 }
  );
}

/** Returns public landing totals from the RTS module's department summaries. */
export async function getCitizenLandingApplicationCountsAction(): Promise<CitizenLandingApplicationCounts | null> {
  try {
    const response = await getRtsMisDashboardData({
      Flag: 'admin',
      DeparmentId: REQUIRED_DEPARTMENT_ID,
      DeparmentName: REQUIRED_DEPARTMENT_NAME,
      ModuleName: 'RTS',
    });

    return response.status ? sumDepartmentCounts(response.data?.departmentWiseData) : null;
  } catch {
    return null;
  }
}

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  RtsMisDashboardDepartmentItem,
  RtsMisDashboardResponse,
} from '@/types/rts/rtsmisdashboard.types';

vi.mock('@/lib/api/rts/rtsmisdashboard.service', () => ({
  getRtsMisDashboardData: vi.fn(),
}));

import { getCitizenLandingApplicationCountsAction } from '@/app/[locale]/service/actions';
import { getRtsMisDashboardData } from '@/lib/api/rts/rtsmisdashboard.service';

function createResponse(
  departmentWiseData: RtsMisDashboardDepartmentItem[],
  status = true
): RtsMisDashboardResponse {
  return {
    status,
    message: '',
    data: {
      serviceWiseData: [],
      departmentWiseData,
      userApplicationDashboardData: [],
    },
  };
}

function department(
  departmentId: number,
  counts: Partial<Pick<RtsMisDashboardDepartmentItem, 'pending' | 'approved' | 'rejected' | 'reverted'>>
): RtsMisDashboardDepartmentItem {
  return {
    departmentId,
    departmentName: `Department ${departmentId}`,
    totalServices: 0,
    totalApplications: 0,
    pending: counts.pending ?? 0,
    approved: counts.approved ?? 0,
    rejected: counts.rejected ?? 0,
    reverted: counts.reverted ?? 0,
    overdueCount: 0,
    sla: 0,
  };
}

describe('getCitizenLandingApplicationCountsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests both sources with the backend-required department fields', async () => {
    vi.mocked(getRtsMisDashboardData)
      .mockResolvedValueOnce(createResponse([department(1, { pending: 1, approved: 2 })]))
      .mockResolvedValueOnce(createResponse([department(1, { pending: 4, approved: 5 })]));

    await getCitizenLandingApplicationCountsAction();

    expect(getRtsMisDashboardData).toHaveBeenCalledTimes(2);
    expect(getRtsMisDashboardData).toHaveBeenNthCalledWith(1, {
      Flag: 'admin',
      DeparmentId: 1,
      DeparmentName: 'Property Tax',
      ModuleName: 'RTS',
    });
    expect(getRtsMisDashboardData).toHaveBeenNthCalledWith(2, {
      Flag: 'admin',
      DeparmentId: 1,
      DeparmentName: 'Property Tax',
      ModuleName: 'AapleSarkar',
    });
  });

  it('sums approved, rejected, pending, and reverted from every department row', async () => {
    vi.mocked(getRtsMisDashboardData)
      .mockResolvedValueOnce(createResponse([
        department(1, { pending: 1, approved: 2, rejected: 3, reverted: null }),
        department(2, { pending: 2, approved: 1, rejected: 1, reverted: 2 }),
      ]))
      .mockResolvedValueOnce(createResponse([
        department(1, { pending: 4, approved: 5, reverted: 1 }),
        department(3, { approved: 2 }),
      ]));

    await expect(getCitizenLandingApplicationCountsAction()).resolves.toEqual({
      received: 24,
      delivered: 10,
    });
  });

  it('returns a partial total when some source requests fail', async () => {
    vi.mocked(getRtsMisDashboardData)
      .mockResolvedValueOnce(createResponse([department(1, { pending: 2, approved: 1 })]))
      .mockRejectedValueOnce(new Error('Network error'));

    await expect(getCitizenLandingApplicationCountsAction()).resolves.toEqual({
      received: 3,
      delivered: 1,
    });
  });

  it('returns null when no request succeeds', async () => {
    vi.mocked(getRtsMisDashboardData).mockRejectedValue(new Error('Network error'));

    await expect(getCitizenLandingApplicationCountsAction()).resolves.toBeNull();
  });
});

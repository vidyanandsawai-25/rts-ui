import 'server-only';

import { apiClient } from '@/services/api.service';
import type {
  RTSAppealTypeDto,
  RTSAppealLevelCheckResultDto,
  RTSAppealApplicationSummaryDto,
  CreateRTSAppealApplicationDto,
  RTSAppealApplicationResultDto,
  RTSAppealDashboardCardsCountDto,
  RTSAppealDashboardDetailsDto,
  RTSAppealProcessDetailsDto,
  ProcessRTSAppealActionDto,
  RTSAppealQueryParameters,
} from '@/types/rts/appeal.types';

interface ApiItemsResponse<T> {
  success: boolean;
  message?: string;
  items: T;
  totalCount?: number;
}

interface ApiPagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}

/**
 * Retrieves statutory appeal types (Rejected, Disagreed, SLA Due).
 */
export async function getAppealTypes(): Promise<RTSAppealTypeDto[]> {
  const response = await apiClient.get<ApiItemsResponse<RTSAppealTypeDto[]>>(
    '/RTSAppeal/types',
    { cache: 'no-store' },
    false
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch statutory appeal types');
  }

  return response.data.items ?? [];
}

/**
 * Checks statutory eligibility and level (1st Appeal vs 2nd Appeal) for an application number.
 */
export async function checkAppealLevel(
  applicationNo: string
): Promise<RTSAppealLevelCheckResultDto> {
  const response = await apiClient.get<ApiItemsResponse<RTSAppealLevelCheckResultDto>>(
    `/RTSAppeal/check-level/${encodeURIComponent(applicationNo)}`,
    { cache: 'no-store' },
    false
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to evaluate appeal eligibility for #${applicationNo}`);
  }

  return response.data.items;
}

/**
 * Retrieves the application summary, dynamic fields, timeline, and uploaded documents for appeal.
 */
export async function getAppealApplicationSummary(
  applicationNo: string
): Promise<RTSAppealApplicationSummaryDto> {
  const response = await apiClient.get<ApiItemsResponse<RTSAppealApplicationSummaryDto>>(
    `/RTSAppeal/summary/${encodeURIComponent(applicationNo)}`,
    { cache: 'no-store' },
    false
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch summary for application #${applicationNo}`);
  }

  return response.data.items;
}

/**
 * Submits a new citizen appeal under MRTSA 2015.
 */
export async function submitAppeal(
  payload: CreateRTSAppealApplicationDto
): Promise<RTSAppealApplicationResultDto> {
  const response = await apiClient.post<ApiItemsResponse<RTSAppealApplicationResultDto>>(
    '/RTSAppeal/submit',
    payload,
    { cache: 'no-store' },
    false
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to submit appeal application');
  }

  return response.data.items;
}

/**
 * Retrieves Appellate Authority Dashboard KPI cards counts.
 */
export async function getAppealDashboardCards(): Promise<RTSAppealDashboardCardsCountDto> {
  const response = await apiClient.get<ApiItemsResponse<RTSAppealDashboardCardsCountDto>>(
    '/RTSAppeal/dashboard-cards',
    { cache: 'no-store' },
    true
  );

  if (!response.success || !response.data) {
    // Return empty fallback if officer auth or data unavailable
    return {
      totalAppeals: 0,
      pendingAppeals: 0,
      approvedAppeals: 0,
      rejectedAppeals: 0,
      returnedAppeals: 0,
      firstAppeals: 0,
      secondAppeals: 0,
      delayedAppeals: 0,
    };
  }

  return response.data.items;
}

/**
 * Retrieves paged, filtered appeals list for Appellate Authority Officer grid.
 */
export async function getAppealDashboardGrid(
  params: RTSAppealQueryParameters = {}
): Promise<ApiPagedResult<RTSAppealDashboardDetailsDto>> {
  const query = new URLSearchParams();
  if (params.searchTerm) query.append('SearchTerm', params.searchTerm);
  if (params.appealStatus && params.appealStatus !== 'All') query.append('AppealStatus', params.appealStatus);
  if (params.appealLevel) query.append('AppealLevel', params.appealLevel.toString());
  if (params.appealTypeId) query.append('AppealTypeId', params.appealTypeId.toString());
  if (params.pageNumber) query.append('PageNumber', params.pageNumber.toString());
  if (params.pageSize) query.append('PageSize', params.pageSize.toString());
  if (params.sortBy) query.append('SortBy', params.sortBy);
  if (params.sortOrder) query.append('SortOrder', params.sortOrder);

  const endpoint = `/RTSAppeal/dashboard?${query.toString()}`;
  const response = await apiClient.get<ApiItemsResponse<ApiPagedResult<RTSAppealDashboardDetailsDto>>>(
    endpoint,
    { cache: 'no-store' },
    true
  );

  if (!response.success || !response.data) {
    return {
      items: [],
      totalCount: 0,
      pageNumber: params.pageNumber ?? 1,
      pageSize: params.pageSize ?? 10,
    };
  }

  return response.data.items;
}

/**
 * Retrieves deep case process details for a specific appeal (dossier, timeline, previous rulings).
 */
export async function getAppealProcessDetails(
  appealId: number
): Promise<RTSAppealProcessDetailsDto | null> {
  const response = await apiClient.get<ApiItemsResponse<RTSAppealProcessDetailsDto>>(
    `/RTSAppeal/${appealId}/details`,
    { cache: 'no-store' },
    true
  );

  if (!response.success || !response.data) {
    return null;
  }

  return response.data.items;
}

/**
 * Submits an Appellate Officer decision (Approve / Reject / Return) on an appeal case.
 */
export async function processAppealAction(
  payload: ProcessRTSAppealActionDto
): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post<ApiItemsResponse<{ success: boolean }>>(
    '/RTSAppeal/process-action',
    payload,
    { cache: 'no-store' },
    true
  );

  if (!response.success) {
    throw new Error(response.error || 'Failed to process appeal action');
  }

  return { success: true, message: response.message || 'Appeal processed successfully' };
}

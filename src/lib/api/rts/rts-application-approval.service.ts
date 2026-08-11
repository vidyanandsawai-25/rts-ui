import 'server-only';

import { apiClient } from '@/services/api.service';
import type {
  RtsApplicationApprovalStagesApiResponse,
  RtsApplicationApprovalStagesItem,
  RtsApplicationApprovalActionPayload,
  RtsApplicationApprovalFieldUpdatePayload,
  RtsApplicationApprovalDecisionResponse,
  RtsApplicationVerificationApiResponse,
  RtsApplicationVerificationItem,
  RtsApplicationDashboardCardsApiResponse,
  RtsApplicationDashboardCardsItem,
  RtsApplicationViewDetailsApiResponse,
  RtsApplicationViewDetailsItem,
  RtsApprovalApplicationListApiResponse,
  RtsApprovalApplicationListItem,
} from '@/types/rts/application-approval.types';
import type { GetRtsApplicationApprovalListParams } from '@/types/rts/rts-application.types';
import {
  isRtsApplicationApprovalStagesItemShape,
  isRtsApplicationDashboardCardsItemShape,
  isRtsApplicationViewDetailsItemShape,
  isRtsApprovalApplicationListItemShape,
  normalizeRtsApplicationApprovalStagesItem,
  normalizeRtsApplicationVerificationItem,
  normalizeRtsApplicationDashboardCardsItem,
  normalizeRtsApplicationViewDetailsItem,
  normalizeRtsApprovalApplicationListItem,
} from './rts-application-approval-types-guard';

type ApprovalSuccessEnvelope = {
  success?: boolean;
  status?: boolean;
  message?: string;
  items?: unknown;
  item?: unknown;
};

function assertApprovalSuccess(data: ApprovalSuccessEnvelope | undefined, fallbackMessage: string): void {
  if (!data || (data.success !== true && data.status !== true)) {
    throw new Error(data?.message || fallbackMessage);
  }
}

function getApprovalItems(data: ApprovalSuccessEnvelope): unknown {
  return data.items ?? data.item;
}

/**
 * 1. GET /api/RTSApplicationApproval/dashboard-cards
 * Fetches dashboard cards summary metrics.
 */
export async function getApplicationDashboardCards(): Promise<RtsApplicationDashboardCardsItem> {
  const response = await apiClient.get<RtsApplicationDashboardCardsApiResponse>(
    '/RTSApplicationApproval/dashboard-cards',
    { cache: 'no-store' }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch application dashboard cards');
  }

  assertApprovalSuccess(response.data, 'Failed to fetch application dashboard cards');
  const rawItem = getApprovalItems(response.data);

  if (isRtsApplicationDashboardCardsItemShape(rawItem)) {
    return normalizeRtsApplicationDashboardCardsItem(rawItem);
  }

  return normalizeRtsApplicationDashboardCardsItem((rawItem ?? {}) as unknown as Record<string, unknown>);
}

/**
 * 2. GET /api/RTSApplicationApproval
 * Fetches paged applications list for the approval dashboard grid.
 */
export async function getApprovalApplicationsPaged(
  params: GetRtsApplicationApprovalListParams = {}
): Promise<{
  applications: RtsApprovalApplicationListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}> {
  const queryParams = new URLSearchParams();
  if (params.pageNumber != null) queryParams.set('PageNumber', String(params.pageNumber));
  queryParams.set('PageSize', '10');
  if (params.departmentId != null) queryParams.set('DepartmentId', String(params.departmentId));
  if (params.serviceId != null) queryParams.set('ServiceId', String(params.serviceId));
  if (params.applicationNo) queryParams.set('ApplicationNo', params.applicationNo);
  if (params.status) queryParams.set('ApplicationStatus', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/RTSApplicationApproval${queryString ? `?${queryString}` : ''}`;

  const response = await apiClient.get<RtsApprovalApplicationListApiResponse>(endpoint, {
    cache: 'no-store',
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch approval applications list');
  }

  const data = response.data;
  assertApprovalSuccess(data, 'Failed to fetch approval applications list');

  // The current API returns the page object in `items`; older deployments use
  // `item`, and an earlier contract returned the record array directly.
  const listPayload = getApprovalItems(data);
  const pagedItem =
    listPayload && !Array.isArray(listPayload)
      ? (listPayload as {
          items?: unknown;
          totalCount?: number;
          pageNumber?: number;
          pageSize?: number;
          totalPages?: number;
        })
      : data.item ?? data;
  const rawItems = Array.isArray(listPayload)
    ? listPayload
    : Array.isArray(pagedItem.items)
      ? pagedItem.items
      : [];

  const applications = rawItems
    .filter(isRtsApprovalApplicationListItemShape)
    .map((item) => normalizeRtsApprovalApplicationListItem(item as unknown as Record<string, unknown>));

  return {
    applications,
    totalCount: pagedItem.totalCount ?? data.totalCount ?? applications.length,
    pageNumber: pagedItem.pageNumber ?? data.pageNumber ?? 1,
    pageSize: pagedItem.pageSize ?? data.pageSize ?? 10,
    totalPages: pagedItem.totalPages ?? data.totalPages ?? 1,
  };
}

/**
 * 3. GET /api/RTSApplicationApproval/{applicationId}/details
 * Fetches detailed form fields, groups, and documents by application ID.
 */
export async function getApprovalApplicationDetails(
  id: number | string
): Promise<RtsApplicationViewDetailsItem> {
  const response = await apiClient.get<RtsApplicationViewDetailsApiResponse>(
    `/RTSApplicationApproval/${encodeURIComponent(String(id))}/details`,
    { cache: 'no-store' }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch application details for ${id}`);
  }

  assertApprovalSuccess(response.data, `Failed to fetch application details for ${id}`);
  const rawItem = getApprovalItems(response.data);

  if (isRtsApplicationViewDetailsItemShape(rawItem)) {
    return normalizeRtsApplicationViewDetailsItem(rawItem as Record<string, unknown>);
  }

  return normalizeRtsApplicationViewDetailsItem((rawItem ?? {}) as unknown as Record<string, unknown>);
}

/**
 * 4. GET /api/RTSApplicationApproval/{applicationId}/approval-stages
 * Fetches approval stages workflow timeline by application ID.
 */
export async function getApprovalApplicationStages(
  id: number | string
): Promise<RtsApplicationApprovalStagesItem> {
  const response = await apiClient.get<RtsApplicationApprovalStagesApiResponse>(
    `/RTSApplicationApproval/${encodeURIComponent(String(id))}/approval-stages`,
    { cache: 'no-store' }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch approval stages for ${id}`);
  }

  assertApprovalSuccess(response.data, `Failed to fetch approval stages for ${id}`);
  const rawItem = getApprovalItems(response.data);

  if (isRtsApplicationApprovalStagesItemShape(rawItem)) {
    return normalizeRtsApplicationApprovalStagesItem(rawItem as Record<string, unknown>);
  }

  return normalizeRtsApplicationApprovalStagesItem((rawItem ?? {}) as unknown as Record<string, unknown>);
}

/**
 * 5. GET /api/RTSApplicationApproval/{applicationId}/approval-officer
 * Fetches application verification details for officer verification workflow step.
 */
export async function getApprovalApplicationVerification(
  id: number | string
): Promise<RtsApplicationVerificationItem> {
  const response = await apiClient.get<RtsApplicationVerificationApiResponse>(
    `/RTSApplicationApproval/${encodeURIComponent(String(id))}/approval-officer`,
    { cache: 'no-store' }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch application verification for ${id}`);
  }

  assertApprovalSuccess(response.data, `Failed to fetch application verification for ${id}`);
  return normalizeRtsApplicationVerificationItem(
    (getApprovalItems(response.data) ?? {}) as Record<string, unknown>
  );
}

/**
 * 6. PUT /api/RTSApplicationApproval/{applicationId}/verify-documents
 * Records document-verification status and the officer's remark.
 */
export async function verifyApprovalDocuments(
  id: number | string,
  payload: RtsApplicationApprovalActionPayload
): Promise<RtsApplicationApprovalDecisionResponse> {
  const response = await apiClient.put<RtsApplicationApprovalDecisionResponse>(
    `/RTSApplicationApproval/${encodeURIComponent(String(id))}/verify-documents`,
    payload
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || response.data?.message || `Failed to verify documents for ${id}`);
  }

  assertApprovalSuccess(response.data, `Failed to verify documents for ${id}`);

  return response.data;
}

/**
 * 7. PUT /api/RTSApplicationApproval/{applicationId}/process-approval
 * Records the approval decision for the current application stage.
 */
export async function verifyAndSendToApprove(
  id: number | string,
  payload: RtsApplicationApprovalActionPayload
): Promise<RtsApplicationApprovalDecisionResponse> {
  const response = await apiClient.put<RtsApplicationApprovalDecisionResponse>(
    `/RTSApplicationApproval/${encodeURIComponent(String(id))}/process-approval`,
    payload
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || response.data?.message || `Failed to send application ${id} for approval`);
  }

  assertApprovalSuccess(response.data, `Failed to process approval for ${id}`);

  return response.data;
}

/**
 * 8. PUT /api/RTSApplicationApproval/{applicationId}/verify-and-correct
 * Saves officer-corrected application field values.
 */
export async function verifyAndCorrectApproval(
  id: number | string,
  payload: RtsApplicationApprovalFieldUpdatePayload
): Promise<RtsApplicationApprovalDecisionResponse> {
  const response = await apiClient.put<RtsApplicationApprovalDecisionResponse>(
    `/RTSApplicationApproval/${encodeURIComponent(String(id))}/verify-and-correct`,
    payload
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || response.data?.message || `Failed to return application ${id} for correction`);
  }

  assertApprovalSuccess(response.data, `Failed to return application ${id} for correction`);
  return response.data;
}

/**
 * 9. PUT /api/RTSApplicationApproval/{applicationId}/Rejected-Application
 * Rejects the application at the current approval stage.
 */
export async function rejectApprovalApplication(
  id: number | string,
  payload: RtsApplicationApprovalActionPayload
): Promise<RtsApplicationApprovalDecisionResponse> {
  const response = await apiClient.put<RtsApplicationApprovalDecisionResponse>(
    `/RTSApplicationApproval/${encodeURIComponent(String(id))}/Rejected-Application`,
    payload
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || response.data?.message || `Failed to reject application ${id}`);
  }

  assertApprovalSuccess(response.data, `Failed to reject application ${id}`);
  return response.data;
}

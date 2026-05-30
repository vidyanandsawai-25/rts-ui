import { apiClient } from '@/services/api.service';
import type { PagedResponse } from '@/types/common.types';
import type { ULBConfigurationFormData, UlbConfigurationMaster } from '@/types/ulbconfig-master.types';
import { ApiError } from '@/lib/utils/api';
import {
  ULB_MASTER_DEFAULT_PAGE_SIZE,
  ULB_MASTER_ENDPOINT,
} from './ulb-master.constants';
import { mapFormDataToUlbMasterPayload } from './ulb-master.mapper';
import { normalizeUlbMaster, parseUlbMasterMutationResponse } from './ulb-master-types-guard';
import type { UlbMasterMutationResponse } from '@/types/ulbconfig-master.types';

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

function buildUlbMasterQuery(pageNumber: number, pageSize: number): string {
  const params = new URLSearchParams({
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });

  return `${ULB_MASTER_ENDPOINT}?${params.toString()}`;
}

function normalizePagedUlbMasters(
  paged: PagedResponse<Record<string, unknown>>
): PagedResponse<UlbConfigurationMaster> {
  const items = (paged.items ?? [])
    .map((item) => normalizeUlbMaster(item))
    .filter((item): item is UlbConfigurationMaster => item !== null);

  return {
    ...paged,
    items,
    totalCount: paged.totalCount ?? items.length,
  };
}

// ---------------------------------------------------------------------------
// ULB Master — GET
// ---------------------------------------------------------------------------

/** GET `/ULBMaster` — paginated ULB master records. */
export async function getUlbMastersPaged(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<UlbConfigurationMaster>> {
  const response = await apiClient.get<PagedResponse<Record<string, unknown>>>(
    buildUlbMasterQuery(pageNumber, pageSize)
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to fetch ULB master records',
      'Get ULB masters failed'
    );
  }

  if (!response.data) {
    throw new ApiError(500, 'No data received from server', 'Get ULB masters — invalid response');
  }

  return normalizePagedUlbMasters(response.data);
}

/** GET `/ULBMaster/{id}` — single ULB master record. */
export async function getUlbMasterById(id: number): Promise<UlbConfigurationMaster> {
  const response = await apiClient.get<Record<string, unknown>>(
    `${ULB_MASTER_ENDPOINT}/${id}`
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to fetch ULB master',
      `Get ULB master ${id} failed`
    );
  }

  if (!response.data) {
    throw new ApiError(
      500,
      'No data received from server',
      `Get ULB master ${id} — invalid response`
    );
  }

  const normalized = normalizeUlbMaster(response.data);
  if (!normalized) {
    throw new ApiError(500, 'Invalid ULB master response', `Get ULB master ${id} — invalid shape`);
  }

  return normalized;
}

/** Returns the first ULB master record for the configuration screen. */
export async function getUlbMaster(): Promise<UlbConfigurationMaster | null> {
  const paged = await getUlbMastersPaged(1, ULB_MASTER_DEFAULT_PAGE_SIZE);
  return paged.items[0] ?? null;
}

// ---------------------------------------------------------------------------
// ULB Master — POST / PUT
// ---------------------------------------------------------------------------

/** POST `/ULBMaster` — create ULB master configuration. */
export async function createUlbMaster(
  formData: ULBConfigurationFormData
): Promise<{ ulb: UlbConfigurationMaster; message: string }> {
  const payload = mapFormDataToUlbMasterPayload(formData);

  const response = await apiClient.post<UlbMasterMutationResponse>(ULB_MASTER_ENDPOINT, payload);

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to create ULB master',
      'Create ULB master failed'
    );
  }

  return parseUlbMasterMutationResponse(response.data, 'Failed to create ULB master');
}

/** PUT `/ULBMaster/{id}` — update ULB master configuration. */
export async function updateUlbMaster(
  id: number,
  formData: ULBConfigurationFormData
): Promise<{ ulb: UlbConfigurationMaster; message: string }> {
  const payload = mapFormDataToUlbMasterPayload(formData, id);

  const response = await apiClient.put<UlbMasterMutationResponse>(
    `${ULB_MASTER_ENDPOINT}/${id}`,
    payload
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to update ULB master',
      `Update ULB master ${id} failed`
    );
  }

  return parseUlbMasterMutationResponse(response.data, 'Failed to update ULB master');
}

import { apiClient } from '@/services/api.service';
import { ApiError, handleApiResponse } from '@/lib/utils/api';
import type { ApartmentQCDetail, ApartmentQCResponse, ApartmentQCSearchParams } from '@/types/apartmentQC.types';
import type { ApiResponse } from '@/types/common.types';

/* ============================================================
   APARTMENT QC — SERVICE
   Base endpoint: /Property/apartmentQC-details
============================================================ */

/**
 * Build a URLSearchParams object from the supplied search params.
 * Only non-empty / non-undefined values are included.
 */
function buildQueryParams(params: ApartmentQCSearchParams): URLSearchParams {
  const qs = new URLSearchParams();

  if (params.wardId !== undefined && params.wardId !== '') {
    qs.append('WardId', String(params.wardId));
  }
  if (params.propertyNo !== undefined && params.propertyNo !== '') {
    qs.append('PropertyNo', String(params.propertyNo));
  }
  if (params.propertyDetailsId !== undefined && params.propertyDetailsId !== '') {
    qs.append('PropertyDetailsId', String(params.propertyDetailsId));
  }
  if (params.partType !== undefined && params.partType.trim() !== '') {
    qs.append('PartType', params.partType.trim());
  }
  if (params.type !== undefined && params.type.trim() !== '') {
    qs.append('Type', params.type.trim());
  }
  if (params.pageNumber !== undefined) {
    qs.append('PageNumber', String(params.pageNumber));
  }
  if (params.pageSize !== undefined) {
    qs.append('PageSize', String(params.pageSize));
  }
  if (params.searchTerm !== undefined && params.searchTerm.trim() !== '') {
    qs.append('SearchTerm', params.searchTerm.trim());
  }
  if (params.sortBy !== undefined && params.sortBy.trim() !== '') {
    qs.append('SortBy', params.sortBy.trim());
  }
  if (params.sortOrder !== undefined && params.sortOrder.trim() !== '') {
    qs.append('SortOrder', params.sortOrder.trim());
  }
  if (params.filterLogic !== undefined) {
    qs.append('FilterLogic', String(params.filterLogic));
  }

  return qs;
}

/**
 * Fetch apartment QC details.
 */
export async function getApartmentQCDetails(
  params: ApartmentQCSearchParams = {}
): Promise<ApiResponse<ApartmentQCResponse>> {
  const qs = buildQueryParams(params);
  const endpoint = qs.toString()
    ? `/Property/apartmentQC-details?${qs.toString()}`
    : '/Property/apartmentQC-details';

  return apiClient.get<ApartmentQCResponse>(endpoint);
}

/**
 * Fetch apartment QC details with error handling and localization keys.
 */
export async function getApartmentQCDetailsLocalized(
  params: ApartmentQCSearchParams = {}
): Promise<ApartmentQCResponse> {
  try {
    const res = await getApartmentQCDetails(params);
    return handleApiResponse(res, "ptis.apartmentQC.errors.fetchFailed");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, (error as Error).message, "ptis.apartmentQC.errors.fetchFailed");
  }
}

/**
 * Convenience wrapper that returns the flat `items[]` array directly,
 * or an empty array on failure.
 */
export async function getApartmentQCDetailsSafe(
  params: ApartmentQCSearchParams = {}
): Promise<ApartmentQCDetail[]> {
  try {
    const data = await getApartmentQCDetailsLocalized(params);
    return data.items ?? [];
  } catch (err) {
    console.error('[appartmentQC.service] Safe wrapper error:', err);
    return [];
  }
}

/**
 * Update apartment QC property details.
 */
export async function updateApartmentQCDetails(
  propertyDetailsId: number | string,
  payload: Partial<ApartmentQCDetail>
): Promise<ApiResponse<ApartmentQCDetail>> {
  const endpoint = `/Property/apartmentQC-details/${propertyDetailsId}`;
  return apiClient.put<ApartmentQCDetail>(endpoint, payload);
}

/**
 * Update apartment QC property details with error handling and localization keys.
 */
export async function updateApartmentQCDetailsLocalized(
  propertyDetailsId: number | string,
  payload: Partial<ApartmentQCDetail>
): Promise<ApartmentQCDetail> {
  try {
    const res = await updateApartmentQCDetails(propertyDetailsId, payload);
    return handleApiResponse(res, "ptis.apartmentQC.errors.updateFailed");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, (error as Error).message, "ptis.apartmentQC.errors.updateFailed");
  }
}

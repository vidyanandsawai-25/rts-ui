import { apiClient } from '@/services/api.service';
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
 *
 * @param params - WardId, PropertyNo, PartType, Type, PageNumber, PageSize, SearchTerm, SortBy, SortOrder, FilterLogic (all optional).
 * @returns The full API response envelope containing `items[]`.
 *
 * @example
 * const res = await getApartmentQCDetails({ wardId: 91, propertyNo: 1, partType: 'Commercial' });
 * const details = res.data?.items ?? [];
 */
export async function getApartmentQCDetails(
  params: ApartmentQCSearchParams = {}
): Promise<ApiResponse<ApartmentQCResponse>> {
  const qs = buildQueryParams(params);
  const endpoint = qs.toString()
    ? `/Property/apartmentQC-details?${qs.toString()}`
    : '/Property/apartmentQC-details';

  console.log('[appartmentQC.service] Calling API:', endpoint);
  const response = await apiClient.get<ApartmentQCResponse>(endpoint);
  console.log('[appartmentQC.service] API Response:', response);
  
  return response;
}

/**
 * Convenience wrapper that returns the flat `items[]` array directly,
 * or an empty array on failure.
 *
 * @param params - WardId, PropertyNo, PartType (all optional).
 */
export async function getApartmentQCDetailsSafe(
  params: ApartmentQCSearchParams = {}
): Promise<ApartmentQCDetail[]> {
  try {
    const res = await getApartmentQCDetails(params);

    console.log('[appartmentQC.service] Safe wrapper - Full response:', JSON.stringify(res, null, 2));

    // Check if the API client request was successful
    if (!res.success) {
      console.warn('[appartmentQC.service] API client returned failure:', res.error);
      return [];
    }

    // Check if the API response itself is successful
    if (!res.data?.success) {
      console.warn('[appartmentQC.service] API data returned failure:', res.data?.message);
      return [];
    }

    const items = res.data?.items ?? [];
    console.log('[appartmentQC.service] Safe wrapper - Returning items:', items.length, items);
    return items;
  } catch (err) {
    console.error('[appartmentQC.service] Unexpected error:', err);
    return [];
  }
}

/**
 * Update apartment QC property details.
 *
 * @param propertyDetailsId - The property details ID to update
 * @param payload - The updated property data
 * @returns The API response
 *
 * @example
 * const res = await updateApartmentQCDetails(206192, { ownerName: "New Owner", ... });
 */
export async function updateApartmentQCDetails(
  propertyDetailsId: number | string,
  payload: Partial<ApartmentQCDetail>
): Promise<ApiResponse<ApartmentQCDetail>> {
  const endpoint = `/Property/apartmentQC-details/${propertyDetailsId}`;
  return apiClient.put<ApartmentQCDetail>(endpoint, payload);
}

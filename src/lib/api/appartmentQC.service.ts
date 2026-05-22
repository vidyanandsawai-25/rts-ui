import { apiClient } from '@/services/api.service';
import { ApiError, handleApiResponse } from '@/lib/utils/api';
import { logger } from '@/lib/utils/logger';
import type { ApartmentQCDetail, ApartmentQCResponse, ApartmentQCSearchParams } from '@/types/apartmentQC.types';
import type { ApiResponse } from '@/types/common.types';

/* ============================================================
   APARTMENT QC — SERVICE
   Base endpoint: /Property/apartmentQC-details
============================================================ */

/**
 * Configuration for mapping search params to URL query parameters
 */
type ParamConfig = {
  key: keyof ApartmentQCSearchParams;
  queryParam: string;
  shouldTrim?: boolean;
  skipEmptyCheck?: boolean;
};

const PARAM_MAPPINGS: ParamConfig[] = [
  { key: 'wardId', queryParam: 'WardId' },
  { key: 'propertyNo', queryParam: 'PropertyNo' },
  { key: 'propertyDetailsId', queryParam: 'PropertyDetailsId' },
  { key: 'partType', queryParam: 'PartType', shouldTrim: true },
  { key: 'type', queryParam: 'Type', shouldTrim: true },
  { key: 'pageNumber', queryParam: 'PageNumber', skipEmptyCheck: true },
  { key: 'pageSize', queryParam: 'PageSize', skipEmptyCheck: true },
  { key: 'searchTerm', queryParam: 'SearchTerm', shouldTrim: true },
  { key: 'sortBy', queryParam: 'SortBy', shouldTrim: true },
  { key: 'sortOrder', queryParam: 'SortOrder', shouldTrim: true },
  { key: 'filterLogic', queryParam: 'FilterLogic', skipEmptyCheck: true },
];

/**
 * Build a URLSearchParams object from the supplied search params.
 * Only non-empty / non-undefined values are included.
 * Uses configuration-driven approach for maintainability.
 */
function buildQueryParams(params: ApartmentQCSearchParams): URLSearchParams {
  const qs = new URLSearchParams();

  PARAM_MAPPINGS.forEach(({ key, queryParam, shouldTrim, skipEmptyCheck }) => {
    const value = params[key];
    
    if (value === undefined) return;
    
    // Skip empty string checks for numeric parameters
    if (!skipEmptyCheck && value === '') return;
    
    // Handle string trimming
    if (shouldTrim && typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        qs.append(queryParam, trimmed);
      }
    } else {
      qs.append(queryParam, String(value));
    }
  });

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
 * Fetch apartment QC details with error handling and user-friendly messages.
 */
export async function getApartmentQCDetailsLocalized(
  params: ApartmentQCSearchParams = {}
): Promise<ApartmentQCResponse> {
  try {
    const res = await getApartmentQCDetails(params);
    return handleApiResponse(res, "Failed to fetch apartment QC details");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, (error as Error).message, "Failed to fetch apartment QC details");
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
    // data.items is PagedResponse<ApartmentQCDetail>, so access .items for the flat array
    return data.items?.items ?? [];
  } catch (err) {
    logger.error('[appartmentQC.service] Failed to fetch apartment QC details', {
      error: err instanceof Error ? err : new Error(String(err)),
      params,
    });
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
 * Update apartment QC property details with error handling and user-friendly messages.
 */
export async function updateApartmentQCDetailsLocalized(
  propertyDetailsId: number | string,
  payload: Partial<ApartmentQCDetail>
): Promise<ApartmentQCDetail> {
  try {
    const res = await updateApartmentQCDetails(propertyDetailsId, payload);
    return handleApiResponse(res, "Failed to update apartment QC details");
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, (error as Error).message, "Failed to update apartment QC details");
  }
}

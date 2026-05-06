import { apiClient } from '@/services/api.service';
import type { ApiResponse } from '@/types/common.types';
import {
  PagedResponse,
  AgeFactorCVMaster,
  AgeFactorCVMasterUpdate,
  AgeFactorCVMasterCreate,
  AgeFactorCVMasterQueryParams,
  BulkAgeFactorCVMasterCreate,
  BulkAgeFactorCVMasterUpdate
} from '@/types/ageFactorCv.types';
import { ApiError } from '../utils/api';

/**
 * Fetches AgeFactorCVMaster records with query parameters for filtering, pagination, and sorting
 * @param params Query parameters for filtering and pagination
 * @returns Promise resolving to ApiResponse containing paginated results
 */
export async function getAgeFactorCVMasterWithParams(
  params: AgeFactorCVMasterQueryParams = {}
): Promise<ApiResponse<PagedResponse<AgeFactorCVMaster>>> {
  const searchParams = new URLSearchParams();

  // Add parameters to query string if they exist
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Map frontend camelCase to backend PascalCase
      const apiKey = key === 'yearRangeCVId' ? 'YearRangeCVId' :
                     key === 'constructionTypeId' ? 'ConstructionTypeId' :
                     key.charAt(0).toUpperCase() + key.slice(1);
      searchParams.append(apiKey, String(value));
    }
  });

  const endpoint = searchParams.toString()
    ? `/AgeFactorCVMaster?${searchParams.toString()}`
    : '/AgeFactorCVMaster';

  return apiClient.get<PagedResponse<AgeFactorCVMaster>>(endpoint);
}

/**
 * Updates an existing AgeFactorCVMaster record
 * @param id The ID of the record to update
 * @param payload The update payload
 * @returns Promise resolving to void on success
 */
export async function updateAgeFactorCVMaster(
  id: number,
  payload: AgeFactorCVMasterUpdate
): Promise<void> {
  try {
    if (!id || id <= 0) {
      throw new ApiError(400, 'Valid AgeFactorCV ID is required for update', 'Validation');
    }
    if (!payload.constructionTypeId || payload.constructionTypeId <= 0) {
      throw new ApiError(400, 'constructionTypeId is required', 'Validation');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new ApiError(400, 'yearRangeCVId is required', 'Validation');
    }

    const requestPayload = {
      isActive: payload.isActive,
      updatedBy: payload.updatedBy,
      constructionTypeId: payload.constructionTypeId,
      ageFrom: Number(payload.ageFrom),
      ageTo: Number(payload.ageTo),
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };

    const response = await apiClient.put<unknown>(
      `/AgeFactorCVMaster/${encodeURIComponent(String(id))}`,
      requestPayload
    );

    if (!response.success) {
      throw new ApiError(500, response.error || 'Failed to update Age Factor CV Master', 'Update Age Factor CV Master failed');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Creates a new AgeFactorCVMaster record (POST)
 * @param payload The creation payload
 * @returns Promise resolving to ApiResponse containing the created record
 */
export async function createAgeFactorCVMaster(
  payload: AgeFactorCVMasterCreate
): Promise<ApiResponse<unknown>> {
  try {
    if (!payload.constructionTypeId || payload.constructionTypeId <= 0) {
      throw new ApiError(400, 'constructionTypeId is required', 'Validation');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new ApiError(400, 'yearRangeCVId is required', 'Validation');
    }

    const requestPayload = {
      isActive: payload.isActive,
      createdBy: payload.createdBy,
      constructionTypeId: payload.constructionTypeId,
      ageFrom: Number(payload.ageFrom),
      ageTo: Number(payload.ageTo),
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };

    return await apiClient.post<unknown>('/AgeFactorCVMaster', requestPayload);
  } catch (error) {
    throw error;
  }
}

/**
 * Bulk creates AgeFactorCVMaster records (POST)
 * @param payload The creation payload containing an array of records
 * @returns Promise resolving to ApiResponse containing the created records
 */
export async function bulkCreateAgeFactorCVMaster(
  payload: BulkAgeFactorCVMasterCreate
): Promise<ApiResponse<unknown>> {
  try {
    if (!payload || payload.length === 0) {
      throw new ApiError(400, 'Valid payload with ageFactors is required for bulk create', 'Validation');
    }

    const requestPayload = payload.map((f) => ({
      isActive: f.isActive,
      createdBy: f.createdBy,
      constructionTypeId: f.constructionTypeId,
      ageFrom: Number(f.ageFrom),
      ageTo: Number(f.ageTo),
      factor: Number(f.factor),
      yearRangeCVId: f.yearRangeCVId,
    }));

    return await apiClient.post<unknown>('/AgeFactorCVMaster/bulk', requestPayload);
  } catch (error) {
    throw error;
  }
}

/**
 * Bulk updates AgeFactorCVMaster records (PUT)
 * @param payload The update payload containing an array of records
 * @returns Promise resolving to void on success
 */
export async function bulkUpdateAgeFactorCVMaster(
  payload: BulkAgeFactorCVMasterUpdate
): Promise<void> {
  try {
    if (!payload || payload.length === 0) {
      throw new ApiError(400, 'Valid payload with ageFactors is required for bulk update', 'Validation');
    }

    const requestPayload = payload.map((f) => ({
      id: f.id,
      data: {
        ageFactorId: f.data.ageFactorId,
        constructionTypeId: f.data.constructionTypeId,
        ageFrom: Number(f.data.ageFrom),
        ageTo: Number(f.data.ageTo),
        factor: Number(f.data.factor),
        yearRangeCVId: f.data.yearRangeCVId,
        isActive: f.data.isActive,
        updatedBy: f.data.updatedBy,
      }
    }));

    const response = await apiClient.put<unknown>(
      '/AgeFactorCVMaster/bulk',
      requestPayload
    );

    if (!response.success) {
      throw new ApiError(500, response.error || 'Failed to bulk update Age Factor CV Master', 'Bulk update Age Factor CV Master failed');
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Deletes an AgeFactorCVMaster record
 * @param id The ID of the record to delete
 * @returns Promise resolving to ApiResponse
 */
export async function deleteAgeFactorCVMaster(id: number): Promise<ApiResponse<unknown>> {
  if (id <= 0) {
    throw new ApiError(400, 'Valid AgeFactorCV ID is required', 'Validation');
  }
  return apiClient.delete<unknown>(`/AgeFactorCVMaster/${id}`);
}

/**
 * Bulk deletes AgeFactorCVMaster records
 * @param ids Array of AgeFactorCV IDs to delete
 * @returns Promise resolving to ApiResponse
 */
export async function bulkDeleteAgeFactorCVMaster(ids: number[]): Promise<ApiResponse<unknown>> {
  if (!ids || ids.length === 0) {
    throw new ApiError(400, 'Valid list of IDs is required for bulk delete', 'Validation');
  }
  return apiClient.delete<unknown>('/AgeFactorCVMaster/bulk', { body: JSON.stringify({ ids }) });
}

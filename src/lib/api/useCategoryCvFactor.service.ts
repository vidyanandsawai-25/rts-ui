import { apiClient } from '@/services/api.service';
import type { ApiResponse } from '@/types/common.types';
import { 
  PagedResponse, 
  UseFactorCVMaster,
  UseFactorCVMasterUpdate,
  UseFactorCVMasterQueryParams,
  UseFactorCVMasterCreate,
  BulkUseFactorCVMasterCreate,
  BulkUseFactorCVMasterUpdate,
  TypeOfUseQueryParams,
  TypeOfUseResponse,
} from '@/types/useCategoryCvFactor.types';
import { ApiError } from '../utils/api';

// ---------------------------------------------
// Use Factor CV Master Services
// ---------------------------------------------

/**
 * Fetches all UseFactorCVMaster records from the API
 * @returns Promise resolving to ApiResponse containing items array
 */
export async function getUseFactorCVMaster(): Promise<ApiResponse<{ items: UseFactorCVMaster[] }>> {
  return apiClient.get<{ items: UseFactorCVMaster[] }>('/UseFactorCVMaster');
}

/**
 * Fetches UseFactorCVMaster records with query parameters for filtering, pagination, and sorting
 * @param params Query parameters for filtering and pagination
 * @returns Promise resolving to ApiResponse containing paginated results
 */
export async function getUseFactorCVMasterWithParams(
  params: UseFactorCVMasterQueryParams = {}
): Promise<ApiResponse<PagedResponse<UseFactorCVMaster>>> {
  const searchParams = new URLSearchParams();
  
  // Add parameters to query string if they exist
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Map 'id' to 'Id' if needed, though usually characters are uppercase in URL params
      const apiKey = key === 'yearRangeCVId' ? 'YearRangeCVId' : 
                    key === 'id' ? 'Id' :
                    key.charAt(0).toUpperCase() + key.slice(1);
      searchParams.append(apiKey, String(value));
    }
  });

  const endpoint = searchParams.toString() 
    ? `/UseFactorCVMaster?${searchParams.toString()}`
    : '/UseFactorCVMaster';

  return apiClient.get<PagedResponse<UseFactorCVMaster>>(endpoint);
}

/**
 * Fetches a single UseFactorCVMaster record by ID
 * @param id The UseFactorCV ID to fetch
 * @returns Promise resolving to ApiResponse containing the record
 */
export async function getUseFactorCVMasterById(id: number): Promise<ApiResponse<UseFactorCVMaster>> {
  if (id <= 0) {
    throw new Error('Valid UseFactorCV ID is required');
  }
  return apiClient.get<UseFactorCVMaster>(`/UseFactorCVMaster/${id}`);
}

/**
 * Updates an existing UseFactorCVMaster record
 * @param id The ID of the record to update
 * @param payload The update payload
 * @returns Promise resolving to void on success
 */
export async function updateUseFactorCVMaster(
  id: number,
  payload: UseFactorCVMasterUpdate
): Promise<void> {
  try {
    // Validate required fields
    if (!id || id <= 0) {
      throw new Error('Valid UseFactorCV ID is required for update');
    }
    if (!payload.typeOfUseId || payload.typeOfUseId <= 0) {
      throw new Error('typeOfUseId is required');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new Error('yearRangeCVId is required');
    }
    if (payload.factor < 0) {
      throw new Error('factor cannot be negative');
    }

    const requestPayload = {
      isActive: payload.isActive,
      updatedBy: payload.updatedBy ?? 1,
      typeOfUseId: payload.typeOfUseId,
      subTypeOfUseId: payload.subTypeOfUseId,
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };


    const response = await apiClient.put<unknown>(
      `/UseFactorCVMaster/${encodeURIComponent(String(id))}`,
      requestPayload
    );

    if (!response.success) {
      const errorMsg = response.error || '';
      const isDuplicate =
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('duplicate');

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || 'Failed to update Use Factor CV Master',
        'Update Use Factor CV Master failed'
      );
    }

    const responseData = response.data as Record<string, unknown> | null;
    if (responseData && typeof responseData === 'object') {
      const message = (responseData.message || responseData.error) as string | undefined;

      if (message) {
        const lowerMsg = message.toLowerCase();
        if (
          lowerMsg.includes('error') ||
          lowerMsg.includes('failed') ||
          lowerMsg.includes('invalid') ||
          lowerMsg.includes('already exists') ||
          lowerMsg.includes('duplicate')
        ) {
          const isDuplicate = lowerMsg.includes('already exists') || lowerMsg.includes('duplicate');
          throw new ApiError(
            isDuplicate ? 409 : 500,
            message,
            'Update Use Factor CV Master failed'
          );
        }
      }
    }

  } catch (error) {
    console.error('Error updating Use Factor CV Master:', error);
    throw error;
  }
}

/**
 * Creates a new UseFactorCVMaster record (POST)
 * @param payload The creation payload
 * @returns Promise resolving to ApiResponse containing the created record
 */
export async function createUseFactorCVMaster(
  payload: UseFactorCVMasterCreate
): Promise<ApiResponse<unknown>> {
  try {
    if (!payload.typeOfUseId || payload.typeOfUseId <= 0) {
      throw new Error('typeOfUseId is required');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new Error('yearRangeCVId is required');
    }
    if (payload.factor < 0) {
      throw new Error('factor cannot be negative');
    }

    const requestPayload = {
      isActive: payload.isActive,
      createdBy: payload.createdBy ?? 1,
      typeOfUseId: payload.typeOfUseId,
      subTypeOfUseId: payload.subTypeOfUseId,
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };


    return await apiClient.post<unknown>('/UseFactorCVMaster', requestPayload);
  } catch (error) {
    console.error('Error creating Use Factor CV Master:', error);
    throw error;
  }
}

/**
 * Bulk creates UseFactorCVMaster records (POST)
 * @param payload The creation payload containing an array of records
 * @returns Promise resolving to ApiResponse containing the created records
 */
export async function bulkCreateUseFactorCVMaster(
  payload: BulkUseFactorCVMasterCreate
): Promise<ApiResponse<unknown>> {
  try {
    if (!payload || payload.length === 0) {
      throw new Error('Valid payload is required for bulk create');
    }


    return await apiClient.post<unknown>('/UseFactorCVMaster/bulk', payload);
  } catch (error) {
    console.error('Error in bulk creating Use Factor CV Master:', error);
    throw error;
  }
}

/**
 * Bulk updates UseFactorCVMaster records (PUT)
 * @param payload The update payload containing an array of records
 * @returns Promise resolving to void on success
 */
export async function bulkUpdateUseFactorCVMaster(
  payload: BulkUseFactorCVMasterUpdate
): Promise<void> {
  try {
    if (!payload || payload.length === 0) {
      throw new Error('Valid payload is required for bulk update');
    }


    const response = await apiClient.put<unknown>(
      '/UseFactorCVMaster/bulk',
      payload
    );


    if (!response.success) {
      const errorMsg = response.error || '';
      const isDuplicate =
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('duplicate');

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || 'Failed to bulk update Use Factor CV Master',
        'Bulk update Use Factor CV Master failed'
      );
    }

  } catch (error) {
    console.error('Error in bulk updating Use Factor CV Master:', error);
    throw error;
  }
}

// ---------------------------------------------
// TypeOfUse Services
// ---------------------------------------------

/**
 * Fetches TypeOfUse records with query parameters for filtering, pagination, and sorting
 * @param params Query parameters for filtering and pagination
 * @returns Promise resolving to ApiResponse containing paginated results
 */
export async function getTypeOfUseWithParams(
  params: TypeOfUseQueryParams = {}
): Promise<ApiResponse<PagedResponse<TypeOfUseResponse>>> {
  const searchParams = new URLSearchParams();
  
  // Add parameters to query string if they exist
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const endpoint = searchParams.toString() 
    ? `/TypeOfUse?${searchParams.toString()}`
    : '/TypeOfUse';

  return apiClient.get<PagedResponse<TypeOfUseResponse>>(endpoint);
}

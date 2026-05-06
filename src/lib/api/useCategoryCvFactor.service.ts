import { apiClient } from '@/services/api.service';
import { getTranslations } from 'next-intl/server';
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
  const response = await apiClient.get<{ items: UseFactorCVMaster[] }>('/UseFactorCVMaster');
  if (!response.success) {
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(response.statusCode || 500, response.error || t('errors.fetchFailed'), 'Fetch all Use Factor CV Master failed');
  }
  return response;
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

  const response = await apiClient.get<PagedResponse<UseFactorCVMaster>>(endpoint);
  if (!response.success) {
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(response.statusCode || 500, response.error || t('errors.fetchFailed'), 'Fetch Use Factor CV Master with params failed');
  }
  return response;
}

/**
 * Fetches a single UseFactorCVMaster record by ID
 * @param id The UseFactorCV ID to fetch
 * @returns Promise resolving to ApiResponse containing the record
 */
export async function getUseFactorCVMasterById(id: number): Promise<ApiResponse<UseFactorCVMaster>> {
  if (id <= 0) {
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(400, t('errors.invalidId'), "Validation");
  }
  const response = await apiClient.get<UseFactorCVMaster>(`/UseFactorCVMaster/${id}`);
  if (!response.success) {
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(response.statusCode || 500, response.error || t('errors.fetchFailed'), 'Fetch Use Factor CV Master by ID failed');
  }
  return response;
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
    const t = await getTranslations('useCategoryFactorMaster');
    
    // Validate required fields
    if (!id || id <= 0) {
      throw new ApiError(400, t('errors.invalidId'), "Validation");
    }
    if (!payload.typeOfUseId || payload.typeOfUseId <= 0) {
      throw new ApiError(400, t('errors.typeOfUseIdRequired'), "Validation");
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new ApiError(400, t('errors.yearRangeCVIdRequired'), "Validation");
    }
    if (payload.factor < 0) {
      throw new ApiError(400, t('errors.factorNegative'), "Validation");
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
        response.error || t('errors.updateFailed'),
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
    if (error instanceof ApiError) throw error;
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(500, t('errors.updateFailed'), error instanceof Error ? error.message : String(error));
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
    const t = await getTranslations('useCategoryFactorMaster');

    if (!payload.typeOfUseId || payload.typeOfUseId <= 0) {
      throw new ApiError(400, t('errors.typeOfUseIdRequired'), "Validation");
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new ApiError(400, t('errors.yearRangeCVIdRequired'), "Validation");
    }
    if (payload.factor < 0) {
      throw new ApiError(400, t('errors.factorNegative'), "Validation");
    }

    const requestPayload = {
      isActive: payload.isActive,
      createdBy: payload.createdBy ?? 1,
      typeOfUseId: payload.typeOfUseId,
      subTypeOfUseId: payload.subTypeOfUseId,
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };


    const response = await apiClient.post<unknown>('/UseFactorCVMaster', requestPayload);
    
    if (!response.success) {
      throw new ApiError(
        response.statusCode || 500,
        response.error || t('errors.createFailed'),
        'Create Use Factor CV Master failed'
      );
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(500, t('errors.createFailed'), error instanceof Error ? error.message : String(error));
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
      const t = await getTranslations('useCategoryFactorMaster');
      throw new ApiError(400, t('errors.payloadRequired'), "Validation");
    }

    const requestPayload = payload.map((item) => ({
      isActive: item.isActive,
      createdBy: item.createdBy ?? 1,
      typeOfUseId: item.typeOfUseId,
      subTypeOfUseId: item.subTypeOfUseId,
      factor: Number(item.factor),
      yearRangeCVId: item.yearRangeCVId,
    }));


    const response = await apiClient.post<unknown>('/UseFactorCVMaster/bulk', requestPayload);

    if (!response.success) {
      const t = await getTranslations('useCategoryFactorMaster');
      throw new ApiError(
        response.statusCode || 500,
        response.error || t('errors.bulkCreateFailed'),
        'Bulk create Use Factor CV Master failed'
      );
    }

    return response;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(500, t('errors.bulkCreateFailed'), error instanceof Error ? error.message : String(error));
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
    const t = await getTranslations('useCategoryFactorMaster');

    if (!payload || payload.length === 0) {
      throw new ApiError(400, t('errors.payloadRequired'), "Validation");
    }

    const requestPayload = payload.map((item) => ({
      id: item.id,
      data: {
        isActive: item.data.isActive,
        updatedBy: item.data.updatedBy ?? 1,
        typeOfUseId: item.data.typeOfUseId,
        subTypeOfUseId: item.data.subTypeOfUseId,
        factor: Number(item.data.factor),
        yearRangeCVId: item.data.yearRangeCVId,
      }
    }));


    const response = await apiClient.put<unknown>(
      '/UseFactorCVMaster/bulk',
      requestPayload
    );


    if (!response.success) {
      const errorMsg = response.error || '';
      const isDuplicate =
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('duplicate');

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || t('errors.bulkUpdateFailed'),
        'Bulk update Use Factor CV Master failed'
      );
    }

  } catch (error) {
    if (error instanceof ApiError) throw error;
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(500, t('errors.bulkUpdateFailed'), error instanceof Error ? error.message : String(error));
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
      // Map keys to PascalCase as expected by the backend
      const apiKey = key === 'id' ? 'Id' : key.charAt(0).toUpperCase() + key.slice(1);
      searchParams.append(apiKey, String(value));
    }
  });
  const endpoint = searchParams.toString() 
    ? `/TypeOfUse?${searchParams.toString()}`
    : '/TypeOfUse';

  const response = await apiClient.get<PagedResponse<TypeOfUseResponse>>(endpoint);
  if (!response.success) {
    const t = await getTranslations('useCategoryFactorMaster');
    throw new ApiError(response.statusCode || 500, response.error || t('errors.fetchFailed'), 'Fetch Type of Use with params failed');
  }
  return response;
}

import { apiClient } from '@/services/api.service';
import type { ApiResponse } from '@/types/common.types';
import { 
  FloorFactorCVMaster, 
  FloorFactorCVMasterUpdate, 
  FloorFactorCVMasterQueryParams,
  PagedResponse, 
  FloorFactorCVMasterCreate,
  BulkFloorFactorCVMasterCreate,
  BulkFloorFactorCVMasterUpdate,
  NatureFactorCVMaster,
  NatureFactorCVMasterQueryParams,
  NatureFactorCVMasterUpdate,
  NatureFactorCVMasterCreate,
  BulkNatureFactorCVMasterCreate,
  BulkNatureFactorCVMasterUpdate,
  UseFactorCVMaster,
  UseFactorCVMasterUpdate,
  UseFactorCVMasterQueryParams,
  UseFactorCVMasterCreate,
  BulkUseFactorCVMasterCreate,
  BulkUseFactorCVMasterUpdate,
  TypeOfUseQueryParams,
  TypeOfUseResponse,
  AgeFactorCVMaster,
  AgeFactorCVMasterUpdate,
  AgeFactorCVMasterCreate,
  AgeFactorCVMasterQueryParams,
  BulkAgeFactorCVMasterCreate,
  BulkAgeFactorCVMasterUpdate
} from '@/types/weightageMaster.types';
import { ApiError } from '../utils/api';



function isPagedResponse(value: unknown): value is PagedResponse<FloorFactorCVMaster> {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    Array.isArray(obj.items) &&
    typeof obj.totalCount === "number" &&
    typeof obj.pageNumber === "number" &&
    typeof obj.pageSize === "number" &&
    typeof obj.totalPages === "number" &&
    typeof obj.hasPrevious === "boolean" &&
    typeof obj.hasNext === "boolean"
  );
}
/**
 * Fetches all FloorFactorCVMaster records from the API
 * @returns Promise resolving to ApiResponse containing items array
 */
export async function getFloorFactorCVMaster(): Promise<ApiResponse<{ items: FloorFactorCVMaster[] }>> {
  return apiClient.get<{ items: FloorFactorCVMaster[] }>('/FloorFactorCVMaster');
}

/**
 * Fetches FloorFactorCVMaster records with query parameters for filtering, pagination, and sorting
 * @param params Query parameters for filtering and pagination
 * @returns Promise resolving to ApiResponse containing paginated results
 * 
 * @example
 * const result = await getFloorFactorCVMasterWithParams({
 *   floorId: 1,
 *   isActive: true,
 *   pageNumber: 1,
 *   pageSize: 20,
 *   searchTerm: 'floor',
 *   sortBy: 'floorCode',
 *   sortOrder: 'asc'
 * });
 */
export async function getFloorFactorCVMasterWithParams(
  params: FloorFactorCVMasterQueryParams = {}
): Promise<ApiResponse<PagedResponse<FloorFactorCVMaster>>> {
  const searchParams = new URLSearchParams();
  
  // Add parameters to query string if they exist
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Convert camelCase to match API expectations
      const apiKey = key === 'yearRangeCVId' ? 'YearRangeCVId' : 
                    key.charAt(0).toUpperCase() + key.slice(1);
      searchParams.append(apiKey, String(value));
    }
  });

  const endpoint = searchParams.toString() 
    ? `/FloorFactorCVMaster?${searchParams.toString()}`
    : '/FloorFactorCVMaster';

  return apiClient.get<PagedResponse<FloorFactorCVMaster>>(endpoint);
}

/**
 * Fetches a single FloorFactorCVMaster record by ID
 * @param id The FloorFactorCV ID to fetch
 * @returns Promise resolving to ApiResponse containing the record
 */
export async function getFloorFactorCVMasterById(id: number): Promise<ApiResponse<FloorFactorCVMaster>> {
  if (id <= 0) {
    throw new Error('Valid FloorFactorCV ID is required');
  }
  return apiClient.get<FloorFactorCVMaster>(`/FloorFactorCVMaster/${id}`);
}

/**
 * Updates an existing FloorFactorCVMaster record
 * @param id The ID of the record to update
 * @param payload The update payload
 * @returns Promise resolving to void on success
 */
export async function updateFloorFactorCVMaster(
  id: number,
  payload: FloorFactorCVMasterUpdate
): Promise<void> {
  try {
    // Validate required fields
    if (!id || id <= 0) {
      throw new Error('Valid FloorFactorCV ID is required for update');
    }
    if (!payload.floorId || payload.floorId <= 0) {
      throw new Error('floorId is required');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new Error('yearRangeCVId is required');
    }
    if (payload.factorWithLift < 0) {
      throw new Error('factorWithLift cannot be negative');
    }
    if (payload.factorWithoutLift < 0) {
      throw new Error('factorWithoutLift cannot be negative');
    }

    const requestPayload = {
      isActive: payload.isActive,
      updatedBy: payload.updatedBy ?? 1, // TODO: Get from auth context
      floorId: payload.floorId,
      factorWithLift: Number(payload.factorWithLift),
      factorWithoutLift: Number(payload.factorWithoutLift),
      yearRangeCVId: payload.yearRangeCVId,
    };

    console.log('Service calling API PUT:', `/FloorFactorCVMaster/${id}`, requestPayload);

    const response = await apiClient.put<unknown>(
      `/FloorFactorCVMaster/${encodeURIComponent(String(id))}`,
      requestPayload
    );

    console.log('Service received response:', response);

    if (!response.success) {
      // Detect duplicate error from backend message
      const errorMsg = response.error || '';
      const isDuplicate =
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('duplicate');

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || 'Failed to update Floor Factor CV Master',
        'Update Floor Factor CV Master failed'
      );
    }

    // Check if response data contains error (backend returns 200 with error in message)
    const responseData = response.data as Record<string, unknown> | null;
    if (responseData && typeof responseData === 'object') {
      const message = (responseData.message || responseData.error) as string | undefined;

      if (message) {
        const lowerMsg = message.toLowerCase();

        // Only throw error if message indicates an actual error
        const isErrorMessage =
          lowerMsg.includes('already exists') ||
          lowerMsg.includes('duplicate') ||
          lowerMsg.includes('error') ||
          lowerMsg.includes('failed') ||
          lowerMsg.includes('invalid') ||
          lowerMsg.includes('not found');

        // Skip success messages like "Record updated successfully"
        const isSuccessMessage =
          lowerMsg.includes('success') ||
          lowerMsg.includes('updated') ||
          lowerMsg.includes('modified');

        if (isErrorMessage && !isSuccessMessage) {
          const isDuplicate =
            lowerMsg.includes('already exists') ||
            lowerMsg.includes('duplicate');

          throw new ApiError(
            isDuplicate ? 409 : 400,
            message,
            'Update Floor Factor CV Master failed'
          );
        }
      }
    }

    console.log('Service update completed successfully');
  } catch (error) {
    console.error('Error updating Floor Factor CV Master:', error);
    throw error;
  }
}

/**
 * Fetches paginated FloorFactorCVMaster records with filtering and sorting
 * @param pageNumber The page number to fetch
 * @param pageSize The number of records per page
 * @param searchTerm Optional search term for filtering
 * @param yearRangeCVId Optional year range CV ID for filtering
 * @returns Promise resolving to PagedResponse of FloorFactorCVMaster
 */
export async function getFloorFactorCVMasterWithPagination(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  yearRangeCVId?: string
): Promise<PagedResponse<FloorFactorCVMaster>> {
  try {
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    });

    if (typeof searchTerm === "string") {
      const trimmedSearchTerm = searchTerm.trim();
      if (trimmedSearchTerm.length > 0) {
        const MAX_SEARCH_TERM_LENGTH = 100;
        const safeSearchTerm = trimmedSearchTerm.slice(0, MAX_SEARCH_TERM_LENGTH);
        params.append("SearchTerm", safeSearchTerm);
      }
    }

    // Add YearRangeCVId filter if provided
    if (yearRangeCVId && yearRangeCVId.trim()) {
      params.append("YearRangeCVId", yearRangeCVId.trim());
      console.log('=== Service: Adding YearRangeCVId filter ===', yearRangeCVId.trim());
    } else {
      console.log('=== Service: NO YearRangeCVId filter provided ===', yearRangeCVId);
    }

    const endpoint = `/FloorFactorCVMaster?${params.toString()}`;
    console.log('=== Service: API Endpoint ===', endpoint);

    const response = await apiClient.get<PagedResponse<FloorFactorCVMaster>>(endpoint);

    if (!response.success) {
      throw new ApiError(
        500,
        response.error || "Failed to fetch FloorFactorCVMaster records",
        "Fetch FloorFactorCVMaster (paged) failed"
      );
    }

    const data = response.data;

    if (!isPagedResponse(data)) {
      throw new ApiError(
        500,
        "Invalid response format",
        "Expected PagedResponse but received unexpected format"
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching paged FloorFactorCVMaster records:", error);
    throw error;
  }
}




/**
 * Creates a new FloorFactorCVMaster record (POST)
 * @param payload The creation payload
 * @returns Promise resolving to ApiResponse containing the created record
 */
export async function createFloorWeightageCv(payload: FloorFactorCVMasterCreate): Promise<ApiResponse<any>> {
  try {
    // Validate required fields
    if (!payload.floorId || payload.floorId <= 0) {
      throw new Error('floorId is required');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new Error('yearRangeCVId is required');
    }
    if (payload.factorWithLift < 0) {
      throw new Error('factorWithLift cannot be negative');
    }
    if (payload.factorWithoutLift < 0) {
      throw new Error('factorWithoutLift cannot be negative');
    }

    const requestPayload = {
      isActive: payload.isActive,
      createdBy: payload.createdBy ?? 1, // TODO: Get from auth context
      floorId: payload.floorId,
      factorWithLift: Number(payload.factorWithLift),
      factorWithoutLift: Number(payload.factorWithoutLift),
      yearRangeCVId: payload.yearRangeCVId,
    };

    console.log('Service calling API POST:', '/FloorFactorCVMaster', requestPayload);

    return await apiClient.post<any>('/FloorFactorCVMaster', requestPayload);
  } catch (error) {
    console.error('Error creating Floor Factor CV Master:', error);
    throw error;
  }
}

/**
 * Bulk creates FloorFactorCVMaster records (POST)
 * @param payload The creation payload containing an array of records
 * @returns Promise resolving to ApiResponse containing the created records
 */
export async function bulkCreateFloorWeightageCv(
  payload: BulkFloorFactorCVMasterCreate
): Promise<ApiResponse<any>> {
  try {
    if (!payload || !payload.floorFactors || payload.floorFactors.length === 0) {
      throw new Error('Valid payload with floorFactors is required for bulk create');
    }

    const requestPayload = {
      floorFactors: payload.floorFactors.map((factor) => ({
        isActive: factor.isActive,
        createdBy: factor.createdBy ?? 1, // TODO: Get from auth context
        floorId: factor.floorId,
        factorWithLift: Number(factor.factorWithLift),
        factorWithoutLift: Number(factor.factorWithoutLift),
        yearRangeCVId: factor.yearRangeCVId,
      }))
    };

    console.log('Service calling API POST bulk:', '/FloorFactorCVMaster/bulk', requestPayload);

    return await apiClient.post<any>('/FloorFactorCVMaster/bulk', requestPayload);
  } catch (error) {
    console.error('Error in bulk creating Floor Factor CV Master:', error);
    throw error;
  }
}

/**
 * Bulk updates FloorFactorCVMaster records (PUT)
 * @param payload The update payload containing an array of records
 * @returns Promise resolving to void on success
 */
export async function bulkUpdateFloorFactorCVMaster(
  payload: BulkFloorFactorCVMasterUpdate
): Promise<void> {
  try {
    if (!payload || !payload.floorFactors || payload.floorFactors.length === 0) {
      throw new Error('Valid payload with floorFactors is required for bulk update');
    }

    const requestPayload = {
      floorFactors: payload.floorFactors.map((factor) => ({
        floorFactorId: factor.floorFactorId,
        floorId: factor.floorId,
        factorWithLift: Number(factor.factorWithLift),
        factorWithoutLift: Number(factor.factorWithoutLift),
        yearRangeCVId: factor.yearRangeCVId,
      }))
    };

    console.log('Service calling API PUT bulk:', '/FloorFactorCVMaster/bulk', requestPayload);

    const response = await apiClient.put<unknown>(
      '/FloorFactorCVMaster/bulk',
      requestPayload
    );

    console.log('Service received bulk response:', response);

    if (!response.success) {
      const errorMsg = response.error || '';
      const isDuplicate =
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('duplicate');

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || 'Failed to bulk update Floor Factor CV Master',
        'Bulk update Floor Factor CV Master failed'
      );
    }

    console.log('Service bulk update completed successfully');
  } catch (error) {
    console.error('Error in bulk updating Floor Factor CV Master:', error);
    throw error;
  }
}

// nature factor cv master service


/**
 * Fetches all NatureFactorCVMaster records from the API
 * @returns Promise resolving to ApiResponse containing items array
 */
export async function getNatureFactorCVMaster(): Promise<ApiResponse<{ items: NatureFactorCVMaster[] }>> {
  return apiClient.get<{ items: NatureFactorCVMaster[] }>('/NatureFactorCVMaster');
}

/**
 * Fetches NatureFactorCVMaster records with query parameters for filtering, pagination, and sorting
 * @param params Query parameters for filtering and pagination
 * @returns Promise resolving to ApiResponse containing paginated results
 * 
 * @example
 * const result = await getNatureFactorCVMasterWithParams({
 *   constructionTypeId: 1,
 *   isActive: true,
 *   pageNumber: 1,
 *   pageSize: 20,
 *   searchTerm: 'construction',
 *   sortBy: 'constructionCode',
 *   sortOrder: 'asc'
 * });
 */
export async function getNatureFactorCVMasterWithParams(
  params: NatureFactorCVMasterQueryParams = {}
): Promise<ApiResponse<PagedResponse<NatureFactorCVMaster>>> {
  const searchParams = new URLSearchParams();
  
  // Add parameters to query string if they exist
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Convert camelCase to match API expectations
      const apiKey = key === 'yearRangeCVId' ? 'YearRangeCVId' : 
                    key.charAt(0).toUpperCase() + key.slice(1);
      searchParams.append(apiKey, String(value));
    }
  });

  const endpoint = searchParams.toString() 
    ? `/NatureFactorCVMaster?${searchParams.toString()}`
    : '/NatureFactorCVMaster';

  return apiClient.get<PagedResponse<NatureFactorCVMaster>>(endpoint);
}

/**
 * Fetches a single NatureFactorCVMaster record by ID
 * @param id The NatureFactorCV ID to fetch
 * @returns Promise resolving to ApiResponse containing the record
 */
export async function getNatureFactorCVMasterById(id: number): Promise<ApiResponse<NatureFactorCVMaster>> {
  if (id <= 0) {
    throw new Error('Valid NatureFactorCV ID is required');
  }
  return apiClient.get<NatureFactorCVMaster>(`/NatureFactorCVMaster/${id}`);
}

/**
 * Updates an existing NatureFactorCVMaster record
 * @param id The ID of the record to update
 * @param payload The update payload
 * @returns Promise resolving to void on success
 */
export async function updateNatureFactorCVMaster(
  id: number,
  payload: NatureFactorCVMasterUpdate
): Promise<void> {
  try {
    // Validate required fields
    if (!id || id <= 0) {
      throw new Error('Valid NatureFactorCV ID is required for update');
    }
    if (!payload.constructionTypeId || payload.constructionTypeId <= 0) {
      throw new Error('constructionTypeId is required');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new Error('yearRangeCVId is required');
    }
    if (payload.factor < 0) {
      throw new Error('factor cannot be negative');
    }

    const requestPayload = {
      isActive: payload.isActive,
      updatedBy: payload.updatedBy ?? 1, // TODO: Get from auth context
      constructionTypeId: payload.constructionTypeId,
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };

    console.log('Service calling API PUT:', `/NatureFactorCVMaster/${id}`, requestPayload);

    const response = await apiClient.put<unknown>(
      `/NatureFactorCVMaster/${encodeURIComponent(String(id))}`,
      requestPayload
    );

    console.log('Service received response:', response);

    if (!response.success) {
      // Detect duplicate error from backend message
      const errorMsg = response.error || '';
      const isDuplicate =
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('duplicate');

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || 'Failed to update Nature Factor CV Master',
        'Update Nature Factor CV Master failed'
      );
    }

    // Check if response data contains error (backend returns 200 with error in message)
    const responseData = response.data as Record<string, unknown> | null;
    if (responseData && typeof responseData === 'object') {
      const message = (responseData.message || responseData.error) as string | undefined;

      if (message) {
        const lowerMsg = message.toLowerCase();

        // Only throw error if message indicates an actual error
        if (
          lowerMsg.includes('error') ||
          lowerMsg.includes('failed') ||
          lowerMsg.includes('invalid') ||
          lowerMsg.includes('already exists') ||
          lowerMsg.includes('duplicate')
        ) {
          const isDuplicate =
            lowerMsg.includes('already exists') || lowerMsg.includes('duplicate');

          throw new ApiError(
            isDuplicate ? 409 : 500,
            message,
            'Update Nature Factor CV Master failed'
          );
        }
      }
    }

    console.log('Service update completed successfully');
  } catch (error) {
    console.error('Error updating Nature Factor CV Master:', error);
    throw error;
  }
}

/**
 * Fetches paginated NatureFactorCVMaster records with filtering and sorting
 * @param pageNumber The page number to fetch
 * @param pageSize The number of records per page
 * @param searchTerm Optional search term for filtering
 * @param yearRangeCVId Optional year range CV ID for filtering
 * @returns Promise resolving to PagedResponse of NatureFactorCVMaster
 */
export async function getNatureFactorCVMasterWithPagination(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  yearRangeCVId?: string,
  constructionTypeId?: string
): Promise<PagedResponse<NatureFactorCVMaster>> {
  try {
    const params = new URLSearchParams({
      PageNumber: pageNumber.toString(),
      PageSize: pageSize.toString(),
    });

    if (typeof searchTerm === "string") {
      const trimmedSearchTerm = searchTerm.trim();
      if (trimmedSearchTerm.length > 0) {
        params.append("SearchTerm", trimmedSearchTerm);
        console.log('=== Service: Adding SearchTerm ===', trimmedSearchTerm);
      }
    }

    // Add YearRangeCVId filter if provided
    if (yearRangeCVId && yearRangeCVId.trim()) {
      params.append("YearRangeCVId", yearRangeCVId.trim());
      console.log('=== Service: Adding YearRangeCVId filter ===', yearRangeCVId.trim());
    } else {
      console.log('=== Service: NO YearRangeCVId filter provided ===', yearRangeCVId);
    }

    // Add ConstructionTypeId filter if provided
    if (constructionTypeId && constructionTypeId.trim()) {
      params.append("ConstructionTypeId", constructionTypeId.trim());
      console.log('=== Service: Adding ConstructionTypeId filter ===', constructionTypeId.trim());
    } else {
      console.log('=== Service: NO ConstructionTypeId filter provided ===', constructionTypeId);
    }

    const endpoint = `/NatureFactorCVMaster?${params.toString()}`;
    console.log('=== Service: API Endpoint ===', endpoint);

    const response = await apiClient.get<PagedResponse<NatureFactorCVMaster>>(endpoint);

    if (!response.success) {
      throw new ApiError(
        500,
        response.error || "Failed to fetch NatureFactorCVMaster records",
        "Fetch NatureFactorCVMaster (paged) failed"
      );
    }

    const data = response.data;

    if (!isPagedResponse(data)) {
      throw new ApiError(
        500,
        "Invalid response format",
        "Expected PagedResponse but received unexpected format"
      );
    }

    return data;
  } catch (error) {
    console.error("Error fetching paged NatureFactorCVMaster records:", error);
    throw error;
  }
}

/**
 * Creates a new NatureFactorCVMaster record (POST)
 * @param payload The creation payload
 * @returns Promise resolving to ApiResponse containing the created record
 */
export async function createNatureFactorCVMaster(
  payload: NatureFactorCVMasterCreate
): Promise<ApiResponse<any>> {
  try {
    // Validate required fields
    if (!payload.constructionTypeId || payload.constructionTypeId <= 0) {
      throw new Error('constructionTypeId is required');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new Error('yearRangeCVId is required');
    }
    if (payload.factor < 0) {
      throw new Error('factor cannot be negative');
    }

    const requestPayload = {
      isActive: payload.isActive,
      createdBy: payload.createdBy ?? 1, // TODO: Get from auth context
      constructionTypeId: payload.constructionTypeId,
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };

    console.log('Service calling API POST:', '/NatureFactorCVMaster', requestPayload);

    return await apiClient.post<any>('/NatureFactorCVMaster', requestPayload);
  } catch (error) {
    console.error('Error creating Nature Factor CV Master:', error);
    throw error;
  }
}

/**
 * Bulk creates NatureFactorCVMaster records (POST)
 * @param payload The creation payload containing an array of records
 * @returns Promise resolving to ApiResponse containing the created records
 */
export async function bulkCreateNatureFactorCVMaster(
  payload: BulkNatureFactorCVMasterCreate
): Promise<ApiResponse<any>> {
  try {
    if (!payload || !payload.natureFactors || payload.natureFactors.length === 0) {
      throw new Error('Valid payload with natureFactors is required for bulk create');
    }

    const requestPayload = {
      natureFactors: payload.natureFactors.map((factor) => ({
        isActive: factor.isActive,
        createdBy: factor.createdBy ?? 1, // TODO: Get from auth context
        constructionTypeId: factor.constructionTypeId,
        factor: Number(factor.factor),
        yearRangeCVId: factor.yearRangeCVId,
      }))
    };

    console.log('Service calling API POST bulk:', '/NatureFactorCVMaster/bulk', requestPayload);

    return await apiClient.post<any>('/NatureFactorCVMaster/bulk', requestPayload);
  } catch (error) {
    console.error('Error in bulk creating Nature Factor CV Master:', error);
    throw error;
  }
}

/**
 * Bulk updates NatureFactorCVMaster records (PUT)
 * @param payload The update payload containing an array of records
 * @returns Promise resolving to void on success
 */
export async function bulkUpdateNatureFactorCVMaster(
  payload: BulkNatureFactorCVMasterUpdate
): Promise<void> {
  try {
    if (!payload || !payload.natureFactors || payload.natureFactors.length === 0) {
      throw new Error('Valid payload with natureFactors is required for bulk update');
    }

    const requestPayload = {
      natureFactors: payload.natureFactors.map((factor) => ({
        natureFactorId: factor.natureFactorId,
        constructionTypeId: factor.constructionTypeId,
        factor: Number(factor.factor),
        yearRangeCVId: factor.yearRangeCVId,
      }))
    };

    console.log('Service calling API PUT bulk:', '/NatureFactorCVMaster/bulk', requestPayload);

    const response = await apiClient.put<unknown>(
      '/NatureFactorCVMaster/bulk',
      requestPayload
    );

    console.log('Service received bulk response:', response);

    if (!response.success) {
      const errorMsg = response.error || '';
      const isDuplicate =
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('duplicate');

      throw new ApiError(
        isDuplicate ? 409 : 500,
        response.error || 'Failed to bulk update Nature Factor CV Master',
        'Bulk update Nature Factor CV Master failed'
      );
    }

    console.log('Service bulk update completed successfully');
  } catch (error) {
    console.error('Error in bulk updating Nature Factor CV Master:', error);
    throw error;
  }
}


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
      // Convert camelCase to match API expectations
      const apiKey = key === 'yearRangeCVId' ? 'YearRangeCVId' : 
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
      updatedBy: payload.updatedBy ?? 1, // TODO: Get from auth context
      typeOfUseId: payload.typeOfUseId,
      subTypeOfUseId: payload.subTypeOfUseId,
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };

    console.log('Service calling API PUT:', `/UseFactorCVMaster/${id}`, requestPayload);

    const response = await apiClient.put<unknown>(
      `/UseFactorCVMaster/${encodeURIComponent(String(id))}`,
      requestPayload
    );

    console.log('Service received response:', response);

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

    console.log('Service update completed successfully');
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
): Promise<ApiResponse<any>> {
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
      createdBy: payload.createdBy ?? 1, // TODO: Get from auth context
      typeOfUseId: payload.typeOfUseId,
      subTypeOfUseId: payload.subTypeOfUseId,
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };

    console.log('Service calling API POST:', '/UseFactorCVMaster', requestPayload);

    return await apiClient.post<any>('/UseFactorCVMaster', requestPayload);
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
): Promise<ApiResponse<any>> {
  try {
    if (!payload || !payload.useFactors || payload.useFactors.length === 0) {
      throw new Error('Valid payload with useFactors is required for bulk create');
    }

    const requestPayload = {
      useFactors: payload.useFactors.map((f) => ({
        isActive: f.isActive,
        createdBy: f.createdBy ?? 1, // TODO: Get from auth context
        typeOfUseId: f.typeOfUseId,
        subTypeOfUseId: f.subTypeOfUseId,
        factor: Number(f.factor),
        yearRangeCVId: f.yearRangeCVId,
      }))
    };

    console.log('Service calling API POST bulk:', '/UseFactorCVMaster/bulk', requestPayload);

    return await apiClient.post<any>('/UseFactorCVMaster/bulk', requestPayload);
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
    if (!payload || !payload.useFactors || payload.useFactors.length === 0) {
      throw new Error('Valid payload with useFactors is required for bulk update');
    }

    const requestPayload = {
      useFactors: payload.useFactors.map((f) => ({
        useFactorId: f.useFactorId,
        typeOfUseId: f.typeOfUseId,
        subTypeOfUseId: f.subTypeOfUseId,
        factor: Number(f.factor),
        yearRangeCVId: f.yearRangeCVId,
      }))
    };

    console.log('Service calling API PUT bulk:', '/UseFactorCVMaster/bulk', requestPayload);

    const response = await apiClient.put<unknown>(
      '/UseFactorCVMaster/bulk',
      requestPayload
    );

    console.log('Service received bulk response:', response);

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

    console.log('Service bulk update completed successfully');
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
 * 
 * @example
 * const result = await getTypeOfUseWithParams({
 *   typeOfUseId: 1,
 *   typeOfUseGroupId: 2,
 *   pageNumber: 1,
 *   pageSize: 20,
 *   searchTerm: 'residential',
 *   sortBy: 'typeOfUseCode',
 *   sortOrder: 'asc',
 *   filterLogic: 1
 * });
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

// ---------------------------------------------
// Age Factor CV Master Services
// ---------------------------------------------

/**
 * Fetches all AgeFactorCVMaster records from the API
 * @returns Promise resolving to ApiResponse containing items array
 */
export async function getAgeFactorCVMaster(): Promise<ApiResponse<{ items: AgeFactorCVMaster[] }>> {
  return apiClient.get<{ items: AgeFactorCVMaster[] }>('/AgeFactorCVMaster');
}

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
      // Convert camelCase to match API expectations
      const apiKey = key === 'yearRangeCVId' ? 'YearRangeCVId' : 
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
 * Fetches a single AgeFactorCVMaster record by ID
 * @param id The AgeFactorCV ID to fetch
 * @returns Promise resolving to ApiResponse containing the record
 */
export async function getAgeFactorCVMasterById(id: number): Promise<ApiResponse<AgeFactorCVMaster>> {
  if (id <= 0) {
    throw new Error('Valid AgeFactorCV ID is required');
  }
  return apiClient.get<AgeFactorCVMaster>(`/AgeFactorCVMaster/${id}`);
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
      throw new Error('Valid AgeFactorCV ID is required for update');
    }
    if (!payload.constructionTypeId || payload.constructionTypeId <= 0) {
      throw new Error('constructionTypeId is required');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new Error('yearRangeCVId is required');
    }

    const requestPayload = {
      isActive: payload.isActive,
      updatedBy: payload.updatedBy ?? 1,
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
    console.error('Error updating Age Factor CV Master:', error);
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
): Promise<ApiResponse<any>> {
  try {
    if (!payload.constructionTypeId || payload.constructionTypeId <= 0) {
      throw new Error('constructionTypeId is required');
    }
    if (!payload.yearRangeCVId || payload.yearRangeCVId <= 0) {
      throw new Error('yearRangeCVId is required');
    }

    const requestPayload = {
      isActive: payload.isActive,
      createdBy: payload.createdBy ?? 1,
      constructionTypeId: payload.constructionTypeId,
      ageFrom: Number(payload.ageFrom),
      ageTo: Number(payload.ageTo),
      factor: Number(payload.factor),
      yearRangeCVId: payload.yearRangeCVId,
    };

    return await apiClient.post<any>('/AgeFactorCVMaster', requestPayload);
  } catch (error) {
    console.error('Error creating Age Factor CV Master:', error);
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
): Promise<ApiResponse<any>> {
  try {
    if (!payload || !payload.ageFactors || payload.ageFactors.length === 0) {
      throw new Error('Valid payload with ageFactors is required for bulk create');
    }

    const requestPayload = {
      ageFactors: payload.ageFactors.map((f) => ({
        isActive: f.isActive,
        createdBy: f.createdBy ?? 1,
        constructionTypeId: f.constructionTypeId,
        ageFrom: Number(f.ageFrom),
        ageTo: Number(f.ageTo),
        factor: Number(f.factor),
        yearRangeCVId: f.yearRangeCVId,
      }))
    };

    return await apiClient.post<any>('/AgeFactorCVMaster/bulk', requestPayload);
  } catch (error) {
    console.error('Error in bulk creating Age Factor CV Master:', error);
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
    if (!payload || !payload.ageFactors || payload.ageFactors.length === 0) {
      throw new Error('Valid payload with ageFactors is required for bulk update');
    }

    const requestPayload = {
      ageFactors: payload.ageFactors.map((f) => ({
        ageFactorId: f.ageFactorId,
        constructionTypeId: f.constructionTypeId,
        ageFrom: Number(f.ageFrom),
        ageTo: Number(f.ageTo),
        factor: Number(f.factor),
        yearRangeCVId: f.yearRangeCVId,
        isActive: f.isActive,
      }))
    };

    const response = await apiClient.put<unknown>(
      '/AgeFactorCVMaster/bulk',
      requestPayload
    );

    if (!response.success) {
      throw new ApiError(500, response.error || 'Failed to bulk update Age Factor CV Master', 'Bulk update Age Factor CV Master failed');
    }
  } catch (error) {
    console.error('Error in bulk updating Age Factor CV Master:', error);
    throw error;
  }
}

/**
 * Deletes an AgeFactorCVMaster record
 * @param id The ID of the record to delete
 * @returns Promise resolving to ApiResponse
 */
export async function deleteAgeFactorCVMaster(id: number): Promise<ApiResponse<any>> {
    if (id <= 0) {
        throw new Error('Valid AgeFactorCV ID is required');
    }
    return apiClient.delete<any>(`/AgeFactorCVMaster/${id}`);
}

/**
 * Bulk deletes AgeFactorCVMaster records
 * @param ids Array of AgeFactorCV IDs to delete
 * @returns Promise resolving to ApiResponse
 */
export async function bulkDeleteAgeFactorCVMaster(ids: number[]): Promise<ApiResponse<any>> {
    if (!ids || ids.length === 0) {
        throw new Error('Valid list of IDs is required for bulk delete');
    }
    return apiClient.delete<any>('/AgeFactorCVMaster/bulk', { body: JSON.stringify({ ids }) });
}



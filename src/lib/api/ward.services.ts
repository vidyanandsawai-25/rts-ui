import { apiClient } from "@/services/api.service";
import { 
  WardItem, 
  WardListResponse, 
  WardMutationResponse, 
  CreateWardPayload, 
  UpdateWardPayload,
  BatchWardCreatePayload,
  BatchWardCreateResponse
} from "@/types/wardMaster.types";

/**
 * Fetches paginated ward master list from /Ward endpoint.
 * Supports filtering by zoneId and search term.
 */
export async function getWards(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  zoneId?: number
): Promise<WardListResponse> {
  const params = new URLSearchParams();
  params.set("PageNumber", pageNumber.toString());
  params.set("PageSize", pageSize.toString());

  if (searchTerm) {
    params.set("SearchTerm", searchTerm);
  }

  if (typeof zoneId === "number" && !isNaN(zoneId)) {
    params.set("ZoneId", zoneId.toString());
  }

  const response = await apiClient.get<WardListResponse>(`/Ward?${params.toString()}`);
  
  if (!response.success || !response.data) {
    return { items: [], totalCount: 0, pageNumber, pageSize, totalPages: 0, hasPrevious: false, hasNext: false };
  }
  
  return response.data;
}

/**
 * Fetches a single ward by its ID.
 * @param id - The numeric ward ID
 */
export async function getWardById(id: number | string): Promise<WardItem | null> {
  const response = await apiClient.get<WardItem>(`/Ward/${id}`);
  
  if (!response.success || !response.data) return null;
  
  return response.data;
}

/**
 * Creates a new ward.
 */
export async function createWard(data: CreateWardPayload): Promise<WardMutationResponse<WardItem>> {
  const response = await apiClient.post<WardMutationResponse<WardItem>>(`/Ward`, data);
  
  if (!response.success || !response.data) {
    return { success: false, message: response.error || "Failed to create ward", items: null, errors: null };
  }
  
  return response.data;
}

/**
 * Updates an existing ward.
 * @param id - The numeric ward ID
 * @param data - The update payload
 */
export async function updateWard(id: number | string, data: UpdateWardPayload): Promise<WardMutationResponse<WardItem>> {
  const response = await apiClient.put<WardMutationResponse<WardItem>>(`/Ward/${id}`, data);
  
  if (!response.success || !response.data) {
    return { success: false, message: response.error || "Failed to update ward", items: null, errors: null };
  }
  
  return response.data;
}

/**
 * Deletes a ward by its ID.
 * @param id - The numeric ward ID
 */
export async function deleteWard(id: number | string): Promise<WardMutationResponse<null>> {
  const response = await apiClient.delete<WardMutationResponse<null>>(`/Ward/${id}`);
  
  // DELETE can return 204 No Content with empty body - only check success flag
  if (!response.success) {
    return { success: false, message: response.error || "Failed to delete ward", items: null, errors: null };
  }
  
  // Return response data if present, otherwise return success with null items (for 204 responses)
  return response.data ?? { success: true, message: "Ward deleted successfully", items: null, errors: null };
}

/**
 * Creates multiple wards in batch using a range (e.g., DI15 to DI24).
 * The API generates wards by incrementing the numeric part of the prefix.
 * @param payload - The batch creation payload with fromValue, toValue, and template
 */
export async function createWardBatch(payload: BatchWardCreatePayload): Promise<BatchWardCreateResponse> {
  const response = await apiClient.post<BatchWardCreateResponse>(`/Ward/batch/range`, payload);
  
  if (!response.success || !response.data) {
    return { success: false, message: response.error || "Failed to create wards in batch", items: null, errors: null };
  }
  
  return response.data;
}

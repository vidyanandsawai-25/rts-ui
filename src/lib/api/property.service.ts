'use server';

import { apiClient } from '@/services/api.service';
import { ApiResponse } from '@/types/common.types';

export interface DeletePropertyResponse {
  message?: string;
}

/**
 * Delete a single property by ID.
 * API: DELETE /api/Property/{PropertyId}
 */
export async function deleteProperty(propertyId: string): Promise<ApiResponse<DeletePropertyResponse>> {
  return apiClient.delete<DeletePropertyResponse>(`/Property/${encodeURIComponent(propertyId)}`);
}

/**
 * Delete a single property or amenity by numeric ID.
 * API: DELETE /api/Property/{PropertyId}
 */
export async function deletePropertyAmenity(propertyId: number): Promise<ApiResponse<DeletePropertyResponse>> {
  return apiClient.delete<DeletePropertyResponse>(`/Property/${propertyId}`);
}

/**
 * Bulk delete multiple property or amenity records by numeric IDs.
 * Calls each individually since the amenity bulk endpoint is per-item.
 * API: DELETE /api/Property/{id} (for each)
 */
export async function deleteMultiplePropertiesAmenities(
  propertyIds: number[]
): Promise<ApiResponse<DeletePropertyResponse>> {
  try {
    const results = await Promise.all(
      propertyIds.map((id) => apiClient.delete<DeletePropertyResponse>(`/Property/${id}`))
    );

    const allSuccessful = results.every((r) => r.success);

    if (allSuccessful) {
      return {
        success: true,
        statusCode: 200,
        data: { message: `Successfully deleted ${propertyIds.length} items` },
      };
    }

    // Collect all error messages from failed deletions
    const failedResults = results.filter((r) => !r.success);
    const failedCount = failedResults.length;
    
    // Extract detailed error messages from each failed deletion
    const errorMessages = failedResults
      .map((r) => r.error)
      .filter((msg): msg is string => !!msg && msg.trim().length > 0);

    // Return detailed error messages if available, otherwise generic count message
    const detailedError = errorMessages.length > 0
      ? errorMessages.join('\n\n')
      : `Failed to delete ${failedCount} out of ${propertyIds.length} items`;

    return {
      success: false,
      statusCode: 207,
      error: detailedError,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete items',
    };
  }
}

/**
 * Bulk delete multiple main properties in a single API call.
 * API: DELETE /api/Property/Bulk  (body: array of property ID strings)
 */
export async function deleteBulkProperties(
  propertyIds: string[]
): Promise<ApiResponse<DeletePropertyResponse>> {
  return apiClient.delete<DeletePropertyResponse>('/Property/Bulk', {
    body: JSON.stringify(propertyIds),
  });
}

'use server';

import { apiClient } from '@/services/api.service';
import { ApiResponse } from '@/types/common.types';

export interface DeletePropertyResponse {
  message?: string;
}

/**
 * Delete a single property
 * @param propertyId - ID of the property to delete
 * @returns ApiResponse with deletion result
 */
export async function deleteProperty(propertyId: string): Promise<ApiResponse<DeletePropertyResponse>> {
  return apiClient.delete<DeletePropertyResponse>(`/api/Property/${propertyId}`);
}

/**
 * Delete a single property or amenity by numeric ID
 */
export async function deletePropertyAmenity(propertyId: number): Promise<ApiResponse<DeletePropertyResponse>> {
  return apiClient.delete<DeletePropertyResponse>(`/Property/${propertyId}`);
}

/**
 * Bulk delete properties or amenities by numeric IDs
 */
export async function deleteMultiplePropertiesAmenities(
  propertyIds: number[]
): Promise<ApiResponse<DeletePropertyResponse>> {
  try {
    const results = await Promise.all(
      propertyIds.map((id) => apiClient.delete<DeletePropertyResponse>(`/Property/Bulk/${id}`))
    );

    const allSuccessful = results.every((r) => r.success);

    if (allSuccessful) {
      return {
        success: true,
        statusCode: 200,
        data: { message: `Successfully deleted ${propertyIds.length} items` },
      };
    }

    const failedCount = results.filter((r) => !r.success).length;
    return {
      success: false,
      statusCode: 207,
      error: `Failed to delete ${failedCount} out of ${propertyIds.length} items`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete items",
    };
  }
}

/**
 * Delete multiple properties in bulk
 * @param propertyIds - Array of property IDs to delete
 * @returns ApiResponse with deletion result
 */
export async function deleteBulkProperties(propertyIds: string[]): Promise<ApiResponse<DeletePropertyResponse>> {
  // According to user specification, bulk delete uses: /api/Property/Bulk/{id}
  // However, for multiple IDs, we need to call the endpoint for each ID
  // Or if there's a single bulk endpoint that accepts an array, we'd use that
  // Based on the URL pattern provided, it seems we need to call for each ID individually
  
  try {
    const results = await Promise.all(
      propertyIds.map(id => apiClient.delete<DeletePropertyResponse>(`/api/Property/Bulk/${id}`))
    );
    
    // Check if all deletions were successful
    const allSuccessful = results.every(r => r.success);
    
    if (allSuccessful) {
      return {
        success: true,
        statusCode: 200,
        data: { message: `Successfully deleted ${propertyIds.length} properties` }
      };
    }
    
    // If some failed, return error with details
    const failedCount = results.filter(r => !r.success).length;
    return {
      success: false,
      statusCode: 207, // Multi-status
      error: `Failed to delete ${failedCount} out of ${propertyIds.length} properties`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete properties'
    };
  }
}

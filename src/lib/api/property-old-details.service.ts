/* ---------------- PROPERTY OLD DETAILS ---------------- */

import { apiClient } from "@/services/api.service";
import { 
  OldTaxesDetailsResponse, 
  PropertyOldDetailsApiItem,
   PropertyOldDetailsResponse,
    OldTaxesDetails
   } from "@/types/property-old-details.types";
   
import { ApiError } from "@/lib/utils/api";

/**
 * Fetches property old details from the API.
 * 
 * @param propertyId The ID of the property to fetch details for.
 * @returns A promise resolving to the property old details or null if not found.
 * @throws {ApiError} if the API request fails.
 */
export async function getPropertyOldDetails(propertyId: number): Promise<PropertyOldDetailsApiItem | null> {
  const response = await apiClient.get<PropertyOldDetailsResponse>(`/Property/${propertyId}/old-details`);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch property old details",
      `Fetch property old details ${propertyId} failed`
    );
  }

  // Check if response data exists and if the internal API success flag is true
  if (response.data && response.data.success) {
    return response.data.items;
  }

  // Handle case where API might return 200 but success: false in body
  if (response.data && !response.data.success) {
    throw new ApiError(
      response.statusCode ?? 400,
      response.data.message || "Failed to fetch property old details",
      `API Error: ${response.data.message || 'Unknown error'}`
    );
  }

  return null;
}

/**
 * Updates property old details.
 * 
 * @param propertyId The ID of the property to update.
 * @param data The payload containing old details to update.
 * @returns A promise resolving to the update result.
 */
export async function updatePropertyOldDetails(propertyId: number, data: Partial<PropertyOldDetailsApiItem>): Promise<PropertyOldDetailsResponse> {
  const response = await apiClient.put<PropertyOldDetailsResponse>(`/Property/${propertyId}/old-details`, data);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to update property old details",
      `Update property old details ${propertyId} failed`
    );
  }

  if (!response.data) {
    throw new ApiError(500, "Response data is missing", "Update property old details failed: No data returned");
  }

  return response.data;
}

/**
 * Fetches property old taxes details from the API.
 * 
 * @param propertyId The ID of the property to fetch taxes for.
 */
export async function getOldTaxesDetails(propertyId: number): Promise<OldTaxesDetailsResponse> {
  const response = await apiClient.get<OldTaxesDetailsResponse>(`/Property/${propertyId}/old-taxes-details`);
  
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to fetch old taxes details",
      `Fetch old taxes details ${propertyId} failed`
    );
  }

  if (!response.data) {
    throw new ApiError(500, "Response data is missing", "Fetch old taxes details failed: No data returned");
  }

  return response.data;
}

/**
 * Saves property old taxes details.
 * 
 * @param propertyId The ID of the property to save taxes for.
 * @param data The payload containing taxes details.
 */
export async function saveOldTaxesDetails(propertyId: number, data: OldTaxesDetails): Promise<OldTaxesDetailsResponse> {
  const response = await apiClient.post<OldTaxesDetailsResponse>(`/Property/${propertyId}/old-taxes-details`, data);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to save old taxes details",
      `Save old taxes details ${propertyId} failed`
    );
  }

  if (!response.data) {
    throw new ApiError(500, "Response data is missing", "Save old taxes details failed: No data returned");
  }

  return response.data;
}
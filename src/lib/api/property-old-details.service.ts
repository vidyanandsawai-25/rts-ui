import { apiClient } from "@/services/api.service";
import { 
  OldTaxesDetailsResponse, 
  PropertyOldDetailsApiItem,
  PropertyOldDetailsResponse,
  OldTaxesDetails
} from "@/types/property-old-details.types";
   
import { handleApiResponse } from "@/lib/utils/api";

/**
 * Fetches property old details from the API.
 * 
 * @param propertyId The ID of the property to fetch details for.
 * @returns A promise resolving to the property old details or null if not found.
 * @throws {ApiError} if the API request fails.
 */
export async function getPropertyOldDetails(propertyId: number): Promise<PropertyOldDetailsApiItem | null> {
  const response = await apiClient.get<PropertyOldDetailsResponse>(`/Property/${propertyId}/old-details`);
  const data = handleApiResponse(response, `Fetch property old details ${propertyId} failed`);
  
  // Return the items object directly (it's a single object, not an array)
  return data.items ?? null;
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
  return handleApiResponse(response, `Update property old details ${propertyId} failed`);
}

/**
 * Fetches property old taxes details from the API.
 * 
 * @param propertyId The ID of the property to fetch taxes for.
 */
export async function getOldTaxesDetails(propertyId: number): Promise<OldTaxesDetailsResponse> {
  const response = await apiClient.get<OldTaxesDetailsResponse>(`/Property/${propertyId}/old-taxes-details`);
  return handleApiResponse(response, `Fetch old taxes details ${propertyId} failed`);
}

/**
 * Saves property old taxes details.
 * 
 * @param propertyId The ID of the property to save taxes for.
 * @param data The payload containing taxes details.
 */
export async function saveOldTaxesDetails(propertyId: number, data: OldTaxesDetails): Promise<OldTaxesDetailsResponse> {
  const response = await apiClient.put<OldTaxesDetailsResponse>(`/Property/${propertyId}/old-taxes-details`, data);
  return handleApiResponse(response, `Save old taxes details ${propertyId} failed`);
}
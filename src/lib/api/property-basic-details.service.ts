import { apiClient } from "@/services/api.service";

import {
  ActionResult,
  PropertyBasicDetailsApiItem,
  PropertyBasicDetailsResponse,
  PropertyCategoryApiItem,
  PropertyCategoryApiResponse,
  PropertyTypeApiItem,
  PropertyTypeApiResponse,
  TaxDetailsApiResponse,
  UpdatePropertyBasicDetailsDto,
  WingItem,
  WingResponse
} from "@/types/property-basic-details.types";

/* ---------------- PROPERTY TYPE ---------------- */
export async function getPropertyTypes(pageSize: number = 200, searchTerm?: string): Promise<PropertyTypeApiItem[]> {
  const params = new URLSearchParams();
  params.append("PageSize", pageSize.toString());
  if (searchTerm?.trim()) {
    params.append("SearchTerm", searchTerm.trim());
  }

  const response = await apiClient.get<PropertyTypeApiResponse>(`/PropertyType?${params.toString()}`);
  if (!response.success || !response.data) return [];
  return response.data.items ?? [];
}

/* ---------------- PROPERTY CATEGORY ---------------- */
export async function getPropertyCategories(pageSize: number = 50): Promise<PropertyCategoryApiItem[]> {
  const params = new URLSearchParams();
  params.append("PageSize", pageSize.toString());

  const response = await apiClient.get<PropertyCategoryApiResponse>(`/PropertyCategory?${params.toString()}`);
  if (!response.success || !response.data) return [];
  return response.data.items ?? [];
}

/* ---------------- PROPERTY BASIC DETAILS ---------------- */
export async function getPropertyBasicDetails(propertyId: number): Promise<PropertyBasicDetailsApiItem | null> {
  const response = await apiClient.get<PropertyBasicDetailsResponse>(`/Property/${propertyId}/basic-details`);

  if (!response.success || !response.data) return null;

  return response.data.items;
}

/* ---------------- UPDATE PROPERTY BASIC DETAILS ---------------- */
export async function updatePropertyBasicDetails(propertyId: number, payload: UpdatePropertyBasicDetailsDto): Promise<ActionResult> {
  const response = await apiClient.put<ActionResult>(`/Property/${propertyId}/basic-details`, payload);

  if (!response.success || !response.data) {
    throw new Error(String(response.error || "Failed to update property basic details"));
  }

  return response.data;
}

// Get Wing Master 
export async function getWingMaster(): Promise<WingItem[]> {
  const response = await apiClient.get<WingResponse>(`/Wing`);

  if (!response.success || !response.data) return [];

  return response.data.items
}

/** Fetches CV tax details for a property. */
export async function getTaxDetailsCvByPropertyId(propertyId: number): Promise<ActionResult<TaxDetailsApiResponse>> {
  if (!propertyId) {
    return { success: false, error: "Property ID is required" };
  }
  const response = await apiClient.get<TaxDetailsApiResponse>(`/Property/${propertyId}/tax-details-cv`);

  if (!response.success || !response.data) {
    return { success: false, error: response.error || "Failed to fetch CV tax details" };
  }

  return { success: true, data: response.data };
}
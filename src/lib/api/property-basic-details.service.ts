import { apiClient } from "@/services/api.service";

import {
  ActionResult,
  CategoryApiItem,
  PropertyApiItem,
  PropertyApiPaginatedResponse,
  PropertyAssessmentApiItem,
  PropertyAssessmentApiResponse,
  PropertyBasicDetailsApiItem,
  PropertyBasicDetailsResponse,
  PropertyCategoryApiItem,
  PropertyCategoryApiResponse,
  PropertyDescriptionApiItem,
  PropertyDetailsApiItem,
  PropertyDetailsApiResponse,
  PropertyTypeApiItem,
  PropertyTypeApiResponse,
  SubCategoryApiItem,
  TaxDetailsApiResponse,
  TypeOfUseApiItem,
  UpdatePropertyBasicDetailsDto,
  WingItem,
  WingResponse
} from "@/types/property-basic-details.types";

/* ---------------- PROPERTY DESCRIPTION ---------------- */

export async function getPropertyDescriptions(searchTerm?: string): Promise<PropertyDescriptionApiItem[]> {
  const params = new URLSearchParams();
  if (searchTerm?.trim()) {
    params.append("SearchTerm", searchTerm.trim());
  }

  const response = await apiClient.get<{ items: PropertyDescriptionApiItem[] }>(`/PropertyDescription?${params.toString()}`);
  return response.success && response.data ? response.data.items : [];
}

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

/* ---------------- CATEGORY ---------------- */

export async function getCategories(searchTerm?: string): Promise<CategoryApiItem[]> {
  const params = new URLSearchParams();
  if (searchTerm?.trim()) {
    params.append("SearchTerm", searchTerm.trim());
  }

  const response = await apiClient.get<{ items: CategoryApiItem[] }>(`/Category?${params.toString()}`);
  return response.success && response.data ? response.data.items : [];
}

/* ---------------- SUB CATEGORY ---------------- */

export async function getSubCategories(categoryId?: string): Promise<SubCategoryApiItem[]> {
  const params = new URLSearchParams();
  if (categoryId) {
    params.append("CategoryId", categoryId);
  }

  const response = await apiClient.get<{ items: SubCategoryApiItem[] }>(`/SubCategory?${params.toString()}`);
  return response.success && response.data ? response.data.items : [];
}

/* ---------------- PROPERTY BY ID ---------------- */

export async function getPropertyById(propertyId: number): Promise<PropertyApiItem | null> {
  const response = await apiClient.get<PropertyApiPaginatedResponse>(`/Property?PropertyId=${propertyId}`);
  if (!response.success || !response.data) return null;
  return response.data.items?.[0] ?? null;
}

/* ---------------- PROPERTY DETAILS (FLOORS) ---------------- */

export async function getPropertyDetails(propertyId: number): Promise<PropertyDetailsApiItem[]> {
  const response = await apiClient.get<PropertyDetailsApiResponse>(`/PropertyDetails?PropertyId=${propertyId}`);
  if (!response.success || !response.data) return [];
  return response.data.items ?? [];
}

/* ---------------- PROPERTY ASSESSMENT ---------------- */

export async function getPropertyAssessment(propertyId: number): Promise<PropertyAssessmentApiItem | null> {
  const response = await apiClient.get<PropertyAssessmentApiResponse>(`/PropertyAssessment?PropertyId=${propertyId}`);
  if (!response.success || !response.data) return null;
  return response.data.items?.[0] ?? null;
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

// get Property TypeOfUse Data
export async function getPropertyTypeOfUseData(): Promise<TypeOfUseApiItem[]> {
  const response = await apiClient.get<{ items: TypeOfUseApiItem[] }>(`/TypeOfUse?pageNumber=1&pageSize=1000`);

  if (!response.success || !response.data) return [];

  return response.data.items ?? [];
}

// Get Wing Master 
export async function getWingMaster(): Promise<WingItem[]> {
  const response = await apiClient.get<WingResponse>(`/Wing`);

  if (!response.success || !response.data) return [];

  return response.data.items
}

export async function getTaxDetailsByPropertyId(propertyId: number): Promise<ActionResult<TaxDetailsApiResponse>> {
  if (!propertyId) {
    return { success: false, error: "Property ID is required" };
  }
  const response = await apiClient.get<TaxDetailsApiResponse>(`Property/${propertyId}/tax-details`);

  if (!response.success || !response.data) {
    return { success: false, error: response.error || "Failed to fetch tax details" };
  }

  return { success: true, data: response.data };
}

/**
 * Fetches stored capital-based tax details (CV) for a specific property.
 * Endpoint: GET /api/Property/{propertyId}/tax-details-cv
 */
export async function getTaxDetailsCvByPropertyId(propertyId: number): Promise<ActionResult<TaxDetailsApiResponse>> {
  if (!propertyId) {
    return { success: false, error: "Property ID is required" };
  }
  const response = await apiClient.get<TaxDetailsApiResponse>(`Property/${propertyId}/tax-details-cv`);

  if (!response.success || !response.data) {
    return { success: false, error: response.error || "Failed to fetch CV tax details" };
  }

  return { success: true, data: response.data };
}
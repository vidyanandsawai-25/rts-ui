import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";

import {
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
import { ActionResult } from "@/types/common.types";

/* ---------------- PROPERTY TYPE ---------------- */
export async function getPropertyTypes(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PropertyTypeApiItem[]> {

  const params = new URLSearchParams();
  params.append("PageSize", pageSize.toString());
  if (searchTerm?.trim()) {
    params.append("SearchTerm", searchTerm.trim());
  }
  params.append("PageNo", pageNumber.toString());

  const response = await apiClient.get<PropertyTypeApiResponse>(`/PropertyTypeMaster?${params.toString()}`);
  return handleApiResponse(response, "Failed to fetch property types").items ?? [];
}

/* ---------------- PROPERTY CATEGORY ---------------- */
export async function getPropertyCategories(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PropertyCategoryApiItem[]> {

  const params = new URLSearchParams();
  params.append("PageSize", pageSize.toString());
  if (searchTerm?.trim()) {
    params.append("SearchTerm", searchTerm.trim());
  }
  params.append("PageNo", pageNumber.toString());;

  const response = await apiClient.get<PropertyCategoryApiResponse>(`/PropertyCategory?${params.toString()}`);
  return handleApiResponse(response, "Failed to fetch property categories").items ?? [];
}

/* ---------------- PROPERTY BASIC DETAILS ---------------- */
export async function getPropertyBasicDetails(propertyId: number): Promise<PropertyBasicDetailsApiItem | null> {
  const response = await apiClient.get<PropertyBasicDetailsResponse>(`/Property/${propertyId}/basic-details`);
  return handleApiResponse(response, "Failed to fetch property basic details").items;
}

/* ---------------- UPDATE PROPERTY BASIC DETAILS ---------------- */
export async function updatePropertyBasicDetails(propertyId: number, payload: UpdatePropertyBasicDetailsDto): Promise<ActionResult> {
  const response = await apiClient.put<ActionResult>(`/Property/${propertyId}/basic-details`, payload);
  return handleApiResponse(response, "Failed to update property basic details");
}

export async function getWingMaster(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<WingItem[]> {
  const params = new URLSearchParams();
  params.append("PageSize", pageSize.toString());
  if (searchTerm?.trim()) {
    params.append("SearchTerm", searchTerm.trim());
  }
  params.append("PageNo", pageNumber.toString());
  const response = await apiClient.get<WingResponse>(`/Wing?${params.toString()}`);
  return handleApiResponse(response, "Failed to fetch wing master").items ?? [];
}

/** Fetches CV tax details for a property. */
export async function getTaxDetailsCvByPropertyId(propertyId: number): Promise<{ propertyId: number; taxAmounts: Record<string, number | undefined> }> {
  const response = await apiClient.get<TaxDetailsApiResponse>(`/Property/${propertyId}/tax-details-cv`);
  return handleApiResponse(response, "Failed to fetch CV tax details").items;
}

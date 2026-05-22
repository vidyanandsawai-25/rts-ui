//ntis-ui\src\lib\api\property-basic-details.service.ts
import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";

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
  WingResponse,
  MoujaItem,
  MoujaResponse,
  TaxZoneItem,
  TaxZoneResponse
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
  const t = await getTranslations("quickDataEntry");
  return handleApiResponse(response, t("property.errors.fetchPropertyTypes")).items ?? [];
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
  params.append("PageNo", pageNumber.toString());

  const response = await apiClient.get<PropertyCategoryApiResponse>(`/PropertyCategory?${params.toString()}`);  

  const t = await getTranslations("quickDataEntry");
  return handleApiResponse(response, t("property.errors.fetchPropertyCategories")).items ?? [];
}

/* ---------------- PROPERTY BASIC DETAILS ---------------- */
export async function getPropertyBasicDetails(propertyId: number): Promise<PropertyBasicDetailsApiItem | null> {
  const response = await apiClient.get<PropertyBasicDetailsResponse>(`/Property/${propertyId}/basic-details`);  

  const t = await getTranslations("quickDataEntry");
  return handleApiResponse(response, t("property.errors.fetchPropertyBasicDetails")).items;
}

/* ---------------- UPDATE PROPERTY BASIC DETAILS ---------------- */
export async function updatePropertyBasicDetails(propertyId: number, payload: UpdatePropertyBasicDetailsDto): Promise<ActionResult<null>> {
  const response = await apiClient.put<ActionResult<null>>(`/Property/${propertyId}/basic-details`, payload);
  const t = await getTranslations("quickDataEntry");
  return handleApiResponse(response, t("property.errors.updatePropertyBasicDetails"));
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
  const t = await getTranslations("quickDataEntry");

  return handleApiResponse(response, t("property.errors.fetchWingMaster")).items ?? [];
}

export async function getMoujaMaster(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<MoujaItem[]> {
  const params = new URLSearchParams();
  params.append("PageSize", pageSize.toString());
  if (searchTerm?.trim()) {
    params.append("SearchTerm", searchTerm.trim());
  }
  params.append("PageNo", pageNumber.toString());
  const response = await apiClient.get<MoujaResponse>(`/Mouja?${params.toString()}`);
  const t = await getTranslations("quickDataEntry");

  return handleApiResponse(response, t("property.errors.fetchMoujaMaster")).items ?? [];
}

/** Fetches CV tax details for a property. */
export async function getTaxDetailsCvByPropertyId(propertyId: number): Promise<{ propertyId: number; taxAmounts: Record<string, number | undefined> }> {
  const response = await apiClient.get<TaxDetailsApiResponse>(`/Property/${propertyId}/tax-details-cv`);
  const t = await getTranslations("quickDataEntry");
  return handleApiResponse(response, t("property.errors.fetchCvTaxDetails")).items;
}

export async function getTaxZones(
  pageNumber: number = 1,
  pageSize: number = 100,
  searchTerm?: string
): Promise<TaxZoneItem[]> {
  const params = new URLSearchParams();
  params.append("PageSize", pageSize.toString());
  if (searchTerm?.trim()) {
    params.append("SearchTerm", searchTerm.trim());
  }
  params.append("PageNo", pageNumber.toString());
  const response = await apiClient.get<TaxZoneResponse>(`/TaxZone?${params.toString()}`);
  const t = await getTranslations("quickDataEntry");

  return handleApiResponse(response, t("property.errors.fetchTaxZones")).items ?? [];
}

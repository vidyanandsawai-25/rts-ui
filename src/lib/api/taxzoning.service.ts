import { PagedResponse } from "@/types/common.types";
import { TaxZone, TaxZoningFormModel, TaxZoning, TaxZoningPropertyNo, Ward } from "@/types/taxzoning.types";
import { apiClient } from "@/services/api.service";

export async function getTaxZonePagedServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<TaxZone>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZone>>(
    `/TaxZone?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchTaxZonesFailed");
  }

  return response.data;
}

export async function getWardPagedServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<Ward>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<Ward>>(
    `/Ward?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchWardsFailed");
  }

  return response.data;
}

export async function getTaxZoningPagedServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<TaxZoning>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZoning>>(
    `/TaxZonning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchZoningDataFailed");
  }

  return response.data;
}

export async function getTaxZoningByWardServer(
  wardNo: string,
  pageSize = 100,
  pageNumber = 1
): Promise<PagedResponse<TaxZoning>> {
  const params = new URLSearchParams({
    WardNo: wardNo,
    PageSize: pageSize.toString(),
    PageNumber: pageNumber.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZoning>>(
    `/TaxZonning/GetAll?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchByWardFailed");
  }

  return response.data;
}

export async function getAllTaxZoningServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<TaxZoning>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZoning>>(
    `/TaxZonning/GetAll?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchAllFailed");
  }

  return response.data;
}

export async function getTaxZoningPropertyNoServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<TaxZoningPropertyNo>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZoningPropertyNo>>(
    `/TaxZonning/GetPropertyNo?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchPropertyNoFailed");
  }

  return response.data;
}

export async function createTaxZoning(
  data: TaxZoningFormModel
): Promise<void> {
  if (!data.taxZoneId) {
    throw new Error("messages.taxZoneRequired");
  }

  if (!data.wardId) {
    throw new Error("messages.wardRequired");
  }

  const payload = {
    taxZoneId: data.taxZoneId,
    wardId: data.wardId,
    propertyNo: data.propertyNo?.trim() || "",
    fromProperty: data.fromProperty?.trim() || "",
    toProperty: data.toProperty?.trim() || "",
    propertyId: data.propertyId ?? 0,
    isActive: data.isActive ?? true,
    ownerID: data.ownerID ?? 0,
    updatedBy: data.updatedBy ?? 1,
  };

  const response = await apiClient.post<void>(`/TaxZonning`, payload);

  if (!response.success) {
    throw new Error(response.error || "messages.createFailed");
  }
}

export async function updateTaxZoning(
  data: TaxZoningFormModel
): Promise<void> {
  if (!data.taxZoneId) {
    throw new Error("messages.taxZoneRequired");
  }

  if (!data.wardId) {
    throw new Error("messages.wardRequired");
  }

  const payload = {
    taxZoneId: data.taxZoneId,
    wardId: data.wardId,
    propertyNo: data.propertyNo?.trim() || "",
    fromProperty: data.fromProperty?.trim() || "",
    toProperty: data.toProperty?.trim() || "",
    propertyId: data.propertyId ?? 0,
    isActive: data.isActive ?? true,
    ownerID: data.ownerID ?? 0,
    updatedBy: data.updatedBy ?? 1,
  };

  const response = await apiClient.put<void>(`/TaxZonning`, payload);

  if (!response.success) {
    throw new Error(response.error || "messages.updateFailed");
  }
}

import { PagedResponse } from "@/types/common.types";
import { TaxZone, TaxZoningFormModel, TaxZonning, TaxZonningPropertyNo, Ward } from "@/types/taxzoning.types";
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
    throw new Error(response.error || "Failed to fetch Tax Zone data");
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
    throw new Error(response.error || "Failed to fetch Ward data");
  }

  return response.data;
}

export async function getTaxZonningPagedServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<TaxZonning>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZonning>>(
    `/TaxZonning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch Tax Zonning data");
  }

  return response.data;
}

export async function getTaxZonningByWardServer(
  wardNo: string,
  pageSize = 100,
  pageNumber = 1
): Promise<PagedResponse<TaxZonning>> {
  const params = new URLSearchParams({
    WardNo: wardNo,
    PageSize: pageSize.toString(),
    PageNumber: pageNumber.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZonning>>(
    `/TaxZonning/GetAll?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch Tax Zonning by Ward");
  }

  return response.data;
}

export async function getTaxZonningPropertyNoServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<TaxZonningPropertyNo>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZonningPropertyNo>>(
    `/TaxZonning/GetPropertyNo?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch Tax Zonning Property No data");
  }

  return response.data;
}

export async function createTaxZoning(
  data: TaxZoningFormModel
): Promise<void> {
  if (!data.taxZoneId) {
    throw new Error("Tax Zone is required");
  }

  if (!data.wardId) {
    throw new Error("Ward No is required");
  }

  const payload = {
    taxZoneId: data.taxZoneId,
    wardId: data.wardId,
    propertyNo: data.propertyNo?.trim() || "",
    fromProperty: data.fromProperty?.trim() || "",
    toProperty: data.toProperty?.trim() || "",
    isActive: data.isActive ?? true,
    ownerID: data.ownerID ?? 0,
    updatedBy: data.updatedBy ?? 1,
  };

  const response = await apiClient.post<void>(`/TaxZonning`, payload);

  if (!response.success) {
    throw new Error(response.error || "Failed to create Tax Zoning");
  }
}

export async function updateTaxZoning(
  data: TaxZoningFormModel
): Promise<void> {
  if (!data.taxZoneId) {
    throw new Error("Tax Zone is required");
  }

  if (!data.wardId) {
    throw new Error("Ward No is required");
  }

  const payload = {
    taxZoneId: data.taxZoneId,
    wardId: data.wardId,
    propertyNo: data.propertyNo?.trim() || "",
    fromProperty: data.fromProperty?.trim() || "",
    toProperty: data.toProperty?.trim() || "",
    isActive: data.isActive ?? true,
    ownerID: data.ownerID ?? 0,
    updatedBy: data.updatedBy ?? 1,
  };

  const response = await apiClient.put<void>(`/TaxZonning`, payload);

  if (!response.success) {
    throw new Error(response.error || "Failed to update Tax Zoning");
  }
}

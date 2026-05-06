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

  const response = await apiClient.get<any>(
    `/TaxZone?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchTaxZonesFailed");
  }

  const rootData = response.data;
  if (rootData.items && typeof rootData.items === 'object' && Array.isArray(rootData.items.items)) {
    return rootData.items;
  }

  if (Array.isArray(rootData.items)) {
    return rootData;
  }

  // Normalize array response to PagedResponse
  if (Array.isArray(rootData)) {
    return {
      items: rootData,
      totalCount: rootData.length,
      pageNumber: 1,
      pageSize: rootData.length,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    };
  }

  return rootData;
}

export async function getWardPagedServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<Ward>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<any>(
    `/Ward?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchWardsFailed");
  }

  const rootData = response.data;
  if (rootData.items && typeof rootData.items === 'object' && Array.isArray(rootData.items.items)) {
    return rootData.items;
  }

  if (Array.isArray(rootData.items)) {
    return rootData;
  }

  // Normalize array response to PagedResponse
  if (Array.isArray(rootData)) {
    return {
      items: rootData,
      totalCount: rootData.length,
      pageNumber: 1,
      pageSize: rootData.length,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    };
  }

  return rootData;
}

export async function getTaxZoningPagedServer(
  pageNumber: number,
  pageSize: number,
  taxZoneId?: number,
  wardId?: number,
  groupBy?: string
): Promise<PagedResponse<TaxZoning>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  if (taxZoneId) params.append("TaxZoneId", taxZoneId.toString());
  if (wardId) params.append("WardId", wardId.toString());
  if (groupBy) params.append("GroupBy", groupBy);

  const response = await apiClient.get<any>(
    `/TaxZoning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchZoningDataFailed");
  }

  // Handle double-nested items structure: { success, message, items: { items: [], ... } }
  const rootData = response.data;
  if (rootData.items && typeof rootData.items === 'object' && Array.isArray(rootData.items.items)) {
    return rootData.items;
  }

  // Handle single-nested items structure: { items: [], ... }
  if (Array.isArray(rootData.items)) {
    return rootData;
  }

  // Handle flat array response
  if (Array.isArray(rootData)) {
    return {
      items: rootData,
      totalCount: rootData.length,
      pageNumber: 1,
      pageSize: rootData.length,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    };
  }

  return rootData;
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

  const response = await apiClient.get<any>(
    `/TaxZoning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchByWardFailed");
  }

  const rootData = response.data;
  if (rootData.items && typeof rootData.items === 'object' && Array.isArray(rootData.items.items)) {
    return rootData.items;
  }

  if (Array.isArray(rootData.items)) {
    return rootData;
  }

  if (Array.isArray(rootData)) {
    return {
      items: rootData,
      totalCount: rootData.length,
      pageNumber: 1,
      pageSize: rootData.length,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    };
  }

  return rootData;
}

export async function getAllTaxZoningServer(
  pageNumber: number,
  pageSize: number,
  taxZoneId?: number,
  wardId?: number
): Promise<PagedResponse<TaxZoning>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  if (taxZoneId) params.append("TaxZoneId", taxZoneId.toString());
  if (wardId) params.append("WardId", wardId.toString());

  const response = await apiClient.get<any>(
    `/TaxZoning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchAllFailed");
  }

  const rootData = response.data;
  if (rootData.items && typeof rootData.items === 'object' && Array.isArray(rootData.items.items)) {
    return rootData.items;
  }

  if (Array.isArray(rootData.items)) {
    return rootData;
  }

  if (Array.isArray(rootData)) {
    return {
      items: rootData,
      totalCount: rootData.length,
      pageNumber: 1,
      pageSize: rootData.length,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    };
  }

  return rootData;
}

export async function getTaxZoningPropertyNoServer(
  pageNumber: number,
  pageSize: number,
  taxZoneId?: number,
  wardId?: number
): Promise<PagedResponse<TaxZoningPropertyNo>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  if (taxZoneId) params.append("TaxZoneId", taxZoneId.toString());
  if (wardId) params.append("WardId", wardId.toString());

  const response = await apiClient.get<any>(
    `/TaxZoning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchPropertyNoFailed");
  }

  const rootData = response.data;
  if (rootData.items && typeof rootData.items === 'object' && Array.isArray(rootData.items.items)) {
    return rootData.items;
  }

  if (Array.isArray(rootData.items)) {
    return rootData;
  }

  if (Array.isArray(rootData)) {
    return {
      items: rootData,
      totalCount: rootData.length,
      pageNumber: 1,
      pageSize: rootData.length,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false
    };
  }

  return rootData;
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

  const response = await apiClient.post<void>(`/TaxZoning`, payload);

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

  const response = await apiClient.put<void>(`/TaxZoning`, payload);

  if (!response.success) {
    throw new Error(response.error || "messages.updateFailed");
  }
}

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

  const response = await apiClient.get<PagedResponse<TaxZone> | { items: PagedResponse<TaxZone> }>(
    `/TaxZone?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchTaxZonesFailed");
  }

  const rootData = response.data;
  if ('items' in rootData && rootData.items && typeof rootData.items === 'object' && 'items' in rootData.items && Array.isArray(rootData.items.items)) {
    return rootData.items as PagedResponse<TaxZone>;
  }

  if ('items' in rootData && Array.isArray(rootData.items)) {
    return rootData as PagedResponse<TaxZone>;
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

  return rootData as PagedResponse<TaxZone>;
}

export async function getWardPagedServer(
  pageNumber: number,
  pageSize: number
): Promise<PagedResponse<Ward>> {
  const params = new URLSearchParams({
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<Ward> | { items: PagedResponse<Ward> }>(
    `/Ward?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchWardsFailed");
  }

  const rootData = response.data;
  if ('items' in rootData && rootData.items && typeof rootData.items === 'object' && 'items' in rootData.items && Array.isArray(rootData.items.items)) {
    return rootData.items as PagedResponse<Ward>;
  }

  if ('items' in rootData && Array.isArray(rootData.items)) {
    return rootData as PagedResponse<Ward>;
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

  return rootData as PagedResponse<Ward>;
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

  const response = await apiClient.get<PagedResponse<TaxZoning> | { items: PagedResponse<TaxZoning> }>(
    `/TaxZoning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchZoningDataFailed");
  }

  // Handle double-nested items structure: { success, message, items: { items: [], ... } }
  const rootData = response.data;
  if ('items' in rootData && rootData.items && typeof rootData.items === 'object' && 'items' in rootData.items && Array.isArray(rootData.items.items)) {
    return rootData.items as PagedResponse<TaxZoning>;
  }

  // Handle single-nested items structure: { items: [], ... }
  if ('items' in rootData && Array.isArray(rootData.items)) {
    return rootData as PagedResponse<TaxZoning>;
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

  return rootData as PagedResponse<TaxZoning>;
}

export async function getTaxZoningByWardServer(
  wardNo: string,
  pageSize:number,
  pageNumber:number
): Promise<PagedResponse<TaxZoning>> {
  const params = new URLSearchParams({
    WardNo: wardNo,
    PageSize: pageSize.toString(),
    PageNumber: pageNumber.toString(),
  });

  const response = await apiClient.get<PagedResponse<TaxZoning> | { items: PagedResponse<TaxZoning> }>(
    `/TaxZoning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchByWardFailed");
  }

  const rootData = response.data;
  if ('items' in rootData && rootData.items && typeof rootData.items === 'object' && 'items' in rootData.items && Array.isArray(rootData.items.items)) {
    return rootData.items as PagedResponse<TaxZoning>;
  }

  if ('items' in rootData && Array.isArray(rootData.items)) {
    return rootData as PagedResponse<TaxZoning>;
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

  return rootData as PagedResponse<TaxZoning>;
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

  const response = await apiClient.get<PagedResponse<TaxZoning> | { items: PagedResponse<TaxZoning> }>(
    `/TaxZoning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchAllFailed");
  }

  const rootData = response.data;
  if ('items' in rootData && rootData.items && typeof rootData.items === 'object' && 'items' in rootData.items && Array.isArray(rootData.items.items)) {
    return rootData.items as PagedResponse<TaxZoning>;
  }

  if ('items' in rootData && Array.isArray(rootData.items)) {
    return rootData as PagedResponse<TaxZoning>;
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

  return rootData as PagedResponse<TaxZoning>;
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

  const response = await apiClient.get<PagedResponse<TaxZoningPropertyNo> | { items: PagedResponse<TaxZoningPropertyNo> }>(
    `/TaxZoning?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "messages.fetchPropertyNoFailed");
  }

  const rootData = response.data;
  if ('items' in rootData && rootData.items && typeof rootData.items === 'object' && 'items' in rootData.items && Array.isArray(rootData.items.items)) {
    return rootData.items as PagedResponse<TaxZoningPropertyNo>;
  }

  if ('items' in rootData && Array.isArray(rootData.items)) {
    return rootData as PagedResponse<TaxZoningPropertyNo>;
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

  return rootData as PagedResponse<TaxZoningPropertyNo>;
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

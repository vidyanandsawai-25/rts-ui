"use server";

import type {
  WaterConnectionFormModel,
  WaterConnectionPageData,
  WaterConnectionTypeLookup,
  WaterConnectionSizeLookup,
  WaterConnectionStatusLookup,
  WaterRateMasterLookup,
  PropertyInfo,
} from "@/types/waterconnection.types";
import {
  getWaterConnectionsPaged,
  getWaterConnectionTypes,
  getWaterConnectionSizes,
  getWaterConnectionStatuses,
  getWaterRateMasters,
  createWaterConnection,
  updateWaterConnection,
  deleteWaterConnection,
  getPropertyInfoById,
  ApiError,
} from "@/lib/api/waterconnection.services";
import { getPropertyBasicDetails } from "@/lib/api/property-basic-details.service";
import { getPropertyKycById } from "@/lib/api/property-kyc.service";



export async function getWaterConnectionPageData(
  propertyId: number,
  pageNumber = 1,
  pageSize = 100
): Promise<WaterConnectionPageData> {
  const [connectionsResponse, typeOptions, sizeOptions, statusOptions, rateMastersFromApi, basicDetails, kycResponse] = await Promise.all([
    getWaterConnectionsPaged(propertyId, pageNumber, pageSize),
    getWaterConnectionTypes().catch((err) => {
      console.error('[waterconnection] getWaterConnectionTypes failed:', err);
      return [] as Awaited<ReturnType<typeof getWaterConnectionTypes>>;
    }),
    getWaterConnectionSizes().catch((err) => {
      console.error('[waterconnection] getWaterConnectionSizes failed:', err);
      return [] as Awaited<ReturnType<typeof getWaterConnectionSizes>>;
    }),
    getWaterConnectionStatuses().catch((err) => {
      console.error('[waterconnection] getWaterConnectionStatuses failed:', err);
      return [] as Awaited<ReturnType<typeof getWaterConnectionStatuses>>;
    }),
    getWaterRateMasters().catch((err) => {
      console.error('[waterconnection] getWaterRateMasters failed:', err);
      return [] as WaterRateMasterLookup[];
    }),
    getPropertyBasicDetails(propertyId).catch((err) => {
      console.error('[waterconnection] getPropertyBasicDetails failed:', err);
      return null;
    }),
    getPropertyKycById(propertyId).catch((err) => {
      console.error('[waterconnection] getPropertyKycById failed:', err);
      return null;
    }),
  ]);

  const kyc = kycResponse?.items ?? null;
  const property: PropertyInfo = {
    id: propertyId,
    propertyNo: basicDetails?.propertyNo ?? `PROP-${propertyId}`,
    ownerName: kyc?.ownerName ?? "—",
    customerId: `CID-${propertyId}`,
    customerType: "Individual",
    contact: kyc?.mobileNo ?? "—",
    email: kyc?.emailId ?? "—",
    address: kyc?.address ?? "—",
    zone: basicDetails?.taxZoneNo ?? "—",
    ward: basicDetails?.wardNo ?? "—",
    buildingType: basicDetails?.categoryName ?? "—",
  };

  const isDev = process.env.NODE_ENV !== "production";
  return {
    property,
    connections: connectionsResponse.items ?? connectionsResponse.data ?? [],
    totalCount: connectionsResponse.totalCount,
    totalPages: connectionsResponse.totalPages,
    pageNumber: connectionsResponse.pageNumber,
    pageSize: connectionsResponse.pageSize,
    typeOptions: typeOptions.length > 0 ? typeOptions : [],
    sizeOptions: sizeOptions.length > 0 ? sizeOptions : [],
    statusOptions: statusOptions.length > 0 ? statusOptions : [],
    rateMasters: rateMastersFromApi.length > 0 ? rateMastersFromApi : [],
  };
}

export async function getConnectionLookupsAction(): Promise<{
  typeOptions: WaterConnectionTypeLookup[];
  sizeOptions: WaterConnectionSizeLookup[];
  statusOptions: WaterConnectionStatusLookup[];
  rateMasters: WaterRateMasterLookup[];
}> {
  const [typeOptions, sizeOptions, statusOptions, rateMastersFromApi] = await Promise.all([
    getWaterConnectionTypes().catch((err) => {
      console.error('[waterconnection] getWaterConnectionTypes failed:', err);
      return [] as WaterConnectionTypeLookup[];
    }),
    getWaterConnectionSizes().catch((err) => {
      console.error('[waterconnection] getWaterConnectionSizes failed:', err);
      return [] as WaterConnectionSizeLookup[];
    }),
    getWaterConnectionStatuses().catch((err) => {
      console.error('[waterconnection] getWaterConnectionStatuses failed:', err);
      return [] as WaterConnectionStatusLookup[];
    }),
    getWaterRateMasters().catch((err) => {
      console.error('[waterconnection] getWaterRateMasters failed:', err);
      return [] as WaterRateMasterLookup[];
    }),
  ]);

  const isDev = process.env.NODE_ENV !== "production";
  return {
    typeOptions: typeOptions.length > 0 ? typeOptions : (isDev ? MOCK_TYPE_OPTIONS : []),
    sizeOptions: sizeOptions.length > 0 ? sizeOptions : (isDev ? MOCK_SIZE_OPTIONS : []),
    statusOptions: statusOptions.length > 0 ? statusOptions : (isDev ? MOCK_STATUS_OPTIONS : []),
    rateMasters: rateMastersFromApi.length > 0 ? rateMastersFromApi : (isDev ? MOCK_RATE_MASTERS : []),
  };
}

export async function getWaterRateMastersAction(): Promise<WaterRateMasterLookup[]> {
  return MOCK_RATE_MASTERS;
}

export async function saveWaterConnectionAction(
  data: WaterConnectionFormModel
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (data.id != null) {
      await updateWaterConnection(data.id, data);
    } else {
      await createWaterConnection(data);
    }
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof ApiError ? e.message : "Save failed",
    };
  }
}

export async function deleteWaterConnectionAction(
  id: number
): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteWaterConnection(id);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof ApiError ? e.message : "Delete failed",
    };
  }
}

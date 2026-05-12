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
  ApiError,
} from "@/lib/api/waterconnection.services";

const MOCK_TYPE_OPTIONS: WaterConnectionTypeLookup[] = [
  { id: 1, connectionTypeCode: "DOM", connectionTypeName: "Domestic" },
  { id: 2, connectionTypeCode: "COM", connectionTypeName: "Commercial" },
  { id: 3, connectionTypeCode: "IND", connectionTypeName: "Industrial" },
];

const MOCK_SIZE_OPTIONS: WaterConnectionSizeLookup[] = [
  { id: 1, connectionSize: 15, connectionSizeUnit: "mm", displayLabel: '15 mm (½")' },
  { id: 2, connectionSize: 20, connectionSizeUnit: "mm", displayLabel: '20 mm (¾")' },
  { id: 3, connectionSize: 25, connectionSizeUnit: "mm", displayLabel: '25 mm (1")' },
  { id: 4, connectionSize: 32, connectionSizeUnit: "mm", displayLabel: '32 mm (1¼")' },
];

const MOCK_STATUS_OPTIONS: WaterConnectionStatusLookup[] = [
  { id: 1, statusName: "Active" },
  { id: 2, statusName: "Stopped" },
  { id: 3, statusName: "Disconnected" },
];

const MOCK_RATE_MASTERS: WaterRateMasterLookup[] = [
  { id: 1,  waterConnectionTypeId: 1, connectionTypeName: "Domestic",   waterConnectionSizeId: 1, connectionSizeDisplay: "15 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 1200,  isActive: true },
  { id: 2,  waterConnectionTypeId: 1, connectionTypeName: "Domestic",   waterConnectionSizeId: 2, connectionSizeDisplay: "20 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 1800,  isActive: true },
  { id: 3,  waterConnectionTypeId: 1, connectionTypeName: "Domestic",   waterConnectionSizeId: 3, connectionSizeDisplay: "25 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 2400,  isActive: true },
  { id: 4,  waterConnectionTypeId: 1, connectionTypeName: "Domestic",   waterConnectionSizeId: 4, connectionSizeDisplay: "32 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 3600,  isActive: true },
  { id: 5,  waterConnectionTypeId: 2, connectionTypeName: "Commercial", waterConnectionSizeId: 1, connectionSizeDisplay: "15 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 2400,  isActive: true },
  { id: 6,  waterConnectionTypeId: 2, connectionTypeName: "Commercial", waterConnectionSizeId: 2, connectionSizeDisplay: "20 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 3600,  isActive: true },
  { id: 7,  waterConnectionTypeId: 2, connectionTypeName: "Commercial", waterConnectionSizeId: 3, connectionSizeDisplay: "25 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 4800,  isActive: true },
  { id: 8,  waterConnectionTypeId: 2, connectionTypeName: "Commercial", waterConnectionSizeId: 4, connectionSizeDisplay: "32 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 7200,  isActive: true },
  { id: 9,  waterConnectionTypeId: 3, connectionTypeName: "Industrial", waterConnectionSizeId: 1, connectionSizeDisplay: "15 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 3600,  isActive: true },
  { id: 10, waterConnectionTypeId: 3, connectionTypeName: "Industrial", waterConnectionSizeId: 2, connectionSizeDisplay: "20 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 5400,  isActive: true },
  { id: 11, waterConnectionTypeId: 3, connectionTypeName: "Industrial", waterConnectionSizeId: 3, connectionSizeDisplay: "25 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 7200,  isActive: true },
  { id: 12, waterConnectionTypeId: 3, connectionTypeName: "Industrial", waterConnectionSizeId: 4, connectionSizeDisplay: "32 mm", financeYearId: 1, yearCode: "2025-26", yearlyRate: 10800, isActive: true },
];

// Placeholder property — replace with real property API call when endpoint is available
function getMockProperty(propertyId: number): PropertyInfo {
  return {
    id: propertyId,
    propertyNo: "FR09-2024-001",
    ownerName: "Rajesh Kumar",
    customerId: `CID-${propertyId}`,
    customerType: "Individual",
    contact: "+91 90743 42210",
    email: "rajesh.kumar@email.com",
    address: "123 MG Road, Koramangala, Bangalore - 560034",
    zone: "Zone-3",
    ward: "Ward-21",
    buildingType: "Residential",
  };
}

export async function getWaterConnectionPageData(
  propertyId: number,
  pageNumber = 1,
  pageSize = 100
): Promise<WaterConnectionPageData> {
  const [connectionsResponse, typeOptions, sizeOptions, statusOptions, rateMastersFromApi] = await Promise.all([
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
  ]);

  return {
    property: getMockProperty(propertyId),
    connections: connectionsResponse.items ?? connectionsResponse.data ?? [],
    totalCount: connectionsResponse.totalCount,
    totalPages: connectionsResponse.totalPages,
    pageNumber: connectionsResponse.pageNumber,
    pageSize: connectionsResponse.pageSize,
    typeOptions: typeOptions.length > 0 ? typeOptions : MOCK_TYPE_OPTIONS,
    sizeOptions: sizeOptions.length > 0 ? sizeOptions : MOCK_SIZE_OPTIONS,
    statusOptions: statusOptions.length > 0 ? statusOptions : MOCK_STATUS_OPTIONS,
    rateMasters: rateMastersFromApi.length > 0 ? rateMastersFromApi : MOCK_RATE_MASTERS,
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

  return {
    typeOptions: typeOptions.length > 0 ? typeOptions : MOCK_TYPE_OPTIONS,
    sizeOptions: sizeOptions.length > 0 ? sizeOptions : MOCK_SIZE_OPTIONS,
    statusOptions: statusOptions.length > 0 ? statusOptions : MOCK_STATUS_OPTIONS,
    rateMasters: rateMastersFromApi.length > 0 ? rateMastersFromApi : MOCK_RATE_MASTERS,
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

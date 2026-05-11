"use server";

import type {
  WaterConnectionFormModel,
  WaterConnectionPageData,
  PropertyInfo,
} from "@/types/waterconnection.types";
import {
  getWaterConnectionsPaged,
  getWaterConnectionTypes,
  getWaterConnectionSizes,
  getWaterConnectionStatuses,
  createWaterConnection,
  updateWaterConnection,
  deleteWaterConnection,
  ApiError,
} from "@/lib/api/waterconnection.services";

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
  propertyId: number
): Promise<WaterConnectionPageData> {
  const [connectionsResponse, typeOptions, sizeOptions, statusOptions] = await Promise.all([
    getWaterConnectionsPaged(propertyId),
    getWaterConnectionTypes(),
    getWaterConnectionSizes(),
    getWaterConnectionStatuses(),
  ]);

  return {
    property: getMockProperty(propertyId),
    connections: connectionsResponse.data ?? [],
    typeOptions,
    sizeOptions,
    statusOptions,
  };
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

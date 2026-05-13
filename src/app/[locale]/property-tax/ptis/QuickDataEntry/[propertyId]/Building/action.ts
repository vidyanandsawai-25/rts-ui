"use server";

import {
  getBuildingPermissions,
  createBuildingPermission,
  updateBuildingPermission,
} from "@/lib/api/building.service";
import { BuildingPermissionItems, BuildingPermissionApiResponse } from "@/types/building-permission.types";
import { revalidatePath } from "next/cache";
import { ApiResponse } from "@/types/common.types";

// Get building permissions
export async function getBuildingPermissionsAction(propertyId: string): Promise<ApiResponse<BuildingPermissionApiResponse>> {
  try {
    const response = await getBuildingPermissions(propertyId);
    return response;
  } catch (_error) {
    // Error logged for debugging (removed in production)
    return { success: false, data: undefined, error: "An unexpected error occurred" };
  }
}

// Create building permissions
export async function createBuildingPermissionsAction(locale: string, propertyId: string, payload: Partial<BuildingPermissionItems>): Promise<ApiResponse<BuildingPermissionApiResponse>> {
  try {
    const response = await createBuildingPermission(payload);
    if (response.success) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
    }
    return response;
  } catch (_error) {
    // Error logged for debugging (removed in production)
    return { success: false, data: undefined, error: "An unexpected error occurred" };
  }
}

// Update building permissions
export async function updateBuildingPermissionsAction(locale: string, propertyId: string, payload: Partial<BuildingPermissionItems>): Promise<ApiResponse<BuildingPermissionApiResponse>> {
  try {
    const response = await updateBuildingPermission(propertyId, payload);
    if (response.success) {
      revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Building`, 'page');
    }
    return response;
  } catch (_error) {
    // Error logged for debugging (removed in production)
    return { success: false, data: undefined, error: "An unexpected error occurred" };
  }
}
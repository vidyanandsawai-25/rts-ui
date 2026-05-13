import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import { 
  BuildingPermissionApiResponse, 
  BuildingPermissionItems 
} from "@/types/building-permission.types";

/* ---------------- BUILDING PERMISSIONS ---------------- */

// Get building permissions for a given property/building
export async function getBuildingPermissions(propertyId: string): Promise<ApiResponse<BuildingPermissionApiResponse>> {
  const response = await apiClient.get<BuildingPermissionApiResponse>(`/Property/${propertyId}/buildingpermission-details`);
  return response;
}

// Create new building permissions
export async function createBuildingPermission(data: Partial<BuildingPermissionItems>): Promise<ApiResponse<BuildingPermissionApiResponse>> {
  const response = await apiClient.post<BuildingPermissionApiResponse>(`/BuildingPermission`, data);
  return response;
}

// Update existing building permissions
export async function updateBuildingPermission(propertyId: string, data: Partial<BuildingPermissionItems>): Promise<ApiResponse<BuildingPermissionApiResponse>> {
  const response = await apiClient.put<BuildingPermissionApiResponse>(`/Property/${propertyId}/buildingpermission-details`, data);
  return response;
}
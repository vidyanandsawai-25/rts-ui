import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import type {
  PagedResponse,
  WaterConnection,
  WaterConnectionFormModel,
  WaterConnectionTypeLookup,
  WaterConnectionSizeLookup,
} from "@/types/waterconnection.types";

export { ApiError };

/** GET all connections for a property (paged) */
export async function getWaterConnectionsPaged(
  propertyId: number,
  pageNumber = 1,
  pageSize = 100
): Promise<PagedResponse<WaterConnection>> {
  const params = new URLSearchParams({
    PropertyId: propertyId.toString(),
    PageNumber: pageNumber.toString(),
    PageSize: pageSize.toString(),
  });

  const response = await apiClient.get<PagedResponse<WaterConnection>>(
    `/WaterConnection?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode || 500,
      "",
      response.error || "Fetch water connections failed"
    );
  }

  return response.data;
}

/** GET by id */
export async function getWaterConnectionById(id: number): Promise<WaterConnection> {
  const response = await apiClient.get<WaterConnection>(`/WaterConnection/${id}`);

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode || 500,
      "",
      response.error || `Fetch water connection ${id} failed`
    );
  }

  return response.data;
}

/** CREATE */
export async function createWaterConnection(data: WaterConnectionFormModel): Promise<WaterConnection> {
  const payload = {
    propertyId: data.propertyId,
    waterConnectionTypeId: data.waterConnectionTypeId,
    waterConnectionSizeId: data.waterConnectionSizeId,
    waterConnectionStatusId: data.waterConnectionStatusId ?? null,
    connectionNo: data.connectionNo.trim(),
    meterNo: data.meterNo?.trim() || null,
    connectionStartDate: data.installDate,
    isActive: data.isActive,
  };

  const response = await apiClient.post<WaterConnection>("/WaterConnection", payload);

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode || 500,
      "",
      response.error || "Create water connection failed"
    );
  }

  return response.data;
}

/** UPDATE */
export async function updateWaterConnection(id: number, data: WaterConnectionFormModel): Promise<WaterConnection> {
  const payload = {
    id,
    propertyId: data.propertyId,
    waterConnectionTypeId: data.waterConnectionTypeId,
    waterConnectionSizeId: data.waterConnectionSizeId,
    waterConnectionStatusId: data.waterConnectionStatusId ?? null,
    connectionNo: data.connectionNo.trim(),
    meterNo: data.meterNo?.trim() || null,
    connectionStartDate: data.installDate,
    isActive: data.isActive,
    updatedBy: null,
  };

  const response = await apiClient.put<WaterConnection>(`/WaterConnection/${id}`, payload);

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode || 500,
      "",
      response.error || "Update water connection failed"
    );
  }

  return response.data;
}

/** DELETE */
export async function deleteWaterConnection(id: number): Promise<void> {
  const response = await apiClient.delete<void>(`/WaterConnection/${id}`);

  if (!response.success) {
    throw new ApiError(
      response.statusCode || 500,
      "",
      response.error || `Delete water connection ${id} failed`
    );
  }
}

/** GET connection types for dropdown */
export async function getWaterConnectionTypes(): Promise<WaterConnectionTypeLookup[]> {
  const params = new URLSearchParams({ PageSize: "200", IsActive: "true" });
  const response = await apiClient.get<PagedResponse<WaterConnectionTypeLookup>>(
    `/WaterConnectionType?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode || 500,
      "",
      response.error || "Fetch connection types failed"
    );
  }

  return response.data.data ?? [];
}

/** GET connection sizes for dropdown */
export async function getWaterConnectionSizes(): Promise<WaterConnectionSizeLookup[]> {
  const params = new URLSearchParams({ PageSize: "200", IsActive: "true" });
  const response = await apiClient.get<PagedResponse<WaterConnectionSizeLookup>>(
    `/WaterConnectionSize?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new ApiError(
      response.statusCode || 500,
      "",
      response.error || "Fetch connection sizes failed"
    );
  }

  return response.data.data ?? [];
}

import "server-only";
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import type {
  TapStatus,
  TapStatusFormModel,
  TapType,
  TapTypeFormModel,
  TapSize,
  TapSizeFormModel,
  PagedResponse,
} from "@/types/water-connection.types";

/* ============================================================
   TYPE GUARDS & NORMALIZERS
============================================================ */

function isTapStatusShape(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "waterConnectionStatusId" in value;
}

function normalizeTapStatus(data: Record<string, unknown>): TapStatus {
  const id = Number(data.waterConnectionStatusId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError(500, "Invalid data", `Invalid waterConnectionStatusId: ${data.waterConnectionStatusId}`);
  }
  return {
    waterConnectionStatusId: id,
    statusCode: String(data.statusCode ?? "").trim(),
    statusName: String(data.statusName ?? "").trim(),
    isActive: Boolean(data.isActive),
  };
}

function isTapTypeShape(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "waterConnectionTypeId" in value;
}

function normalizeTapType(data: Record<string, unknown>): TapType {
  const id = Number(data.waterConnectionTypeId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError(500, "Invalid data", `Invalid waterConnectionTypeId: ${data.waterConnectionTypeId}`);
  }
  return {
    waterConnectionTypeId: id,
    typeCode: String(data.typeCode ?? "").trim(),
    typeName: String(data.typeName ?? "").trim(),
    isActive: Boolean(data.isActive),
  };
}

function isTapSizeShape(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "waterConnectionSizeId" in value;
}

function normalizeTapSize(data: Record<string, unknown>): TapSize {
  const id = Number(data.waterConnectionSizeId);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError(500, "Invalid data", `Invalid waterConnectionSizeId: ${data.waterConnectionSizeId}`);
  }
  return {
    waterConnectionSizeId: id,
    sizeCode: String(data.sizeCode ?? "").trim(),
    sizeName: String(data.sizeName ?? "").trim(),
    isActive: Boolean(data.isActive),
  };
}

/* ============================================================
   TAP STATUS — CRUD
============================================================ */

export async function getTapStatusPaged(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<TapStatus>> {
  const params = new URLSearchParams({
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });
  if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());

  const response = await apiClient.get<PagedResponse<TapStatus>>(
    `/WaterConnectionStatus?${params.toString()}`
  );
  if (!response.success) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to fetch tap status", "getTapStatusPaged");
  }
  return {
    ...response.data!,
    items: response.data!.items.filter(isTapStatusShape).map(normalizeTapStatus),
  };
}

export async function getTapStatusById(id: number): Promise<TapStatus> {
  const response = await apiClient.get<TapStatus>(
    `/WaterConnectionStatus/${encodeURIComponent(String(id))}`
  );
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Not found", "getTapStatusById");
  }
  return normalizeTapStatus(response.data as unknown as Record<string, unknown>);
}

export async function createTapStatus(
  data: TapStatusFormModel,
  userId: number
): Promise<TapStatus> {
  const response = await apiClient.post<TapStatus>("/WaterConnectionStatus", {
    ...data,
    createdBy: userId,
  });
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to create", "createTapStatus");
  }
  return normalizeTapStatus(response.data as unknown as Record<string, unknown>);
}

export async function updateTapStatus(
  id: number,
  data: TapStatusFormModel,
  userId: number
): Promise<TapStatus> {
  const response = await apiClient.put<TapStatus>(
    `/WaterConnectionStatus/${encodeURIComponent(String(id))}`,
    { ...data, updatedBy: userId }
  );
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to update", "updateTapStatus");
  }
  return normalizeTapStatus(response.data as unknown as Record<string, unknown>);
}

export async function deleteTapStatus(id: number, _userId: number): Promise<void> {
  const response = await apiClient.delete(
    `/WaterConnectionStatus/${encodeURIComponent(String(id))}`
  );
  if (!response.success) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to delete", "deleteTapStatus");
  }
}

/* ============================================================
   TAP TYPE — CRUD
============================================================ */

export async function getTapTypePaged(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<TapType>> {
  const params = new URLSearchParams({
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });
  if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());

  const response = await apiClient.get<PagedResponse<TapType>>(
    `/WaterConnectionType?${params.toString()}`
  );
  if (!response.success) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to fetch tap type", "getTapTypePaged");
  }
  return {
    ...response.data!,
    items: response.data!.items.filter(isTapTypeShape).map(normalizeTapType),
  };
}

export async function getTapTypeById(id: number): Promise<TapType> {
  const response = await apiClient.get<TapType>(
    `/WaterConnectionType/${encodeURIComponent(String(id))}`
  );
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Not found", "getTapTypeById");
  }
  return normalizeTapType(response.data as unknown as Record<string, unknown>);
}

export async function createTapType(
  data: TapTypeFormModel,
  userId: number
): Promise<TapType> {
  const response = await apiClient.post<TapType>("/WaterConnectionType", {
    ...data,
    createdBy: userId,
  });
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to create", "createTapType");
  }
  return normalizeTapType(response.data as unknown as Record<string, unknown>);
}

export async function updateTapType(
  id: number,
  data: TapTypeFormModel,
  userId: number
): Promise<TapType> {
  const response = await apiClient.put<TapType>(
    `/WaterConnectionType/${encodeURIComponent(String(id))}`,
    { ...data, updatedBy: userId }
  );
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to update", "updateTapType");
  }
  return normalizeTapType(response.data as unknown as Record<string, unknown>);
}

export async function deleteTapType(id: number, _userId: number): Promise<void> {
  const response = await apiClient.delete(
    `/WaterConnectionType/${encodeURIComponent(String(id))}`
  );
  if (!response.success) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to delete", "deleteTapType");
  }
}

/* ============================================================
   TAP SIZE — CRUD
============================================================ */

export async function getTapSizePaged(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string
): Promise<PagedResponse<TapSize>> {
  const params = new URLSearchParams({
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });
  if (searchTerm?.trim()) params.append("SearchTerm", searchTerm.trim());

  const response = await apiClient.get<PagedResponse<TapSize>>(
    `/WaterConnectionSize?${params.toString()}`
  );
  if (!response.success) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to fetch tap size", "getTapSizePaged");
  }
  return {
    ...response.data!,
    items: response.data!.items.filter(isTapSizeShape).map(normalizeTapSize),
  };
}

export async function getTapSizeById(id: number): Promise<TapSize> {
  const response = await apiClient.get<TapSize>(
    `/WaterConnectionSize/${encodeURIComponent(String(id))}`
  );
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Not found", "getTapSizeById");
  }
  return normalizeTapSize(response.data as unknown as Record<string, unknown>);
}

export async function createTapSize(
  data: TapSizeFormModel,
  userId: number
): Promise<TapSize> {
  const response = await apiClient.post<TapSize>("/WaterConnectionSize", {
    ...data,
    createdBy: userId,
  });
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to create", "createTapSize");
  }
  return normalizeTapSize(response.data as unknown as Record<string, unknown>);
}

export async function updateTapSize(
  id: number,
  data: TapSizeFormModel,
  userId: number
): Promise<TapSize> {
  const response = await apiClient.put<TapSize>(
    `/WaterConnectionSize/${encodeURIComponent(String(id))}`,
    { ...data, updatedBy: userId }
  );
  if (!response.success || !response.data) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to update", "updateTapSize");
  }
  return normalizeTapSize(response.data as unknown as Record<string, unknown>);
}

export async function deleteTapSize(id: number, _userId: number): Promise<void> {
  const response = await apiClient.delete(
    `/WaterConnectionSize/${encodeURIComponent(String(id))}`
  );
  if (!response.success) {
    throw new ApiError(response.statusCode ?? 500, response.error ?? "Failed to delete", "deleteTapSize");
  }
}

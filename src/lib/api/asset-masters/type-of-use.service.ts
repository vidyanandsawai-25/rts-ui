import { apiClient } from "@/services/api.service";
import {
  TypeOfUseGroup,
  TypeOfUseGroupFormModel,
  AssetTypeOfUse,
  AssetTypeOfUseFormModel,
  AssetSubTypeOfUse,
  AssetSubTypeOfUseFormModel,
} from "@/types/asset-masters/type-of-use.types";
import { PagedResponse } from "@/types/common.types";
import { ApiError } from "@/lib/utils/api";
import { logger } from "@/lib/utils/logger";
import { validateAndPrepareSearchTerm, getDeleteErrorStatusCode } from "@/lib/api/typeofuse-validation";

// ==========================================
// TYPE OF USE GROUP SERVICES
// ==========================================

export async function getTypeOfUseGroupsPaged(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<TypeOfUseGroup>> {
  try {
    const params = new URLSearchParams();
    params.append("PageNumber", pageNumber.toString());
    params.append("PageSize", pageSize.toString());
    params.append("MarkedForDeletion", "false");

    const safeSearchTerm = validateAndPrepareSearchTerm(searchTerm);
    if (safeSearchTerm) params.append("SearchTerm", safeSearchTerm);
    if (sortBy?.trim()) params.append("SortBy", sortBy.trim());
    if (sortOrder?.trim()) params.append("SortOrder", sortOrder.trim());

    const response = await apiClient.get<PagedResponse<TypeOfUseGroup>>(
      `/asset-management/type-of-use-group?${params.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch paged Type of Use Groups",
        "Get paged groups failed"
      );
    }
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }

    return response.data;
  } catch (error) {
    logger.error("Error fetching paged Type of Use Groups", { error: error as Error });
    throw error;
  }
}

export async function getTypeOfUseGroupsAllActive(): Promise<TypeOfUseGroup[]> {
  try {
    const params = new URLSearchParams();
    params.append("PageNumber", "1");
    params.append("PageSize", "-1");
    params.append("IsActive", "true");
    params.append("MarkedForDeletion", "false");

    const response = await apiClient.get<PagedResponse<TypeOfUseGroup>>(
      `/asset-management/type-of-use-group?${params.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch active Type of Use Groups",
        "Get active groups failed"
      );
    }
    if (!response.data) {
      throw new ApiError(500, "No data received from server", "Invalid response format");
    }

    return response.data.items ?? [];
  } catch (error) {
    logger.error("Error fetching active Type of Use Groups", { error: error as Error });
    throw error;
  }
}

export async function getTypeOfUseGroupById(groupId: number): Promise<TypeOfUseGroup | null> {
  try {
    if (typeof groupId !== "number" || groupId <= 0 || !Number.isFinite(groupId)) {
      throw new ApiError(400, "Valid Group ID is required", "Invalid ID");
    }
    const response = await apiClient.get<TypeOfUseGroup>(
      `/asset-management/type-of-use-group/${encodeURIComponent(String(groupId))}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch Type of Use Group",
        `Get Group ${groupId} failed`
      );
    }
    return response.data || null;
  } catch (error) {
    logger.error(`Error fetching Type of Use Group ${groupId}`, { error: error as Error });
    throw error;
  }
}

export async function createTypeOfUseGroup(data: TypeOfUseGroupFormModel): Promise<string | undefined> {
  try {
    if (!data.typeOfUseGroupCode?.trim() || !data.groupName?.trim()) {
      throw new ApiError(400, "Required fields are missing", "Validation failed");
    }
    const payload = {
      typeOfUseGroupCode: data.typeOfUseGroupCode.trim(),
      groupName: data.groupName.trim(),
      groupIcon: data.groupIcon?.trim() || "home",
      isActive: data.isActive,
      createdBy: data.createdBy ?? null,
    };
    const response = await apiClient.post<{ message?: string }>("/asset-management/type-of-use-group", payload);
    if (!response.success) {
      const errorMsg = response.error || "";
      const isDuplicate = errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate");
      throw new ApiError(
        response.statusCode ?? (isDuplicate ? 409 : 500),
        errorMsg || "Create Type of Use Group failed",
        "Create Group failed"
      );
    }
    return response.data?.message;
  } catch (error) {
    logger.error("Error creating Type of Use Group", { error: error as Error });
    throw error;
  }
}

export async function updateTypeOfUseGroup(data: TypeOfUseGroupFormModel): Promise<string | undefined> {
  try {
    if (!data.id || data.id <= 0 || !data.typeOfUseGroupCode?.trim() || !data.groupName?.trim()) {
      throw new ApiError(400, "Required fields are missing", "Validation failed");
    }
    const payload = {
      id: data.id,
      typeOfUseGroupCode: data.typeOfUseGroupCode.trim(),
      groupName: data.groupName.trim(),
      groupIcon: data.groupIcon?.trim() || "home",
      isActive: data.isActive,
      updatedBy: data.updatedBy ?? null,
    };
    const response = await apiClient.put<{ message?: string }>(
      `/asset-management/type-of-use-group/${encodeURIComponent(String(data.id))}`,
      payload
    );
    if (!response.success) {
      const errorMsg = response.error || "";
      const isDuplicate = errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate");
      throw new ApiError(
        response.statusCode ?? (isDuplicate ? 409 : 500),
        errorMsg || "Update Type of Use Group failed",
        "Update Group failed"
      );
    }
    return response.data?.message;
  } catch (error) {
    logger.error("Error updating Type of Use Group", { error: error as Error });
    throw error;
  }
}

export async function deleteTypeOfUseGroup(id: number): Promise<void> {
  try {
    if (typeof id !== "number" || id <= 0 || !Number.isFinite(id)) {
      throw new ApiError(400, "Valid Group ID is required", "Validation failed");
    }
    const response = await apiClient.delete<void>(
      `/asset-management/type-of-use-group/${encodeURIComponent(String(id))}`
    );
    if (!response.success) {
      const errorMsg = response.error || "";
      const statusCode = response.statusCode ?? getDeleteErrorStatusCode(errorMsg);
      throw new ApiError(statusCode, errorMsg || "Failed to delete Type of Use Group", `Delete Group ${id} failed`);
    }
  } catch (error) {
    logger.error(`Error deleting Type of Use Group ${id}`, { error: error as Error });
    throw error;
  }
}

// ==========================================
// ASSET TYPE OF USE SERVICES
// ==========================================

export async function getAssetTypeOfUses(
  typeOfUseGroupId: number,
  isActive?: boolean
): Promise<AssetTypeOfUse[]> {
  try {
    const params = new URLSearchParams();
    params.append("TypeOfUseGroupId", typeOfUseGroupId.toString());
    params.append("MarkedForDeletion", "false");
    params.append("PageSize", "-1");
    if (isActive !== undefined) {
      params.append("IsActive", isActive.toString());
    }

    const response = await apiClient.get<PagedResponse<AssetTypeOfUse>>(
      `/asset-management/asset-type-of-use?${params.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch Asset Type of Uses",
        "Get Types failed"
      );
    }
    return response.data?.items ?? [];
  } catch (error) {
    logger.error("Error fetching Asset Type of Uses", { error: error as Error });
    throw error;
  }
}

export async function getAssetTypeOfUseById(id: number): Promise<AssetTypeOfUse | null> {
  try {
    const response = await apiClient.get<AssetTypeOfUse>(
      `/asset-management/asset-type-of-use/${encodeURIComponent(String(id))}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch Asset Type of Use",
        `Get Type ${id} failed`
      );
    }
    return response.data || null;
  } catch (error) {
    logger.error(`Error fetching Asset Type of Use ${id}`, { error: error as Error });
    throw error;
  }
}

export async function createAssetTypeOfUse(data: AssetTypeOfUseFormModel): Promise<string | undefined> {
  try {
    const response = await apiClient.post<{ message?: string }>("/asset-management/asset-type-of-use", data);
    if (!response.success) {
      const errorMsg = response.error || "";
      const isDuplicate = errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate");
      throw new ApiError(
        response.statusCode ?? (isDuplicate ? 409 : 500),
        errorMsg || "Create Asset Type of Use failed",
        "Create Type failed"
      );
    }
    return response.data?.message;
  } catch (error) {
    logger.error("Error creating Asset Type of Use", { error: error as Error });
    throw error;
  }
}

export async function updateAssetTypeOfUse(data: AssetTypeOfUseFormModel): Promise<string | undefined> {
  try {
    if (typeof data.id !== "number" || data.id <= 0 || !Number.isFinite(data.id)) {
      throw new ApiError(400, "Valid Type of Use ID is required", "Validation failed");
    }
    const response = await apiClient.put<{ message?: string }>(
      `/asset-management/asset-type-of-use/${encodeURIComponent(String(data.id))}`,
      data
    );
    if (!response.success) {
      const errorMsg = response.error || "";
      const isDuplicate = errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate");
      throw new ApiError(
        response.statusCode ?? (isDuplicate ? 409 : 500),
        errorMsg || "Update Asset Type of Use failed",
        "Update Type failed"
      );
    }
    return response.data?.message;
  } catch (error) {
    logger.error("Error updating Asset Type of Use", { error: error as Error });
    throw error;
  }
}

export async function deleteAssetTypeOfUse(id: number): Promise<void> {
  try {
    if (typeof id !== "number" || id <= 0 || !Number.isFinite(id)) {
      throw new ApiError(400, "Valid ID is required", "Invalid ID");
    }
    const response = await apiClient.delete<void>(
      `/asset-management/asset-type-of-use/${encodeURIComponent(String(id))}`
    );
    if (!response.success) {
      const errorMsg = response.error || "";
      const statusCode = response.statusCode ?? getDeleteErrorStatusCode(errorMsg);
      throw new ApiError(
        statusCode,
        errorMsg || "Failed to delete Asset Type of Use",
        `Delete Type ${id} failed`
      );
    }
  } catch (error) {
    logger.error(`Error deleting Asset Type of Use ${id}`, { error: error as Error });
    throw error;
  }
}

// ==========================================
// ASSET SUB-TYPE OF USE SERVICES
// ==========================================

export async function getAssetSubTypeOfUses(
  typeOfUseId: number,
  isActive?: boolean
): Promise<AssetSubTypeOfUse[]> {
  try {
    const params = new URLSearchParams();
    params.append("TypeOfUseId", typeOfUseId.toString());
    params.append("MarkedForDeletion", "false");
    params.append("PageSize", "-1");
    if (isActive !== undefined) {
      params.append("IsActive", isActive.toString());
    }

    const response = await apiClient.get<PagedResponse<AssetSubTypeOfUse>>(
      `/asset-management/asset-sub-type-of-use?${params.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch Asset Sub-Type of Uses",
        "Get Sub-Types failed"
      );
    }
    return response.data?.items ?? [];
  } catch (error) {
    logger.error("Error fetching Asset Sub-Type of Uses", { error: error as Error });
    throw error;
  }
}

export async function getAssetSubTypeOfUseById(id: number): Promise<AssetSubTypeOfUse | null> {
  try {
    const response = await apiClient.get<AssetSubTypeOfUse>(
      `/asset-management/asset-sub-type-of-use/${encodeURIComponent(String(id))}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch Asset Sub-Type of Use",
        `Get Sub-Type ${id} failed`
      );
    }
    return response.data || null;
  } catch (error) {
    logger.error(`Error fetching Asset Sub-Type of Use ${id}`, { error: error as Error });
    throw error;
  }
}

export async function createAssetSubTypeOfUse(data: AssetSubTypeOfUseFormModel): Promise<string | undefined> {
  try {
    const response = await apiClient.post<{ message?: string }>("/asset-management/asset-sub-type-of-use", data);
    if (!response.success) {
      const errorMsg = response.error || "";
      const isDuplicate = errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate");
      throw new ApiError(
        response.statusCode ?? (isDuplicate ? 409 : 500),
        errorMsg || "Create Asset Sub-Type of Use failed",
        "Create Sub-Type failed"
      );
    }
    return response.data?.message;
  } catch (error) {
    logger.error("Error creating Asset Sub-Type of Use", { error: error as Error });
    throw error;
  }
}

export async function updateAssetSubTypeOfUse(data: AssetSubTypeOfUseFormModel): Promise<string | undefined> {
  try {
    if (typeof data.id !== "number" || data.id <= 0 || !Number.isFinite(data.id)) {
      throw new ApiError(400, "Valid Sub-Type of Use ID is required", "Validation failed");
    }
    const response = await apiClient.put<{ message?: string }>(
      `/asset-management/asset-sub-type-of-use/${encodeURIComponent(String(data.id))}`,
      data
    );
    if (!response.success) {
      const errorMsg = response.error || "";
      const isDuplicate = errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate");
      throw new ApiError(
        response.statusCode ?? (isDuplicate ? 409 : 500),
        errorMsg || "Update Asset Sub-Type of Use failed",
        "Update Sub-Type failed"
      );
    }
    return response.data?.message;
  } catch (error) {
    logger.error("Error updating Asset Sub-Type of Use", { error: error as Error });
    throw error;
  }
}

export async function deleteAssetSubTypeOfUse(id: number): Promise<void> {
  try {
    if (typeof id !== "number" || id <= 0 || !Number.isFinite(id)) {
      throw new ApiError(400, "Valid ID is required", "Invalid ID");
    }
    const response = await apiClient.delete<void>(
      `/asset-management/asset-sub-type-of-use/${encodeURIComponent(String(id))}`
    );
    if (!response.success) {
      const errorMsg = response.error || "";
      const statusCode = response.statusCode ?? getDeleteErrorStatusCode(errorMsg);
      throw new ApiError(
        statusCode,
        errorMsg || "Failed to delete Asset Sub-Type of Use",
        `Delete Sub-Type ${id} failed`
      );
    }
  } catch (error) {
    logger.error(`Error deleting Asset Sub-Type of Use ${id}`, { error: error as Error });
    throw error;
  }
}

export async function getAssetTypeOfUsesAllActive(): Promise<AssetTypeOfUse[]> {
  try {
    const params = new URLSearchParams();
    params.append("PageNumber", "1");
    params.append("PageSize", "-1");
    params.append("IsActive", "true");
    params.append("MarkedForDeletion", "false");

    const response = await apiClient.get<PagedResponse<AssetTypeOfUse>>(
      `/asset-management/asset-type-of-use?${params.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch active Asset Type of Uses",
        "Get active types failed"
      );
    }
    return response.data?.items ?? [];
  } catch (error) {
    logger.error("Error fetching active Asset Type of Uses", { error: error as Error });
    throw error;
  }
}

export async function getAssetTypeOfUsesPaged(
  pageNumber: number,
  pageSize: number,
  typeOfUseGroupId?: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<AssetTypeOfUse>> {
  try {
    const params = new URLSearchParams();
    params.append("PageNumber", pageNumber.toString());
    params.append("PageSize", pageSize.toString());
    if (typeOfUseGroupId) {
      params.append("TypeOfUseGroupId", typeOfUseGroupId.toString());
    }
    params.append("MarkedForDeletion", "false");
    const safeSearch = validateAndPrepareSearchTerm(searchTerm);
    if (safeSearch) {
      params.append("SearchTerm", safeSearch);
    }
    if (sortBy) {
      params.append("SortBy", sortBy);
      params.append("SortOrder", sortOrder || "asc");
    }

    const response = await apiClient.get<PagedResponse<AssetTypeOfUse>>(
      `/asset-management/asset-type-of-use?${params.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch paged Asset Type of Uses",
        "Get paged types failed"
      );
    }
    return response.data ?? { items: [], pageNumber, pageSize, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false };
  } catch (error) {
    logger.error("Error fetching paged Asset Type of Uses", { error: error as Error });
    throw error;
  }
}

export async function getAssetSubTypeOfUsesPaged(
  pageNumber: number,
  pageSize: number,
  typeOfUseId: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<AssetSubTypeOfUse>> {
  try {
    const params = new URLSearchParams();
    params.append("PageNumber", pageNumber.toString());
    params.append("PageSize", pageSize.toString());
    params.append("TypeOfUseId", typeOfUseId.toString());
    params.append("MarkedForDeletion", "false");
    const safeSubSearch = validateAndPrepareSearchTerm(searchTerm);
    if (safeSubSearch) {
      params.append("SearchTerm", safeSubSearch);
    }
    if (sortBy) {
      params.append("SortBy", sortBy);
      params.append("SortOrder", sortOrder || "asc");
    }

    const response = await apiClient.get<PagedResponse<AssetSubTypeOfUse>>(
      `/asset-management/asset-sub-type-of-use?${params.toString()}`
    );
    if (!response.success) {
      throw new ApiError(
        response.statusCode ?? 500,
        response.error || "Failed to fetch paged Asset Sub-Type of Uses",
        "Get paged sub-types failed"
      );
    }
    return response.data ?? { items: [], pageNumber, pageSize, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false };
  } catch (error) {
    logger.error("Error fetching paged Asset Sub-Type of Uses", { error: error as Error });
    throw error;
  }
}

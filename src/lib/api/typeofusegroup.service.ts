import { apiClient } from "@/services/api.service";
import type { UseGroup, UseGroupIconKey } from "@/types/typeOfUse.types";
import type { PagedResponse } from "@/types/common.types";
import { mapApiGroupToUi, iconKeyToApi } from "./typeofuse.mappers";
import { TypeOfUseErrorMessages } from "./typeofuse.errors";

/* ====================================================================== */
/* =============================== GROUP APIS ============================ */
/* ====================================================================== */

/**
 * Get paginated list of use groups
 */
export async function getUseGroupsPagedServer(params: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
  typeOfUseGroupId?: number;
}): Promise<PagedResponse<UseGroup>> {
  const qs = new URLSearchParams();
  qs.set("PageNumber", String(params.pageNumber));
  qs.set("PageSize", String(params.pageSize));
  if (params.searchTerm) qs.set("SearchTerm", params.searchTerm);
  if (params.sortBy) qs.set("SortBy", params.sortBy);
  if (params.sortOrder) qs.set("SortOrder", params.sortOrder);
  if (typeof params.filterLogic === "number") qs.set("FilterLogic", String(params.filterLogic));
  if (typeof params.typeOfUseGroupId === "number") qs.set("TypeOfUseGroupId", String(params.typeOfUseGroupId));

  const response = await apiClient.get<PagedResponse<unknown>>(`/TypeOfUseGroup?${qs.toString()}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.FETCH_GROUPS_FAILED);
  }

  const data = response.data!;
  return { ...data, items: (data.items ?? []).map((g) => mapApiGroupToUi(g as Record<string, unknown>)) };
}

/**
 * Get a single use group by ID
 */
export async function getUseGroupById(id: string | number): Promise<UseGroup | null> {
  const response = await apiClient.get<unknown>(`/TypeOfUseGroup/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    return null;
  }
  
  return response.data ? mapApiGroupToUi(response.data as Record<string, unknown>) : null;
}

/**
 * Create a new use group
 */
export async function createUseGroupApi(input: {
  typeOfUseGroupCode: string;
  groupName: string;
  groupIcon: UseGroupIconKey;
  isActive: boolean;
  createdBy?: string;
}): Promise<UseGroup> {
  const payload = {
    typeOfUseGroupCode: input.typeOfUseGroupCode?.trim(),
    groupName: input.groupName?.trim(),
    groupIcon: iconKeyToApi(input.groupIcon),
    isActive: input.isActive,
    createdBy: Number(input.createdBy ?? "1"),
  };

  const response = await apiClient.post<unknown>("/TypeOfUseGroup", payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.CREATE_GROUP_FAILED);
  }
  
  return mapApiGroupToUi(response.data as Record<string, unknown>);
}

/**
 * Update an existing use group
 */
export async function updateUseGroupApi(input: {
  typeOfUseGroupId: number;
  typeOfUseGroupCode: string;
  groupName: string;
  groupIcon: UseGroupIconKey;
  isActive: boolean;
  updatedBy?: string;
}): Promise<UseGroup> {
  const payload = {
    typeOfUseGroupId: input.typeOfUseGroupId,
    typeOfUseGroupCode: input.typeOfUseGroupCode?.trim(),
    groupName: input.groupName?.trim(),
    groupIcon: iconKeyToApi(input.groupIcon),
    isActive: input.isActive,
    updatedBy: Number(input.updatedBy ?? "1"),
  };

  const response = await apiClient.put<unknown>(`/TypeOfUseGroup/${input.typeOfUseGroupId}`, payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.UPDATE_GROUP_FAILED);
  }
  
  return mapApiGroupToUi(response.data as Record<string, unknown>);
}

/**
 * Delete a use group
 */
export async function deleteUseGroupApi(id: string | number) {
  const response = await apiClient.delete<unknown>(`/TypeOfUseGroup/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.DELETE_GROUP_FAILED);
  }
  
  return true;
}

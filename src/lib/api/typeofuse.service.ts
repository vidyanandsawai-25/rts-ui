import { apiClient } from "@/services/api.service";
import type { UseType } from "@/types/typeOfUse.types";
import type { PagedResponse } from "@/types/common.types";
import { mapApiTypeToUi } from "./typeofuse.mappers";
import { TypeOfUseErrorMessages } from "./typeofuse.errors";

/* ====================================================================== */
/* =============================== TYPE APIS ============================= */
/* ====================================================================== */

/**
 * Get paginated list of use types
 */
export async function getUseTypesPagedServer(params: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
  typeOfUseId?: number;
  type?: string;
  typeOfUseGroupId?: number;
}): Promise<PagedResponse<UseType>> {
  const qs = new URLSearchParams();
  qs.set("PageNumber", String(params.pageNumber));
  qs.set("PageSize", String(params.pageSize));
  if (params.searchTerm) qs.set("SearchTerm", params.searchTerm);
  if (params.sortBy) qs.set("SortBy", params.sortBy);
  if (params.sortOrder) qs.set("SortOrder", params.sortOrder);
  if (typeof params.filterLogic === "number") qs.set("FilterLogic", String(params.filterLogic));
  if (typeof params.typeOfUseId === "number") qs.set("TypeOfUseId", String(params.typeOfUseId));
  if (params.type) qs.set("Type", params.type);
  if (typeof params.typeOfUseGroupId === "number") qs.set("TypeOfUseGroupId", String(params.typeOfUseGroupId));

  const response = await apiClient.get<PagedResponse<unknown>>(`/TypeOfUse?${qs.toString()}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.FETCH_TYPES_FAILED);
  }

  const data = response.data!;
  return { ...data, items: (data.items ?? []).map((t) => mapApiTypeToUi(t as Record<string, unknown>)) };
}

/**
 * Get a single use type by ID
 */
export async function getUseTypeById(id: string | number): Promise<UseType | null> {
  const response = await apiClient.get<unknown>(`/TypeOfUse/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    return null;
  }
  
  return response.data ? mapApiTypeToUi(response.data as Record<string, unknown>) : null;
}

/**
 * Create a new use type
 */
export async function createUseTypeApi(input: {
  typeOfUseCode: string;
  description: string;
  type: string;
  typeOfUseGroupId: number;
  searchSequence: number;
  isActive: boolean;
  createdBy?: string;
}): Promise<UseType> {
  const payload = {
    typeOfUseCode: input.typeOfUseCode?.trim(),
    description: input.description?.trim(),
    type: input.type,
    typeOfUseGroupId: input.typeOfUseGroupId,
    searchSequence: input.searchSequence,
    isActive: input.isActive,
    createdBy: Number(input.createdBy ?? "1"),
  };

  const response = await apiClient.post<unknown>("/TypeOfUse", payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.CREATE_TYPE_FAILED);
  }
  
  return mapApiTypeToUi(response.data as Record<string, unknown>);
}

/**
 * Update an existing use type
 */
export async function updateUseTypeApi(input: {
  typeOfUseId: number;
  typeOfUseCode: string;
  description: string;
  type: string;
  typeOfUseGroupId: number;
  searchSequence: number;
  isActive: boolean;
  updatedBy?: string;
}): Promise<UseType> {
  const payload = {
    typeOfUseId: input.typeOfUseId,
    typeOfUseCode: input.typeOfUseCode?.trim(),
    description: input.description?.trim(),
    type: input.type,
    typeOfUseGroupId: input.typeOfUseGroupId,
    searchSequence: input.searchSequence,
    isActive: input.isActive,
    updatedBy: Number(input.updatedBy ?? "1"),
  };

  const response = await apiClient.put<unknown>(`/TypeOfUse/${input.typeOfUseId}`, payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    // Return raw backend error - forms will map reference errors to appropriate i18n keys
    throw new Error(response.error ?? TypeOfUseErrorMessages.UPDATE_TYPE_FAILED);
  }
  
  return mapApiTypeToUi(response.data as Record<string, unknown>);
}

/**
 * Delete a use type (purge - permanent delete)
 */
export async function deleteUseTypeApi(id: string) {
  const response = await apiClient.delete<unknown>(`/TypeOfUse/${id}/purge`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    // Map backend reference error to the corresponding i18n key
    let errorMessage = response.error ?? TypeOfUseErrorMessages.DELETE_TYPE_FAILED;
    
    if (errorMessage.includes("referenced by other entities")) {
      errorMessage = TypeOfUseErrorMessages.DELETE_TYPE_REFERENCED;
    }
    
    throw new Error(errorMessage);
  }
  
  return true;
}

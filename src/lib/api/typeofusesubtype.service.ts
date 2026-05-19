import { apiClient } from "@/services/api.service";
import type { UseSubType } from "@/types/typeOfUse.types";
import type { PagedResponse } from "@/types/common.types";
import { mapApiSubTypeToUi } from "./typeofuse.mappers";
import { TypeOfUseErrorMessages } from "./typeofuse.errors";

/* ====================================================================== */
/* ============================ SUBTYPE APIS ============================= */
/* ====================================================================== */

/**
 * Get paginated list of use subtypes
 */
export async function getSubTypesPagedServer(params: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
  typeOfUseId?: number;
}): Promise<PagedResponse<UseSubType>> {
  const qs = new URLSearchParams();
  qs.set("PageNumber", String(params.pageNumber));
  qs.set("PageSize", String(params.pageSize));
  if (params.searchTerm) qs.set("SearchTerm", params.searchTerm);
  if (params.sortBy) qs.set("SortBy", params.sortBy);
  if (params.sortOrder) qs.set("SortOrder", params.sortOrder);
  if (typeof params.filterLogic === "number") qs.set("FilterLogic", String(params.filterLogic));
  if (typeof params.typeOfUseId === "number") qs.set("TypeOfUseId", String(params.typeOfUseId));

  const response = await apiClient.get<PagedResponse<unknown>>(`/SubTypeOfUse?${qs.toString()}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.FETCH_SUBTYPES_FAILED);
  }

  const data = response.data!;
  return { ...data, items: (data.items ?? []).map((s) => mapApiSubTypeToUi(s as Record<string, unknown>)) };
}

/**
 * Get a single use subtype by ID
 */
export async function getSubTypeByIdApi(id: string | number): Promise<UseSubType | null> {
  const response = await apiClient.get<unknown>(`/SubTypeOfUse/${id}`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    return null;
  }
  
  return response.data ? mapApiSubTypeToUi(response.data as Record<string, unknown>) : null;
}

/**
 * Create a new use subtype
 */
export async function createSubTypeApi(input: {
  description: string;
  typeOfUseId: number;
  searchSequence: number;
  isActive: boolean;
  createdBy?: string;
}): Promise<UseSubType> {
  const payload = {
    description: input.description?.trim(),
    typeOfUseId: input.typeOfUseId,
    searchSequence: input.searchSequence,
    isActive: input.isActive,
    createdBy: Number(input.createdBy ?? "1"),
  };

  const response = await apiClient.post<unknown>("/SubTypeOfUse", payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.CREATE_SUBTYPE_FAILED);
  }
  
  return mapApiSubTypeToUi(response.data as Record<string, unknown>);
}

/**
 * Update an existing use subtype
 */
export async function updateSubTypeApi(input: {
  subTypeOfUseId: number;
  description: string;
  typeOfUseId: number;
  searchSequence: number;
  isActive: boolean;
  updatedBy?: string;
}): Promise<UseSubType> {
  const payload = {
    subTypeOfUseId: input.subTypeOfUseId,
    description: input.description?.trim(),
    typeOfUseId: input.typeOfUseId,
    searchSequence: input.searchSequence,
    isActive: input.isActive,
    updatedBy: Number(input.updatedBy ?? "1"),
  };

  const response = await apiClient.put<unknown>(`/SubTypeOfUse/${input.subTypeOfUseId}`, payload, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    // Return raw backend error - forms will map reference errors to appropriate i18n keys
    throw new Error(response.error ?? TypeOfUseErrorMessages.UPDATE_SUBTYPE_FAILED);
  }
  
  return mapApiSubTypeToUi(response.data as Record<string, unknown>);
}

/**
 * Delete a use subtype (purge - permanent delete)
 */
export async function deleteSubTypeApi(id: string) {
  const response = await apiClient.delete<unknown>(`/SubTypeOfUse/${id}/purge`, {
    cache: "no-store",
    headers: { "Accept": "application/json" },
  });
  
  if (!response.success) {
    // Map backend reference error to the corresponding i18n key
    let errorMessage = response.error ?? TypeOfUseErrorMessages.DELETE_SUBTYPE_FAILED;
    
    if (errorMessage.includes("referenced by other entities")) {
      errorMessage = TypeOfUseErrorMessages.DELETE_SUBTYPE_REFERENCED;
    }
    
    throw new Error(errorMessage);
  }
  
  return true;
}

/**
 * Get subtype count by type IDs
 */
export async function getSubTypeCountByTypeIds(typeIds: string[]) {
  const response = await apiClient.post<{ [key: string]: number }>(
    "/SubTypeOfUse/CountByType",
    { typeIds },
    {
      cache: "no-store",
      headers: { "Accept": "application/json" },
    }
  );

  if (!response.success) {
    throw new Error(response.error ?? TypeOfUseErrorMessages.FETCH_SUBTYPE_COUNTS_FAILED);
  }

  return response.data; // { [typeId]: number }
}

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { fetchAllPaged } from "@/lib/utils/pagination-helpers";
import { ApiError } from "@/lib/utils/api";
import type { TypeOfUseMasterData, UseGroupIconKey, UseStatus, UseType, UseGroup, UseSubType } from "@/types/typeOfUse.types";

import {
  // ✅ groups
  getUseGroupsPagedServer,
  getUseGroupById,
  createUseGroupApi,
  updateUseGroupApi,
  deleteUseGroupApi,

  // ✅ types
  getUseTypesPagedServer,
  getUseTypeById,
  createUseTypeApi,
  updateUseTypeApi,
  deleteUseTypeApi,

  // ✅ subtypes
  getSubTypesPagedServer,
  getSubTypeByIdApi,
  createSubTypeApi,
  updateSubTypeApi,
  deleteSubTypeApi,
} from "@/lib/api/typeofusemaster.service";

// ✅ Helper to get current user ID from cookies (fallback to 1 if not found)
async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const userId = getUserIdFromCookies(cookieStore);
  return userId ? String(userId) : "1";
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    // Use the backend error message from ApiError.error property
    // This contains the actual error from the API response
    return error.error || fallback;
  }
  
  if (error instanceof Error) {
    // Extract message and clean any leading/trailing artifacts
    const msg = error.message.trim();
    // Remove leading ": " if present (from empty contextMessage in ApiError)
    return msg.startsWith(': ') ? msg.substring(2) : msg;
  }
  
  // For non-Error types, use the fallback
  return fallback;
}

export async function getTypeOfUseMasterData(): Promise<TypeOfUseMasterData> {
  try {
    const [groupsResp, typesResp] = await Promise.all([
      getAllUseGroups(),
      getAllUseTypes(),
    ]);

    return {
      groups: groupsResp.items,
      types: typesResp.items,
      subTypes: [], // 🔥 intentionally empty (loaded paged later)
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load Type of Use master data");
    throw new Error(errorMessage, { cause: error });
  }
}


/** ===================== GROUP ACTIONS ===================== */
export async function getUseGroupsPaged(input: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
  typeOfUseGroupId?: number;
}) {
  try {
    return await getUseGroupsPagedServer(input);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load groups");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function getGroupById(id: string | number) {
  try {
    return await getUseGroupById(id);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load group");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function createUseGroup(input: {
  code: string;
  name: string;
  icon: UseGroupIconKey;
  status?: UseStatus;
}) {
  try {
    await createUseGroupApi({
      typeOfUseGroupCode: input.code,
      groupName: input.name,
      groupIcon: input.icon,
      isActive: (input.status ?? "Active") === "Active",
      createdBy: await getCurrentUserId(),
    });
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to create group");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function updateUseGroup(input: {
  id: number;
  code: string;
  name: string;
  icon: UseGroupIconKey;
  status: UseStatus;
}) {
  try {
    await updateUseGroupApi({
      typeOfUseGroupId: input.id,
      typeOfUseGroupCode: input.code,
      groupName: input.name,
      groupIcon: input.icon,
      isActive: input.status === "Active",
      updatedBy: await getCurrentUserId(),
    });
    
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to update group");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function deleteUseGroup(id: string | number) {
  try {
    await deleteUseGroupApi(id);
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to delete group");
    throw new Error(errorMessage, { cause: error });
  }
}

/** ===================== TYPE ACTIONS ===================== */
export async function getUseTypesPaged(input: {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
  typeOfUseId?: number;
  type?: string;
  typeOfUseGroupId?: number;
}) {
  try {
    return await getUseTypesPagedServer(input);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load types");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function getAllUseTypes(searchTerm?: string) {
  try {
    return await fetchAllPaged<UseType>(
      getUseTypesPagedServer,
      searchTerm ? { searchTerm } : {}
    );
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load all types");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function getAllUseGroups() {
  try {
    return await fetchAllPaged<UseGroup>(getUseGroupsPagedServer);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load all groups");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function getTypesByGroupPaged(input: {
  pageNumber: number;
  pageSize: number;
  typeOfUseGroupId?: number;
  searchTerm?: string;
}) {
  try {
    const res = await getUseTypesPagedServer({
      pageNumber: input.pageNumber,
      pageSize: input.pageSize,
      typeOfUseGroupId: input.typeOfUseGroupId,
      searchTerm: input.searchTerm,
    });

    return {
      items: res.items || [],
      totalCount: res.totalCount || 0,
      totalPages: res.totalPages || 1,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load types by group");
    throw new Error(errorMessage, { cause: error });
  }
}


export async function getTypeById(id: string | number) {
  try {
    return await getUseTypeById(id);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load type");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function resolveTypeId(typeIdOrCode: string): Promise<string> {
  if (!typeIdOrCode) return "";
  
  try {
    // Try as direct ID first
    const type = await getUseTypeById(typeIdOrCode);
    if (type) return String(type.typeOfUseId);
  } catch {
    // If ID lookup fails, it might be a code - search with pagination
    const result = await getUseTypesPagedServer({
      pageNumber: 1,
      pageSize: 1,
      searchTerm: typeIdOrCode, // Search by code
    });
    
    // Find exact match by code
    const match = result.items?.find(t => t.typeOfUseCode === typeIdOrCode);
    if (match) return String(match.typeOfUseId);
  }
  
  return "";
}

export async function createUseType(input: {
  groupId: number;
  code: string;
  description: string;
  type: string;
  searchSequence: number;
  status?: UseStatus;
}) {
  try {
    await createUseTypeApi({
      typeOfUseGroupId: input.groupId,
      typeOfUseCode: input.code,
      description: input.description,
      type: input.type,
      searchSequence: input.searchSequence,
      isActive: (input.status ?? "Active") === "Active",
      createdBy: await getCurrentUserId(),
    });
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to create type");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function updateUseType(input: {
  id: number;
  groupId: number;
  code: string;
  description: string;
  type: string;
  searchSequence: number;
  status: UseStatus;
}) {
  try {
    await updateUseTypeApi({
      typeOfUseId: input.id,
      typeOfUseGroupId: input.groupId,
      typeOfUseCode: input.code,
      description: input.description,
      type: input.type,
      searchSequence: input.searchSequence,
      isActive: input.status === "Active",
      updatedBy: await getCurrentUserId(),
    });
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to update type");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function deleteUseType(id: string | number) {
  try {
    await deleteUseTypeApi(String(id));
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to delete type");
    throw new Error(errorMessage, { cause: error });
  }
}

/** ===================== DEPENDENCY CHECKING ===================== */

export async function checkTypeHasSubTypes(typeId: number): Promise<{ hasSubTypes: boolean; count: number }> {
  try {
    const { totalCount } = await getSubTypesPagedServer({
      pageNumber: 1,
      pageSize: 1,
      typeOfUseId: typeId,
    });
    
    return {
      hasSubTypes: totalCount > 0,
      count: totalCount,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to check subtypes");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function checkGroupHasTypes(groupId: number): Promise<{ hasTypes: boolean; count: number }> {
  try {
    const { totalCount } = await getUseTypesPagedServer({
      pageNumber: 1,
      pageSize: 1,
      typeOfUseGroupId: groupId,
    });
    
    return {
      hasTypes: totalCount > 0,
      count: totalCount,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to check group types");
    throw new Error(errorMessage, { cause: error });
  }
}

/** ===================== SUBTYPE ACTIONS ===================== */
export async function getSubTypesPaged(input: {
  pageNumber: number;
  pageSize: number;
  typeOfUseId?: number;
  searchTerm?: string;
}) {
  try {
    return await getSubTypesPagedServer(input);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load subtypes");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function getAllSubTypes(typeOfUseId?: number, searchTerm?: string) {
  try {
    const params: Record<string, unknown> = {};
    if (typeOfUseId) params.typeOfUseId = typeOfUseId;
    if (searchTerm) params.searchTerm = searchTerm;

    return await fetchAllPaged<UseSubType>(getSubTypesPagedServer, params);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load all subtypes");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function getSubTypeById(id: string | number) {
  try {
    return await getSubTypeByIdApi(id);
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to load subtype");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function createSubType(input: {
  typeId: number;
  description: string;
  searchSequence: number;
  status?: UseStatus;
}) {
  try {
    await createSubTypeApi({
      typeOfUseId: input.typeId,
      description: input.description,
      searchSequence: input.searchSequence,
      isActive: (input.status ?? "Active") === "Active",
      createdBy: await getCurrentUserId(),
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to create subtype");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function updateSubType(input: {
  id: number;
  typeId: number;
  description: string;
  searchSequence: number;
  status: UseStatus;
}) {
  try {
    await updateSubTypeApi({
      subTypeOfUseId: input.id,
      typeOfUseId: input.typeId,
      description: input.description,
      searchSequence: input.searchSequence,
      isActive: input.status === "Active",
      updatedBy: await getCurrentUserId(),
    });

    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to update subtype");
    throw new Error(errorMessage, { cause: error });
  }
}

export async function deleteSubType(id: string | number) {
  try {
    await deleteSubTypeApi(String(id));
    for (const locale of locales) {
      revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to delete subtype");
    throw new Error(errorMessage, { cause: error });
  }
}


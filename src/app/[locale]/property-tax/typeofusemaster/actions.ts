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

/**
 * Extract clean error message from any error type
 * Ensures error messages are properly displayed in production
 */
function extractErrorMessage(error: unknown, fallback: string): string {
  // Always log error details for server-side debugging
  console.error('[Server Action Error]', {
    error,
    type: error?.constructor?.name,
    message: error instanceof Error ? error.message : String(error),
    isApiError: error instanceof ApiError,
    apiErrorProp: error instanceof ApiError ? error.error : undefined,
  });
  
  if (error instanceof ApiError) {
    // Use the clean backend error message from ApiError.error property
    const msg = error.error || fallback;
    console.log('[Extracted from ApiError]', msg);
    return msg;
  }
  if (error instanceof Error) {
    // Extract message and clean any leading/trailing artifacts
    const msg = error.message.trim();
    // Remove leading ": " if present (from empty contextMessage)
    const cleaned = msg.startsWith(': ') ? msg.substring(2) : msg;
    console.log('[Extracted from Error]', cleaned);
    return cleaned;
  }
  console.log('[Using fallback]', fallback);
  return fallback;
}

export async function getTypeOfUseMasterData(): Promise<TypeOfUseMasterData> {
  const [groupsResp, typesResp] = await Promise.all([
    getAllUseGroups(),
    getAllUseTypes(),
  ]);

  return {
    groups: groupsResp.items,
    types: typesResp.items,
    subTypes: [], // 🔥 intentionally empty (loaded paged later)
  };
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
  return await getUseGroupsPagedServer(input);
}

export async function getGroupById(id: string | number) {
  return await getUseGroupById(id);
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
    throw new Error(errorMessage);
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
    
    // Revalidate paths after successful update
    try {
      for (const locale of locales) {
        revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
      }
    } catch (revalidateError) {
      // Log revalidation errors but don't fail the operation
      console.error('[Revalidation Error]', revalidateError);
    }
  } catch (error) {
    const errorMessage = extractErrorMessage(error, "Failed to update group");
    throw new Error(errorMessage);
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
    throw new Error(errorMessage);
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
  return await getUseTypesPagedServer(input);
}

// ✅ NEW: Helper to fetch ALL types (handles backend page limits)
export async function getAllUseTypes(searchTerm?: string) {
  return await fetchAllPaged<UseType>(
    getUseTypesPagedServer,
    searchTerm ? { searchTerm } : {}
  );
}

// ✅ NEW: Helper to fetch ALL groups
export async function getAllUseGroups() {
  return await fetchAllPaged<UseGroup>(getUseGroupsPagedServer);
}

// ✅ NEW: Get paginated types by groupId (for server-side pagination)
export async function getTypesByGroupPaged(input: {
  pageNumber: number;
  pageSize: number;
  typeOfUseGroupId?: number;
  searchTerm?: string;
}) {
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
}


export async function getTypeById(id: string | number) {
  return await getUseTypeById(id);
}

// ✅ NEW: Lightweight lookup to resolve a type by ID or code without fetching all
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
    throw new Error(errorMessage);
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
    throw new Error(errorMessage);
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
    throw new Error(errorMessage);
  }
}

/** ===================== DEPENDENCY CHECKING ===================== */

/**
 * Check if a type has any sub-types
 */
export async function checkTypeHasSubTypes(typeId: number): Promise<{ hasSubTypes: boolean; count: number }> {
  const { totalCount } = await getSubTypesPagedServer({
    pageNumber: 1,
    pageSize: 1,
    typeOfUseId: typeId,
  });
  
  return {
    hasSubTypes: totalCount > 0,
    count: totalCount,
  };
}

/**
 * Check if a group has any types
 */
export async function checkGroupHasTypes(groupId: number): Promise<{ hasTypes: boolean; count: number }> {
  const { totalCount } = await getUseTypesPagedServer({
    pageNumber: 1,
    pageSize: 1,
    typeOfUseGroupId: groupId,
  });
  
  return {
    hasTypes: totalCount > 0,
    count: totalCount,
  };
}

/** ===================== SUBTYPE ACTIONS ===================== */
export async function getSubTypesPaged(input: {
  pageNumber: number;
  pageSize: number;
  typeOfUseId?: number;
  searchTerm?: string;
}) {
  return await getSubTypesPagedServer(input);
}

// ✅ NEW: Helper to fetch ALL subtypes for a given typeId
export async function getAllSubTypes(typeOfUseId?: number, searchTerm?: string) {
  const params: Record<string, unknown> = {};
  if (typeOfUseId) params.typeOfUseId = typeOfUseId;
  if (searchTerm) params.searchTerm = searchTerm;

  return await fetchAllPaged<UseSubType>(getSubTypesPagedServer, params);
}

export async function getSubTypeById(id: string | number) {
  return await getSubTypeByIdApi(id);
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
    throw new Error(errorMessage);
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
    throw new Error(errorMessage);
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
    throw new Error(errorMessage);
  }
}


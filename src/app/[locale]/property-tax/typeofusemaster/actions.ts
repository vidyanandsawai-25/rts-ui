"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { fetchAllPaged } from "@/lib/utils/pagination-helpers";
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
}

export async function updateUseGroup(input: {
  id: number;
  code: string;
  name: string;
  icon: UseGroupIconKey;
  status: UseStatus;
}) {
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
}

export async function deleteUseGroup(id: string | number) {
  await deleteUseGroupApi(id);
  for (const locale of locales) {
    revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
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
}

export async function deleteUseType(id: string | number) {
  await deleteUseTypeApi(String(id));
  for (const locale of locales) {
    revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
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
}

export async function updateSubType(input: {
  id: number;
  typeId: number;
  description: string;
  searchSequence: number;
  status: UseStatus;
}) {
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
}

export async function deleteSubType(id: string | number) {
  await deleteSubTypeApi(String(id));
  for (const locale of locales) {
    revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
  }
}


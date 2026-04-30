
//-----------------------------------------------------------
"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
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
    createdBy: "1",
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
    updatedBy: "1",
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
  const pageSize = 2000; // Reasonable chunk size
  let page = 1;
  const allItems: UseType[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await getUseTypesPagedServer({
      pageNumber: page,
      pageSize,
      searchTerm,
    });

    const newItems = res.items || [];
    allItems.push(...newItems);

    if (newItems.length === 0 || allItems.length >= res.totalCount) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return {
    items: allItems,
    totalCount: allItems.length,
  };
}

// ✅ NEW: Helper to fetch ALL groups
export async function getAllUseGroups() {
  const pageSize = 1000;
  let page = 1;
  const allItems: UseGroup[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await getUseGroupsPagedServer({
      pageNumber: page,
      pageSize,
    });

    const newItems = res.items || [];
    allItems.push(...newItems);

    if (newItems.length === 0 || allItems.length >= res.totalCount) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return {
    items: allItems,
    totalCount: allItems.length,
  };
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
    createdBy: "1",
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
    updatedBy: "1",
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

// ✅ NEW: Delete Type AND its SubTypes
export async function deleteUseTypeWithSubTypes(typeId: number) {
  // 1. Fetch ALL sub-types for this type
  const pageSize = 1000;
  let page = 1;
  const allSubTypes: UseSubType[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await getSubTypesPagedServer({
      pageNumber: page,
      pageSize,
      typeOfUseId: typeId,
    });

    const newItems = res.items || [];
    allSubTypes.push(...newItems);

    if (newItems.length === 0 || allSubTypes.length >= res.totalCount) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // 2. Delete ALL sub-types
  await Promise.all(
    allSubTypes.map((sub) => deleteSubTypeApi(String(sub.subTypeOfUseId)))
  );

  // 3. Delete the parent Type
  await deleteUseTypeApi(String(typeId));

  // 4. Revalidate
  for (const locale of locales) {
    revalidatePath(`/${locale}/property-tax/typeofusemaster`, "page");
  }
}

// ✅ NEW: Delete Group AND its Types AND their SubTypes
export async function deleteUseGroupWithCascade(groupId: number) {
  // 1. Fetch ALL types for this group
  const pageSize = 1000;
  let page = 1;
  const allTypes: UseType[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await getUseTypesPagedServer({
      pageNumber: page,
      pageSize,
      typeOfUseGroupId: groupId,
    });

    const newItems = res.items || [];
    allTypes.push(...newItems);

    if (newItems.length === 0 || allTypes.length >= res.totalCount) {
      hasMore = false;
    } else {
      page++;
    }
  }

  // 2. Delete each type (and its sub-types) sequentially to avoid creating a large fan-out of concurrent delete requests.
  for (const type of allTypes) {
    await deleteUseTypeWithSubTypes(type.typeOfUseId);
  }

  // 3. Delete the Group itself
  await deleteUseGroupApi(groupId);

  // 4. Revalidate
  revalidatePath("/[locale]/property-tax/typeofusemaster", "page");
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
  const pageSize = 2000; // Reasonable chunk size
  let page = 1;
  const allItems: UseSubType[] = [];
  let hasMore = true;

  while (hasMore) {
    const res = await getSubTypesPagedServer({
      pageNumber: page,
      pageSize,
      typeOfUseId,
      searchTerm,
    });

    const newItems = res.items || [];
    allItems.push(...newItems);

    if (newItems.length === 0 || allItems.length >= res.totalCount) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return {
    items: allItems,
    totalCount: allItems.length,
  };
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
    createdBy: "1",
  });

  revalidatePath("/[locale]/property-tax/typeofusemaster", "page");
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
    updatedBy: "1",
  });

  revalidatePath("/[locale]/property-tax/typeofusemaster", "page");
}

export async function deleteSubType(id: string | number) {
  await deleteSubTypeApi(String(id));
  revalidatePath("/[locale]/property-tax/typeofusemaster", "page");
}


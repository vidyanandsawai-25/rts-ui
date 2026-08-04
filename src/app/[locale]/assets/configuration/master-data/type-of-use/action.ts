"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import {
  getTypeOfUseGroupsPaged,
  getTypeOfUseGroupsAllActive,
  getTypeOfUseGroupById,
  createTypeOfUseGroup,
  updateTypeOfUseGroup,
  deleteTypeOfUseGroup,
  getAssetTypeOfUses,
  getAssetTypeOfUseById,
  createAssetTypeOfUse,
  updateAssetTypeOfUse,
  deleteAssetTypeOfUse,
  getAssetSubTypeOfUses,
  getAssetSubTypeOfUseById,
  createAssetSubTypeOfUse,
  updateAssetSubTypeOfUse,
  deleteAssetSubTypeOfUse,
  getAssetTypeOfUsesAllActive,
  getAssetTypeOfUsesPaged,
  getAssetSubTypeOfUsesPaged,
} from "@/lib/api/asset-masters/type-of-use.service";
import { ApiError } from "@/lib/utils/api";
import {
  TypeOfUseGroup,
  TypeOfUseGroupFormModel,
  AssetTypeOfUse,
  AssetTypeOfUseFormModel,
  AssetSubTypeOfUse,
  AssetSubTypeOfUseFormModel,
} from "@/types/asset-masters/type-of-use.types";
import { PagedResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { createLogger } from "@/lib/utils/server-logger";
import { getAssetCategories, getAssetTypes } from "@/lib/api/asset-masters/asset-photo-crud.service";

const logger = createLogger("TypeOfUseGroupActions");

function revalidateTypeOfUseRoutes() {
  for (const locale of locales) {
    revalidatePath(`/${locale}/assets/configuration/master-data/type-of-use`, "page");
  }
}

// ==========================================
// TYPE OF USE GROUP ACTIONS
// ==========================================

export async function fetchTypeOfUseGroupsPagedAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<TypeOfUseGroup>> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      throw new ApiError(401, "you are unauthorized", "Unauthorized");
    }
    const MAX_PAGE_SIZE = 100;
    const MAX_PAGE_NUMBER = 10000;
    if (
      !Number.isFinite(pageNumber) ||
      !Number.isFinite(pageSize) ||
      pageNumber <= 0 ||
      (pageSize <= 0 && pageSize !== -1) ||
      (pageSize > MAX_PAGE_SIZE && pageSize !== -1) ||
      pageNumber > MAX_PAGE_NUMBER
    ) {
      throw new ApiError(400, "Invalid pagination parameters", "Validation failed");
    }

    const allowedSortColumns = ["typeOfUseGroupCode", "groupName"];
    const validSortBy = sortBy && allowedSortColumns.includes(sortBy) ? sortBy : undefined;
    const validSortOrder = sortOrder && ["asc", "desc"].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : undefined;

    return await getTypeOfUseGroupsPaged(pageNumber, pageSize, searchTerm, validSortBy, validSortOrder);
  } catch (error: unknown) {
    logger.error("Failed to fetch Type of Use Groups paged", { pageNumber, pageSize, searchTerm, sortBy, sortOrder }, error);
    throw error;
  }
}

export async function getTypeOfUseGroupDropdownAction(includeGroupId?: number): Promise<TypeOfUseGroup[]> {
  try {
    const list = await getTypeOfUseGroupsAllActive();
    if (includeGroupId && includeGroupId > 0 && !list.some((g) => g.id === includeGroupId)) {
      const extraGroup = await getTypeOfUseGroupById(includeGroupId);
      if (extraGroup) {
        return [extraGroup, ...list];
      }
    }
    return list;
  } catch (error) {
    logger.error("Failed to fetch Type of Use Group dropdown options", { includeGroupId }, error);
    throw error;
  }
}

export async function createTypeOfUseGroupAction(
  data: TypeOfUseGroupFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return { success: false, message: "you are unauthorized", statusCode: 401 };
    }
    data.createdBy = userId;
    const msg = await createTypeOfUseGroup(data);
    revalidateTypeOfUseRoutes();
    return { success: true, message: msg };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to create Type of Use Group" };
  }
}

export async function updateTypeOfUseGroupAction(
  data: TypeOfUseGroupFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return { success: false, message: "you are unauthorized", statusCode: 401 };
    }
    data.updatedBy = userId;
    const msg = await updateTypeOfUseGroup(data);
    revalidateTypeOfUseRoutes();
    return { success: true, message: msg };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update Type of Use Group" };
  }
}

export async function deleteTypeOfUseGroupAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const cookieStore = await cookies();
  const userId = getUserIdFromCookies(cookieStore);
  if (!userId) return { success: false, message: "you are unauthorized", statusCode: 401 };

  const rawId = formData.get("id");
  const numericId = Number(rawId);

  if (rawId == null || !Number.isInteger(numericId) || numericId <= 0) {
    return { success: false, message: "Valid Group ID is required", statusCode: 400 };
  }

  try {
    await deleteTypeOfUseGroup(numericId);
    revalidateTypeOfUseRoutes();
    return { success: true, message: "Type of Use Group deleted successfully" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: "Failed to delete Type of Use Group" };
  }
}

export async function fetchTypeOfUseGroupByIdAction(id: number): Promise<TypeOfUseGroup> {
  try {
    const numericId = Number(id);
    if (id == null || !Number.isInteger(numericId) || numericId <= 0) {
      throw new ApiError(400, "Valid Group ID is required", "Validation failed");
    }
    const result = await getTypeOfUseGroupById(numericId);
    if (!result) {
      throw new ApiError(404, "Type of Use Group not found", "Not Found");
    }
    return result;
  } catch (error) {
    logger.error("Failed to fetch Type of Use Group by ID", { id }, error);
    throw error;
  }
}

// ==========================================
// ASSET TYPE OF USE ACTIONS
// ==========================================

export async function fetchAssetTypeOfUsesAction(
  typeOfUseGroupId: number,
  isActive?: boolean
): Promise<AssetTypeOfUse[]> {
  try {
    return await getAssetTypeOfUses(typeOfUseGroupId, isActive);
  } catch (error) {
    logger.error("Failed to fetch Asset Type of Uses", { typeOfUseGroupId }, error);
    throw error;
  }
}

export async function fetchAssetTypeOfUseByIdAction(id: number): Promise<AssetTypeOfUse> {
  try {
    const numericId = Number(id);
    if (id == null || !Number.isInteger(numericId) || numericId <= 0) {
      throw new ApiError(400, "Valid Type ID is required", "Validation failed");
    }
    const result = await getAssetTypeOfUseById(numericId);
    if (!result) {
      throw new ApiError(404, "Asset Type of Use not found", "Not Found");
    }
    return result;
  } catch (error) {
    logger.error("Failed to fetch Asset Type of Use by ID", { id }, error);
    throw error;
  }
}

export async function createAssetTypeOfUseAction(
  data: AssetTypeOfUseFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return { success: false, message: "you are unauthorized", statusCode: 401 };
    }
    data.createdBy = userId;
    const msg = await createAssetTypeOfUse(data);
    revalidateTypeOfUseRoutes();
    return { success: true, message: msg };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to create Asset Type of Use" };
  }
}

export async function updateAssetTypeOfUseAction(
  data: AssetTypeOfUseFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return { success: false, message: "you are unauthorized", statusCode: 401 };
    }
    data.updatedBy = userId;
    const msg = await updateAssetTypeOfUse(data);
    revalidateTypeOfUseRoutes();
    return { success: true, message: msg };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update Asset Type of Use" };
  }
}

export async function deleteAssetTypeOfUseAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const cookieStore = await cookies();
  const userId = getUserIdFromCookies(cookieStore);
  if (!userId) return { success: false, message: "you are unauthorized", statusCode: 401 };

  const rawId = formData.get("id");
  const numericId = Number(rawId);

  if (rawId == null || !Number.isInteger(numericId) || numericId <= 0) {
    return { success: false, message: "Valid Type ID is required", statusCode: 400 };
  }

  try {
    await deleteAssetTypeOfUse(numericId);
    revalidateTypeOfUseRoutes();
    return { success: true, message: "Asset Type of Use deleted successfully" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: "Failed to delete Asset Type of Use" };
  }
}

// ==========================================
// ASSET SUB-TYPE OF USE ACTIONS
// ==========================================

export async function fetchAssetSubTypeOfUsesAction(
  typeOfUseId: number,
  isActive?: boolean
): Promise<AssetSubTypeOfUse[]> {
  try {
    return await getAssetSubTypeOfUses(typeOfUseId, isActive);
  } catch (error) {
    logger.error("Failed to fetch Asset Sub-Type of Uses", { typeOfUseId }, error);
    throw error;
  }
}

export async function fetchAssetSubTypeOfUseByIdAction(id: number): Promise<AssetSubTypeOfUse> {
  try {
    const numericId = Number(id);
    if (id == null || !Number.isInteger(numericId) || numericId <= 0) {
      throw new ApiError(400, "Valid Sub-Type ID is required", "Validation failed");
    }
    const result = await getAssetSubTypeOfUseById(numericId);
    if (!result) {
      throw new ApiError(404, "Asset Sub-Type of Use not found", "Not Found");
    }
    return result;
  } catch (error) {
    logger.error("Failed to fetch Asset Sub-Type of Use by ID", { id }, error);
    throw error;
  }
}

export async function createAssetSubTypeOfUseAction(
  data: AssetSubTypeOfUseFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return { success: false, message: "you are unauthorized", statusCode: 401 };
    }
    data.createdBy = userId;
    const msg = await createAssetSubTypeOfUse(data);
    revalidateTypeOfUseRoutes();
    return { success: true, message: msg };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to create Asset Sub-Type of Use" };
  }
}

export async function updateAssetSubTypeOfUseAction(
  data: AssetSubTypeOfUseFormModel
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      return { success: false, message: "you are unauthorized", statusCode: 401 };
    }
    data.updatedBy = userId;
    const msg = await updateAssetSubTypeOfUse(data);
    revalidateTypeOfUseRoutes();
    return { success: true, message: msg };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Failed to update Asset Sub-Type of Use" };
  }
}

export async function deleteAssetSubTypeOfUseAction(
  formData: FormData
): Promise<{ success: boolean; message?: string; statusCode?: number }> {
  const cookieStore = await cookies();
  const userId = getUserIdFromCookies(cookieStore);
  if (!userId) return { success: false, message: "you are unauthorized", statusCode: 401 };

  const rawId = formData.get("id");
  const numericId = Number(rawId);

  if (rawId == null || !Number.isInteger(numericId) || numericId <= 0) {
    return { success: false, message: "Valid Sub-Type ID is required", statusCode: 400 };
  }

  try {
    await deleteAssetSubTypeOfUse(numericId);
    revalidateTypeOfUseRoutes();
    return { success: true, message: "Asset Sub-Type of Use deleted successfully" };
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, message: error.responseText, statusCode: error.statusCode };
    }
    return { success: false, message: "Failed to delete Asset Sub-Type of Use" };
  }
}

// ==========================================
// COMMON DROPDOWN ACTIONS
// ==========================================

export async function getAssetCategoriesAction() {
  try {
    return await getAssetCategories();
  } catch (error) {
    logger.error("Failed to fetch asset categories", {}, error);
    throw error;
  }
}

export async function getAssetTypesByCategoryAction(assetCategoryId?: number) {
  try {
    return await getAssetTypes(assetCategoryId);
  } catch (error) {
    logger.error("Failed to fetch asset types by category", { assetCategoryId }, error);
    throw error;
  }
}

export async function getAssetTypeOfUseDropdownAction(includeTypeId?: number): Promise<AssetTypeOfUse[]> {
  try {
    const list = await getAssetTypeOfUsesAllActive();
    if (includeTypeId && includeTypeId > 0 && !list.some((t) => t.id === includeTypeId)) {
      const extraType = await getAssetTypeOfUseById(includeTypeId);
      if (extraType) {
        return [extraType, ...list];
      }
    }
    return list;
  } catch (error) {
    logger.error("Failed to fetch Asset Type of Use dropdown options", { includeTypeId }, error);
    throw error;
  }
}

export async function fetchAssetTypeOfUsesPagedAction(
  pageNumber: number,
  pageSize: number,
  typeOfUseGroupId: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<AssetTypeOfUse>> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      throw new ApiError(401, "you are unauthorized", "Unauthorized");
    }
    return await getAssetTypeOfUsesPaged(pageNumber, pageSize, typeOfUseGroupId, searchTerm, sortBy, sortOrder);
  } catch (error) {
    logger.error("Failed to fetch Asset Type of Uses paged", { typeOfUseGroupId }, error);
    throw error;
  }
}

export async function fetchAssetSubTypeOfUsesPagedAction(
  pageNumber: number,
  pageSize: number,
  typeOfUseId: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<AssetSubTypeOfUse>> {
  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore);
    if (!userId) {
      throw new ApiError(401, "you are unauthorized", "Unauthorized");
    }
    return await getAssetSubTypeOfUsesPaged(pageNumber, pageSize, typeOfUseId, searchTerm, sortBy, sortOrder);
  } catch (error) {
    logger.error("Failed to fetch Asset Sub-Type of Uses paged", { typeOfUseId }, error);
    throw error;
  }
}

export async function getTypeOfUseDashboardProps(
  action: string | undefined,
  editId: number | null,
  search: {
    selectedGroupId?: string;
    selectedTypeOfUseId?: string;
    typePn?: string;
    typePs?: string;
    typeSearch?: string;
    subTypePn?: string;
    subTypePs?: string;
    subTypeSearch?: string;
    assetCategoryId?: string;
    [key: string]: string | undefined;
  }
) {
  const cookieStore = await cookies();
  const userId = getUserIdFromCookies(cookieStore);
  if (!userId) {
    throw new ApiError(401, "you are unauthorized", "Unauthorized");
  }

  const groupsResult = await fetchTypeOfUseGroupsPagedAction(1, -1);

  let selectedGroupId = search.selectedGroupId ? Number(search.selectedGroupId) : null;
  if (selectedGroupId && !Number.isFinite(selectedGroupId)) {
    selectedGroupId = null;
  }

  let selectedTypeOfUseId = search.selectedTypeOfUseId ? Number(search.selectedTypeOfUseId) : null;
  if (selectedTypeOfUseId && !Number.isFinite(selectedTypeOfUseId)) {
    selectedTypeOfUseId = null;
  }

  const typePn = Number(search.typePn || 1);
  const typePs = Number(search.typePs || 10);
  const typeSearch = search.typeSearch || undefined;
  const typeSortBy = search.typeSortBy || undefined;
  const typeSortOrder = search.typeSortOrder || undefined;

  const typesResult = await getAssetTypeOfUsesPaged(
    typePn,
    typePs,
    selectedGroupId || undefined,
    typeSearch,
    typeSortBy,
    typeSortOrder
  );

  // Preselect the first type of use if not specified in search params, so server fetches sub-types for it
  if (!selectedTypeOfUseId && typesResult.items.length > 0) {
    selectedTypeOfUseId = typesResult.items[0].id;
  }

  const subTypePn = Number(search.subTypePn || 1);
  const subTypePs = Number(search.subTypePs || 10);
  const subTypeSearch = search.subTypeSearch || undefined;
  const subTypeSortBy = search.subTypeSortBy || undefined;
  const subTypeSortOrder = search.subTypeSortOrder || undefined;

  let subTypesResult: PagedResponse<AssetSubTypeOfUse> = { items: [], pageNumber: 1, pageSize: 10, totalCount: 0, totalPages: 0, hasPrevious: false, hasNext: false };
  if (selectedTypeOfUseId) {
    subTypesResult = await getAssetSubTypeOfUsesPaged(
      subTypePn,
      subTypePs,
      selectedTypeOfUseId,
      subTypeSearch,
      subTypeSortBy,
      subTypeSortOrder
    );
  }

  let categories: { id: number; name: string }[] = [];
  let dropdownGroups: { id: number; name: string }[] = [];
  let typeOfUses: { id: number; name: string }[] = [];
  let types: { id: number; name: string }[] = [];
  let initialTypeData: AssetTypeOfUse | undefined;
  let initialSubtypeData: AssetSubTypeOfUse | undefined;

  let assetCategoryId = search.assetCategoryId ? Number(search.assetCategoryId) : null;
  if (assetCategoryId && !Number.isFinite(assetCategoryId)) {
    assetCategoryId = null;
  }

  const promises: Promise<void>[] = [];

  if (action === "addType" || action === "editType") {
    promises.push(
      getAssetCategories().then((res) => {
        categories = res.map((c) => ({ id: c.id, name: c.categoryName }));
      })
    );
    promises.push(
      getTypeOfUseGroupsAllActive().then((res) => {
        dropdownGroups = res.map((g) => ({ id: g.id, name: g.groupName }));
      })
    );

    if (action === "editType" && editId) {
      promises.push(
        getAssetTypeOfUseById(editId).then(async (res) => {
          initialTypeData = res ?? undefined;
          const catId = assetCategoryId || res?.assetCategoryId;
          if (catId) {
            const typesData = await getAssetTypes(catId);
            types = typesData.map((t) => ({ id: t.id, name: t.typeName }));
          }
        })
      );
    } else {
      if (action === "addType" && selectedGroupId) {
        initialTypeData = {
          typeOfUseGroupId: selectedGroupId,
        } as AssetTypeOfUse;
      }
      const catId = assetCategoryId || (initialTypeData?.assetCategoryId);
      if (catId) {
        promises.push(
          getAssetTypes(catId).then((res) => {
            types = res.map((t) => ({ id: t.id, name: t.typeName }));
          })
        );
      }
    }
  }

  if (action === "addSubtype" || action === "editSubtype") {
    if (action === "editSubtype" && editId) {
      promises.push(
        getAssetSubTypeOfUseById(editId).then(async (res) => {
          initialSubtypeData = res ?? undefined;
          const typesData = await getAssetTypeOfUsesAllActive();
          typeOfUses = typesData.map((t) => ({
            id: t.id,
            name: `${t.typeOfCode || t.typeOfUseCode} - ${t.description}`,
          }));
        })
      );
    } else {
      promises.push(
        getAssetTypeOfUsesAllActive().then((res) => {
          typeOfUses = res.map((t) => ({
            id: t.id,
            name: `${t.typeOfCode || t.typeOfUseCode} - ${t.description}`,
          }));
        })
      );
      if (action === "addSubtype" && selectedTypeOfUseId) {
        initialSubtypeData = {
          typeOfUseId: selectedTypeOfUseId,
        } as AssetSubTypeOfUse;
      }
    }
  }

  await Promise.all(promises);

  return {
    groups: groupsResult.items,
    selectedGroupId,
    selectedTypeOfUseId,
    groupPageNumber: groupsResult.pageNumber,
    groupPageSize: groupsResult.pageSize,
    groupTotalCount: groupsResult.totalCount,
    groupTotalPages: groupsResult.totalPages,

    types: typesResult.items,
    typePageNumber: typesResult.pageNumber,
    typePageSize: typesResult.pageSize,
    typeTotalCount: typesResult.totalCount,
    typeTotalPages: typesResult.totalPages,

    subtypes: subTypesResult.items,
    subTypePageNumber: subTypesResult.pageNumber,
    subTypePageSize: subTypesResult.pageSize,
    subTypeTotalCount: subTypesResult.totalCount,
    subTypeTotalPages: subTypesResult.totalPages,

    action,
    editId,
    categories,
    dropdownGroups,
    typeOfUses,
    initialTypeData,
    initialSubtypeData,
    dropdownTypes: types,
  };
}


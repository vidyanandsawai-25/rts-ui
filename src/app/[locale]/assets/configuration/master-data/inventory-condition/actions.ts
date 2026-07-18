"use server";

import { inventoryConditionService } from "@/lib/api/asset-masters/inventory-condition.service";
import { inventoryCategoryService } from "@/lib/api/asset-masters/inventory-category.service";
import { revalidatePath } from "next/cache";
import { InventoryConditionFormModel, InventoryConditionCategory, AssetConditionCategory } from "@/types/asset-masters/inventory-condition.types";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { cookies } from "next/headers";
import { createLogger } from "@/lib/utils/server-logger";
import { handleActionError } from "@/lib/utils/asset-utils/actions.utils";

const logger = createLogger("InventoryCondition");

export async function fetchInventoryConditionPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm: string,
  sortBy: string,
  sortOrder: "asc" | "desc"
) {
  try {
    const response = await inventoryConditionService.getAll({
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchTerm: searchTerm,
      SortBy: sortBy,
      SortOrder: sortOrder
    });
    
    return {
      items: response.items,
      totalCount: response.totalCount,
      pageNumber: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
  } catch (error) {
    logger.error("Error fetching inventory conditions:", { operation: "fetchInventoryConditionPagedServerAction" }, error);
    return { items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 };
  }
}

export async function getInventoryConditionCategoriesAction(): Promise<InventoryConditionCategory[]> {
  try {
    const res = await inventoryCategoryService.getAll({ PageNumber: 1, PageSize: 1000 });
    return res.items.map(item => ({
      id: item.id,
      categoryName: item.typeName || "",
    }));
  } catch (error) {
    logger.error("Error fetching inventory condition categories:", { operation: "getInventoryConditionCategoriesAction" }, error);
    return [];
  }
}

export async function getAssetCategoriesForConditionAction(): Promise<AssetConditionCategory[]> {
  try {
    const res = await inventoryCategoryService.getAll({ PageNumber: 1, PageSize: 1000 });
    return res.items.map(item => ({
      id: item.id,
      categoryName: item.typeName || "",
    }));
  } catch (error) {
    logger.error("Error fetching asset condition categories:", { operation: "getAssetCategoriesForConditionAction" }, error);
    return [];
  }
}

export async function createInventoryConditionAction(formData: InventoryConditionFormModel) {
  try {
    const userId = getUserIdFromCookies(await cookies()) ?? 1;
    const result = await inventoryConditionService.create({
      inventoryItemCategoryId: formData.inventoryItemCategoryId,
      conditionName: formData.conditionName,
      conditionFactor: formData.conditionFactor as number,
      description: formData.description,
      displayOrder: 1,
      isActive: formData.isActive,
      createdBy: userId,
      updatedBy: userId,
      conditionType: formData.conditionType,
    });
    const { locales } = await import("@/i18n/config");
    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/inventory-condition`, "page");
    }
    return { success: true, createdId: result.id };
  } catch (error) {
    return handleActionError(error, "messages.createFailed");
  }
}

export async function updateInventoryConditionAction(formData: InventoryConditionFormModel) {
  try {
    if (!formData.id) throw new Error("ID is required for update");
    const userId = getUserIdFromCookies(await cookies()) ?? 1;
    
    const result = await inventoryConditionService.update(formData.id, {
      inventoryItemCategoryId: formData.inventoryItemCategoryId,
      conditionName: formData.conditionName,
      conditionFactor: formData.conditionFactor as number,
      description: formData.description,
      displayOrder: 1,
      isActive: formData.isActive,
      updatedBy: userId,
      conditionType: formData.conditionType,
    });
    const { locales } = await import("@/i18n/config");
    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/inventory-condition`, "page");
    }
    return { success: true, updatedId: result.id };
  } catch (error) {
    return handleActionError(error, "messages.updateFailed");
  }
}

export async function deleteInventoryConditionAction(id: string) {
  try {
    await inventoryConditionService.delete(id);
    const { locales } = await import("@/i18n/config");
    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/inventory-condition`, "page");
    }
    return { success: true };
  } catch (error) {
    return handleActionError(error, "messages.deleteFailed");
  }
}

export async function getInventoryConditionByIdAction(id: string) {
  try {
    return await inventoryConditionService.getById(id);
  } catch (error) {
    logger.error("Error fetching condition by ID:", { operation: "getInventoryConditionByIdAction", id }, error);
    return null;
  }
}

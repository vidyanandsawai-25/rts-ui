"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { inventoryCategoryService } from "@/lib/api/asset-masters/inventory-category.service";
import { cleanErrorMessage } from "@/lib/utils/api-error-handler";
import { deduplicateErrorMessage } from "@/lib/utils/asset-utils/actions.utils";
import { ApiError } from "@/lib/utils/api";
import { createLogger } from "@/lib/utils/server-logger";

const logger = createLogger("InventoryCategory");

export async function saveInventoryCategoryAction(id: string, formData: FormData) {
  try {
    const userId = getUserIdFromCookies(await cookies());
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }
    const isEdit = !!id;

    const rawGroupId = Number(formData.get("group"));
    if (!Number.isFinite(rawGroupId) || rawGroupId <= 0) {
      return { ok: false, error: "invalid_assetCategoryId" };
    }
    const assetCategoryId = rawGroupId;

    const record = {
      typeCode: formData.get("code") as string,
      typeName: formData.get("name") as string,
      assetCategoryId,
      depreciationRate: Number(formData.get("depreciationRate") || 0.1),
      description: formData.get("description") as string,
      displayOrder: Number(formData.get("displayOrder") || 1),
      isActive: formData.get("isActive") === "true",
      updatedBy: userId,
    };

    if (isEdit) {
      await inventoryCategoryService.update(id, record);
    } else {
      await inventoryCategoryService.create({ ...record, createdBy: userId });
    }


    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/inventory-category`, "page");
    }

    return { ok: true, mode: isEdit ? "update" : "create" };
  } catch (error: unknown) {
    const rawMessage = error instanceof ApiError ? (error.error || error.responseText) : error instanceof Error ? error.message : String(error);
    const errMessage = deduplicateErrorMessage(cleanErrorMessage(rawMessage, "Failed to save inventory category"));
    if (errMessage.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "duplicate" };
    }
    return { ok: false, error: errMessage };
  }
}

export async function deleteInventoryCategoryAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const userId = getUserIdFromCookies(await cookies());

    if (userId == null) {
      return { ok: false, error: "Unauthorized" };
    }

    await inventoryCategoryService.delete(id);

    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/inventory-category`, "page");
    }

    return { ok: true };
  } catch (error: unknown) {
    const rawMessage = error instanceof ApiError ? (error.error || error.responseText) : error instanceof Error ? error.message : String(error);
    const errMessage = deduplicateErrorMessage(cleanErrorMessage(rawMessage, "Failed to delete inventory category"));
    return { ok: false, error: errMessage };
  }
}

export async function getInventoryCategoryByIdAction(id: string | number) {
  try {
    const rawRecord = await inventoryCategoryService.getById(String(id));
    if (!rawRecord) return null;
    return {
      id: String(rawRecord.id),
      code: rawRecord.typeCode || "",
      name: rawRecord.typeName || "",
      group: String(rawRecord.assetCategoryId || (rawRecord as unknown as Record<string, unknown>).categoryId || ""),
      description: rawRecord.description || "",
      depreciationRate: rawRecord.depreciationRate ? String(rawRecord.depreciationRate) : "",
      isActive: rawRecord.isActive ?? true,
    };
  } catch (error) {
    logger.error("Failed to fetch inventory category by ID", { id: String(id) }, error);
    return null;
  }
}

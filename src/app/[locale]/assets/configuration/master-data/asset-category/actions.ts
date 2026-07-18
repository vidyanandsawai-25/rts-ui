"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { assetCategoryService } from "@/lib/api/asset-masters/asset-category-crud.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { cleanErrorMessage } from "@/lib/utils/api-error-handler";
import { createLogger } from "@/lib/utils/server-logger";

const logger = createLogger("AssetCategory");

export async function saveAssetCategoryAction(id: string, formData: FormData) {
  try {
    const userId = getUserIdFromCookies(await cookies()) ?? 0;
    const isEdit = !!id;

    const record = {
      categoryCode: formData.get("code") as string,
      categoryName: formData.get("name") as string,
      description: formData.get("description") as string,
      isMovable: formData.get("isMovable") === "true",
      hasFloorDetails: formData.get("hasFloorDetails") === "true",
      hasInventory: formData.get("hasInventory") === "true",
      isInventoryMandatory: formData.get("isInventoryMandatory") === "true",
      hasLegalCompliance: formData.get("hasLegalCompliance") === "true",
      valuationType: formData.get("valuationType") as string,
      isActive: formData.get("isActive") === "true",
      status: (formData.get("isActive") === "true") ? "Active" : "Inactive"
    };

    if (isEdit) {
      await assetCategoryService.update(id, { ...record, id: Number(id), updatedBy: userId });
    } else {
      await assetCategoryService.create({ ...record, createdBy: userId });
    }


    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/asset-category`, "page");
    }

    return { ok: true, mode: isEdit ? "update" : "create" };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (errMessage.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "duplicate" };
    }
    return { ok: false, error: cleanErrorMessage(errMessage, "Failed to save asset category") };
  }
}

export async function deleteAssetCategoryAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const userId = getUserIdFromCookies(await cookies());

    if (userId == null) {
      return { ok: false, error: "Unauthorized" };
    }

    await assetCategoryService.delete(id, userId);

    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/asset-category`, "page");
    }

    return { ok: true };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { ok: false, error: cleanErrorMessage(errMessage, "Failed to delete asset category") };
  }
}

export async function getAssetCategoryByIdAction(id: string | number) {
  try {
    const rawRecord = await assetCategoryService.getById(String(id));
    if (!rawRecord) return null;
    return {
      id: String(rawRecord.id),
      code: rawRecord.categoryCode,
      name: rawRecord.categoryName,
      description: rawRecord.description,
      isMovable: Boolean(rawRecord.isMovable),
      hasFloorDetails: Boolean(rawRecord.hasFloorDetails),
      hasInventory: Boolean(rawRecord.hasInventory),
      isInventoryMandatory: Boolean(rawRecord.isInventoryMandatory),
      hasLegalCompliance: Boolean(rawRecord.hasLegalCompliance),
      valuationType: rawRecord.valuationType || "",
      isActive: rawRecord.isActive,
    };
  } catch (error) {
    logger.error("Failed to fetch asset category by ID", { id: String(id) }, error);
    return null;
  }
}

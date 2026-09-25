"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { assetCategoryService } from "@/lib/api/asset-masters/asset-category-crud.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { cleanErrorMessage } from "@/lib/utils/api-error-handler";
import { createLogger } from "@/lib/utils/server-logger";
import { ApiError } from "@/lib/utils/api";

const logger = createLogger("AssetCategory");

export async function saveAssetCategoryAction(id: string, formData: FormData) {
  try {
    const userId = getUserIdFromCookies(await cookies());
    if (!userId) {
      return { ok: false, error: "Unauthorized" };
    }
    const isEdit = !!id;

    const record = {
      categoryCode: (formData.get("code") as string)?.trim() || "",
      categoryName: (formData.get("name") as string)?.trim() || "",
      description: (formData.get("description") as string)?.trim() || "",
      isMovable: formData.get("isMovable") === "true",
      hasFloorDetails: formData.get("hasFloorDetails") === "true",
      hasInventory: formData.get("hasInventory") === "true",
      isInventoryMandatory: formData.get("isInventoryMandatory") === "true",
      hasLegalCompliance: formData.get("hasLegalCompliance") === "true",
      valuationType: (formData.get("valuationType") as string)?.trim() || "",
      isActive: formData.get("isActive") === "true",
      status: (formData.get("isActive") === "true") ? "Active" : "Inactive"
    };

    if (!record.categoryCode) {
      return { ok: false, error: "Category code is required", field: "code" };
    }
    if (!record.categoryName) {
      return { ok: false, error: "Category name is required", field: "name" };
    }
    if (!record.valuationType) {
      return { ok: false, error: "Valuation type is required", field: "valuationType" };
    }
    if (record.categoryCode.length > 20) {
      return { ok: false, error: "Category code cannot exceed 20 characters", field: "code" };
    }
    if (record.valuationType.length > 20) {
      return { ok: false, error: "Valuation type cannot exceed 20 characters", field: "valuationType" };
    }
    if (!/^[A-Z0-9 \-_]+$/i.test(record.valuationType)) {
      return { ok: false, error: "Invalid characters in valuation type", field: "valuationType" };
    }

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
    const rawMsg = error instanceof ApiError
      ? (error.responseText || error.message)
      : (error instanceof Error ? error.message : String(error));
    if (rawMsg.toLowerCase().includes("duplicate") || rawMsg.toLowerCase().includes("already exists")) {
      const isCodeDup = rawMsg.includes("CategoryCode") || rawMsg.toLowerCase().includes("categorycode");
      const isNameDup = rawMsg.includes("CategoryName") || rawMsg.toLowerCase().includes("categoryname");
      const field = (isCodeDup && !isNameDup) ? "code" : (isNameDup && !isCodeDup ? "name" : "both");
      return { ok: false, error: "duplicate", field, message: rawMsg };
    }
    if (rawMsg.includes("ValuationType_MaxLengthExceeded_20") || (rawMsg.toLowerCase().includes("valuationtype") && rawMsg.toLowerCase().includes("maxlength"))) {
      return { ok: false, error: "Valuation type cannot exceed 20 characters", field: "valuationType" };
    }
    return { ok: false, error: cleanErrorMessage(rawMsg, "Failed to save asset category") };
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

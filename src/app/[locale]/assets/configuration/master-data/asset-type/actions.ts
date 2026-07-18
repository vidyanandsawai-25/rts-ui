"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { assetTypeService } from "@/lib/api/asset-masters/asset-type-crud.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { cleanErrorMessage } from "@/lib/utils/api-error-handler";
import { createLogger } from "@/lib/utils/server-logger";

const logger = createLogger("AssetType");

export async function saveAssetTypeAction(id: string, formData: FormData) {
  try {
    const userId = getUserIdFromCookies(await cookies()) ?? 0;
    const isEdit = !!id;

    const record = {
      typeCode: formData.get("code") as string,
      typeName: formData.get("name") as string,
      categoryId: Number(formData.get("group")),
      assetCategoryId: Number(formData.get("group")),
      codeFormat: "ALPHANUMERIC",
      description: formData.get("description") as string,
      allowUnitRegistration: formData.get("allowUnitRegistration") === "true",
      allowRoomRegistration: formData.get("allowRoomRegistration") === "true",
      isActive: formData.get("isActive") === "true",
      status: (formData.get("isActive") === "true") ? "Active" : "Inactive"
    };

    if (isEdit) {
      await assetTypeService.update(id, { ...record, id: Number(id), updatedBy: userId });
    } else {
      await assetTypeService.create({ ...record, createdBy: userId });
    }


    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/asset-type`, "page");
    }
    
    return { ok: true, mode: isEdit ? "update" : "create" };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    if (errMessage.toLowerCase().includes("duplicate")) {
      return { ok: false, error: "duplicate" };
    }
    return { ok: false, error: cleanErrorMessage(errMessage, "Failed to save asset type") };
  }
}

export async function deleteAssetTypeAction(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const userId = getUserIdFromCookies(await cookies());

    if (userId == null) {
      return { ok: false, error: "Unauthorized" };
    }

    await assetTypeService.delete(id, userId);

    for (const locale of locales) {
      revalidatePath(`/${locale}/assets/configuration/master-data/asset-type`, "page");
    }

    return { ok: true };
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return { ok: false, error: cleanErrorMessage(errMessage, "Failed to delete asset type") };
  }
}

export async function getAssetTypeByIdAction(id: string | number) {
  try {
    return await assetTypeService.getById(String(id));
  } catch (error) {
    logger.error("Failed to fetch asset type by ID", { id: String(id) }, error);
    return null;
  }
}

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { ApiError } from "@/lib/utils/api";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import {
  deleteGstMaster,
  getGstMasterById,
  getGstMastersPaged,
  createGstMaster,
  updateGstMaster,
} from "@/lib/api/asset-masters/gst-master.service";
import type { GstMaster, GstMasterFormModel } from "@/types/asset-masters/gst-master.types";
import type { PagedResponse } from "@/types/common.types";

const PAGE_PATH = "/assets/configuration/master-data/gst-master";

export async function fetchGstMasterPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<GstMaster>> {
  return getGstMastersPaged(pageNumber, pageSize, searchTerm, sortBy, sortOrder);
}

export async function getGstMasterByIdAction(id: number | string): Promise<GstMaster> {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new ApiError(400, "Valid GST master ID is required", "Validation failed");
  }

  const result = await getGstMasterById(numericId);
  if (!result) throw new ApiError(404, "GST master not found", "Not Found");
  return result;
}

export async function saveGstMaster(id: string, formData: FormData) {
  let locale: string;
  let taxCode: string;
  let taxName: string;
  let taxPercentageRaw: string;
  let effectiveFromDate: string;

  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;

    locale = String(formData.get("locale") ?? "").trim();
    if (!locale) return { ok: false, error: "invalid_locale" };

    taxCode = String(formData.get("taxCode") ?? "").trim();
    taxName = String(formData.get("taxName") ?? "").trim();
    taxPercentageRaw = String(formData.get("taxPercentage") ?? "").trim();
    effectiveFromDate = String(formData.get("effectiveFromDate") ?? "").trim();

    if (taxCode === "") return { ok: false, error: "invalid_taxCode" };
    if (taxName === "") return { ok: false, error: "invalid_taxName" };
    if (taxPercentageRaw === "") return { ok: false, error: "invalid_taxPercentage" };
    if (effectiveFromDate === "") return { ok: false, error: "invalid_effectiveFromDate" };

    const taxPercentage = Number(taxPercentageRaw);
    if (!Number.isFinite(taxPercentage) || taxPercentage < 0 || taxPercentage > 100) return { ok: false, error: "invalid_taxPercentage" };

    const effectiveToDateRaw = String(formData.get("effectiveToDate") ?? "").trim();
    if (effectiveToDateRaw === "") return { ok: false, error: "invalid_effectiveToDate" };

    const from = new Date(effectiveFromDate);
    const to = new Date(effectiveToDateRaw);
    if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || to < from) {
      return { ok: false, error: "invalid_effectiveToDate" };
    }
    const isActive = String(formData.get("isActive") ?? "true").toLowerCase() === "true";

    let numericId: number | null = null;
    let isUpdate = false;

    if (id && id.trim() !== "") {
      numericId = Number(id);
      if (!Number.isFinite(numericId) || numericId <= 0) {
        return { ok: false, error: "invalid_id" };
      }
      isUpdate = true;
    }

    const payload: GstMasterFormModel = {
      id: numericId,
      taxCode,
      taxName,
      taxPercentage,
      effectiveFromDate,
      effectiveToDate: effectiveToDateRaw,
      isActive,
      createdBy: isUpdate ? undefined : userId,
      updatedBy: isUpdate ? userId : undefined,
    };

    if (isUpdate) {
      await updateGstMaster(payload);
      for (const loc of locales) revalidatePath(`/${loc}${PAGE_PATH}`, "page");
      return { ok: true, mode: "update" as const };
    }

    await createGstMaster(payload);
    for (const loc of locales) revalidatePath(`/${loc}${PAGE_PATH}`, "page");
    return { ok: true, mode: "create" as const };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 409) return { ok: false, error: "duplicate" };
    if (error instanceof ApiError) return { ok: false, error: "api_error", message: error.message };
    return { ok: false, error: "unknown", message: error instanceof Error ? error.message : "An unexpected error occurred." };
  }
}

export async function createGstMasterAction(data: GstMasterFormModel) {
  const payload = new FormData();
  payload.set("locale", "en");
  payload.set("taxCode", data.taxCode);
  payload.set("taxName", data.taxName);
  payload.set("taxPercentage", String(data.taxPercentage));
  payload.set("effectiveFromDate", data.effectiveFromDate || "");
  payload.set("effectiveToDate", data.effectiveToDate || "");
  payload.set("isActive", String(data.isActive));
  return saveGstMaster("", payload);
}

export async function updateGstMasterAction(data: GstMasterFormModel) {
  const payload = new FormData();
  payload.set("locale", "en");
  payload.set("taxCode", data.taxCode);
  payload.set("taxName", data.taxName);
  payload.set("taxPercentage", String(data.taxPercentage));
  payload.set("effectiveFromDate", data.effectiveFromDate || "");
  payload.set("effectiveToDate", data.effectiveToDate || "");
  payload.set("isActive", String(data.isActive));
  return saveGstMaster(String(data.id ?? ""), payload);
}

export async function deleteGstMasterAction(formData: FormData) {
  const id = Number(formData.get("id") ?? 0);
  if (!id) return { success: false, message: "Valid GST master ID is required", statusCode: 400 };
  try {
    await deleteGstMaster(id);
    for (const locale of locales) revalidatePath(`/${locale}${PAGE_PATH}`, "page");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.responseText, statusCode: error.statusCode };
    return { success: false, message: error instanceof Error ? error.message : "Delete GST master failed" };
  }
}

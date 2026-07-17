"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { ApiError } from "@/lib/utils/api";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import {
  deletePenaltyRule,
  getPenaltyRuleById,
  getPenaltyRulesPaged,
  createPenaltyRule,
  updatePenaltyRule,
} from "@/lib/api/asset-masters/penalty-rule-master.service";
import type { PenaltyRule, PenaltyRuleFormModel } from "@/types/asset-masters/penalty-rule-master.types";
import type { PagedResponse } from "@/types/common.types";

const PAGE_PATH = "/assets/configuration/master-data/penalty-rule-master";

export async function fetchPenaltyRuleMasterPagedServerAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  sortBy?: string,
  sortOrder?: string
): Promise<PagedResponse<PenaltyRule>> {
  return getPenaltyRulesPaged(pageNumber, pageSize, searchTerm, sortBy, sortOrder);
}

export async function getPenaltyRuleByIdAction(id: number | string): Promise<PenaltyRule> {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new ApiError(400, "Valid penalty rule master ID is required", "Validation failed");
  }

  const result = await getPenaltyRuleById(numericId);
  if (!result) throw new ApiError(404, "Penalty rule master not found", "Not Found");
  return result;
}

export async function savePenaltyRule(id: string, formData: FormData) {
  let locale: string;
  let penaltyCode: string;
  let penaltyName: string;
  let calculationType: string;
  let penaltyValueRaw: string;
  let gracePeriodDaysRaw: string;

  try {
    const cookieStore = await cookies();
    const userId = getUserIdFromCookies(cookieStore) || 1;

    locale = String(formData.get("locale") ?? "").trim();
    if (!locale || !locales.includes(locale as (typeof locales)[number])) return { ok: false, error: "invalid_locale" };

    penaltyCode = String(formData.get("penaltyCode") ?? "").trim();
    penaltyName = String(formData.get("penaltyName") ?? "").trim();
    calculationType = String(formData.get("calculationType") ?? "").trim();
    penaltyValueRaw = String(formData.get("penaltyValue") ?? "").trim();
    gracePeriodDaysRaw = String(formData.get("gracePeriodDays") ?? "").trim();

    if (penaltyCode === "") return { ok: false, error: "invalid_penaltyCode" };
    if (penaltyName === "") return { ok: false, error: "invalid_penaltyName" };
    const allowedCalculationTypes = ["Percentage", "FlatAmount", "PerDay"];
    if (calculationType === "" || !allowedCalculationTypes.includes(calculationType)) {
      return { ok: false, error: "invalid_calculationType" };
    }
    if (penaltyValueRaw === "") return { ok: false, error: "invalid_penaltyValue" };
    if (gracePeriodDaysRaw === "") return { ok: false, error: "invalid_gracePeriodDays" };

    const penaltyValue = Number(penaltyValueRaw);
    if (!Number.isFinite(penaltyValue) || penaltyValue < 0) return { ok: false, error: "invalid_penaltyValue" };
    if (calculationType === "Percentage" && penaltyValue > 100) return { ok: false, error: "invalid_penaltyValue" };

    const gracePeriodDays = Number(gracePeriodDaysRaw);
    if (!Number.isFinite(gracePeriodDays) || gracePeriodDays < 0 || !Number.isInteger(gracePeriodDays)) return { ok: false, error: "invalid_gracePeriodDays" };

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

    const payload: PenaltyRuleFormModel = {
      id: numericId,
      penaltyCode,
      penaltyName,
      calculationType,
      penaltyValue,
      gracePeriodDays,
      isActive,
      createdBy: isUpdate ? undefined : userId,
      updatedBy: isUpdate ? userId : undefined,
    };

    if (isUpdate) {
      await updatePenaltyRule(payload);
      for (const loc of locales) revalidatePath(`/${loc}${PAGE_PATH}`, "page");
      return { ok: true, mode: "update" as const };
    }

    await createPenaltyRule(payload);
    for (const loc of locales) revalidatePath(`/${loc}${PAGE_PATH}`, "page");
    return { ok: true, mode: "create" as const };
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 409) return { ok: false, error: "duplicate" };
    if (error instanceof ApiError) return { ok: false, error: "api_error", message: error.message };
    return { ok: false, error: "unknown", message: error instanceof Error ? error.message : "An unexpected error occurred." };
  }
}

export async function createPenaltyRuleAction(data: PenaltyRuleFormModel) {
  const payload = new FormData();
  payload.set("locale", "en");
  payload.set("penaltyCode", data.penaltyCode);
  payload.set("penaltyName", data.penaltyName);
  payload.set("calculationType", data.calculationType);
  payload.set("penaltyValue", String(data.penaltyValue));
  payload.set("gracePeriodDays", String(data.gracePeriodDays));
  payload.set("isActive", String(data.isActive));
  return savePenaltyRule("", payload);
}

export async function updatePenaltyRuleAction(data: PenaltyRuleFormModel) {
  const payload = new FormData();
  payload.set("locale", "en");
  payload.set("penaltyCode", data.penaltyCode);
  payload.set("penaltyName", data.penaltyName);
  payload.set("calculationType", data.calculationType);
  payload.set("penaltyValue", String(data.penaltyValue));
  payload.set("gracePeriodDays", String(data.gracePeriodDays));
  payload.set("isActive", String(data.isActive));
  return savePenaltyRule(String(data.id ?? ""), payload);
}

export async function deletePenaltyRuleAction(formData: FormData) {
  const id = Number(formData.get("id") ?? 0);
  if (!id) return { success: false, message: "Valid penalty rule ID is required", statusCode: 400 };
  try {
    await deletePenaltyRule(id);
    for (const locale of locales) revalidatePath(`/${locale}${PAGE_PATH}`, "page");
    return { success: true };
  } catch (error) {
    if (error instanceof ApiError) return { success: false, message: error.responseText, statusCode: error.statusCode };
    return { success: false, message: error instanceof Error ? error.message : "Delete penalty rule failed" };
  }
}

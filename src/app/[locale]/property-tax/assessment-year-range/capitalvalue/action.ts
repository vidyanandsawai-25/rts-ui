"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getAssessmentYearsPagedServerCV, createAssessmentYearCV, updateAssessmentYearCV, deleteAssessmentYearCV, ApiError } from "@/lib/api/assessmentYearMasterCV.service";
import type { AssessmentYearCV } from "@/types/assessmentYearMaster.types";

function extractApiError(error: unknown, _t: (key: string) => string, fallback: string) {
  try {
    if (error instanceof ApiError) {
      const text = (error.responseText || "").trim();
      if (text.startsWith("{")) {
        const parsed = JSON.parse(text);
        if (parsed?.message) return String(parsed.message);
      }
    }
    if (error instanceof Error && error.message) return String(error.message);
  } catch {
    // ignore parse errors
  }
  return fallback;
}

export async function checkAssessmentYearOverlapCV(fromYear: number, toYear: number, excludeId?: number) {
  try {
    // Use a single backend call for overlap validation to avoid one request per page.
    const pageSize = Number.MAX_SAFE_INTEGER;
    const res = await getAssessmentYearsPagedServerCV(1, pageSize);
    const items = res?.items || [];

    const hasOverlap = items.some((item) => {
      if (excludeId && item.yearId === excludeId) return false;
      // Check for overlap:
      // A range (StartA, EndA) overlaps with (StartB, EndB) if:
      // StartA <= EndB AND EndA >= StartB
      return fromYear <= item.toYear && toYear >= item.fromYear;
    });

    return { hasOverlap };
  } catch (error) {
    console.error("Check overlap error:", error);
    return {
      hasOverlap: true,
      error: true,
      message: "Unable to validate assessment year range overlap."
    };
  }
}

export async function fetchAssessmentYearsActionCV(page: number, pageSize: number, search?: string) {
  try {
    const res = await getAssessmentYearsPagedServerCV(page, pageSize, search);
    return res;
  } catch (error) {
    console.error("Fetch assessment years CV error:", error);
    return null;
  }
}

export async function createAssessmentYearActionCV(data: Partial<AssessmentYearCV>) {
  const t = await getTranslations("AssessmentYearMasterCV");
  try {
    const res = await createAssessmentYearCV(data);
    revalidatePath("/property-tax/assessment-year-range/capitalvalue");
    return { success: true, data: res };
  } catch (error: unknown) {
    if (error instanceof ApiError && error.statusCode === 409) {
      return { success: false, error: t("duplicateRecordError") };
    }
    const message = extractApiError(error, t, t("failedToCreate"));
    return { success: false, error: message };
  }
}

export async function updateAssessmentYearActionCV(data: AssessmentYearCV) {
  const t = await getTranslations("AssessmentYearMasterCV");
  try {
    const res = await updateAssessmentYearCV(data);
    revalidatePath("/property-tax/assessment-year-range/capitalvalue");
    return { success: true, data: res };
  } catch (error: unknown) {
    if (error instanceof ApiError && error.statusCode === 409) {
      return { success: false, error: t("duplicateRecordError") };
    }
    const message = extractApiError(error, t, t("failedToUpdate"));
    return { success: false, error: message };
  }
}

export async function deleteAssessmentYearActionCV(id: number) {
  const t = await getTranslations("AssessmentYearMasterCV");
  try {
    await deleteAssessmentYearCV(id);
    revalidatePath("/property-tax/assessment-year-range/capitalvalue");
    return { success: true };
  } catch (error: unknown) {
    const message = extractApiError(error, t, t("failedToDelete"));
    if (error instanceof ApiError && error.statusCode === 409) {
      return { success: false, code: "LINKED_RECORD", error: message };
    }
    return { success: false, error: message };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getAssessmentYearsPagedServerCV, createAssessmentYearCV, updateAssessmentYearCV, deleteAssessmentYearCV, ApiError } from "@/lib/api/assessmentYearMasterCV.service";
import type { AssessmentYearCV } from "@/types/assessmentYearMaster.types";

async function extractApiError(error: unknown, fallback: string) {
  const t = await getTranslations("AssessmentYearMasterCV");
  try {
    if (error instanceof ApiError) {
      const text = (error.responseText || "").trim();
      if (text.startsWith("{")) {
        const parsed = JSON.parse(text);
        if (parsed?.message) return String(parsed.message);
      }
      if (error.statusCode === 409) {
        return t("duplicateRecordError");
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
 // Fetch all records by paginating through all available pages
    const pageSize = 1000;
    let page = 1;
    let totalPages = 1;
    const allItems: AssessmentYearCV[] = [];
    do {
      const res = await getAssessmentYearsPagedServerCV(page, pageSize);
      const items = res?.items || [];
      allItems.push(...items);
      if (typeof res?.totalPages === "number" && res.totalPages > 0) {
        totalPages = res.totalPages;
      }
      page += 1;
    } while (page <= totalPages);
    const hasOverlap = allItems.some((item) => {
      if (excludeId && item.yearId === excludeId) return false;
      
      // Check for overlap:
      // A range (StartA, EndA) overlaps with (StartB, EndB) if:
      // StartA <= EndB AND EndA >= StartB
      return (fromYear <= item.toYear && toYear >= item.fromYear);
    });

    return { hasOverlap };
  } catch (error) {
    console.error("Check overlap error:", error);
    return { hasOverlap: false };
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
    const message = await extractApiError(error, t("failedToCreate"));
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
    const message = await extractApiError(error, t("failedToUpdate"));
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
    const message = await extractApiError(error, t("failedToDelete"));
    if (error instanceof ApiError && error.statusCode === 409) {
      return { success: false, code: "LINKED_RECORD", error: message };
    }
    return { success: false, error: message };
  }
}

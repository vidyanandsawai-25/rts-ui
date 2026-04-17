"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getAssessmentYearsPagedServer, createAssessmentYear, updateAssessmentYear, deleteAssessmentYear, ApiError } from "@/lib/api/assessmentYearMaster.service";
import type { AssessmentYearRV } from "@/types/assessmentYearMaster.types";

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

export async function fetchAssessmentYearsAction(page: number, pageSize: number, search?: string) {
  try {
    const res = await getAssessmentYearsPagedServer(page, pageSize, search);
    return res;
  } catch (error) {
    console.error("Fetch assessment years error:", error);
    return null;
  }
}

export async function createAssessmentYearAction(data: Partial<AssessmentYearRV>) {
  const t = await getTranslations("AssessmentYearMasterRV");
  try {
    const res = await createAssessmentYear(data);
    revalidatePath("/property-tax/assessment-year-range/rateablevalue");
    return { success: true, data: res };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      let code: string | undefined;
      try {
        const text = (error.responseText || "").trim();
        if (text.startsWith("{")) {
          const parsed = JSON.parse(text);
          code = parsed.code || parsed.errorCode;
        }
      } catch {}
      if (code === "DUPLICATE") {
        return { success: false, error: t("duplicateRecordError") };
      }
      if (code === "OVERLAP") {
        return { success: false, error: t("overlapError") };
      }
      if (error.statusCode === 409) {
        return { success: false, error: t("duplicateRecordError") };
      }
      if (error.statusCode === 500) {
        return { success: false, error: t("overlapError") };
      }
    }
    const message = extractApiError(error, t, t("failedToCreate"));
    return { success: false, error: message };
  }
}

export async function updateAssessmentYearAction(data: AssessmentYearRV) {
  const t = await getTranslations("AssessmentYearMasterRV");
  try {
    const res = await updateAssessmentYear(data);
    revalidatePath("/property-tax/assessment-year-range/rateablevalue");
    return { success: true, data: res };
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      let code: string | undefined;
      try {
        const text = (error.responseText || "").trim();
        if (text.startsWith("{")) {
          const parsed = JSON.parse(text);
          code = parsed.code || parsed.errorCode;
        }
      } catch {}
      if (code === "DUPLICATE") {
        return { success: false, error: t("duplicateRecordError") };
      }
      if (code === "OVERLAP") {
        return { success: false, error: t("overlapError") };
      }
      if (error.statusCode === 409) {
        return { success: false, error: t("duplicateRecordError") };
      }
      if (error.statusCode === 500) {
        return { success: false, error: t("overlapError") };
      }
    }
    const message = extractApiError(error, t, t("failedToUpdate"));
    return { success: false, error: message };
  }
}

export async function deleteAssessmentYearAction(id: number) {
  const t = await getTranslations("AssessmentYearMasterRV");
  try {
    await deleteAssessmentYear(id);
    revalidatePath("/property-tax/assessment-year-range/rateablevalue");
    return { success: true };
  } catch (error: unknown) {
    // Try to detect a linked-record delete condition and surface a structured error code
    try {
      if (error instanceof ApiError) {
        const text = (error.responseText || "").trim();
        if (text.startsWith("{")) {
          const parsed2 = JSON.parse(text);
          const code = parsed2.code || parsed2.errorCode;
          if (code === "LINKED_RECORD") {
            const message = extractApiError(error, t, t("failedToDelete"));
            return { success: false, code: "LINKED_RECORD", error: message };
          }
        }
      }
    } catch {
      // ignore JSON parse / shape errors and fall back to generic handling
    }
    const message = extractApiError(error, t, t("failedToDelete"));
    return { success: false, error: message };
  }
}

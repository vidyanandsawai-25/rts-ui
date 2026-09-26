import { mapSharedApiError, SharedErrorMapOptions } from "@/lib/utils/asset-utils/shared-error-mapping";
import type { PenaltyRuleFormModel } from "@/types/asset-masters/penalty-rule-master.types";

/**
 * Maps Penalty Rule Master backend API error responses to localized multi-lingual strings (en, mr, hi).
 */
export function getPenaltyRuleErrorMessage(
  message: string | undefined,
  statusCode: number | undefined,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string,
  fallbackEntityName?: string
): string {
  let rawMsg = (message || "").trim();

  if (rawMsg.startsWith("{") && rawMsg.endsWith("}")) {
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed.errors && typeof parsed.errors === "object") {
        const firstErrorKey = Object.keys(parsed.errors)[0];
        if (firstErrorKey) {
          const errorsList = parsed.errors[firstErrorKey];
          if (Array.isArray(errorsList) && errorsList.length > 0) {
            rawMsg = String(errorsList[0]);
          } else if (typeof errorsList === "string") {
            rawMsg = errorsList;
          }
        }
      } else if (typeof parsed.message === "string" && parsed.message.trim()) {
        rawMsg = parsed.message.trim();
      }
    } catch {
      // Keep rawMsg as is if parsing fails
    }
  }

  const lowerMsg = rawMsg.toLowerCase();

  // 2. Duplicate detection (penaltyrule_code_duplicate, penaltyrule_name_duplicate, "already exist", "duplicate", or HTTP 409)
  if (
    lowerMsg.includes("duplicate") ||
    lowerMsg.includes("already exist") ||
    lowerMsg.includes("already exists") ||
    lowerMsg.includes("penaltyrule_code_duplicate") ||
    lowerMsg.includes("penaltyrule_name_duplicate") ||
    statusCode === 409
  ) {
    try {
      const formDup = t("form.messages.duplicate");
      if (formDup && formDup !== "form.messages.duplicate" && !formDup.includes("form.messages.duplicate")) {
        return formDup;
      }
    } catch {}
    try {
      const apiDup = t("apiErrors.duplicateRecord");
      if (apiDup && apiDup !== "apiErrors.duplicateRecord" && !apiDup.includes("apiErrors.duplicateRecord")) {
        return apiDup;
      }
    } catch {}
    try {
      const penaltyCodeDup = t("apiErrors.Penaltyrule_Code_Duplicate");
      if (penaltyCodeDup && penaltyCodeDup !== "apiErrors.Penaltyrule_Code_Duplicate" && !penaltyCodeDup.includes("apiErrors")) {
        return penaltyCodeDup;
      }
    } catch {}
  }

  return mapSharedApiError({
    message: rawMsg || message,
    statusCode,
    t: t as SharedErrorMapOptions["t"],
    tCommon: tCommon as SharedErrorMapOptions["tCommon"],
    fallbackEntityName: fallbackEntityName || t("title"),
    entityMatchers: [{ test: /penalty/i, labelKey: "title" }],
  });
}

export interface PenaltyRuleApiErrorResult {
  fieldErrors: Partial<Record<keyof PenaltyRuleFormModel, string>>;
  globalMessage: string;
}

/**
 * Parses backend API errors and returns both specific field-level errors (e.g. penaltyCode, penaltyName) and global toast message.
 */
export function parsePenaltyRuleApiErrors(
  message: string | undefined,
  statusCode: number | undefined,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string
): PenaltyRuleApiErrorResult {
  const globalMessage = getPenaltyRuleErrorMessage(message, statusCode, t, tCommon);
  const fieldErrors: Partial<Record<keyof PenaltyRuleFormModel, string>> = {};

  const rawMsg = (message || "").trim();

  if (rawMsg.startsWith("{") && rawMsg.endsWith("}")) {
    try {
      const parsed = JSON.parse(rawMsg);
      if (parsed.errors && typeof parsed.errors === "object") {
        for (const [key, errVal] of Object.entries(parsed.errors)) {
          const lowerKey = key.toLowerCase();
          const errTextLower = (Array.isArray(errVal) ? String(errVal[0] || "") : String(errVal || "")).toLowerCase();
          const isDup = errTextLower.includes("duplicate") || errTextLower.includes("already exist") || errTextLower.includes("already exists") || errTextLower.includes("penaltyrule_code_duplicate") || errTextLower.includes("penaltyrule_name_duplicate") || statusCode === 409;
          const localizedErr = isDup ? getDuplicateErrorMessageForPenaltyField(lowerKey, t) : globalMessage;

          if (lowerKey.includes("code") || lowerKey === "penaltycode") {
            fieldErrors.penaltyCode = localizedErr;
          } else if (lowerKey.includes("name") || lowerKey === "penaltyname") {
            fieldErrors.penaltyName = localizedErr;
          } else if (
            lowerKey.includes("percent") ||
            lowerKey.includes("value") ||
            lowerKey === "penaltypercentage" ||
            lowerKey === "penaltyvalue"
          ) {
            fieldErrors.penaltyValue = localizedErr;
          } else if (lowerKey.includes("calculation") || lowerKey === "calculationtype") {
            fieldErrors.calculationType = localizedErr;
          } else if (lowerKey.includes("grace") || lowerKey === "graceperioddays") {
            fieldErrors.gracePeriodDays = localizedErr;
          }
        }
      }
    } catch {
      // Ignore parse failure
    }
  }

  if (Object.keys(fieldErrors).length === 0) {
    const lowerMsg = rawMsg.toLowerCase();
    if (
      statusCode === 409 ||
      lowerMsg.includes("duplicate") ||
      lowerMsg.includes("already exist") ||
      lowerMsg.includes("already exists") ||
      lowerMsg.includes("penaltyrule_code_duplicate") ||
      lowerMsg.includes("penaltyrule_name_duplicate")
    ) {
      if (lowerMsg.includes("code") || lowerMsg.includes("penaltycode")) {
        fieldErrors.penaltyCode = getDuplicateErrorMessageForPenaltyField("penaltycode", t);
      } else if (lowerMsg.includes("name") || lowerMsg.includes("penaltyname") || lowerMsg.includes("description")) {
        fieldErrors.penaltyName = getDuplicateErrorMessageForPenaltyField("penaltyname", t);
      } else {
        // Generic duplicate message (e.g. "This record already exists"):
        // Assign to penaltyName because when user retains existing name and submits a new code,
        // penaltyName is the conflicting existing field.
        fieldErrors.penaltyName = getDuplicateErrorMessageForPenaltyField("penaltyname", t);
      }
    }
  }

  return {
    fieldErrors,
    globalMessage,
  };
}

function getDuplicateErrorMessageForPenaltyField(
  fieldKey: string,
  t: (key: string) => string
): string {
  if (fieldKey.includes("name") || fieldKey === "penaltyname") {
    try {
      const nameDup = t("form.validation.penaltyNameDuplicate");
      if (nameDup && nameDup !== "form.validation.penaltyNameDuplicate" && !nameDup.includes("form.validation")) {
        return nameDup;
      }
    } catch {}
    return "Penalty name already exists";
  }

  try {
    const codeDup = t("form.validation.penaltyCodeDuplicate");
    if (codeDup && codeDup !== "form.validation.penaltyCodeDuplicate" && !codeDup.includes("form.validation")) {
      return codeDup;
    }
  } catch {}

  try {
    const codeDup = t("apiErrors.Penaltyrule_Code_Duplicate");
    if (codeDup && codeDup !== "apiErrors.Penaltyrule_Code_Duplicate" && !codeDup.includes("apiErrors")) {
      return codeDup;
    }
  } catch {}

  try {
    const dup = t("form.messages.duplicate");
    if (dup && dup !== "form.messages.duplicate" && !dup.includes("form.messages")) {
      return dup;
    }
  } catch {}

  return "Penalty code already exists";
}

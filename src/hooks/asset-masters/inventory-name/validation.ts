import { validateForm } from "@/lib/utils/validation";
import {
  CODE_REGEX,
  CODE_SANITIZE,
  ASSET_MASTER_NAME_REGEX,
  ASSET_MASTER_NAME_SANITIZE,
  ASSET_MASTER_TEXT_SANITIZE,
  DESCRIPTION_REGEX,
} from "@/lib/utils/asset-validation-rules";
import { createSafeMasterTranslator } from "@/lib/utils/asset-utils/createSafeMasterTranslator";
import type { InventoryNameFormModel } from "@/types/asset-masters/inventory-name.types";

export const CODE_MAX = 15;
export const NAME_MAX = 50;
export const DESCRIPTION_MAX = 500;

export const sanitizeFieldValue = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "description") {
    sanitizedValue = value.replace(ASSET_MASTER_TEXT_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > DESCRIPTION_MAX) {
      sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
    }
  } else if (name === "subTypeName") {
    sanitizedValue = value.replace(ASSET_MASTER_NAME_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  } else if (name === "subTypeCode") {
    sanitizedValue = value.replace(CODE_SANITIZE, "").toUpperCase();
    if (sanitizedValue.length > CODE_MAX) {
      sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
    }
  }
  return sanitizedValue;
};

export const validateInventoryNameForm = (
  data: InventoryNameFormModel,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  isEdit: boolean
): Partial<Record<keyof InventoryNameFormModel, string>> => {
  const safeT = createSafeMasterTranslator(t);

  const schema = {
    inventoryItemCategoryId: (val: unknown) => {
      const num = Number(val);
      if (!val || isNaN(num) || num <= 0) {
        return safeT('categoryRequired');
      }
      return undefined;
    },
    subTypeCode: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return safeT('codeRequired');
      if (str.length > CODE_MAX) return safeT('subTypeCodeMaxLength', { count: CODE_MAX });
      if (/^0+$/.test(str)) return safeT('subTypeCodeAllZeros');
      if (!CODE_REGEX.test(str)) return safeT('subTypeCodeFormat');
      return undefined;
    },
    subTypeName: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return safeT('nameRequired');
      if (str.length > NAME_MAX) return safeT('subTypeNameMaxLength', { count: NAME_MAX });
      if (/^0+$/.test(str)) return safeT('subTypeNameAllZeros');
      if (!ASSET_MASTER_NAME_REGEX.test(str)) return safeT('subTypeNameFormat');
      return undefined;
    },
    description: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return undefined;
      if (str.length > DESCRIPTION_MAX) return safeT('descriptionMaxLength', { count: DESCRIPTION_MAX });
      if (/^0+$/.test(str)) return safeT('descriptionAllZeros');
      if (!DESCRIPTION_REGEX.test(str)) return safeT('descriptionFormat');
      return undefined;
    },
    isActive: (val: unknown) => {
      if (!isEdit && val !== true) {
        return safeT('mustBeActive');
      }
      return undefined;
    },
  };
  return validateForm(data, schema);
};

export const mapInventoryNameApiError = (
  result: { statusCode?: number; message?: string; error?: string; success?: boolean },
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string
): string => {
  const rawMsg = (result.message || result.error || "").replace(/\.$/, "");
  const match = rawMsg.match(/Cannot deactivate\/delete this (.*?) because it is referenced in:\s*(.*)/i);
  if (match) {
    const entityName = t("masterNames.inventory-name-master") || "Inventory Name";
    const tables = match[2];
    try {
      const translation = t("apiErrors.referencedIn", { entity: entityName, tables });
      if (translation && translation !== "apiErrors.referencedIn") {
        return translation;
      }
    } catch {}
    return `Cannot deactivate or delete this ${entityName} because it is referenced in: ${tables}.`;
  }

  if (result.error === "duplicate" || rawMsg.toLowerCase().includes("duplicate") || rawMsg.toLowerCase().includes("already exists")) {
    return t("configuration.masterData.form.validation.duplicateRecord") || "Record already exists.";
  }

  const errorMap: Record<number, string> = {
    409: t("configuration.masterData.form.validation.duplicateRecord") || "Record already exists.",
    404: tCommon("errors.notFound") || "Record not found.",
    401: tCommon("errors.unauthorized"),
    403: tCommon("errors.unauthorized"),
  };

  const code = result.statusCode ?? 0;
  if (errorMap[code]) return errorMap[code];

  if (code >= 500) return tCommon("errors.serverError") || "Server error occurred.";
  return result.message || result.error || tCommon("errors.generic") || "Operation failed.";
};

export function getErrorMessage(
  message: string | undefined,
  statusCode: number | undefined,
  t: (key: string, values?: Record<string, string>) => string,
  tCommon: (key: string) => string,
  fallbackEntityName: string
): string {
  const rawMsg = (message || "").replace(/\.$/, "");
  const match = rawMsg.match(/Cannot deactivate\/delete this (.*?) because it is referenced in:\s*(.*)/i);
  if (match) {
    const entityName = fallbackEntityName;
    const tables = match[2];
    try {
      const translation = t("apiErrors.referencedIn", { entity: entityName, tables });
      if (translation && translation !== "apiErrors.referencedIn") {
        return translation;
      }
    } catch {}
    return `Cannot deactivate or delete this ${entityName} because it is referenced in: ${tables}.`;
  }

  return statusCode === 409
    ? (t("apiErrors.duplicateRecord") || "Record is in use.")
    : (tCommon("errors.generic") || tCommon("errors.deleteError"));
}

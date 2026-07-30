import {
  CODE_SANITIZE,
  DESCRIPTION_SANITIZE,
  validateForm,
  commonValidations
} from "@/lib/utils/validation";
import { AssetPhotoTypeFormModel } from "@/types/asset-masters/asset-photo-type.types";

export const CODE_MAX = 50;
export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 200;

export const sanitizeFieldValue = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "description") {
    sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > DESCRIPTION_MAX) {
      sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
    }
  } else if (name === "photoTypeName") {
    sanitizedValue = value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  } else if (name === "photoTypeCode") {
    sanitizedValue = value.replace(CODE_SANITIZE, "").toUpperCase();
    if (sanitizedValue.length > CODE_MAX) {
      sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
    }
  }
  return sanitizedValue;
};

export const validateAssetPhotoForm = (
  data: AssetPhotoTypeFormModel,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  isEdit: boolean
): Partial<Record<keyof AssetPhotoTypeFormModel, string>> => {
  const schema = {
    photoTypeCode: commonValidations.masterCode(t, CODE_MAX, {
      required: 'form.validation.photoTypeCodeRequired',
      format: 'form.validation.photoTypeCodeFormat',
      maxLength: 'form.validation.photoTypeCodeMaxLength',
    }),
    photoTypeName: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return t('form.validation.photoTypeNameRequired');
      if (str.length > NAME_MAX) return t('form.validation.photoTypeNameMaxLength', { count: NAME_MAX });
      if (!/^[\p{L}\p{M}\p{N}]+(?:[\s][\p{L}\p{M}\p{N}]+)*$/u.test(str)) return t('form.validation.photoTypeNameFormat');
      return undefined;
    },
    description: (val: unknown) => {
      if (!String(val ?? '').trim()) return undefined;
      return commonValidations.masterDescription(t, DESCRIPTION_MAX, {
        maxLength: 'form.validation.descriptionMaxLength',
        format: 'form.validation.descriptionFormat',
      })(val);
    },
    displayOrder: (val: unknown) => {
      if (val === null || val === undefined || val === "") {
        return t('form.validation.displayOrderRequired');
      }
      const numVal = Number(val);
      if (isNaN(numVal)) {
        return t('form.validation.displayOrderRequired');
      }
      if (numVal <= 0) {
        return t('form.validation.displayOrderInvalid');
      }
      return undefined;
    },
    isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
    assetCategoryId: (val: unknown) => {
      const parsed = Number(val);
      if (!val || isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
        return t('form.validation.assetCategoryRequired');
      }
      return undefined;
    },
    assetTypeId: (val: unknown) => {
      const parsed = Number(val);
      if (!val || isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
        return t('form.validation.assetTypeRequired');
      }
      return undefined;
    },
  };
  return validateForm(data, schema);
};

export const mapAssetPhotoApiError = (
  result: { statusCode?: number; message?: string },
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string
): string => {
  const rawMsg = (result.message || "").replace(/\.$/, "");
  const match = rawMsg.match(/Cannot deactivate\/delete this (.*?) because it is referenced in:\s*(.*)/i);
  if (match) {
    const entity = match[1];
    const tables = match[2];
    
    let entityName = t("list.title");
    const lowerEntity = entity.toLowerCase();
    
    if (lowerEntity.includes("photo")) {
      try { entityName = t("list.title"); } catch {}
    }
    
    try {
      const translation = t("apiErrors.referencedIn", { entity: entityName, tables });
      if (translation && translation !== "apiErrors.referencedIn") {
        return translation;
      }
    } catch {}

    return `Cannot deactivate or delete this ${entityName} because it is referenced in: ${tables}.`;
  }

  const errorMap: Record<number, string> = {
    409: t("apiErrors.duplicateRecord"),
    404: t("apiErrors.notFound"),
    401: tCommon("errors.unauthorized"),
    403: tCommon("errors.unauthorized"),
  };

  const code = result.statusCode ?? 0;
  if (errorMap[code]) return errorMap[code];

  if (code === 400) {
    const msg = result.message?.toLowerCase() || "";
    if (msg.includes("duplicate") || msg.includes("already exists")) {
      return t("apiErrors.duplicateRecord");
    }
    return result.message || t("apiErrors.invalidData");
  }

  if (code >= 500) return tCommon("errors.serverError");
  return result.message || t("apiErrors.operationFailed");
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
    const entity = match[1];
    const tables = match[2];
    
    let entityName = fallbackEntityName;
    const lowerEntity = entity.toLowerCase();
    
    if (lowerEntity.includes("photo")) {
      try { entityName = t("list.title"); } catch {}
    }
    
    try {
      const translation = t("apiErrors.referencedIn", { entity: entityName, tables });
      if (translation && translation !== "apiErrors.referencedIn") {
        return translation;
      }
    } catch {}

    return `Cannot deactivate or delete this ${entityName} because it is referenced in: ${tables}.`;
  }
  
  try {
    const key = `apiErrors.${rawMsg}`;
    const translated = t(key as never);
    if (translated && translated !== key && !translated.includes(key)) {
      return translated;
    }
  } catch {}

  return statusCode === 409
    ? (t("apiErrors.inUse") || "Record is in use.")
    : (t("apiErrors.operationFailed") || tCommon("errors.generic") || tCommon("errors.deleteError"));
}



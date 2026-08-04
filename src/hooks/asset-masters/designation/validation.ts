import {
  validateForm
} from "@/lib/utils/validation";
import {
  CODE_SANITIZE,
  DESCRIPTION_SANITIZE,
  CODE_REGEX,
  DESCRIPTION_REGEX,
  isAllZeros
} from "@/lib/utils/asset-validation-rules";
import { DesignationFormModel } from "@/types/asset-masters/designation.types";
import { mapSharedApiError } from "@/lib/utils/asset-utils/shared-error-mapping";

export const CODE_MAX = 20;
export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 100;

export const sanitizeFieldValue = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "designationDescription") {
    sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > DESCRIPTION_MAX) {
      sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
    }
  } else if (name === "designationName" || name === "designationLocal") {
    sanitizedValue = value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  } else if (name === "designationCode") {
    sanitizedValue = value.replace(CODE_SANITIZE, "").toUpperCase();
    if (sanitizedValue.length > CODE_MAX) {
      sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
    }
  }
  return sanitizedValue;
};

export const validateDesignationForm = (
  data: DesignationFormModel,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  isEdit: boolean
): Partial<Record<keyof DesignationFormModel, string>> => {
  const schema = {
    designationCode: (value: unknown) => {
      const strVal = String(value ?? '').trim();
      if (!strVal) return t('form.validation.designationCodeRequired');
      if (strVal.length > CODE_MAX) return t('form.validation.designationCodeMaxLength', { count: CODE_MAX });
      if (isAllZeros(strVal)) return t('form.validation.invalidFormat', { default: 'Invalid format' });
      if (!CODE_REGEX.test(strVal)) return t('form.validation.designationCodeFormat');
      return undefined;
    },
    designationName: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return t('form.validation.designationNameRequired');
      if (str.length > NAME_MAX) return t('form.validation.designationNameMaxLength', { count: NAME_MAX });
      if (/^0+$/.test(str)) return t('form.validation.designationNameFormat');
      if (!/^[\p{L}\p{M}\p{N}]+(?:[\s][\p{L}\p{M}\p{N}]+)*$/u.test(str)) return t('form.validation.designationNameFormat');
      return undefined;
    },
    designationLocal: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return t('form.validation.designationLocalRequired');
      if (str.length > NAME_MAX) return t('form.validation.designationLocalMaxLength', { count: NAME_MAX });
      if (/^0+$/.test(str)) return t('form.validation.designationLocalRequired');
      return undefined;
    },
    designationDescription: (val: unknown) => {
      const strVal = String(val ?? '').trim();
      if (!strVal) return undefined;
      if (strVal.length > DESCRIPTION_MAX) return t('form.validation.descriptionMaxLength', { count: DESCRIPTION_MAX });
      if (isAllZeros(strVal)) return t('form.validation.invalidFormat', { default: 'Invalid format' });
      if (!DESCRIPTION_REGEX.test(strVal)) return t('form.validation.descriptionFormat');
      return undefined;
    },
    isActive: (val: unknown) => {
      if (!isEdit && val !== true) {
        return t('form.validation.mustBeActive');
      }
      return undefined;
    },
    owningDepartmentId: (val: unknown) => {
      const parsed = Number(val);
      if (!val || isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
        return t('form.validation.owningDepartmentRequired');
      }
      return undefined;
    },
  };
  return validateForm(data, schema);
};

export const mapDesignationApiError = (
  result: { statusCode?: number; message?: string },
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string
): string => {
  return mapSharedApiError({
    message: result.message,
    statusCode: result.statusCode,
    t,
    tCommon,
    fallbackEntityName: t("list.title"),
    entityMatchers: [{ test: /designation/i, labelKey: "list.title" }],
    customStatusCodes: {
      409: t("apiErrors.duplicateRecord"),
      404: t("apiErrors.notFound"),
      401: tCommon("errors.unauthorized"),
      403: tCommon("errors.unauthorized"),
    }
  });
};


export function getErrorMessage(
  message: string | undefined,
  statusCode: number | undefined,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string,
  fallbackEntityName: string
): string {
  return mapSharedApiError({
    message,
    statusCode,
    t,
    tCommon,
    fallbackEntityName,
    entityMatchers: [{ test: /designation/i, labelKey: "list.title" }]
  });
}

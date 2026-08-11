import {
  validateForm
} from "@/lib/utils/validation";
import {
  DESCRIPTION_SANITIZE,
  DESCRIPTION_REGEX,
  ASSET_MASTER_NAME_REGEX,
  ASSET_MASTER_NAME_SANITIZE,
  isAllZeros
} from "@/lib/utils/asset-validation-rules";
import { AssetGrievanceCategoryFormModel } from "@/types/asset-masters/asset-grievance-category.types";
import { mapSharedApiError } from "@/lib/utils/asset-utils/shared-error-mapping";

export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 500;

export const sanitizeCategoryField = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "description") {
    sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > DESCRIPTION_MAX) {
      sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
    }
  } else if (name === "categoryName") {
    sanitizedValue = value.replace(ASSET_MASTER_NAME_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  }
  return sanitizedValue;
};

export const validateGrievanceCategoryForm = (
  data: AssetGrievanceCategoryFormModel,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  isEdit: boolean
): Partial<Record<keyof AssetGrievanceCategoryFormModel, string>> => {
  const schema = {
    categoryName: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return t('form.errors.nameReq');
      if (str.length < 3) return t('form.errors.nameMinLength');
      if (str.length > NAME_MAX) return t('form.errors.nameMaxLength');
      if (isAllZeros(str) || !ASSET_MASTER_NAME_REGEX.test(str)) return t('form.errors.invalidFormat', { default: 'Only alphanumeric characters and spaces are allowed' });
      return undefined;
    },
    description: (val: unknown) => {
      const strVal = String(val ?? '').trim();
      if (!strVal) return undefined;
      if (strVal.length < 3) return t('form.errors.descMinLength');
      if (strVal.length > DESCRIPTION_MAX) return t('form.errors.descMaxLength');
      if (isAllZeros(strVal)) return t('form.errors.invalidFormat', { default: 'Invalid format' });
      if (!DESCRIPTION_REGEX.test(strVal)) return t('form.errors.invalidFormat', { default: 'Invalid format' });
      return undefined;
    },
    resolutionSlaDays: (val: unknown) => {
      if (val === null || val === undefined || val === "") {
        return t('form.errors.slaReq');
      }
      const numVal = Number(val);
      if (isNaN(numVal)) {
        return t('form.errors.slaReq');
      }
      if (numVal <= 0) {
        return t('form.errors.slaPositiveInteger');
      }
      if (numVal > 365) {
        return t('form.errors.slaMaxDays');
      }
      return undefined;
    },
    isActive: (val: unknown) => {
      if (!isEdit && val !== true) {
        return t('form.errors.mustBeActive', { default: 'Must be active' });
      }
      return undefined;
    },
  };
  return validateForm(data, schema);
};

export const mapGrievanceCategoryApiError = (
  result: { statusCode?: number; message?: string },
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string
): string => {
  return mapSharedApiError({
    message: result.message,
    statusCode: result.statusCode,
    t,
    tCommon,
    fallbackEntityName: t("master.title"),
    entityMatchers: [{ test: /category/i, labelKey: "master.title" }],
    customStatusCodes: {
      409: t("form.errors.duplicateRecord") || t("form.errors.duplicateName"),
      404: t("form.errors.recordNotFound"),
      401: tCommon("errors.unauthorized"),
      403: tCommon("errors.unauthorized"),
    }
  });
};

export function getCategoryErrorMessage(
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
    entityMatchers: [{ test: /category/i, labelKey: "master.title" }]
  });
}

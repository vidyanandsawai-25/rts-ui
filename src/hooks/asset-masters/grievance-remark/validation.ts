import {
  validateForm
} from "@/lib/utils/validation";
import {
  DESCRIPTION_SANITIZE,
  isAllZeros,
  DESCRIPTION_REGEX
} from "@/lib/utils/asset-validation-rules";
import { AssetGrievanceRemarkFormModel } from "@/types/asset-masters/asset-grievance-remark.types";
import { mapSharedApiError } from "@/lib/utils/asset-utils/shared-error-mapping";

export const REMARK_MAX = 150;
export const DESCRIPTION_MAX = 200;

export const sanitizeRemarkField = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "description") {
    sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > DESCRIPTION_MAX) {
      sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
    }
  } else if (name === "remark") {
    sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > REMARK_MAX) {
      sanitizedValue = sanitizedValue.substring(0, REMARK_MAX);
    }
  }
  return sanitizedValue;
};

export const validateGrievanceRemarkForm = (
  data: AssetGrievanceRemarkFormModel,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  isEdit: boolean
): Partial<Record<keyof AssetGrievanceRemarkFormModel, string>> => {
  const schema = {
    remark: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return t('form.validation.remarkRequired');
      if (str.length < 3) return t('form.validation.remarkMinLength');
      if (str.length > REMARK_MAX) return t('form.validation.remarkMaxLength');
      if (isAllZeros(str) || !DESCRIPTION_REGEX.test(str)) return t('form.validation.remarkFormat');
      return undefined;
    },
    description: (val: unknown) => {
      const strVal = String(val ?? '').trim();
      if (!strVal) return t('form.validation.descriptionRequired');
      if (strVal.length > DESCRIPTION_MAX) return t('form.validation.descriptionMaxLength');
      if (isAllZeros(strVal) || !DESCRIPTION_REGEX.test(strVal)) return t('form.validation.remarkFormat');
      return undefined;
    },
    grievanceCategoryId: (val: unknown) => {
      const parsed = Number(val);
      if (!val || isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
        return t('form.validation.remarkTypeRequired'); // maps category selection
      }
      return undefined;
    },
    isActive: (val: unknown) => {
      if (!isEdit && val !== true) {
        return t('form.validation.mustBeActive');
      }
      return undefined;
    },
  };
  return validateForm(data, schema);
};

export const mapGrievanceRemarkApiError = (
  result: { statusCode?: number; message?: string },
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string
): string => {
  return mapSharedApiError({
    message: result.message,
    statusCode: result.statusCode,
    t,
    tCommon,
    fallbackEntityName: t("title"),
    entityMatchers: [{ test: /remark/i, labelKey: "title" }],
    customStatusCodes: {
      409: t("apiErrors.duplicateRecord"),
      404: t("apiErrors.notFound"),
      401: tCommon("errors.unauthorized"),
      403: tCommon("errors.unauthorized"),
    }
  });
};

export function getRemarkErrorMessage(
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
    entityMatchers: [{ test: /remark/i, labelKey: "title" }]
  });
}

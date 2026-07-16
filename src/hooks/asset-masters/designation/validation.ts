import {
  CODE_SANITIZE,
  DESCRIPTION_SANITIZE,
  validateForm,
  commonValidations
} from "@/lib/utils/validation";
import { DesignationFormModel } from "@/types/asset-masters/designation.types";

export const CODE_MAX = 50;
export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 200;

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
    designationCode: commonValidations.masterCode(t, CODE_MAX, {
      required: 'form.validation.designationCodeRequired',
      format: 'form.validation.designationCodeFormat',
      maxLength: 'form.validation.designationCodeMaxLength',
    }),
    designationName: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return t('form.validation.designationNameRequired');
      if (str.length > NAME_MAX) return t('form.validation.designationNameMaxLength', { count: NAME_MAX });
      if (!/^[\p{L}\p{M}\p{N}]+(?:[\s][\p{L}\p{M}\p{N}]+)*$/u.test(str)) return t('form.validation.designationNameFormat');
      return undefined;
    },
    designationLocal: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return t('form.validation.designationLocalRequired');
      if (str.length > NAME_MAX) return t('form.validation.designationLocalMaxLength', { count: NAME_MAX });
      return undefined;
    },
    designationDescription: (val: unknown) => {
      if (!String(val ?? '').trim()) return undefined;
      return commonValidations.masterDescription(t, DESCRIPTION_MAX, {
        maxLength: 'form.validation.designationDescriptionMaxLength',
        format: 'form.validation.descriptionFormat',
      })(val);
    },
    isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
    owningDepartmentId: (val: unknown) => !val ? t('form.validation.owningDepartmentRequired') : undefined,
  };
  return validateForm(data, schema);
};

export const mapDesignationApiError = (
  result: { statusCode?: number; message?: string },
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  tCommon: (key: string, values?: Record<string, string | number | Date>) => string
): string => {
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

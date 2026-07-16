import {
  CODE_SANITIZE,
  DESCRIPTION_SANITIZE,
  validateForm,
  commonValidations
} from "@/lib/utils/validation";
import {
  ALPHANUMERIC_WITH_SPACES_REGEX,
  ALPHANUMERIC_WITH_SPACES_SANITIZE
} from "@/lib/utils/validation-rules";
import { AssetRoomTypeFormModel } from "@/types/asset-masters/asset-room-type.types";

export const CODE_MAX = 20;
export const NAME_MAX = 100;
export const DESCRIPTION_MAX = 200;

export const sanitizeFieldValue = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "description") {
    sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > DESCRIPTION_MAX) {
      sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
    }
  } else if (name === "roomTypeName") {
    sanitizedValue = value.replace(ALPHANUMERIC_WITH_SPACES_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  } else if (name === "roomTypeCode") {
    sanitizedValue = value.replace(CODE_SANITIZE, "").toUpperCase();
    if (sanitizedValue.length > CODE_MAX) {
      sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
    }
  }
  return sanitizedValue;
};

export const validateAssetRoomForm = (
  data: AssetRoomTypeFormModel,
  t: (key: string, values?: any) => string,
  isEdit: boolean
): Partial<Record<keyof AssetRoomTypeFormModel, string>> => {
  const schema = {
    roomTypeCode: commonValidations.masterCode(t, CODE_MAX, {
      required: 'form.validation.roomTypeCodeRequired',
      format: 'form.validation.roomTypeCodeFormat',
      maxLength: 'form.validation.roomTypeCodeMaxLength',
    }),
    roomTypeName: (val: unknown) => {
      const str = String(val ?? '').trim();
      if (!str) return t('form.validation.roomTypeNameRequired');
      if (str.length > NAME_MAX) return t('form.validation.roomTypeNameMaxLength', { count: NAME_MAX });
      if (!ALPHANUMERIC_WITH_SPACES_REGEX.test(str)) return t('form.validation.roomTypeNameFormat');
      return undefined;
    },
    description: (val: unknown) => {
      if (!String(val ?? '').trim()) return undefined;
      return commonValidations.masterDescription(t, DESCRIPTION_MAX, {
        maxLength: 'form.validation.descriptionMaxLength',
        format: 'form.validation.descriptionFormat',
      })(val);
    },
    isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
    assetCategoryId: (val: unknown) => !val ? t('form.validation.assetCategoryRequired') : undefined,
    assetTypeId: (val: unknown) => !val ? t('form.validation.assetTypeRequired') : undefined,
  };
  return validateForm(data, schema);
};

export const mapAssetRoomApiError = (
  result: { statusCode?: number; message?: string },
  t: (key: string, values?: any) => string,
  tCommon: (key: string, values?: any) => string
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

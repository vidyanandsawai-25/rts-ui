import {
  validateForm,
  commonValidations
} from "@/lib/utils/validation";
import {
  ASSET_MOUJA_NO_REGEX,
  ASSET_MOUJA_NO_SANITIZE,
  ASSET_SUBZONE_NO_REGEX,
  ASSET_SUBZONE_NO_SANITIZE,
  ASSET_MASTER_NAME_REGEX,
  ASSET_MASTER_NAME_SANITIZE
} from "@/lib/utils/asset-validation-rules";
import { MoujaFormModel, SubZoneFormModel } from "@/types/asset-masters/mouja-subzone.types";
import { mapSharedApiError } from "@/lib/utils/asset-utils/shared-error-mapping";

export const CODE_MAX = 20;
export const NAME_MAX = 100;

export const sanitizeMoujaFieldValue = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "moujaName") {
    sanitizedValue = value.replace(ASSET_MASTER_NAME_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  } else if (name === "moujaNo") {
    sanitizedValue = value.replace(ASSET_MOUJA_NO_SANITIZE, "").toUpperCase();
    if (sanitizedValue.length > CODE_MAX) {
      sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
    }
  }
  return sanitizedValue;
};

export const sanitizeSubZoneFieldValue = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "subZoneName") {
    sanitizedValue = value.replace(ASSET_MASTER_NAME_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  } else if (name === "subZoneNo") {
    sanitizedValue = value.replace(ASSET_SUBZONE_NO_SANITIZE, "").toUpperCase();
    if (sanitizedValue.length > CODE_MAX) {
      sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
    }
  }
  return sanitizedValue;
};

export const validateMoujaForm = (
  data: MoujaFormModel,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  isEdit: boolean
): Partial<Record<keyof MoujaFormModel, string>> => {
  const schema = {
    moujaNo: (val: unknown) => {
      const strVal = String(val ?? "").trim();
      if (!strVal) return t("form.validation.moujaNoRequired");
      if (strVal.length > CODE_MAX) return t("form.validation.moujaNoMaxLength", { count: CODE_MAX });
      if (!ASSET_MOUJA_NO_REGEX.test(strVal)) return t("form.validation.moujaNoFormat");
      return undefined;
    },
    moujaName: (val: unknown) => {
      const str = String(val ?? "").trim();
      if (!str) return t("form.validation.moujaNameRequired");
      if (str.length > NAME_MAX) return t("form.validation.moujaNameMaxLength", { count: NAME_MAX });
      if (!ASSET_MASTER_NAME_REGEX.test(str)) return t("form.validation.moujaNameFormat");
      return undefined;
    },
    isActive: commonValidations.masterActiveStatus(t, isEdit, "form.validation.mustBeActive"),
  };
  return validateForm(data, schema);
};

export const validateSubZoneForm = (
  data: SubZoneFormModel,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  isEdit: boolean
): Partial<Record<keyof SubZoneFormModel, string>> => {
  const schema = {
    moujaId: (val: unknown) => {
      const n = typeof val === "number" ? val : Number(val);
      if (!Number.isFinite(n) || n <= 0) return t("form.validation.moujaRequired");
      return undefined;
    },
    subZoneNo: (val: unknown) => {
      const strVal = String(val ?? "").trim();
      if (!strVal) return t("form.validation.subZoneNoRequired");
      if (strVal.length > CODE_MAX) return t("form.validation.subZoneNoMaxLength", { count: CODE_MAX });
      if (!ASSET_SUBZONE_NO_REGEX.test(strVal)) return t("form.validation.subZoneNoFormat");
      return undefined;
    },
    subZoneName: (val: unknown) => {
      const str = String(val ?? "").trim();
      if (!str) return t("form.validation.subZoneNameRequired");
      if (str.length > NAME_MAX) return t("form.validation.subZoneNameMaxLength", { count: NAME_MAX });
      if (!ASSET_MASTER_NAME_REGEX.test(str)) return t("form.validation.subZoneNameFormat");
      return undefined;
    },
    isActive: commonValidations.masterActiveStatus(t, isEdit, "form.validation.mustBeActive"),
  };
  return validateForm(data, schema);
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
    entityMatchers: [
      { test: /mouja/i, labelKey: "list.moujaTitle" },
      { test: /subzone|sub zone/i, labelKey: "list.subZoneTitle" }
    ]
  });
}




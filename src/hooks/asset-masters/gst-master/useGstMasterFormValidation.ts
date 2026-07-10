"use client";

import { useCallback } from "react";
import type { GstMasterFormModel } from "@/types/asset-masters/gst-master.types";
import { validateForm, commonValidations, isAllZeros } from "@/lib/utils/validation";

interface UseGstMasterFormValidationProps {
  isEdit: boolean;
  submittedOnce: boolean;
  touched: Record<string, boolean>;
  errors: Partial<Record<keyof GstMasterFormModel, string>>;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

export function useGstMasterFormValidation({
  isEdit,
  submittedOnce,
  touched,
  errors,
  t,
}: UseGstMasterFormValidationProps) {
  const validate = useCallback(
    (data: GstMasterFormModel): Partial<Record<keyof GstMasterFormModel, string>> => {
      const schema = {
        taxCode: commonValidations.masterCode(t, 20, {
          required: "form.validation.codeRequired",
          format: "form.validation.codeFormat",
          maxLength: "form.validation.codeMaxLength",
        }),
        taxName: (value: unknown) => {
          const standardError = commonValidations.masterDescription(t, 100, {
            required: "form.validation.descriptionRequired",
            format: "form.validation.descriptionFormat",
            maxLength: "form.validation.descriptionMaxLength",
          })(value);

          if (standardError) return standardError;

          const strVal = String(value ?? "").trim();
          if (isAllZeros(strVal)) {
            return t("form.validation.descriptionFormat");
          }
          return undefined;
        },
        taxPercentage: (value: unknown) => {
          if (value === "" || value === null || value === undefined) {
            return t("form.validation.percentRequired");
          }
          const num = Number(value);
          if (!Number.isFinite(num) || num < 0 || num > 100) {
            return t("form.validation.percentInvalid");
          }
          return undefined;
        },
        effectiveFromDate: (value: unknown) => {
          const strVal = String(value ?? "").trim();
          if (!strVal) {
            return t("form.validation.effectiveFromRequired");
          }
          return undefined;
        },
        effectiveToDate: (value: unknown) => {
          const strVal = String(value ?? "").trim();
          if (!strVal) {
            return t("form.validation.effectiveToRequired");
          }
          if (data.effectiveFromDate?.trim()) {
            const from = new Date(data.effectiveFromDate);
            const to = new Date(strVal);
            if (to < from) {
              return t("form.validation.effectiveToInvalid");
            }
          }
          return undefined;
        },
        isActive: commonValidations.masterActiveStatus(t, isEdit, "form.validation.mustBeActive"),
      };

      return validateForm(data, schema) as Partial<Record<keyof GstMasterFormModel, string>>;
    },
    [t, isEdit]
  );

  const showError = useCallback(
    (field: keyof GstMasterFormModel): boolean => {
      return (submittedOnce || touched[field]) && !!errors[field];
    },
    [submittedOnce, touched, errors]
  );

  return {
    validate,
    showError,
  };
}

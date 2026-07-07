"use client";

import { useCallback } from "react";
import type { PenaltyRuleFormModel } from "@/types/asset-masters/penalty-rule-master.types";
import { validateForm, commonValidations, isAllZeros } from "@/lib/utils/validation";

interface UsePenaltyRuleFormValidationProps {
  isEdit: boolean;
  submittedOnce: boolean;
  touched: Record<string, boolean>;
  errors: Partial<Record<keyof PenaltyRuleFormModel, string>>;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

export function usePenaltyRuleFormValidation({
  isEdit,
  submittedOnce,
  touched,
  errors,
  t,
}: UsePenaltyRuleFormValidationProps) {
  const validate = useCallback(
    (data: PenaltyRuleFormModel): Partial<Record<keyof PenaltyRuleFormModel, string>> => {
      const schema = {
        penaltyCode: commonValidations.masterCode(t, 20, {
          required: "form.validation.codeRequired",
          format: "form.validation.codeFormat",
          maxLength: "form.validation.codeMaxLength",
        }),
        penaltyName: (value: unknown) => {
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
        calculationType: (value: unknown) => {
          const strVal = String(value ?? "").trim();
          if (!strVal) {
            return t("form.validation.calculationTypeRequired");
          }
          return undefined;
        },
        penaltyValue: (value: unknown) => {
          if (value === "" || value === null || value === undefined) {
            return t("form.validation.valueRequired");
          }
          const num = Number(value);
          if (!Number.isFinite(num) || num < 0) {
            return t("form.validation.valueInvalid");
          }
          return undefined;
        },
        gracePeriodDays: (value: unknown) => {
          if (value === "" || value === null || value === undefined) {
            return t("form.validation.gracePeriodRequired");
          }
          const num = Number(value);
          if (!Number.isFinite(num) || num < 0 || !Number.isInteger(num)) {
            return t("form.validation.gracePeriodInvalid");
          }
          return undefined;
        },
        isActive: commonValidations.masterActiveStatus(t, isEdit, "form.validation.mustBeActive"),
      };

      return validateForm(data, schema) as Partial<Record<keyof PenaltyRuleFormModel, string>>;
    },
    [t, isEdit]
  );

  const showError = useCallback(
    (field: keyof PenaltyRuleFormModel): boolean => {
      return (submittedOnce || touched[field]) && !!errors[field];
    },
    [submittedOnce, touched, errors]
  );

  return {
    validate,
    showError,
  };
}

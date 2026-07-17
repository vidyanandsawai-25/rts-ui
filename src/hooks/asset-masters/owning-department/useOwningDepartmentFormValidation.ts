"use client";

import { useCallback } from "react";
import type { OwningDepartmentFormModel } from "@/types/asset-masters/owning-department.types";
import { validateForm, commonValidations, isAllZeros } from "@/lib/utils/validation";

interface UseOwningDepartmentFormValidationProps {
  isEdit: boolean;
  submittedOnce: boolean;
  touched: Record<string, boolean>;
  errors: Partial<Record<keyof OwningDepartmentFormModel, string>>;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
}

export function useOwningDepartmentFormValidation({
  submittedOnce,
  touched,
  errors,
  t,
}: UseOwningDepartmentFormValidationProps) {
  const validate = useCallback(
    (data: OwningDepartmentFormModel): Partial<Record<keyof OwningDepartmentFormModel, string>> => {
      const schema = {
        owningDepartmentName: (value: unknown) => {
          const strVal = String(value ?? "").trim();
          if (isAllZeros(strVal)) {
            return t("form.validation.nameFormat");
          }
          return commonValidations.masterDescription(t, 100, {
            required: "form.validation.nameRequired",
            format: "form.validation.nameFormat",
            maxLength: "form.validation.nameMaxLength",
          })(value);
        },
        description: (value: unknown) => {
          const strVal = String(value ?? "").trim();
          if (isAllZeros(strVal)) {
            return t("form.validation.descriptionFormat");
          }
          return commonValidations.masterDescription(t, 100, {
            required: "form.validation.descriptionRequired",
            format: "form.validation.descriptionFormat",
            maxLength: "form.validation.descriptionMaxLength",
          })(value);
        },
      };

      return validateForm(data, schema);
    },
    [t]
  );

  const showError = useCallback(
    (fieldName: keyof OwningDepartmentFormModel) => {
      return submittedOnce || touched[fieldName] ? !!errors[fieldName] : false;
    },
    [submittedOnce, touched, errors]
  );

  return {
    validate,
    showError,
  };
}

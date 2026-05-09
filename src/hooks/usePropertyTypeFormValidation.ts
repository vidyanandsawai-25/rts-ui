"use client";

import { useCallback } from "react";
import { PropertyTypeFormModel } from "@/types/property-type.types";
import {
  validateForm,
  commonValidations
} from "@/lib/utils/validation";
import {
  PROPERTY_DESCRIPTION_MAX,
  TYPE_MAX,
  PROPERTY_TYPE_GROUP_MAX
} from "@/components/modules/property-tax/property-type-master/constants";

interface UsePropertyTypeFormValidationProps {
  isEdit: boolean;
  submittedOnce: boolean;
  touched: Record<string, boolean>;
  errors: Partial<Record<keyof PropertyTypeFormModel, string>>;
  t: (key: string) => string;
}

/**
 * Hook for PropertyType form validation logic
 * 
 * Handles:
 * - Form validation schema definition
 * - Error display logic
 * 
 * @param props - Validation configuration
 * @returns Validation functions
 */
export function usePropertyTypeFormValidation({
  isEdit,
  submittedOnce,
  touched,
  errors,
  t,
}: UsePropertyTypeFormValidationProps) {
  const validate = useCallback(
    (data: PropertyTypeFormModel): Partial<Record<keyof PropertyTypeFormModel, string>> => {
      const schema = {
        propertyDescription: commonValidations.masterDescription(t, PROPERTY_DESCRIPTION_MAX, {
          required: 'form.validation.propertyDescriptionRequired',
          format: 'form.validation.propertyDescriptionFormat',
          maxLength: 'form.validation.propertyDescriptionMaxLength',
        }),
        type: commonValidations.masterCode(t, TYPE_MAX, {
          required: 'form.validation.typeRequired',
          format: 'form.validation.typeFormat',
          maxLength: 'form.validation.typeMaxLength',
        }),
        propertyTypeGroup: commonValidations.masterDescription(t, PROPERTY_TYPE_GROUP_MAX, {
          required: 'form.validation.propertyTypeGroupRequired',
          format: 'form.validation.propertyDescriptionFormat',
          maxLength: 'form.validation.propertyTypeGroupMaxLength',
        }),
        searchSequence: commonValidations.masterSearchSequence(t, 'form.validation.sequenceInvalid'),
        propertyTypeCategoryId: (value: unknown) => {
          const numValue = Number(value);
          if (!numValue || numValue === 0) {
            return t('form.validation.categoryRequired');
          }
          return undefined;
        },
        isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
      };
      return validateForm(data, schema);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof PropertyTypeFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  return {
    validate,
    showError,
  };
}

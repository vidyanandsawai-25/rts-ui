import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { FloorInformationFormData } from "@/types/property-old-details.types";
import { oldDetailsValidations } from "@/lib/utils/validation-schemas";


/**
 * Hook to manage Floor Information Form validation.
 * Handles validation logic, error state, and visibility.
 */
export function useFloorFormValidation() {
  const t = useTranslations('quickDataEntry');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);

  /**
   * Validates the form data and updates error state.
   * @returns Record of errors found.
   */
  const validate = useCallback((formData: FloorInformationFormData) => {
    const newErrors = oldDetailsValidations.validateFloorInformation(formData, t);
    setErrors(newErrors);
    setShowErrors(true);
    return newErrors;
  }, [t]);

  /**
   * Resets validation state.
   */
  const resetValidation = useCallback(() => {
    setErrors({});
    setShowErrors(false);
  }, []);

  /**
   * Clears error for a specific field.
   */
  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      if (prev[field]) {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      }
      return prev;
    });
  }, []);

  /**
   * Helper to determine if an error should be shown for a specific field.
   */
  const showError = useCallback((field: string) => showErrors && !!errors[field], [errors, showErrors]);

  return {
    errors,
    showErrors,
    validate,
    resetValidation,
    showError,
    clearError
  };
}

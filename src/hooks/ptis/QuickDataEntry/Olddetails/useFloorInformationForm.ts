import { useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { UseFloorInformationFormProps } from "@/types/property-old-details.types";
import { hasErrors } from "@/lib/utils/validation";
import { useFloorFormState } from "./useFloorFormState";
import { useFloorFormValidation } from "./useFloorFormValidation";
import { useFloorFormApi } from "./useFloorFormApi";

/**
 * Orchestrator hook to manage Floor Information Form.
 * Composes smaller hooks for state, validation, and API operations.
 */
export function useFloorInformationForm({
  propertyId,
  locale,
  initialSubUseTypeOptions
}: UseFloorInformationFormProps) {
  const t = useTranslations('quickDataEntry');

  // 1. Manage Form State
  const {
    formData,
    setFormData,
    handleUseTypeChange,
    handleEdit,
    handleReset: stateReset
  } = useFloorFormState();

  // 2. Manage Validation
  const {
    errors,
    validate,
    resetValidation,
    showError
  } = useFloorFormValidation();

  // 3. Manage API Calls
  const {
    isSubmitting,
    handleSave: apiSave,
    handleDelete
  } = useFloorFormApi(propertyId, locale);

  /**
   * Combined reset for state and validation.
   */
  const handleReset = useCallback(() => {
    stateReset();
    resetValidation();
  }, [stateReset, resetValidation]);

  /**
   * Validates and then triggers the API save.
   */
  const handleSave = useCallback(async () => {
    const newErrors = validate(formData);

    if (hasErrors(newErrors)) {
      toast.error(t('floor.fillRequiredFields'));
      return;
    }

    await apiSave(formData, handleReset);
  }, [formData, validate, apiSave, handleReset, t]);

  return {
    formData,
    setFormData,
    subUseTypeOptions: initialSubUseTypeOptions,
    isSubmitting,
    errors,
    showError,
    handleUseTypeChange,
    handleEdit,
    handleReset,
    handleSave,
    handleDelete
  };
}

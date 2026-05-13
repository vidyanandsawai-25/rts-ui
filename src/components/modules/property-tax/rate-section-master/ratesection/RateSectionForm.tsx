"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Drawer, SaveButton, CancelButton, Input, ValidationMessage } from "@/components/common";
import { RateSectionFormProps, RateSectionFormState, RateSectionFormErrors } from "@/types/rateSectionMaster.types";
import { Layers, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CODE_REGEX, CODE_SANITIZE, DESCRIPTION_REGEX, DESCRIPTION_SANITIZE } from "@/lib/utils/validation";
import { isAllZeros } from "@/lib/utils/validation-rules";
import { useAddRateSection } from "./AddRateSection";
import { useEditRateSection, EditRateSectionContent } from "./EditRateSection";

export type { RateSectionFormState, RateSectionFormErrors } from "@/types/rateSectionMaster.types";

// Shared constants for validation
export const RATE_SECTION_NO_MAX_LENGTH = 20;
export const RATE_SECTION_NAME_MAX_LENGTH = 80;

// Initial form state
export const INITIAL_FORM_STATE: RateSectionFormState = {
  zoneCode: "", zoneEnglish: "", zoneRegional: "", description: "", wards: [], isActive: true,
};

/**
 * Shared validation function for rate section forms (Add & Edit)
 * Uses validation rules from @/lib/utils/validation
 */
export function validateRateSectionForm(
  data: RateSectionFormState,
  t: (key: string, values?: Record<string, string | number>) => string
): RateSectionFormErrors {
  const errors: RateSectionFormErrors = {};
  const zoneCode = data.zoneCode.trim();
  const zoneRegional = data.zoneRegional.trim();

  // Validate zoneCode (Rate Section No)
  if (!zoneCode) {
    errors.zoneCode = t('validation.required', { label: t('form.rateSectionNo') });
  } else if (isAllZeros(zoneCode)) {
    errors.zoneCode = t('validation.allZeros', { label: t('form.rateSectionNo') });
  } else if (zoneCode.length > RATE_SECTION_NO_MAX_LENGTH) {
    errors.zoneCode = t('validation.maxChars', { label: t('form.rateSectionNo'), count: RATE_SECTION_NO_MAX_LENGTH });
  } else if (!CODE_REGEX.test(zoneCode)) {
    errors.zoneCode = t('validation.alphanumericUnderscore', { label: t('form.rateSectionNo') });
  }

  // Validate zoneRegional (Rate Section Name/Description)
  if (!zoneRegional) {
    errors.zoneRegional = t('validation.required', { label: t('form.rateSectionName') });
  } else if (isAllZeros(zoneRegional)) {
    errors.zoneRegional = t('validation.allZeros', { label: t('form.rateSectionName') });
  } else if (zoneRegional.length > RATE_SECTION_NAME_MAX_LENGTH) {
    errors.zoneRegional = t('validation.maxChars', { label: t('form.rateSectionName'), count: RATE_SECTION_NAME_MAX_LENGTH });
  } else if (!DESCRIPTION_REGEX.test(zoneRegional)) {
    errors.zoneRegional = t('validation.descriptionFormat', { label: t('form.rateSectionName') });
  }

  return errors;
}

/**
 * Shared input sanitization for rate section form fields
 * Uses sanitization patterns from @/lib/utils/validation
 */
export function sanitizeRateSectionInput(name: string, value: string): string {
  let newValue = value;
  
  if (name === "zoneCode") {
    newValue = newValue.replace(CODE_SANITIZE, "").toUpperCase();
    if (newValue.length > RATE_SECTION_NO_MAX_LENGTH) {
      newValue = newValue.substring(0, RATE_SECTION_NO_MAX_LENGTH);
    }
  }
  
  if (name === "zoneRegional") {
    newValue = newValue.replace(DESCRIPTION_SANITIZE, "");
    if (newValue.length > RATE_SECTION_NAME_MAX_LENGTH) {
      newValue = newValue.substring(0, RATE_SECTION_NAME_MAX_LENGTH);
    }
  }
  
  return newValue;
}

/**
 * Hook to create shared field handlers for rate section forms
 */
export function useRateSectionFieldHandlers(
  validate: (data: RateSectionFormState) => RateSectionFormErrors,
  form: RateSectionFormState,
  setForm: React.Dispatch<React.SetStateAction<RateSectionFormState>>,
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  setErrors: React.Dispatch<React.SetStateAction<RateSectionFormErrors>>
) {
  const handleChange = useCallback((name: string, value: string): void => {
    const sanitizedValue = sanitizeRateSectionInput(name, value);
    setForm((prev) => ({ ...prev, [name]: sanitizedValue }));
  }, [setForm]);

  const handleBlur = useCallback((name: string): void => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validate(form);
    setErrors((prev) => {
      const newErrors = { ...prev };
      const fieldName = name as keyof RateSectionFormErrors;
      if (fieldErrors[fieldName]) {
        newErrors[fieldName] = fieldErrors[fieldName];
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  }, [validate, form, setTouched, setErrors]);

  return { handleChange, handleBlur };
}

export default function RateSectionForm(props: RateSectionFormProps) {
  const t = useTranslations("rateSectionMaster");
  const { mode, open = true } = props;
  const isEdit = mode === "edit";

  // Always call both hooks to comply with Rules of Hooks
  const addHook = useAddRateSection({
    onClose: props.onClose,
    onSuccess: props.onSuccess,
    existingRates: props.existingRates || []
  });

  const editHook = useEditRateSection({
    onClose: props.onClose,
    onUpdate: props.onUpdate,
    zoneId: props.zoneId || "",
    initialData: props.initialData,
    rates: props.rates || []
  });

  const { form, loading, handleClose, handleSave } = isEdit ? editHook : addHook;

  // Check if form has errors or required fields are empty
  const currentHook = isEdit ? editHook : addHook;
  const hasErrors = Object.keys(currentHook.errors).length > 0;
  const hasEmptyRequiredFields = !form.zoneCode?.trim() || !form.zoneRegional?.trim();
  const isFormInvalid = hasErrors || hasEmptyRequiredFields;

  return (
    <Drawer open={open} onClose={handleClose} width="sm"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t('dialogs.editTitle') : t('dialogs.addTitle')}
            </div>
            {isEdit ? (
              <div className="text-sm text-slate-500">{t('dialogs.editDescription')}</div>
            ) : (
              <div className="mt-2">
                <StatusBadge variant="info" label={form.zoneCode && form.zoneRegional ? `${form.zoneCode} - ${form.zoneRegional}` : form.zoneCode || form.zoneRegional || t('form.rateSectionNoPlaceholder')} />
              </div>
            )}
          </div>
        </div>
      }
      footer={<>
        <CancelButton label={t('actions.cancel')} onClick={handleClose} disabled={loading} />
        <SaveButton label={loading ? (isEdit ? t('actions.updating') : t('actions.saving')) : (isEdit ? t('actions.update') : t('actions.save'))} onClick={handleSave} disabled={loading || isFormInvalid} />
      </>}
    >
      <div className="space-y-6 bg-[#F8FAFF] p-5">
        <div className="space-y-5">
          {isEdit && <EditRateSectionContent {...editHook} />}
          <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
            <Input name="zoneCode" label={t('form.rateSectionNo')} required placeholder={t('form.rateSectionNoPlaceholder')}
              value={form.zoneCode} maxLength={RATE_SECTION_NO_MAX_LENGTH} onChange={(e) => (isEdit ? editHook : addHook).handleChange("zoneCode", e.target.value)}
              onBlur={() => (isEdit ? editHook : addHook).handleBlur("zoneCode")} fullWidth className="text-gray-700" />
            <ValidationMessage message={(isEdit ? editHook : addHook).errors.zoneCode} visible={(isEdit ? editHook : addHook).showError("zoneCode")} />
            <Input name="zoneRegional" label={t('form.rateSectionName')} required placeholder={t('form.rateSectionNamePlaceholder')}
              disabled={loading} value={form.zoneRegional} maxLength={RATE_SECTION_NAME_MAX_LENGTH}
              onChange={(e) => (isEdit ? editHook : addHook).handleChange("zoneRegional", e.target.value)}
              onBlur={() => (isEdit ? editHook : addHook).handleBlur("zoneRegional")} fullWidth className="text-gray-700" />
            <ValidationMessage message={(isEdit ? editHook : addHook).errors.zoneRegional} visible={(isEdit ? editHook : addHook).showError("zoneRegional")} />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            <AlertCircle size={16} />
            <span>{t('form.mandatoryFields')}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}


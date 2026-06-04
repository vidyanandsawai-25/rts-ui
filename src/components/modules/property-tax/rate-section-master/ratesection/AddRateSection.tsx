"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createRateSectionAction } from "@/app/[locale]/property-tax/rate-section-master/actions";
import { RateItem, RateSectionFormState, RateSectionFormErrors, AddRateSectionHookProps } from "@/types/rateSectionMaster.types";
import { 
  validateRateSectionForm, 
  sanitizeRateSectionInput, 
  INITIAL_FORM_STATE 
} from "./RateSectionForm";

export function useAddRateSection({ onClose, onSuccess, existingRates }: AddRateSectionHookProps) {
  const t = useTranslations("rateSectionMaster");
  const router = useRouter();
  const [form, setForm] = useState<RateSectionFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<RateSectionFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // Use shared validation from RateSectionForm
  const validate = useCallback((data: RateSectionFormState): RateSectionFormErrors => {
    return validateRateSectionForm(data, t);
  }, [t]);

  const showError = (field: keyof RateSectionFormErrors): boolean => (submittedOnce || touched[field]) && !!errors[field];

  const checkDuplicateRateSection = (zoneRegional: string) => {
    const regionalValue = zoneRegional.trim().toLowerCase();
    const duplicate = existingRates.find((r: RateItem) => {
      const existingRegional = (r.description || '').trim().toLowerCase();
      return regionalValue && existingRegional === regionalValue;
    });
    if (duplicate) {
      const label = duplicate.description || '';
      toast.error(t('validation.duplicate', { name: label }));
      return true;
    }
    return false;
  };

  // Use shared sanitization from RateSectionForm
  const handleChange = (name: string, value: string): void => {
    const sanitizedValue = sanitizeRateSectionInput(name, value);
    setForm((p) => ({ ...p, [name]: sanitizedValue }));
  };

  const handleBlur = (name: string): void => {
    setTouched((p) => ({ ...p, [name]: true }));
    const fieldErrors = validate(form);
    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof RateSectionFormErrors;
      if (fieldErrors[fieldName]) newErrors[fieldName] = fieldErrors[fieldName];
      else delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleClose = useCallback(() => {
    if (onClose) onClose();
    else router.back();
    setForm(INITIAL_FORM_STATE);
    setErrors({});
    setTouched({});
    setSubmittedOnce(false);
  }, [onClose, router]);

  const handleSave = async () => {
    setSubmittedOnce(true);
    const v = validate(form);
    setErrors(v);
    const isDuplicate = checkDuplicateRateSection(form.zoneRegional);
    if (Object.keys(v).length || isDuplicate) return;
    setLoading(true);
    try {
      const result = await createRateSectionAction({
        description: form.zoneRegional, isActive: form.isActive ?? true
      });
      if (result.success) {
        toast.success(t('messages.createSuccess', { name: form.zoneRegional }));
        setForm(INITIAL_FORM_STATE);
        setErrors({});
        if (onSuccess) onSuccess(String(result.data?.id || ''));
        else if (onClose) onClose();
        else router.back();
        router.refresh();
      } else toast.error(result.error || t('messages.createError'));
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message?.includes("500") ? t('messages.createExistsError', { name: form.zoneRegional }) : err?.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { form, loading, errors, showError, handleChange, handleBlur, handleClose, handleSave };
}

"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { MeterType, MeterTypeFormModel } from "@/types/water-bill/meter-type-master.types";
import {
  ALPHANUMERIC_ONLY_REGEX,
  ALPHANUMERIC_ONLY_SANITIZE,
  ALPHANUMERIC_WITH_SPACES_REGEX,
  ALPHANUMERIC_WITH_SPACES_SANITIZE,
} from "@/lib/utils/validation-rules";

export interface UseMeterTypeFormProps {
  open: boolean;
  initialData?: MeterType | null;
  onClose: () => void;
  onSubmit: (data: MeterTypeFormModel) => Promise<void>;
}

const getInitialFormData = (initialData?: MeterType | null): MeterTypeFormModel => {
  if (initialData) {
    const codeVal = initialData.meterTypeCode || initialData.code || "";
    return {
      id: initialData.id,
      code: codeVal,
      meterTypeCode: codeVal,
      meterType: initialData.meterType || "",
      description: initialData.description || "",
      isActive: initialData.isActive ?? true,
    };
  }
  return { code: "", meterTypeCode: "", meterType: "", description: "", isActive: true };
};

export function useMeterTypeForm({ open, initialData, onClose, onSubmit }: UseMeterTypeFormProps) {
  const isEdit = Boolean(initialData && initialData.id > 0);
  const t = useTranslations("meterTypeMaster");
  const [formData, setFormData] = useState<MeterTypeFormModel>(() => getInitialFormData(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevInitialData, setPrevInitialData] = useState(initialData);
  const [prevOpen, setPrevOpen] = useState(open);

  if (initialData !== prevInitialData || open !== prevOpen) {
    setPrevInitialData(initialData);
    setPrevOpen(open);
    setFormData(getInitialFormData(initialData));
    setErrors({});
    setTouched({});
  }

  const validateField = useCallback((field: string, value: string): string => {
    const trimmed = (value || "").trim();
    if (field === "code" || field === "meterTypeCode") {
      if (!trimmed) return t("validation.codeRequired");
      if (trimmed.length < 2) return t("validation.codeMinLength");
      if (trimmed.length > 20) return t("validation.codeMaxLength");
      if (!ALPHANUMERIC_ONLY_REGEX.test(trimmed)) {
        return t("validation.codeInvalid");
      }
    }
    if (field === "meterType") {
      if (!trimmed) return t("validation.nameRequired");
      if (trimmed.length < 2) return t("validation.nameMinLength");
      if (trimmed.length > 100) return t("validation.nameMaxLength");
      if (!ALPHANUMERIC_WITH_SPACES_REGEX.test(trimmed)) {
        return t("validation.nameInvalid");
      }
    }
    if (field === "description" && trimmed) {
      if (trimmed.length > 300) return t("validation.descriptionMaxLength");
    }
    return "";
  }, [t]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const codeErr = validateField("code", formData.code || "");
    if (codeErr) newErrors.code = codeErr;

    const nameErr = validateField("meterType", formData.meterType || "");
    if (nameErr) newErrors.meterType = nameErr;

    const descErr = validateField("description", formData.description || "");
    if (descErr) newErrors.description = descErr;

    setErrors(newErrors);
    setTouched({ code: true, meterType: true, description: true });
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === "code" ? (formData.code || "") : field === "meterType" ? (formData.meterType || "") : (formData.description || "");
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }, [formData, validateField]);

  const handleCodeChange = useCallback((value: string) => {
    const val = value.replace(ALPHANUMERIC_ONLY_SANITIZE, "").toUpperCase().slice(0, 20);
    setFormData((prev) => ({ ...prev, code: val, meterTypeCode: val }));
    if (touched.code) {
      setErrors((prev) => ({ ...prev, code: validateField("code", val) }));
    }
  }, [touched.code, validateField]);

  const handleMeterTypeChange = useCallback((value: string) => {
    const val = value.replace(ALPHANUMERIC_WITH_SPACES_SANITIZE, "").slice(0, 100);
    setFormData((prev) => ({ ...prev, meterType: val }));
    if (touched.meterType) {
      setErrors((prev) => ({ ...prev, meterType: validateField("meterType", val) }));
    }
  }, [touched.meterType, validateField]);

  const handleDescriptionChange = useCallback((value: string) => {
    const val = value.slice(0, 300);
    setFormData((prev) => ({ ...prev, description: val }));
    if (touched.description) {
      setErrors((prev) => ({ ...prev, description: validateField("description", val) }));
    }
  }, [touched.description, validateField]);

  const handleToggleStatus = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // Error toast is handled by onSubmit in Master hook
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, onClose, validateAll]);

  return {
    isEdit,
    formData,
    errors,
    touched,
    isSubmitting,
    handleCodeChange,
    handleMeterTypeChange,
    handleDescriptionChange,
    handleToggleStatus,
    handleBlur,
    handleSubmit,
  };
}

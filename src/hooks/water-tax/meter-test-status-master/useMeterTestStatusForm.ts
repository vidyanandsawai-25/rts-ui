"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { MeterTestStatus, MeterTestStatusFormModel } from "@/types/water-bill/meter-test-status-master.types";
import {
  ALPHANUMERIC_ONLY_REGEX,
  ALPHANUMERIC_ONLY_SANITIZE,
  ALPHANUMERIC_WITH_SPACES_REGEX,
  ALPHANUMERIC_WITH_SPACES_SANITIZE,
} from "@/lib/utils/validation-rules";

export interface UseMeterTestStatusFormProps {
  open: boolean;
  initialData?: MeterTestStatus | null;
  onClose: () => void;
  onSubmit: (data: MeterTestStatusFormModel) => Promise<void>;
}

const getInitialFormData = (initialData?: MeterTestStatus | null): MeterTestStatusFormModel => {
  if (initialData) {
    const codeVal = initialData.meterTestStatusCode || initialData.code || "";
    return {
      id: initialData.id,
      code: codeVal,
      meterTestStatusCode: codeVal,
      meterTestStatus: initialData.meterTestStatus || "",
      isActive: initialData.isActive ?? true,
    };
  }
  return { code: "", meterTestStatusCode: "", meterTestStatus: "", isActive: true };
};

export function useMeterTestStatusForm({ open, initialData, onClose, onSubmit }: UseMeterTestStatusFormProps) {
  const isEdit = Boolean(initialData && initialData.id > 0);
  const t = useTranslations("meterTestStatusMaster");
  const [formData, setFormData] = useState<MeterTestStatusFormModel>(() => getInitialFormData(initialData));
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
    if (field === "code" || field === "meterTestStatusCode") {
      if (!trimmed) return t("validation.codeRequired");
      if (trimmed.length < 2) return t("validation.codeMinLength");
      if (trimmed.length > 15) return t("validation.codeMaxLength");
      if (!ALPHANUMERIC_ONLY_REGEX.test(trimmed)) {
        return t("validation.codeInvalid");
      }
    }
    if (field === "meterTestStatus") {
      if (!trimmed) return t("validation.nameRequired");
      if (trimmed.length < 2) return t("validation.nameMinLength");
      if (trimmed.length > 30) return t("validation.nameMaxLength");
      if (!ALPHANUMERIC_WITH_SPACES_REGEX.test(trimmed)) {
        return t("validation.nameInvalid");
      }
    }
    return "";
  }, [t]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const codeErr = validateField("code", formData.code || "");
    if (codeErr) newErrors.code = codeErr;

    const nameErr = validateField("meterTestStatus", formData.meterTestStatus || "");
    if (nameErr) newErrors.meterTestStatus = nameErr;

    setErrors(newErrors);
    setTouched({ code: true, meterTestStatus: true });
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === "code" ? (formData.code || "") : (formData.meterTestStatus || "");
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }, [formData, validateField]);

  const handleCodeChange = useCallback((value: string) => {
    const val = value.replace(ALPHANUMERIC_ONLY_SANITIZE, "").toUpperCase().slice(0, 15);
    setFormData((prev) => ({ ...prev, code: val, meterTestStatusCode: val }));
    if (touched.code) {
      setErrors((prev) => ({ ...prev, code: validateField("code", val) }));
    }
  }, [touched.code, validateField]);

  const handleStatusNameChange = useCallback((value: string) => {
    const val = value.replace(ALPHANUMERIC_WITH_SPACES_SANITIZE, "").slice(0, 30);
    setFormData((prev) => ({ ...prev, meterTestStatus: val }));
    if (touched.meterTestStatus) {
      setErrors((prev) => ({ ...prev, meterTestStatus: validateField("meterTestStatus", val) }));
    }
  }, [touched.meterTestStatus, validateField]);

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
    handleStatusNameChange,
    handleToggleStatus,
    handleBlur,
    handleSubmit,
  };
}

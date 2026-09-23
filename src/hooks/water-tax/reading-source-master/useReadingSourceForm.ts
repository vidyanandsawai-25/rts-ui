"use client";

import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { ReadingSource, ReadingSourceFormModel } from "@/types/water-bill/reading-source-master.types";
import {
  ALPHANUMERIC_ONLY_REGEX,
  ALPHANUMERIC_ONLY_SANITIZE,
  ALPHANUMERIC_WITH_SPACES_REGEX,
  ALPHANUMERIC_WITH_SPACES_SANITIZE,
} from "@/lib/utils/validation-rules";

export interface UseReadingSourceFormProps {
  open: boolean;
  initialData?: ReadingSource | null;
  onClose: () => void;
  onSubmit: (data: ReadingSourceFormModel) => Promise<void>;
}

const getInitialFormData = (initialData?: ReadingSource | null): ReadingSourceFormModel => {
  if (initialData) {
    const codeVal = initialData.readingSourceCode || initialData.code || "";
    return {
      id: initialData.id,
      code: codeVal,
      readingSourceCode: codeVal,
      readingSource: initialData.readingSource || "",
      isActive: initialData.isActive ?? true,
    };
  }
  return { code: "", readingSourceCode: "", readingSource: "", isActive: true };
};

export function useReadingSourceForm({ open, initialData, onClose, onSubmit }: UseReadingSourceFormProps) {
  const isEdit = Boolean(initialData && initialData.id > 0);
  const t = useTranslations("readingSourceMaster");
  const [formData, setFormData] = useState<ReadingSourceFormModel>(() => getInitialFormData(initialData));
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
    if (field === "code" || field === "readingSourceCode") {
      if (!trimmed) return t("validation.codeRequired");
      if (trimmed.length < 2) return t("validation.codeMinLength");
      if (trimmed.length > 20) return t("validation.codeMaxLength");
      if (!ALPHANUMERIC_ONLY_REGEX.test(trimmed)) {
        return t("validation.codeInvalid");
      }
    }
    if (field === "readingSource") {
      if (!trimmed) return t("validation.nameRequired");
      if (trimmed.length < 2) return t("validation.nameMinLength");
      if (trimmed.length > 100) return t("validation.nameMaxLength");
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

    const nameErr = validateField("readingSource", formData.readingSource || "");
    if (nameErr) newErrors.readingSource = nameErr;

    setErrors(newErrors);
    setTouched({ code: true, readingSource: true });
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === "code" ? (formData.code || "") : (formData.readingSource || "");
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  }, [formData, validateField]);

  const handleCodeChange = useCallback((value: string) => {
    const val = value.replace(ALPHANUMERIC_ONLY_SANITIZE, "").toUpperCase().slice(0, 20);
    setFormData((prev) => ({ ...prev, code: val, readingSourceCode: val }));
    if (touched.code) {
      setErrors((prev) => ({ ...prev, code: validateField("code", val) }));
    }
  }, [touched.code, validateField]);

  const handleSourceNameChange = useCallback((value: string) => {
    const val = value.replace(ALPHANUMERIC_WITH_SPACES_SANITIZE, "").slice(0, 100);
    setFormData((prev) => ({ ...prev, readingSource: val }));
    if (touched.readingSource) {
      setErrors((prev) => ({ ...prev, readingSource: validateField("readingSource", val) }));
    }
  }, [touched.readingSource, validateField]);

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
    handleSourceNameChange,
    handleToggleStatus,
    handleBlur,
    handleSubmit,
  };
}

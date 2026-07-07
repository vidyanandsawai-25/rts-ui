"use client";

import React, { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { OwningDepartmentFormModel } from "@/types/asset-masters/owning-department.types";
import { saveOwningDepartment } from "@/app/[locale]/assets/configuration/master-data/owning-department/action";
import { sanitizeText } from "@/lib/utils/sanitization";

interface UseOwningDepartmentFormHandlersProps {
  formData: OwningDepartmentFormModel;
  setFormData: React.Dispatch<React.SetStateAction<OwningDepartmentFormModel>>;
  setTouched: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof OwningDepartmentFormModel, string>>>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmittedOnce: React.Dispatch<React.SetStateAction<boolean>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  validate: (data: OwningDepartmentFormModel) => Partial<Record<keyof OwningDepartmentFormModel, string>>;
  isEdit: boolean;
  locale: string;
  t: (key: string) => string;
  initialFormData: OwningDepartmentFormModel;
}

export function useOwningDepartmentFormHandlers({
  formData,
  setFormData,
  setTouched,
  setErrors,
  setIsSubmitting,
  setSubmittedOnce,
  setOpen,
  validate,
  isEdit,
  locale,
  t,
  initialFormData,
}: UseOwningDepartmentFormHandlersProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router, setOpen]);

  const handleClear = useCallback(() => {
    setFormData({ ...initialFormData });
    setErrors({});
    setTouched({});
    setSubmittedOnce(false);
  }, [initialFormData, setFormData, setErrors, setTouched, setSubmittedOnce]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    if (name === "owningDepartmentName") {
      sanitizedValue = sanitizeText(value, 100);
    } else if (name === "description") {
      sanitizedValue = sanitizeText(value, 250);
    }
    setFormData((p) => ({ ...p, [name]: sanitizedValue }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }, [setFormData, setErrors]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof OwningDepartmentFormModel;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    const fieldErrors = validate(updatedFormData);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (fieldErrors[fieldName]) {
        newErrors[fieldName] = fieldErrors[fieldName];
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  }, [formData, validate, setTouched, setErrors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);

    const nextErrors = validate(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error(t("form.validation.fixErrors"));
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("locale", locale);
      fd.set("owningDepartmentName", formData.owningDepartmentName);
      fd.set("description", formData.description);
      fd.set("isActive", String(formData.isActive));

      const res = await saveOwningDepartment(isEdit ? String(formData.id ?? "") : "", fd);
      if (res?.ok) {
        toast.success(isEdit ? t("form.messages.updateSuccess") : t("form.messages.createSuccess"));
        setOpen(false);
        startTransition(() => {
          router.push(`/${locale}/assets/configuration/master-data/owning-department`);
          router.refresh();
        });
        return;
      }

      if (res?.error === "duplicate") {
        toast.error(t("form.messages.error") + " (Duplicate record)");
        return;
      }
      toast.error(res?.message || res?.error || t("form.messages.error"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("form.messages.error"));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isEdit, locale, t, validate, setErrors, setSubmittedOnce, setIsSubmitting, setOpen, router]);

  return {
    handleChange,
    handleBlur,
    handleSubmit,
    handleClear,
    handleClose,
  };
}

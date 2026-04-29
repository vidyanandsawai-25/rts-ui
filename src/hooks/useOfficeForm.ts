"use client";

import React, { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createOfficeAction,
  updateOfficeAction,
} from "@/app/[locale]/configuration-settings/office-master/action";
import { Office, OfficeFormModel } from "@/types/office.types";
import { officeValidations } from "@/lib/utils/validation";


interface UseOfficeFormProps {
  officeId: number | null;
  initialData?: Office;
  onSuccess: () => void;
  onCancel: () => void;
}

export function useOfficeForm({
  officeId,
  initialData,
  onSuccess,
  onCancel,
}: UseOfficeFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("office");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(officeId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [formData, setFormData] = useState<OfficeFormModel>({
    officeId: officeId ?? initialData?.officeId,
    officeCode: initialData?.officeCode ?? "",
    officeName: initialData?.officeName ?? "",
    type: initialData?.type ?? "",
    address: initialData?.address ?? "",
    city: initialData?.city ?? "",
    pincode: initialData?.pincode ?? "",
    phone: initialData?.phone ?? "",
    emailId: initialData?.emailId ?? "",
    officeIncharge: initialData?.officeIncharge ?? null,
    designationMasterId: initialData?.designationMasterId ?? null,
    establishedDate: initialData?.establishedDate ?? "",
    isActive: initialData?.isActive ?? true,
    updatedBy: 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof OfficeFormModel, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof OfficeFormModel, boolean>>>({});
  const [open, setOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const validate = useCallback(
    (data: OfficeFormModel) => {
      const v = officeValidations.validate(data, t, isEdit);
      setErrors(v);
      return v;
    },
    [t, isEdit]
  );


  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | null = value;
    
    if (type === 'number' || ['officeIncharge', 'designationMasterId'].includes(name)) {
      processedValue = value === '' ? null : Number(value);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: processedValue };
      if (submittedOnce) validate(updated);
      return updated;
    });
  }, [submittedOnce, validate]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate(formData);
  }, [formData, validate]);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      startTransition(() => {
        router.push(`/${locale}/configuration-settings/office-master`);
      });
    }, 400); 
  }, [router, locale]);

  const handleCancel = useCallback(() => {
    onCancel();
    closeAndRoute();
  }, [onCancel, closeAndRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    if (Object.keys(v).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = isEdit ? await updateOfficeAction(formData) : await createOfficeAction(formData);
      if (result.success) {
        toast.success(isEdit ? t("success.updated") : t("success.created"));
        onSuccess();
        startTransition(() => {
          router.refresh();
          closeAndRoute();
        });
      } else {
        toast.error(result.message || "Operation failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = useCallback((): void => {
    setFormData((prev) => {
      const updated = { ...prev, isActive: !prev.isActive };
      if (submittedOnce) validate(updated);
      return updated;
    });
  }, [submittedOnce, validate]);

  const showError = useCallback((field: keyof OfficeFormModel) => {
    return (submittedOnce || touched[field]) && !!errors[field];
  }, [submittedOnce, touched, errors]);

  return {
    formData,
    errors,
    isSubmitting: isSubmitting || isPending,
    isActive: formData.isActive,
    open,
    setOpen,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  };
}

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createOfficeAction,
  updateOfficeAction,
} from "@/app/[locale]/configuration-settings/office-master/action";
import { OfficeFormModel, Office } from "@/types/office.types";

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
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: OfficeFormModel): Partial<Record<keyof OfficeFormModel, string>> => {
      const fieldErrors: Partial<Record<keyof OfficeFormModel, string>> = {};
      if (!data.officeCode || !data.officeCode.trim()) {
        fieldErrors.officeCode = "Office Code is required";
      }
      if (!data.officeName || !data.officeName.trim()) {
        fieldErrors.officeName = "Office Name is required";
      }
      return fieldErrors;
    },
    []
  );

  const showError = useCallback((field: keyof OfficeFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    
    setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        const ve = validate(updated);
        setErrors((errs) => {
           const newE = { ...errs };
           const fieldName = name as keyof OfficeFormModel;
           if(ve[fieldName]) newE[fieldName] = ve[fieldName];
           else delete newE[fieldName];
           return newE;
        });
        return updated;
    });
  }, [validate]);

  const mapApiError = useCallback((result: { statusCode?: number; message?: string }) => {
    if (result.statusCode === 409) return t("apiErrors.duplicateRecord") || "Duplicate Record";
    if (result.statusCode === 404) return t("apiErrors.notFound") || "Not Found";
    return result.message || "Operation failed";
  }, [t]);

  const [open, setOpen] = useState(true);
  const [, startTransition] = React.useTransition();

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

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) return;

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateOfficeAction(formData)
        : await createOfficeAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(isEdit ? "Office updated successfully" : "Office created successfully");
      
      onSuccess();
      startTransition(() => {
          router.refresh();
          closeAndRoute();
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = useCallback((): void => {
    setIsActive((prev) => {
      const newValue = !prev;
      setFormData((p) => ({ ...p, isActive: newValue }));
      return newValue;
    });
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    isActive,
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

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createAssetGrievanceRemarkAction,
  updateAssetGrievanceRemarkAction,
} from "@/app/[locale]/assets/configuration/master-data/grievance-remark-master/action";
import { AssetGrievanceRemarkFormModel, AssetGrievanceRemark } from "@/types/asset-masters/asset-grievance-remark.types";
import {
  sanitizeRemarkField,
  validateGrievanceRemarkForm,
  mapGrievanceRemarkApiError,
} from "./validation";

interface UseAssetGrievanceRemarkFormProps {
  id: number | null;
  initialData?: AssetGrievanceRemark;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useAssetGrievanceRemarkForm({
  id,
  initialData,
  onSuccess = () => { },
  onCancel = () => { },
}: UseAssetGrievanceRemarkFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("assetGrievanceRemark");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<AssetGrievanceRemarkFormModel>({
    id: id ?? initialData?.id,
    grievanceCategoryId: initialData?.grievanceCategoryId ?? 0,
    remark: initialData?.remark ?? "",
    description: initialData?.description ?? "",
    isActive: initialData?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AssetGrievanceRemarkFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: AssetGrievanceRemarkFormModel): Partial<Record<keyof AssetGrievanceRemarkFormModel, string>> => {
      return validateGrievanceRemarkForm(data, t, isEdit);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof AssetGrievanceRemarkFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: sanitizeRemarkField(name, value) }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    const sanitized = sanitizeRemarkField(name, value);
    const updated = { ...formData, [name]: sanitized };
    setFormData(updated);
    const fieldErrors = validate(updated);
    setErrors(p => {
      const err = { ...p };
      const field = name as keyof AssetGrievanceRemarkFormModel;
      if (fieldErrors[field]) err[field] = fieldErrors[field]; else delete err[field];
      return err;
    });
  }, [formData, validate]);

  const [open, setOpen] = useState(true);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      router.push(`/${locale}/assets/configuration/master-data/grievance-remark-master`);
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
    setErrors(v);
    if (Object.keys(v).length) return;
    setIsSubmitting(true);
    try {
      const res = isEdit ? await updateAssetGrievanceRemarkAction(formData) : await createAssetGrievanceRemarkAction(formData);
      if (!res.success) {
        toast.error(mapGrievanceRemarkApiError(res, t, tCommon));
        return;
      }
      toast.success(res.message || t(isEdit ? "messages.updateSuccess" : "messages.addSuccess"));
      onSuccess();
      closeAndRoute();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = useCallback((checked: boolean) => {
    setIsActive(checked);
    setFormData(p => ({ ...p, isActive: checked }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    const parsed = Number(value);
    const numVal = value && Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
    setFormData(p => {
      const updated = { ...p, [name]: numVal };
      const errs = validate(updated);
      setErrors(prev => {
        const err = { ...prev };
        const field = name as keyof AssetGrievanceRemarkFormModel;
        if (errs[field]) err[field] = errs[field]; else delete err[field];
        return err;
      });
      return updated;
    });
  }, [validate]);

  return {
    formData,
    errors,
    isSubmitting,
    isActive,
    open,
    setOpen,
    handleChange,
    handleBlur,
    handleSelectChange,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  };
}

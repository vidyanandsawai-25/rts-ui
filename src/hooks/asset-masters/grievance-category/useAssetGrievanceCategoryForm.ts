"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createAssetGrievanceCategoryAction,
  updateAssetGrievanceCategoryAction,
} from "@/app/[locale]/assets/configuration/master-data/grievance-category-master/action";
import { AssetGrievanceCategoryFormModel, AssetGrievanceCategory } from "@/types/asset-masters/asset-grievance-category.types";
import {
  sanitizeCategoryField,
  validateGrievanceCategoryForm,
  mapGrievanceCategoryApiError,
} from "./validation";

interface UseAssetGrievanceCategoryFormProps {
  id: number | null;
  initialData?: AssetGrievanceCategory;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useAssetGrievanceCategoryForm({
  id,
  initialData,
  onSuccess = () => { },
  onCancel = () => { },
}: UseAssetGrievanceCategoryFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("assetGrievanceCategory");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<AssetGrievanceCategoryFormModel>({
    id: id ?? initialData?.id,
    categoryName: initialData?.categoryName ?? "",
    description: initialData?.description ?? "",
    resolutionSlaDays: initialData?.resolutionSlaDays ?? Number.NaN,
    isActive: initialData?.isActive ?? true,
  });
  const [slaValue, setSlaValue] = useState<string>(
    initialData?.resolutionSlaDays?.toString() ?? ""
  );
  const [errors, setErrors] = useState<Partial<Record<keyof AssetGrievanceCategoryFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: AssetGrievanceCategoryFormModel): Partial<Record<keyof AssetGrievanceCategoryFormModel, string>> => {
      return validateGrievanceCategoryForm(data, t, isEdit);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof AssetGrievanceCategoryFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "resolutionSlaDays") {
      const val = value.replace(/[^0-9]/g, "").substring(0, 3);
      setSlaValue(val);
      setFormData(p => ({ ...p, resolutionSlaDays: val === "" ? Number.NaN : Number(val) }));
    } else {
      setFormData(p => ({ ...p, [name]: sanitizeCategoryField(name, value) }));
    }
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    let sanitized = sanitizeCategoryField(name, value);
    if (name === "resolutionSlaDays") {
      sanitized = value.replace(/[^0-9]/g, "").substring(0, 3);
      setSlaValue(sanitized);
    }
    const updated = { ...formData, [name]: name === "resolutionSlaDays" ? (sanitized === "" ? Number.NaN : Number(sanitized)) : sanitized };
    setFormData(updated);
    const fieldErrors = validate(updated);
    setErrors(p => {
      const err = { ...p };
      const field = name as keyof AssetGrievanceCategoryFormModel;
      if (fieldErrors[field]) err[field] = fieldErrors[field]; else delete err[field];
      return err;
    });
  }, [formData, validate]);

  const [open, setOpen] = useState(true);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      router.push(`/${locale}/assets/configuration/master-data/grievance-category-master`);
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
      const res = isEdit ? await updateAssetGrievanceCategoryAction(formData) : await createAssetGrievanceCategoryAction(formData);
      if (!res.success) {
        toast.error(mapGrievanceCategoryApiError(res, t, tCommon));
        return;
      }
      toast.success(res.message || t(isEdit ? "master.toast.updateSuccess" : "master.toast.createSuccess"));
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

  return {
    formData,
    slaValue,
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

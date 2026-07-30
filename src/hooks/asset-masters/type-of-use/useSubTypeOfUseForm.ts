"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createAssetSubTypeOfUseAction,
  updateAssetSubTypeOfUseAction,
} from "@/app/[locale]/assets/configuration/master-data/type-of-use/action";
import { AssetSubTypeOfUseFormModel, AssetSubTypeOfUse } from "@/types/asset-masters/type-of-use.types";

import { validateSubTypeOfUseForm, sanitizeSubTypeOfUseFieldValue } from "./validation";
import { getErrorMessage } from "./error-mapping";


interface UseSubTypeOfUseFormProps {
  id: number | null;
  initialData?: AssetSubTypeOfUse;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useSubTypeOfUseForm({
  id,
  initialData,
  onSuccess = () => {},
  onCancel = () => {},
}: UseSubTypeOfUseFormProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("assetTypeOfUse");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const urlTypeOfUseId = parseInt(sp.get("selectedTypeOfUseId") ?? "0", 10) || 0;

  const [formData, setFormData] = useState<AssetSubTypeOfUseFormModel>({
    id: id ?? initialData?.id,
    isActive: initialData?.isActive ?? true,
    typeOfUseId: initialData?.typeOfUseId ?? urlTypeOfUseId,
    description: initialData?.description ?? "",
    searchSequence: initialData?.searchSequence ?? 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AssetSubTypeOfUseFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: AssetSubTypeOfUseFormModel): Partial<Record<keyof AssetSubTypeOfUseFormModel, string>> => {
      return validateSubTypeOfUseForm(data, t, isEdit);
    },
    [t, isEdit]
  );

  const showError = useCallback(
    (field: keyof AssetSubTypeOfUseFormModel): boolean =>
      (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    let val: string | number = value;

    if (name === "typeOfUseId" || name === "searchSequence") {
      val = Number(value) || 0;
    } else {
      val = sanitizeSubTypeOfUseFieldValue(name, value);
    }

    setFormData((p) => ({
      ...p,
      [name]: val,
    }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    let sanitizedValue: string | number = value;
    if (name === "typeOfUseId" || name === "searchSequence") {
      sanitizedValue = Number(value) || 0;
    } else {
      sanitizedValue = sanitizeSubTypeOfUseFieldValue(name, value);
    }

    const updatedFormData = {
      ...formData,
      [name]: sanitizedValue,
    };
    setFormData(updatedFormData);

    const fieldErrors = validate(updatedFormData);
    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof AssetSubTypeOfUseFormModel;
      if (fieldErrors[fieldName]) {
        newErrors[fieldName] = fieldErrors[fieldName];
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });
  }, [formData, validate]);

  const mapApiError = useCallback((result: { statusCode?: number; message?: string; errors?: Record<string, string> | null }) => {
    if (result.errors) {
      for (const val of Object.values(result.errors)) {
        if (val) {
          const cleanVal = val.replace(/\.$/, "");
          const translationKey = `apiErrors.${cleanVal}` as never;
          try {
            const translated = t(translationKey);
            if (translated && translated !== translationKey && !translated.includes(translationKey)) {
              return translated;
            }
          } catch {}
        }
      }
    }
    return getErrorMessage(result.message, result.statusCode, t, tCommon, t("subtype.title"));
  }, [t, tCommon]);

  const [open, setOpen] = useState(true);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      const params = sp.toString() ? `?${sp.toString()}` : "";
      router.push(`/${locale}/assets/configuration/master-data/type-of-use${params}`);
    }, 400);
  }, [router, locale, sp]);

  const handleCancel = useCallback(() => {
    onCancel();
    closeAndRoute();
  }, [onCancel, closeAndRoute]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      toast.error(t("errors.fixErrors", { default: "Please fix validation errors" }));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateAssetSubTypeOfUseAction(formData)
        : await createAssetSubTypeOfUseAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(result.message || (isEdit
        ? t("messages.subTypeUpdated", { default: "Sub-Type updated successfully" })
        : t("messages.subTypeCreated", { default: "Sub-Type created successfully" })
      ));

      onSuccess();
      router.refresh();
      closeAndRoute();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = useCallback((checked: boolean): void => {
    setIsActive(checked);
    setFormData((p) => ({ ...p, isActive: checked }));
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

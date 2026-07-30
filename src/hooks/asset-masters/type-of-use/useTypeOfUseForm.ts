"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createAssetTypeOfUseAction,
  updateAssetTypeOfUseAction,
} from "@/app/[locale]/assets/configuration/master-data/type-of-use/action";
import { AssetTypeOfUseFormModel, AssetTypeOfUse } from "@/types/asset-masters/type-of-use.types";
import { validateTypeOfUseForm, sanitizeTypeOfUseFieldValue } from "./validation";
import { getErrorMessage } from "./error-mapping";


interface UseTypeOfUseFormProps {
  id: number | null;
  initialData?: AssetTypeOfUse;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialTypes?: { id: number; name: string }[];
  onCategoryChange?: (categoryId: number) => void;
}

export function useTypeOfUseForm({
  id,
  initialData,
  onSuccess = () => {},
  onCancel = () => {},
  initialTypes = [],
  onCategoryChange,
}: UseTypeOfUseFormProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("assetTypeOfUse");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const urlGroupId = parseInt(sp.get("selectedGroupId") ?? "0", 10) || 0;
  const urlCategoryId = parseInt(sp.get("assetCategoryId") ?? "0", 10) || 0;

  const [formData, setFormData] = useState<AssetTypeOfUseFormModel>({
    id: id ?? initialData?.id,
    isActive: initialData?.isActive ?? true,
    assetCategoryId: initialData?.assetCategoryId ?? urlCategoryId,
    assetTypeId: initialData?.assetTypeId ?? 0,
    typeOfUseGroupId: initialData?.typeOfUseGroupId ?? urlGroupId,
    typeOfUseCode: initialData?.typeOfUseCode ?? "",
    description: initialData?.description ?? "",
    type: initialData?.type ?? "",
    searchSequence: initialData?.searchSequence ?? 1,
  });

  const types = initialTypes;
  const isLoadingTypes = false;
  const [errors, setErrors] = useState<Partial<Record<keyof AssetTypeOfUseFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: AssetTypeOfUseFormModel): Partial<Record<keyof AssetTypeOfUseFormModel, string>> => {
      return validateTypeOfUseForm(data, t, isEdit);
    },
    [t, isEdit]
  );

  const showError = useCallback(
    (field: keyof AssetTypeOfUseFormModel): boolean =>
      (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const parseVal = (name: string, value: string) =>
    ["assetCategoryId", "assetTypeId", "typeOfUseGroupId", "searchSequence"].includes(name)
      ? (Number(value) || 0)
      : sanitizeTypeOfUseFieldValue(name, value);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    const val = parseVal(name, value);
    setFormData((p) => ({ ...p, [name]: val }));
    if (name === "assetCategoryId") onCategoryChange?.(Number(val));
  }, [onCategoryChange]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const val = parseVal(name, value);
    const updated = { ...formData, [name]: val };
    setFormData(updated);
    if (name === "assetCategoryId") onCategoryChange?.(Number(val));

    const fieldErrors = validate(updated);
    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof AssetTypeOfUseFormModel;
      if (fieldErrors[fieldName]) newErrors[fieldName] = fieldErrors[fieldName];
      else delete newErrors[fieldName];
      return newErrors;
    });
  }, [formData, validate, onCategoryChange]);

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
    return getErrorMessage(result.message, result.statusCode, t, tCommon, t("type.title"));
  }, [t, tCommon]);

  const [open, setOpen] = useState(true);

  const closeAndRoute = useCallback((updatedGroupId?: number) => {
    setOpen(false);
    setTimeout(() => {
      const params = new URLSearchParams(sp.toString());
      if (updatedGroupId !== undefined) {
        params.set("selectedGroupId", String(updatedGroupId));
        params.set("typePn", "1");
      }
      const paramsStr = params.toString() ? `?${params.toString()}` : "";
      router.push(`/${locale}/assets/configuration/master-data/type-of-use${paramsStr}`);
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
      toast.error(t("errors.fixErrors"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateAssetTypeOfUseAction(formData)
        : await createAssetTypeOfUseAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(result.message || (isEdit
        ? t("messages.typeUpdated", { default: "Type updated successfully" })
        : t("messages.typeCreated", { default: "Type created successfully" })
      ));

      onSuccess();
      router.refresh();
      closeAndRoute(formData.typeOfUseGroupId);
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
    types,
    open,
    setOpen,
    isLoadingTypes,
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

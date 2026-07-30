"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { createTypeOfUseGroupAction, updateTypeOfUseGroupAction } from "@/app/[locale]/assets/configuration/master-data/type-of-use/action";
import { TypeOfUseGroupFormModel, TypeOfUseGroup } from "@/types/asset-masters/type-of-use.types";

import { validateGroupForm, sanitizeGroupFieldValue } from "./validation";
import { getErrorMessage } from "./error-mapping";


interface UseGroupFormProps {
  id: number | null;
  initialData?: TypeOfUseGroup;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useGroupForm({
  id,
  initialData,
  onSuccess = () => { },
  onCancel = () => { },
}: UseGroupFormProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("assetTypeOfUse");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<TypeOfUseGroupFormModel>({
    id: id ?? initialData?.id,
    typeOfUseGroupCode: initialData?.typeOfUseGroupCode ?? "",
    groupName: initialData?.groupName ?? "",
    groupIcon: initialData?.groupIcon ?? "home",
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TypeOfUseGroupFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: TypeOfUseGroupFormModel): Partial<Record<keyof TypeOfUseGroupFormModel, string>> => {
      return validateGroupForm(data, t, isEdit);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof TypeOfUseGroupFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const sanitized = sanitizeGroupFieldValue(name, value);
    setFormData((p) => ({
      ...p,
      [name]: sanitized,
    }));
  }, []);

  const handleValueChange = useCallback((name: string, value: string): void => {
    setFormData((p) => ({
      ...p,
      [name]: value,
    }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const sanitizedValue = sanitizeGroupFieldValue(name, value);
    const updatedFormData = {
      ...formData,
      [name]: sanitizedValue,
    };
    setFormData(updatedFormData);

    const fieldErrors = validate(updatedFormData);
    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof TypeOfUseGroupFormModel;
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
    return getErrorMessage(result.message, result.statusCode, t, tCommon, t("group.title"));
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
        ? await updateTypeOfUseGroupAction(formData)
        : await createTypeOfUseGroupAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(result.message || (isEdit
        ? t("messages.groupUpdated", { default: "Group updated successfully" })
        : t("messages.groupCreated", { default: "Group created successfully" })
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
    handleValueChange,
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

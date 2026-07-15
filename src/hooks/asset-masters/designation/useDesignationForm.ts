"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createDesignationAction,
  updateDesignationAction,
} from "@/app/[locale]/assets/configuration/master-data/designation-master/action";
import { DesignationFormModel, Designation } from "@/types/asset-masters/designation.types";
import {
  CODE_SANITIZE,
  DESCRIPTION_SANITIZE,
  validateForm,
  commonValidations,
  DESCRIPTION_REGEX
} from "@/lib/utils/validation";

const CODE_MAX = 50;
const NAME_MAX = 100;
const DESCRIPTION_MAX = 200;

const sanitizeFieldValue = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "designationDescription") {
    sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > DESCRIPTION_MAX) {
      sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
    }
  } else if (name === "designationName" || name === "designationLocal") {
    sanitizedValue = value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  } else if (name === "designationCode") {
    sanitizedValue = value.replace(CODE_SANITIZE, "").toUpperCase();
    if (sanitizedValue.length > CODE_MAX) {
      sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
    }
  }
  return sanitizedValue;
};

interface UseDesignationFormProps {
  id: number | null;
  initialData?: Designation;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useDesignationForm({
  id,
  initialData,
  onSuccess = () => { },
  onCancel = () => { },
}: UseDesignationFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("designation");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<DesignationFormModel>({
    id: id ?? initialData?.id,
    designationCode: initialData?.designationCode ?? "",
    designationName: initialData?.designationName ?? "",
    designationLocal: initialData?.designationLocal ?? "",
    designationDescription: initialData?.designationDescription ?? "",
    isActive: initialData?.isActive ?? true,
    owningDepartmentId: initialData?.owningDepartmentId ?? null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DesignationFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: DesignationFormModel): Partial<Record<keyof DesignationFormModel, string>> => {
      const schema = {
        designationCode: commonValidations.masterCode(t, CODE_MAX, {
          required: 'form.validation.designationCodeRequired',
          format: 'form.validation.designationCodeFormat',
          maxLength: 'form.validation.designationCodeMaxLength',
        }),
        designationName: (val: unknown) => {
          const str = String(val ?? '').trim();
          if (!str) return t('form.validation.designationNameRequired');
          if (str.length > NAME_MAX) return t('form.validation.designationNameMaxLength', { count: NAME_MAX });
          if (!/^[\p{L}\p{M}\p{N}]+(?:[\s][\p{L}\p{M}\p{N}]+)*$/u.test(str)) return t('form.validation.designationNameFormat');
          return undefined;
        },
        designationLocal: (val: unknown) => {
          const str = String(val ?? '').trim();
          if (!str) return t('form.validation.designationLocalRequired');
          if (str.length > NAME_MAX) return t('form.validation.designationLocalMaxLength', { count: NAME_MAX });
          return undefined;
        },
        designationDescription: (val: unknown) => {
          const str = String(val ?? '').trim();
          if (!str) return undefined;
          if (str.length > DESCRIPTION_MAX) return t('form.validation.designationDescriptionMaxLength', { count: DESCRIPTION_MAX });
          if (!DESCRIPTION_REGEX.test(str)) return t('form.validation.descriptionFormat');
          return undefined;
        },
        isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
        owningDepartmentId: (val: unknown) => !val ? t('form.validation.owningDepartmentRequired') : undefined,
      };
      return validateForm(data, schema);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof DesignationFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeFieldValue(name, value);
    setFormData((p) => ({
      ...p,
      [name]: sanitizedValue,
    }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const sanitizedValue = sanitizeFieldValue(name, value);
    const updatedFormData = {
      ...formData,
      [name]: sanitizedValue,
    };

    setFormData(updatedFormData);

    const fieldErrors = validate(updatedFormData);
    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof DesignationFormModel;

      if (fieldErrors[fieldName]) {
        newErrors[fieldName] = fieldErrors[fieldName];
      } else {
        delete newErrors[fieldName];
      }

      return newErrors;
    });
  }, [formData, validate]);

  const mapApiError = useCallback((result: { statusCode?: number; message?: string }) => {
    const errorMap: Record<number, string> = {
      409: t("apiErrors.duplicateRecord"),
      404: t("apiErrors.notFound"),
      401: tCommon("errors.unauthorized"),
      403: tCommon("errors.unauthorized"),
    };

    const code = result.statusCode ?? 0;
    if (errorMap[code]) return errorMap[code];

    if (code === 400) {
      const msg = result.message?.toLowerCase() || "";
      if (msg.includes("duplicate") || msg.includes("already exists")) {
        return t("apiErrors.duplicateRecord");
      }
      return result.message || t("apiErrors.invalidData");
    }

    if (code >= 500) return tCommon("errors.serverError");
    return result.message || t("apiErrors.operationFailed");
  }, [t, tCommon]);

  const [open, setOpen] = useState(true);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      router.push(`/${locale}/assets/configuration/master-data/designation-master`);
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
        ? await updateDesignationAction(formData)
        : await createDesignationAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(result.message || (isEdit
        ? t("success.updated", { code: formData.designationCode })
        : t("success.created", { code: formData.designationCode })
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

  const handleSelectChange = useCallback((name: string, value: string): void => {
    const parsed = Number(value);
    const numericValue = value && Number.isFinite(parsed) ? parsed : null;

    setFormData((p) => {
      const updated = {
        ...p,
        [name]: numericValue,
      };

      const fieldErrors = validate(updated);
      setErrors((prev) => {
        const newErrors = { ...prev };
        const fieldName = name as keyof DesignationFormModel;

        if (fieldErrors[fieldName]) {
          newErrors[fieldName] = fieldErrors[fieldName];
        } else {
          delete newErrors[fieldName];
        }

        return newErrors;
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

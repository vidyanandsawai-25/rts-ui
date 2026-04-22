"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createConstructionAction,
  updateConstructionAction,
} from "@/app/[locale]/property-tax/constructiontype/action";
import { ConstructionTypeFormModel, ConstructionType } from "@/types/construction.types";
import { 
  CODE_SANITIZE, 
  DESCRIPTION_SANITIZE, 
  validateForm, 
  commonValidations 
} from "@/lib/utils/validation";
import { CONSTRUCTION_CODE_MAX, DESCRIPTION_MAX } from "@/components/modules/property-tax/construction-type-master/constants";

interface UseConstructionFormProps {
  constructionTypeId: number | null;
  initialData?: ConstructionType;
  onSuccess: () => void;
  onCancel: () => void;
}

export function useConstructionForm({
  constructionTypeId,
  initialData,
  onSuccess,
  onCancel,
}: UseConstructionFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("construction.constructionType");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(constructionTypeId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<ConstructionTypeFormModel>({
    constructionTypeId: constructionTypeId ?? initialData?.constructionTypeId,
    constructionCode: initialData?.constructionCode ?? "",
    description: initialData?.description ?? "",
    searchSequence: initialData?.searchSequence ?? 0,
    isActive: initialData?.isActive ?? true,
    updatedBy: 1,
  });

  const [searchSequenceValue, setSearchSequenceValue] = useState<string>(
    initialData?.searchSequence?.toString() ?? "0"
  );

  const [errors, setErrors] = useState<Partial<Record<keyof ConstructionTypeFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: ConstructionTypeFormModel): Partial<Record<keyof ConstructionTypeFormModel, string>> => {
      const schema = {
        constructionCode: commonValidations.masterCode(t, CONSTRUCTION_CODE_MAX, {
          required: 'form.validation.constructionCodeRequired',
          format: 'form.validation.constructionCodeFormat',
          maxLength: 'form.validation.constructionCodeMaxLength',
        }),
        description: commonValidations.masterDescription(t, DESCRIPTION_MAX, {
          required: 'form.validation.descriptionRequired',
          format: 'form.validation.descriptionFormat',
          maxLength: 'form.validation.descriptionMaxLength',
        }),
        searchSequence: commonValidations.masterSearchSequence(t, 'form.validation.sequenceInvalid'),
        isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
      };
      return validateForm(data, schema);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof ConstructionTypeFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    
    let sanitizedValue = value;
    if (name === "description") {
      sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "");
      if (sanitizedValue.length > DESCRIPTION_MAX) {
        sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
      }
    } else if (name === "constructionCode") {
      sanitizedValue = value.replace(CODE_SANITIZE, "");
      if (sanitizedValue.length > CONSTRUCTION_CODE_MAX) {
        sanitizedValue = sanitizedValue.substring(0, CONSTRUCTION_CODE_MAX);
      }
    }

    if (name === "searchSequence") {
      setSearchSequenceValue(value);
      setFormData((p) => ({
        ...p,
        searchSequence: value === "" ? 0 : Number(value),
      }));
      return;
    }

    setFormData((p) => ({
      ...p,
      [name]: sanitizedValue,
    }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    let sanitizedValue = value;
    if (name === "searchSequence" && value === "") {
      sanitizedValue = "0";
      setSearchSequenceValue("0");
    }

    const updatedFormData = {
      ...formData,
      [name]: name === "searchSequence" ? Number(sanitizedValue || 0) : sanitizedValue,
    };

    setFormData(updatedFormData);

    const fieldErrors = validate(updatedFormData);
    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof ConstructionTypeFormModel;
      
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
  const [, startTransition] = React.useTransition();

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      startTransition(() => {
        router.push(`/${locale}/property-tax/constructiontype`);
      });
    }, 400); // Increased delay for smoother animation
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
        ? await updateConstructionAction(formData)
        : await createConstructionAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(isEdit
        ? t("success.updated", { code: formData.constructionCode })
        : t("success.created", { code: formData.constructionCode })
      );
      
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
    searchSequenceValue,
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

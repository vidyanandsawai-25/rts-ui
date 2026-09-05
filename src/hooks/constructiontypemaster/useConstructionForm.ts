"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAliasLabel } from "@/lib/providers/AliasLabelsProvider";
import {
  createConstructionAction,
  updateConstructionAction,
} from "@/app/[locale]/property-tax/constructiontype/action";
import { ConstructionTypeFormModel, ConstructionType } from "@/types/construction.types";
import {
  CODE_SANITIZE,
  DESCRIPTION_SANITIZE,
  HAS_LETTER_REGEX,
  validateForm,
  commonValidations
} from "@/lib/utils/validation";
import { CONSTRUCTION_CODE_MAX, DESCRIPTION_MAX } from "@/components/modules/property-tax/construction-type-master/constants";

interface UseConstructionFormProps {
  id: number | null;
  initialData?: ConstructionType;
  onSuccess: () => void;
  onCancel: () => void;
}

export function useConstructionForm({
  id,
  initialData,
  onSuccess,
  onCancel,
}: UseConstructionFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("construction.constructionType");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const constructionTypeLabel = useAliasLabel("Construction_Type", t("aliasFallback.entity"));
  const values = useMemo(
    () => ({ constructionType: constructionTypeLabel, entity: constructionTypeLabel }),
    [constructionTypeLabel]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<ConstructionTypeFormModel>({
    id: id ?? initialData?.id,
    constructionCode: initialData?.constructionCode ?? "",
    description: initialData?.description ?? "",
    searchSequence: initialData?.searchSequence ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const [searchSequenceValue, setSearchSequenceValue] = useState<string>(
    initialData?.searchSequence?.toString() ?? "0"
  );

  const [errors, setErrors] = useState<Partial<Record<keyof ConstructionTypeFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: ConstructionTypeFormModel): Partial<Record<keyof ConstructionTypeFormModel, string>> => {
      const tWithValues = (key: string, v?: Record<string, string | number | Date>) => t(key, { ...values, ...v });
      const schema = {
        constructionCode: commonValidations.masterCode(tWithValues, CONSTRUCTION_CODE_MAX, {
          required: 'form.validation.constructionCodeRequired',
          format: 'form.validation.constructionCodeFormat',
          maxLength: 'form.validation.constructionCodeMaxLength',
        }),
        description: commonValidations.masterDescription(tWithValues, DESCRIPTION_MAX, {
          required: 'form.validation.descriptionRequired',
          format: 'form.validation.descriptionFormat',
          maxLength: 'form.validation.descriptionMaxLength',
        }),
        searchSequence: commonValidations.masterSearchSequence(tWithValues, 'form.validation.sequenceInvalid'),
        isActive: commonValidations.masterActiveStatus(tWithValues, isEdit, 'form.validation.mustBeActive'),
      };
      return validateForm(data, schema);
    },
    [t, isEdit, values]
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
      // Only allow digits and limit to 3 characters
      const sanitizedValue = value.replace(/[^0-9]/g, "").substring(0, 3);
      setSearchSequenceValue(sanitizedValue);
      setFormData((p) => ({
        ...p,
        searchSequence: sanitizedValue === "" ? 0 : Number(sanitizedValue),
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
      409: t("apiErrors.duplicateRecord", values),
      404: t("apiErrors.notFound", values),
      401: tCommon("errors.unauthorized"),
      403: tCommon("errors.unauthorized"),
    };

    const code = result.statusCode ?? 0;
    if (errorMap[code]) return errorMap[code];

    if (code === 400) {
      const msg = result.message?.toLowerCase() || "";
      if (msg.includes("duplicate") || msg.includes("already exists")) {
        return t("apiErrors.duplicateRecord", values);
      }
      return result.message || t("apiErrors.invalidData", values);
    }

    if (code >= 500) return tCommon("errors.serverError");
    return result.message || t("apiErrors.operationFailed", values);
  }, [t, tCommon, values]);

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

    // Numbers only not allowed for constructionCode
    if (!HAS_LETTER_REGEX.test(formData.constructionCode)) {
      toast.error(t("form.validation.constructionCodeNumbersOnlyNotAllowed", values));
      return;
    }

    // Numbers only not allowed for description
    if (!HAS_LETTER_REGEX.test(formData.description)) {
      toast.error(t("form.validation.descriptionNumbersOnlyNotAllowed", values));
      return;
    }

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
        ? t("success.updated", { code: formData.constructionCode, ...values })
        : t("success.created", { code: formData.constructionCode, ...values })
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
    constructionTypeLabel,
  };
}

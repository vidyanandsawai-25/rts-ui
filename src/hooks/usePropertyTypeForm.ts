"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createPropertyTypeAction,
  updatePropertyTypeAction,
} from "@/app/[locale]/property-tax/propertytype/action";
import { PropertyTypeFormModel, PropertyType } from "@/types/property-type.types";
import {
  CODE_SANITIZE,
  DESCRIPTION_SANITIZE,
  validateForm,
  commonValidations
} from "@/lib/utils/validation";
import {
  PROPERTY_DESCRIPTION_MAX,
  TYPE_MAX,
  PROPERTY_TYPE_GROUP_MAX
} from "@/components/modules/property-tax/property-type-master/constants";

interface UsePropertyTypeFormProps {
  id: number | null;
  initialData?: PropertyType;
  onSuccess: () => void;
  onCancel: () => void;
}

export function usePropertyTypeForm({
  id,
  initialData,
  onSuccess,
  onCancel,
}: UsePropertyTypeFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("propertyType.propertyType");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  // For add mode, show placeholder (0). For edit, use initial value.
  const [formData, setFormData] = useState<PropertyTypeFormModel>({
    id: id ?? initialData?.id,
    propertyDescription: initialData?.propertyDescription ?? "",
    type: initialData?.type ?? "",
    propertyTypeGroup: initialData?.propertyTypeGroup ?? "",
    searchSequence: initialData?.searchSequence ?? 0,
    propertyTypeCategoryId: isEdit
      ? (initialData?.propertyTypeCategoryId ?? 0)
      : 0,
    isActive: initialData?.isActive ?? true,
    updatedBy: 1,
  });

  const [searchSequenceValue, setSearchSequenceValue] = useState<string>(
    initialData?.searchSequence?.toString() ?? "0"
  );

  const [errors, setErrors] = useState<Partial<Record<keyof PropertyTypeFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: PropertyTypeFormModel): Partial<Record<keyof PropertyTypeFormModel, string>> => {
      const schema = {
        propertyDescription: commonValidations.masterDescription(t, PROPERTY_DESCRIPTION_MAX, {
          required: 'form.validation.propertyDescriptionRequired',
          format: 'form.validation.propertyDescriptionFormat',
          maxLength: 'form.validation.propertyDescriptionMaxLength',
        }),
        type: commonValidations.masterCode(t, TYPE_MAX, {
          required: 'form.validation.typeRequired',
          format: 'form.validation.typeFormat',
          maxLength: 'form.validation.typeMaxLength',
        }),
        propertyTypeGroup: commonValidations.masterDescription(t, PROPERTY_TYPE_GROUP_MAX, {
          required: 'form.validation.propertyTypeGroupRequired',
          format: 'form.validation.propertyDescriptionFormat',
          maxLength: 'form.validation.propertyTypeGroupMaxLength',
        }),
        searchSequence: commonValidations.masterSearchSequence(t, 'form.validation.sequenceInvalid'),
        propertyTypeCategoryId: (value: unknown) => {
          const numValue = Number(value);
          if (!numValue || numValue === 0) {
            return t('form.validation.categoryRequired');
          }
          return undefined;
        },
        isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
      };
      return validateForm(data, schema);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof PropertyTypeFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    let sanitizedValue = value;
    if (name === "propertyDescription" || name === "propertyTypeGroup") {
      sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "");
      const maxLength = name === "propertyDescription" ? PROPERTY_DESCRIPTION_MAX : PROPERTY_TYPE_GROUP_MAX;
      if (sanitizedValue.length > maxLength) {
        sanitizedValue = sanitizedValue.substring(0, maxLength);
      }
    } else if (name === "type") {
      sanitizedValue = value.replace(CODE_SANITIZE, "");
      if (sanitizedValue.length > TYPE_MAX) {
        sanitizedValue = sanitizedValue.substring(0, TYPE_MAX);
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
      const fieldName = name as keyof PropertyTypeFormModel;

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
        router.push(`/${locale}/property-tax/propertytype`);
      });
    }, 400);
  }, [router, locale]);

  const handleCancel = useCallback(() => {
    onCancel();
    closeAndRoute();
  }, [onCancel, closeAndRoute]);

  const handleSubmit = async (e: React.FormEvent): Promise<{ success: boolean; createdId?: number }> => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) return { success: false };

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updatePropertyTypeAction(formData)
        : await createPropertyTypeAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return { success: false };
      }

      toast.success(isEdit
        ? t("success.updated", { description: formData.propertyDescription })
        : t("success.created", { description: formData.propertyDescription })
      );

      onSuccess();
      // Return createdId for add mode (from createPropertyTypeAction)
      const createdId = !isEdit && 'createdId' in result ? (result.createdId as number | undefined) : undefined;
      return { success: true, createdId };
    } catch {
      return { success: false };
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

  const handleCategoryChange = useCallback((value: string): void => {
    const categoryId = value === "" ? 0 : Number(value);
    setFormData((p) => ({ ...p, propertyTypeCategoryId: categoryId }));
    // Mark as touched for validation
    setTouched((p) => ({ ...p, propertyTypeCategoryId: true }));
  }, []);

  const refreshAndClose = () => {
    startTransition(() => {
      router.refresh();
      closeAndRoute();
    });
  };

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
    handleCategoryChange,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    refreshAndClose,
    showError,
    t,
    tCommon,
    isEdit,
  };
}

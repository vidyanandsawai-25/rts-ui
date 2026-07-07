"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createAssetRoomAction,
  updateAssetRoomAction,
} from "@/app/[locale]/assets/configuration/master-data/asset-room-type/action";
import { AssetRoomTypeFormModel, AssetRoomType } from "@/types/asset-masters/asset-room-type.types";
import {
  CODE_SANITIZE,
  DESCRIPTION_SANITIZE,
  validateForm,
  commonValidations
} from "@/lib/utils/validation";

const CODE_MAX = 50;
const NAME_MAX = 100;
const DESCRIPTION_MAX = 200;

interface UseAssetRoomFormProps {
  id: number | null;
  initialData?: AssetRoomType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useAssetRoomForm({
  id,
  initialData,
  onSuccess = () => { },
  onCancel = () => { },
}: UseAssetRoomFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("assetRoomType");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<AssetRoomTypeFormModel>({
    id: id ?? initialData?.id,
    roomTypeCode: initialData?.roomTypeCode ?? "",
    roomTypeName: initialData?.roomTypeName ?? "",
    description: initialData?.description ?? "",
    isActive: initialData?.isActive ?? true,
    assetTypeId: initialData?.assetTypeId ?? null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AssetRoomTypeFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: AssetRoomTypeFormModel): Partial<Record<keyof AssetRoomTypeFormModel, string>> => {
      const schema = {
        roomTypeCode: commonValidations.masterCode(t, CODE_MAX, {
          required: 'form.validation.roomTypeCodeRequired',
          format: 'form.validation.roomTypeCodeFormat',
          maxLength: 'form.validation.roomTypeCodeMaxLength',
        }),
        roomTypeName: commonValidations.masterDescription(t, NAME_MAX, {
          required: 'form.validation.roomTypeNameRequired',
          format: 'form.validation.roomTypeNameFormat',
          maxLength: 'form.validation.roomTypeNameMaxLength',
        }),
        description: commonValidations.masterDescription(t, DESCRIPTION_MAX, {
          required: 'form.validation.descriptionRequired',
          format: 'form.validation.descriptionFormat',
          maxLength: 'form.validation.descriptionMaxLength',
        }),
        isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
        assetTypeId: (val: unknown) => !val ? t('form.validation.assetTypeRequired') : undefined,
      };
      return validateForm(data, schema);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof AssetRoomTypeFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    let sanitizedValue = value;
    if (name === "description") {
      sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
      if (sanitizedValue.length > DESCRIPTION_MAX) {
        sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
      }
    } else if (name === "roomTypeName") {
      sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
      if (sanitizedValue.length > NAME_MAX) {
        sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
      }
    } else if (name === "roomTypeCode") {
      sanitizedValue = value.replace(CODE_SANITIZE, "");
      if (sanitizedValue.length > CODE_MAX) {
        sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
      }
    }

    setFormData((p) => ({
      ...p,
      [name]: sanitizedValue,
    }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);

    const fieldErrors = validate(updatedFormData);
    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof AssetRoomTypeFormModel;

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
      router.push(`/${locale}/assets/configuration/master-data/asset-room-type`);
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
        ? await updateAssetRoomAction(formData)
        : await createAssetRoomAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(result.message || (isEdit
        ? t("success.updated", { code: formData.roomTypeCode })
        : t("success.created", { code: formData.roomTypeCode })
      ));

      onSuccess();
      router.refresh();
      closeAndRoute();
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

  const handleSelectChange = useCallback((name: string, value: string): void => {
    const numericValue = value ? Number(value) : null;
    setFormData((p) => {
      const updated = {
        ...p,
        [name]: numericValue,
      };

      const fieldErrors = validate(updated);
      setErrors((prev) => {
        const newErrors = { ...prev };
        const fieldName = name as keyof AssetRoomTypeFormModel;

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

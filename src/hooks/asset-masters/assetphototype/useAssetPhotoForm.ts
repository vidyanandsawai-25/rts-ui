"use client";

import React, { useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import {
  createAssetPhotoAction,
  updateAssetPhotoAction,
} from "@/app/[locale]/assets/configuration/master-data/asset-photo-type/action";
import { AssetPhotoTypeFormModel, AssetPhotoType } from "@/types/asset-masters/asset-photo-type.types";
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

interface UseAssetPhotoFormProps {
  id: number | null;
  initialData?: AssetPhotoType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const sanitizeFieldValue = (name: string, value: string): string => {
  let sanitizedValue = value;
  if (name === "description") {
    sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > DESCRIPTION_MAX) {
      sanitizedValue = sanitizedValue.substring(0, DESCRIPTION_MAX);
    }
  } else if (name === "photoTypeName") {
    sanitizedValue = value.replace(/[^\p{L}\p{M}\p{N}\s]/gu, "").trimStart().replace(/\s{2,}/g, " ");
    if (sanitizedValue.length > NAME_MAX) {
      sanitizedValue = sanitizedValue.substring(0, NAME_MAX);
    }
  } else if (name === "photoTypeCode") {
    sanitizedValue = value.replace(CODE_SANITIZE, "").toUpperCase();
    if (sanitizedValue.length > CODE_MAX) {
      sanitizedValue = sanitizedValue.substring(0, CODE_MAX);
    }
  }
  return sanitizedValue;
};

export function useAssetPhotoForm({
  id,
  initialData,
  onSuccess = () => { },
  onCancel = () => { },
}: UseAssetPhotoFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("assetPhotoType");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [formData, setFormData] = useState<AssetPhotoTypeFormModel>({
    id: id ?? initialData?.id,
    photoTypeCode: initialData?.photoTypeCode ?? "",
    photoTypeName: initialData?.photoTypeName ?? "",
    description: initialData?.description ?? "",
    displayOrder: initialData?.displayOrder ?? 0,
    isActive: initialData?.isActive ?? true,
    assetCategoryId: initialData?.assetCategoryId ?? null,
    assetTypeId: initialData?.assetTypeId ?? null,
    isRequired: initialData?.isRequired ?? false,
  });

  const [displayOrderValue, setDisplayOrderValue] = useState<string>(
    initialData?.displayOrder?.toString() ?? "0"
  );

  const [errors, setErrors] = useState<Partial<Record<keyof AssetPhotoTypeFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback(
    (data: AssetPhotoTypeFormModel): Partial<Record<keyof AssetPhotoTypeFormModel, string>> => {
      const schema = {
        photoTypeCode: commonValidations.masterCode(t, CODE_MAX, {
          required: 'form.validation.photoTypeCodeRequired',
          format: 'form.validation.photoTypeCodeFormat',
          maxLength: 'form.validation.photoTypeCodeMaxLength',
        }),
        photoTypeName: (val: unknown) => {
          const str = String(val ?? '').trim();
          if (!str) return t('form.validation.photoTypeNameRequired');
          if (str.length > NAME_MAX) return t('form.validation.photoTypeNameMaxLength', { count: NAME_MAX });
          if (!/^[\p{L}\p{M}\p{N}]+(?:[\s][\p{L}\p{M}\p{N}]+)*$/u.test(str)) return t('form.validation.photoTypeNameFormat');
          return undefined;
        },
        description: (val: unknown) => {
          const str = String(val ?? '').trim();
          if (!str) return undefined;
          if (str.length > DESCRIPTION_MAX) return t('form.validation.descriptionMaxLength', { count: DESCRIPTION_MAX });
          if (!DESCRIPTION_REGEX.test(str)) return t('form.validation.descriptionFormat');
          return undefined;
        },
        displayOrder: commonValidations.masterSearchSequence(t, 'form.validation.displayOrderInvalid'),
        isActive: commonValidations.masterActiveStatus(t, isEdit, 'form.validation.mustBeActive'),
        assetCategoryId: (val: unknown) => !val ? t('form.validation.assetCategoryRequired') : undefined,
        assetTypeId: (val: unknown) => !val ? t('form.validation.assetTypeRequired') : undefined,
      };
      return validateForm(data, schema);
    },
    [t, isEdit]
  );

  const showError = useCallback((field: keyof AssetPhotoTypeFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field],
    [submittedOnce, touched, errors]
  );

  const pushCategoryQuery = useCallback((assetCategoryId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (assetCategoryId && assetCategoryId > 0) {
      params.set("assetCategoryId", String(assetCategoryId));
    } else {
      params.delete("assetCategoryId");
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    if (name === "displayOrder") {
      const digits = value.replace(/[^0-9]/g, "").substring(0, 4);
      setDisplayOrderValue(digits);
      setFormData((p) => ({
        ...p,
        displayOrder: digits === "" ? 0 : Number(digits),
      }));
      return;
    }

    const sanitizedValue = sanitizeFieldValue(name, value);
    setFormData((p) => ({
      ...p,
      [name]: sanitizedValue,
    }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    let sanitizedValue = sanitizeFieldValue(name, value);
    if (name === "displayOrder" && value === "") {
      sanitizedValue = "0";
      setDisplayOrderValue("0");
    }

    const updatedFormData = {
      ...formData,
      [name]: name === "displayOrder" ? Number(sanitizedValue || 0) : sanitizedValue,
    };

    setFormData(updatedFormData);

    const fieldErrors = validate(updatedFormData);
    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof AssetPhotoTypeFormModel;

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
      router.push(`/${locale}/assets/configuration/master-data/asset-photo-type`);
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
        ? await updateAssetPhotoAction(formData)
        : await createAssetPhotoAction(formData);

      if (!result.success) {
        toast.error(mapApiError(result));
        return;
      }

      toast.success(result.message || (isEdit
        ? t("success.updated", { code: formData.photoTypeCode })
        : t("success.created", { code: formData.photoTypeCode })
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

  const handleToggleRequired = useCallback((checked: boolean): void => {
    setFormData((p) => ({ ...p, isRequired: checked }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string): void => {
    const parsed = Number(value);
    const numericValue = value && Number.isFinite(parsed) ? parsed : null;

    if (name === "assetCategoryId") {
      setFormData((p) => {
        const updated = {
          ...p,
          assetCategoryId: numericValue,
          assetTypeId: null,
        };
        const fieldErrors = validate(updated);
        setErrors((prev) => ({
          ...prev,
          assetCategoryId: fieldErrors.assetCategoryId,
          assetTypeId: fieldErrors.assetTypeId,
        }));
        return updated;
      });
      pushCategoryQuery(numericValue);
      return;
    }

    setFormData((p) => {
      const updated = {
        ...p,
        [name]: numericValue,
      };

      const fieldErrors = validate(updated);
      setErrors((prev) => {
        const newErrors = { ...prev };
        const fieldName = name as keyof AssetPhotoTypeFormModel;

        if (fieldErrors[fieldName]) {
          newErrors[fieldName] = fieldErrors[fieldName];
        } else {
          delete newErrors[fieldName];
        }

        return newErrors;
      });

      return updated;
    });
  }, [pushCategoryQuery, validate]);

  return {
    formData,
    displayOrderValue,
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
    handleToggleRequired,
    handleCancel,
    showError,
    t,
    tCommon,
    isEdit,
  };
}

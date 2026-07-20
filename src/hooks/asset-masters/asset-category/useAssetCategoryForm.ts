"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CODE_SANITIZE, ASSET_MASTER_TEXT_SANITIZE, ASSET_MASTER_NAME_SANITIZE } from "@/lib/utils/validation-rules";
import { validateAssetMasterForm } from "@/lib/validations/asset-master-form.validation";
import { useAssetCategorySubmit } from "./useAssetCategorySubmit";
import type { AssetCategoryFormModel } from "@/types/asset-masters/asset-category.types";

const CODE_MAX = 15;

export interface UseAssetCategoryFormProps {
  initialData?: AssetCategoryFormModel | null;
}

export function useAssetCategoryForm({ initialData }: UseAssetCategoryFormProps) {
  const router = useRouter();
  const isEdit = initialData?.id != null;

  const [open, setOpen] = useState(true);

  const t = useTranslations("asset.configuration.masterData.form");
  const tCommon = useTranslations("common");
  const tNames = useTranslations("asset.masterNames");
  const locale = useLocale();

  const [formData, setFormData] = useState<AssetCategoryFormModel>(
    initialData ?? {
      id: undefined,
      code: "",
      name: "",
      description: "",
      isMovable: false,
      hasFloorDetails: false,
      hasInventory: false,
      isInventoryMandatory: false,
      hasLegalCompliance: false,
      valuationType: "",
      isActive: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const validate = useCallback((data: AssetCategoryFormModel) => {
    return validateAssetMasterForm(data, t);
  }, [t]);

  const showError = useCallback((field: keyof AssetCategoryFormModel) => {
    return touched[field] && !!errors[field];
  }, [touched, errors]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "code") {
      if (newValue.length > CODE_MAX) return;
      newValue = newValue.replace(CODE_SANITIZE, "");
    }

    if (name === "name") {
      newValue = newValue.replace(ASSET_MASTER_NAME_SANITIZE, "");
    }

    if (name === "description") {
      newValue = newValue.replace(ASSET_MASTER_TEXT_SANITIZE, "");
    }
    
    if (typeof newValue === "string" && newValue.length > 0 && ["code", "name", "description"].includes(name)) {
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
    }

    setFormData((p) => ({ ...p, [name]: newValue }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const handleCheckboxChange = useCallback((name: string, checked: boolean) => {
    setFormData((p) => {
      const updated = { ...p, [name]: checked };
      if (name === "hasInventory" && !checked) {
        updated.isInventoryMandatory = false;
      }
      return updated;
    });
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({ ...formData, [name]: value });
    setErrors((p) => ({ ...p, [name]: fieldErrors[name] }));
  }, [formData, validate]);

  const { handleSubmit, isSubmitting } = useAssetCategorySubmit({
    isEdit,
    locale,
    formData,
    validate,
    setErrors,
    setTouched,
    setOpen,
    t,
  });

  const handleToggleStatus = useCallback((checked?: boolean) => {
    setFormData((p) => ({ ...p, isActive: checked !== undefined ? checked : !p.isActive }));
  }, []);

  return {
    isEdit,
    open,
    handleClose,
    formData,
    errors,
    showError,
    handleChange,
    handleCheckboxChange,
    handleBlur,
    handleToggleStatus,
    handleSubmit,
    isSubmitting,
    t,
    tCommon,
    tNames,
  };
}

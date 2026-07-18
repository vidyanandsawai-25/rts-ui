"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CODE_SANITIZE, ASSET_MASTER_TEXT_SANITIZE, ASSET_MASTER_NAME_SANITIZE } from "@/lib/utils/validation-rules";
import { validateAssetMasterForm } from "@/lib/validations/asset-master-form.validation";
import { useAssetTypeSubmit } from "./useAssetTypeSubmit";
import type { AssetTypeFormModel } from "@/types/asset-masters/asset-type.types";
import type { MasterDataGroup } from "@/types/asset-masters/master-data.types";

const CODE_MAX = 15;

export interface UseAssetTypeFormProps {
  initialData?: AssetTypeFormModel | null;
  groups?: MasterDataGroup[];
}

export function useAssetTypeForm({ initialData, groups }: UseAssetTypeFormProps) {
  const router = useRouter();
  const isEdit = initialData?.id != null;

  const [open, setOpen] = useState(true);

  const t = useTranslations("asset.configuration.masterData.form");
  const tCommon = useTranslations("common");
  const tNames = useTranslations("asset.masterNames");
  const locale = useLocale();

  const [formData, setFormData] = useState<AssetTypeFormModel>(
    initialData ?? {
      id: undefined,
      code: "",
      name: "",
      group: "",
      allowUnitRegistration: false,
      allowRoomRegistration: false,
      description: "",
      isActive: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const categoryOptions = useMemo(() => {
    return (groups || [])
      .filter((g) => g.id !== "all" && (g.status !== "Inactive" || g.id === String(formData.group ?? "")))
      .map((g) => ({ label: g.name, value: g.id }));
  }, [groups, formData.group]);

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const validate = useCallback((data: AssetTypeFormModel) => {
    const err = validateAssetMasterForm(data, t, { requiresGroup: true });
    if (!data.allowUnitRegistration && !data.allowRoomRegistration) {
      err.registrationType = t("validation.registrationTypeRequired");
    }
    return err;
  }, [t]);

  const showError = useCallback((field: keyof AssetTypeFormModel) => {
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

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const handleRadioChange = useCallback((value: string) => {
    setFormData((p) => ({
      ...p,
      allowUnitRegistration: value === "unit",
      allowRoomRegistration: value === "room",
    }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({ ...formData, [name]: value });
    setErrors((p) => ({ ...p, [name]: fieldErrors[name] }));
  }, [formData, validate]);

  const { handleSubmit, isSubmitting } = useAssetTypeSubmit({
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
    handleSelectChange,
    handleRadioChange,
    handleBlur,
    handleToggleStatus,
    handleSubmit,
    isSubmitting,
    t,
    tCommon,
    tNames,
    categoryOptions,
  };
}

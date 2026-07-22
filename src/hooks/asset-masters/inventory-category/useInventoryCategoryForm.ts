import { useState, useCallback } from "react";
import type React from "react";
import type { InventoryCategoryFormModel } from "@/types/asset-masters/inventory-category.types";
import { CODE_SANITIZE, ASSET_MASTER_TEXT_SANITIZE, ASSET_INVENTORY_NAME_SANITIZE } from "@/lib/utils/validation-rules";

const CODE_MAX = 15;

export function useInventoryCategoryForm(
  initialData: InventoryCategoryFormModel | null,
  validate: (data: InventoryCategoryFormModel) => Record<string, string>
) {
  const [formData, setFormData] = useState<InventoryCategoryFormModel>(
    initialData ?? {
      id: undefined,
      code: "",
      name: "",
      group: "",
      depreciationRate: "",
      description: "",
      isActive: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "code") {
      if (newValue.length > CODE_MAX) return;
      newValue = newValue.replace(CODE_SANITIZE, "");
    }

    if (name === "name") {
      newValue = newValue.replace(ASSET_INVENTORY_NAME_SANITIZE, "");
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

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({ ...formData, [name]: value });
    setErrors((p) => ({ ...p, [name]: fieldErrors[name] }));
  }, [formData, validate]);

  const handleToggleStatus = useCallback((checked?: boolean | unknown) => {
    setFormData((p) => ({ ...p, isActive: typeof checked === "boolean" ? checked : !p.isActive }));
  }, []);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    touched,
    setTouched,
    handleChange,
    handleBlur,
    handleToggleStatus,
  };
}

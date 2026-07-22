import { useState, useCallback } from "react";
import type React from "react";
import type { InventoryModelFormModel } from "@/types/asset-masters/inventory-model.types";
import { ASSET_MASTER_TEXT_SANITIZE, ASSET_INVENTORY_NAME_SANITIZE } from "@/lib/utils/validation-rules";

export function useInventoryModelForm(
  initialData: InventoryModelFormModel | null | undefined,
  validate: (data: InventoryModelFormModel) => Record<string, string>
) {
  const [formData, setFormData] = useState<InventoryModelFormModel>(
    initialData ?? {
      id: undefined,
      name: "",
      group: "",
      description: "",
      isActive: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name") {
      newValue = newValue.replace(ASSET_INVENTORY_NAME_SANITIZE, "");
    }

    if (name === "description") {
      newValue = newValue.replace(ASSET_MASTER_TEXT_SANITIZE, "");
    }
    
    if (typeof newValue === "string" && newValue.length > 0 && ["name", "description"].includes(name)) {
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
    }

    setFormData((p) => ({ ...p, [name]: newValue }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((p) => ({ ...p, [name]: value }));
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
    handleSelectChange,
    handleBlur,
    handleToggleStatus,
  };
}

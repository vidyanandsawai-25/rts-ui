import { useState, useCallback } from "react";
import type React from "react";
import type { InventoryNameFormModel } from "@/types/asset-masters/inventory-name.types";
import { ASSET_MASTER_TEXT_SANITIZE, CODE_SANITIZE, ASSET_INVENTORY_NAME_SANITIZE } from "@/lib/utils/validation-rules";

export function useInventoryNameForm(
  initialData: InventoryNameFormModel | null | undefined,
  validate: (data: InventoryNameFormModel) => Record<string, string>
) {
  const [formData, setFormData] = useState<InventoryNameFormModel>(
    initialData ?? {
      id: undefined,
      inventoryItemCategoryId: 0,
      subTypeCode: "",
      subTypeName: "",
      description: "",
      isActive: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "subTypeName") {
      newValue = newValue.replace(ASSET_INVENTORY_NAME_SANITIZE, "");
    }

    if (name === "description") {
      newValue = newValue.replace(ASSET_MASTER_TEXT_SANITIZE, "");
    }
    
    if (name === "subTypeCode") {
      newValue = newValue.replace(CODE_SANITIZE, "");
    }
    
    if (typeof newValue === "string" && newValue.length > 0 && ["subTypeCode", "subTypeName", "description"].includes(name)) {
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
    }

    setFormData((p) => ({ ...p, [name]: newValue }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((p) => ({ ...p, [name]: Number(value) }));
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

import { useState, useCallback } from "react";
import type React from "react";
import type { InventoryConditionFormModel, ConditionType } from "@/types/asset-masters/inventory-condition.types";
import { ASSET_MASTER_TEXT_SANITIZE, ASSET_INVENTORY_NAME_SANITIZE } from "@/lib/utils/validation-rules";

export function useInventoryConditionForm(
  initialData: InventoryConditionFormModel | null | undefined,
  validate: (data: InventoryConditionFormModel) => Record<string, string>
) {
  const [formData, setFormData] = useState<InventoryConditionFormModel>(
    initialData
      ? { ...initialData, conditionType: initialData.conditionType || "Inventory" }
      : {
          id: undefined,
          inventoryItemCategoryId: 0,
          conditionType: "",
          conditionName: "",
          conditionFactor: "",
          description: "",
          isActive: true,
        }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "conditionName") {
      newValue = newValue.replace(ASSET_INVENTORY_NAME_SANITIZE, "");
    }

    if (name === "description") {
      newValue = newValue.replace(ASSET_MASTER_TEXT_SANITIZE, "");
    }
    
    if (typeof newValue === "string" && newValue.length > 0 && ["conditionName", "description"].includes(name)) {
      newValue = newValue.charAt(0).toUpperCase() + newValue.slice(1);
    }

    setFormData((p) => ({ ...p, [name]: name === "conditionFactor" && newValue !== "" ? Number(newValue) : newValue }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    if (name === "conditionType") {
      setFormData((p) => ({
        ...p,
        conditionType: value as ConditionType,
        inventoryItemCategoryId: 0,
      }));
      setErrors((p) => ({ ...p, conditionType: "", inventoryItemCategoryId: "" }));
    } else {
      setFormData((p) => ({ ...p, [name]: Number(value) }));
      setErrors((p) => ({ ...p, [name]: "" }));
    }
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({ ...formData, [name]: name === "conditionFactor" && value !== "" ? Number(value) : value });
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

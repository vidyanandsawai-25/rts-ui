import { useState, useCallback } from "react";
import type React from "react";
import type { InventoryConditionFormModel, ConditionType } from "@/types/asset-masters/inventory-condition.types";
import { sanitizeFieldValue } from "./validation";

export function useInventoryConditionForm(
  initialData: InventoryConditionFormModel | null | undefined,
  validate: (data: InventoryConditionFormModel) => Partial<Record<keyof InventoryConditionFormModel, string>>
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

  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof InventoryConditionFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const sanitized = sanitizeFieldValue(name, value);

    const valToSave = name === "conditionFactor" && sanitized !== "" ? Number(sanitized) : sanitized;
    setFormData((p) => ({ ...p, [name]: valToSave }));
    setErrors((p) => {
      const err = { ...p };
      delete err[name as keyof InventoryConditionFormModel];
      return err;
    });
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    if (name === "conditionType") {
      setFormData((p) => {
        const updated = {
          ...p,
          conditionType: value as ConditionType,
          inventoryItemCategoryId: 0,
        };
        const fieldErrors = validate(updated);
        setErrors((prev) => {
          const err = { ...prev };
          if (fieldErrors.conditionType) err.conditionType = fieldErrors.conditionType; else delete err.conditionType;
          if (fieldErrors.inventoryItemCategoryId) err.inventoryItemCategoryId = fieldErrors.inventoryItemCategoryId; else delete err.inventoryItemCategoryId;
          return err;
        });
        return updated;
      });
    } else {
      setFormData((p) => {
        const updated = { ...p, [name]: Number(value) };
        const fieldErrors = validate(updated);
        setErrors((prev) => {
          const err = { ...prev };
          const field = name as keyof InventoryConditionFormModel;
          if (fieldErrors[field]) err[field] = fieldErrors[field]; else delete err[field];
          return err;
        });
        return updated;
      });
    }
  }, [validate]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const sanitized = sanitizeFieldValue(name, value);
    const valToSave = name === "conditionFactor" && sanitized !== "" ? Number(sanitized) : sanitized;
    const updated = { ...formData, [name]: valToSave };
    setFormData(updated);

    const fieldErrors = validate(updated);
    setErrors((p) => {
      const err = { ...p };
      const field = name as keyof InventoryConditionFormModel;
      if (fieldErrors[field]) err[field] = fieldErrors[field]; else delete err[field];
      return err;
    });
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
    submittedOnce,
    setSubmittedOnce,
    handleChange,
    handleSelectChange,
    handleBlur,
    handleToggleStatus,
  };
}


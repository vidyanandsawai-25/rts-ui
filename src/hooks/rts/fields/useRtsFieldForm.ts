"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { createRtsFieldAction, updateRtsFieldAction } from "@/app/[locale]/rts/fields/action";
import { getRtsServicesByDeptId } from "@/lib/api/rts/rtsservice.service";
import { RtsFieldDefinitionApiItem } from "@/types/rts/field-definition.types";
import { RtsServiceApiItem } from "@/types/rts/service.types";

interface UseRtsFieldFormProps {
  initialOpen?: boolean;
  editingField: RtsFieldDefinitionApiItem | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface RtsFieldFormData {
  id?: number;
  departmentId: number;
  serviceId: number;
  fieldCode: string;
  fieldLabel: string;
  fieldLabelLocal: string;
  fieldType: string;
  fieldGroup: string;
  displayOrder: number;
  isRequired: boolean;
  validationRules: string;
  isActive: boolean;
}

export function useRtsFieldForm({
  initialOpen = true,
  editingField,
  onSuccess,
  onCancel,
}: UseRtsFieldFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const isEdit = Boolean(editingField);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [open, setOpen] = useState(initialOpen);

  const [formData, setFormData] = useState<RtsFieldFormData>({
    departmentId: 0,
    serviceId: 0,
    fieldCode: "",
    fieldLabel: "",
    fieldLabelLocal: "",
    fieldType: "text",
    fieldGroup: "General Details",
    displayOrder: 0,
    isRequired: false,
    validationRules: "",
    isActive: true,
  });

  const [services, setServices] = useState<RtsServiceApiItem[]>([]);
  const [loadingServices, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Dynamic services fetching on department selection
  useEffect(() => {
    if (formData.departmentId > 0) {
      startTransition(async () => {
        try {
          const list = await getRtsServicesByDeptId(formData.departmentId);
          setServices(list);
        } catch {
          setServices([]);
        }
      });
    } else {
      setServices([]);
    }
  }, [formData.departmentId]);

  useEffect(() => {
    if (editingField) {
      setFormData({
        id: editingField.id,
        departmentId: editingField.departmentId || 0,
        serviceId: editingField.serviceId || 0,
        fieldCode: editingField.fieldCode || "",
        fieldLabel: editingField.fieldLabel || "",
        fieldLabelLocal: editingField.fieldLabelLocal || "",
        fieldType: editingField.fieldType || "text",
        fieldGroup: editingField.fieldGroup || "General Details",
        displayOrder: editingField.displayOrder || 0,
        isRequired: editingField.isRequired || false,
        validationRules: editingField.validationRules || "",
        isActive: editingField.isActive,
      });
    } else {
      setFormData({
        departmentId: 0,
        serviceId: 0,
        fieldCode: "",
        fieldLabel: "",
        fieldLabelLocal: "",
        fieldType: "text",
        fieldGroup: "General Details",
        displayOrder: 0,
        isRequired: false,
        validationRules: "",
        isActive: true,
      });
    }
  }, [editingField]);

  const validate = useCallback(
    (data: RtsFieldFormData) => {
      const newErrors: Record<string, string> = {};

      if (!data.departmentId) newErrors.departmentId = tCommon("validation.required");
      if (!data.serviceId) newErrors.serviceId = tCommon("validation.required");
      if (!data.fieldCode?.trim()) newErrors.fieldCode = tCommon("validation.required");
      if (!data.fieldLabel?.trim()) newErrors.fieldLabel = tCommon("validation.required");

      return newErrors;
    },
    [tCommon]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const checked = (e.target as HTMLInputElement).checked;

      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : name === "departmentId" || name === "serviceId" || name === "displayOrder"
            ? parseInt(value, 10) || 0
            : value,
      }));
    },
    []
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleToggleStatus = useCallback((status: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: status }));
  }, []);

  const handleToggleRequired = useCallback((status: boolean) => {
    setFormData((prev) => ({ ...prev, isRequired: status }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmittedOnce(true);

      const validationErrors = validate(formData);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        toast.error("Please resolve validation errors first.");
        return;
      }

      setIsSubmitting(true);
      try {
        const result = isEdit
          ? await updateRtsFieldAction(formData.id!, formData)
          : await createRtsFieldAction(formData);

        if (result.success) {
          toast.success(isEdit ? "RTS Field Definition updated!" : "RTS Field Definition created!");
          onSuccess?.();
          setOpen(false);
          router.refresh();
        } else {
          toast.error(result.message || "Something went wrong.");
        }
      } catch (err: any) {
        toast.error(err.message || "Submission failed.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isEdit, validate, onSuccess, router]
  );

  const handleCancel = useCallback(() => {
    setOpen(false);
    onCancel?.();
  }, [onCancel]);

  const showError = useCallback(
    (field: keyof RtsFieldFormData) => {
      return (submittedOnce || touched[field as string]) && !!errors[field as string];
    },
    [submittedOnce, touched, errors]
  );

  return {
    formData,
    services,
    loadingServices,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleToggleRequired,
    handleCancel,
    showError,
    isEdit,
  };
}

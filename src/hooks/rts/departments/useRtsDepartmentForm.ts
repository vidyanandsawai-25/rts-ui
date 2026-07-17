"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { createRtsDepartmentAction, updateRtsDepartmentAction } from "@/app/[locale]/rts/departments/action";
import { RtsDepartmentApiItem } from "@/types/rts/departments.types";

interface UseRtsDepartmentFormProps {
  initialOpen?: boolean;
  editingDepartment: RtsDepartmentApiItem | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

export interface RtsDepartmentFormData {
  id?: number;
  departmentName: string;
  departmentNameLocal: string;
  departmentIcon: string;
  displayOrder: number;
  isActive: boolean;
}

export function useRtsDepartmentForm({
  initialOpen = true,
  editingDepartment,
  onSuccess,
  onClose,
}: UseRtsDepartmentFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const isEdit = Boolean(editingDepartment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [open, setOpen] = useState(initialOpen);

  const [formData, setFormData] = useState<RtsDepartmentFormData>({
    departmentName: "",
    departmentNameLocal: "",
    departmentIcon: "",
    displayOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editingDepartment) {
      setFormData({
        id: editingDepartment.id,
        departmentName: editingDepartment.departmentName || "",
        departmentNameLocal: editingDepartment.departmentNameLocal || "",
        departmentIcon: editingDepartment.departmentIcon || "",
        displayOrder: editingDepartment.displayOrder || 0,
        isActive: editingDepartment.isActive,
      });
    } else {
      setFormData({
        departmentName: "",
        departmentNameLocal: "",
        departmentIcon: "",
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [editingDepartment]);

  const validate = useCallback(
    (data: RtsDepartmentFormData) => {
      const newErrors: Record<string, string> = {};

      if (!data.departmentName?.trim()) {
        newErrors.departmentName = tCommon("validation.required");
      }

      return newErrors;
    },
    [tCommon]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : name === "displayOrder" ? parseInt(value, 10) || 0 : value,
      }));
    },
    []
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleToggleStatus = useCallback((status: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: status }));
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
          ? await updateRtsDepartmentAction(formData.id!, formData)
          : await createRtsDepartmentAction(formData);

        if (result.success) {
          toast.success(isEdit ? "RTS Department updated successfully!" : "RTS Department created successfully!");
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
    onClose?.();
  }, [onClose]);

  const showError = useCallback(
    (field: keyof RtsDepartmentFormData) => {
      return (submittedOnce || touched[field as string]) && !!errors[field as string];
    },
    [submittedOnce, touched, errors]
  );

  return {
    formData,
    errors,
    isSubmitting,
    open,
    handleChange,
    handleBlur,
    handleSubmit,
    handleToggleStatus,
    handleCancel,
    showError,
    isEdit,
  };
}

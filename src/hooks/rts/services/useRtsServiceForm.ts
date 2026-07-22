"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { createRtsServiceAction, updateRtsServiceAction } from "@/app/[locale]/rts/services/action";
import { RtsServiceApiItem } from "@/types/rts/service.types";

interface UseRtsServiceFormProps {
  initialOpen?: boolean;
  editingService: RtsServiceApiItem | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

export interface RtsServiceFormData {
  id?: number;
  departmentId: number;
  serviceName: string;
  serviceNameLocal: string;
  description: string;
  serviceUrl: string;
  serviceIcon: string;
  sla: number;
  fees: number;
  isFeesRequired: boolean;
  displayOrder: number;
  isActive: boolean;
}

export function useRtsServiceForm({
  initialOpen = true,
  editingService,
  onSuccess,
  onClose,
}: UseRtsServiceFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const tCommon = useTranslations("common");
  const isEdit = Boolean(editingService);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [open, setOpen] = useState(initialOpen);

  const [formData, setFormData] = useState<RtsServiceFormData>({
    departmentId: 0,
    serviceName: "",
    serviceNameLocal: "",
    description: "",
    serviceUrl: "",
    serviceIcon: "",
    sla: 0,
    fees: 0,
    isFeesRequired: false,
    displayOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editingService) {
      setFormData({
        id: editingService.id,
        departmentId: editingService.departmentId || 0,
        serviceName: editingService.serviceName || "",
        serviceNameLocal: editingService.serviceNameLocal || "",
        description: editingService.description || "",
        serviceUrl: editingService.serviceUrl || "",
        serviceIcon: editingService.serviceIcon || "",
        sla: editingService.sla || 0,
        fees: editingService.fees || 0,
        isFeesRequired: editingService.isFeesRequired || false,
        displayOrder: editingService.displayOrder || 0,
        isActive: editingService.isActive,
      });
    } else {
      setFormData({
        departmentId: 0,
        serviceName: "",
        serviceNameLocal: "",
        description: "",
        serviceUrl: "",
        serviceIcon: "",
        sla: 0,
        fees: 0,
        isFeesRequired: false,
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [editingService]);

  const validate = useCallback(
    (data: RtsServiceFormData) => {
      const newErrors: Record<string, string> = {};

      if (!data.departmentId) {
        newErrors.departmentId = tCommon("validation.required");
      }
      if (!data.serviceName?.trim()) {
        newErrors.serviceName = tCommon("validation.required");
      }

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
            : name === "departmentId" || name === "sla" || name === "fees" || name === "displayOrder"
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

  const handleToggleFees = useCallback((status: boolean) => {
    setFormData((prev) => ({ ...prev, isFeesRequired: status }));
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
          ? await updateRtsServiceAction(formData.id!, formData)
          : await createRtsServiceAction(formData);

        if (result.success) {
          toast.success(isEdit ? "RTS Service updated successfully!" : "RTS Service created successfully!");
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
    (field: keyof RtsServiceFormData) => {
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
    handleToggleFees,
    handleCancel,
    showError,
    isEdit,
  };
}

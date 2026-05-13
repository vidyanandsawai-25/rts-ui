"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { saveDepartmentMasterAction } from "@/app/[locale]/configuration-settings/department-master/action";
import { DepartmentMaster, DepartmentMasterFormData } from "@/types/departmentMaster.types";

interface UseDepartmentFormProps {
  editingDepartment: DepartmentMaster | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useDepartmentForm({ editingDepartment, onSuccess, onClose }: UseDepartmentFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("departmentMaster");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(editingDepartment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(true);

  const [formData, setFormData] = useState<DepartmentMasterFormData>({
    departmentCode: "",
    departmentName: "",
    departmentNameLocal: "",
    departmentIcon: "",
    departmentDescription: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (editingDepartment) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        departmentCode: editingDepartment.departmentCode || "",
        departmentName: editingDepartment.departmentName || "",
        departmentNameLocal: editingDepartment.departmentNameLocal || "",
        departmentIcon: editingDepartment.departmentIcon || "",
        departmentDescription: editingDepartment.departmentDescription || "",
        isActive: editingDepartment.isActive,
      });
    } else {
      setFormData({
        departmentCode: "",
        departmentName: "",
        departmentNameLocal: "",
        departmentIcon: "",
        departmentDescription: "",
        isActive: true,
      });
    }
  }, [editingDepartment]);

  const validate = useCallback((data: DepartmentMasterFormData) => {
    const newErrors: Record<string, string> = {};
    if (!data.departmentCode?.trim()) newErrors.departmentCode = tCommon("validation.required");
    if (!data.departmentName?.trim()) newErrors.departmentName = tCommon("validation.required");
    
    if (data.departmentCode && data.departmentCode.length > 50) {
      newErrors.departmentCode = tCommon("validation.maxLength", { count: 50 });
    }
    return newErrors;
  }, [tCommon]);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    // Use transition for smoother navigation
    startTransition(() => {
      router.push(`/${locale}/configuration-settings/department-master`);
    });
  }, [router, locale]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const v = validate(formData);
    setErrors(v);
  };

  const handleToggleStatus = () => {
    setFormData((p) => ({ ...p, isActive: !p.isActive }));
  };

  const handleCancel = useCallback(() => {
    if (onClose) onClose();
    closeAndRoute();
  }, [onClose, closeAndRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);
    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length > 0) {
      toast.error(tCommon("errors.fixValidation"));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      if (isEdit && editingDepartment?.departmentId) {
        payload.append("departmentId", String(editingDepartment.departmentId));
      }
      payload.append("departmentCode", formData.departmentCode);
      payload.append("departmentName", formData.departmentName);
      payload.append("departmentNameLocal", formData.departmentNameLocal || "");
      payload.append("departmentIcon", formData.departmentIcon || "");
      payload.append("departmentDescription", formData.departmentDescription || "");
      payload.append("isActive", String(formData.isActive));

      const result = await saveDepartmentMasterAction(payload);
      if (result.success) {
        toast.success(result.message);
        if (onSuccess) onSuccess();
        startTransition(() => {
          router.refresh();
          closeAndRoute();
        });
      } else {
        toast.error(result.error || tCommon("errors.saveFailed"));
      }
    } catch (_error) {
      toast.error(tCommon("errors.generic"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    touched,
    submittedOnce,
    isSubmitting: isSubmitting || isPending,
    open,
    handleChange,
    handleBlur,
    handleToggleStatus,
    handleSubmit,
    handleCancel,
    isEdit,
    t,
    tCommon,
  };
}

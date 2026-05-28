"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { saveDepartmentMasterAction } from "@/app/[locale]/configuration-settings/department-master/action";
import { DepartmentMaster, DepartmentMasterFormData } from "@/types/departmentMaster.types";

interface UseDepartmentFormProps {
  initialOpen?: boolean;
  editingDepartment: DepartmentMaster | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useDepartmentForm({ initialOpen = true, editingDepartment, onSuccess, onClose }: UseDepartmentFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("departmentMaster");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(editingDepartment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(initialOpen);

  const [formData, setFormData] = useState<DepartmentMasterFormData>({
    departmentCode: "",
    departmentName: "",
    departmentNameLocal: "",
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
        departmentDescription: editingDepartment.departmentDescription || "",
        isActive: editingDepartment.isActive,
      });
    } else {
      setFormData({
        departmentCode: "",
        departmentName: "",
        departmentNameLocal: "",
        departmentDescription: "",
        isActive: true,
      });
    }
  }, [editingDepartment]);

  const validate = useCallback((data: DepartmentMasterFormData) => {
    const newErrors: Record<string, string> = {};
    
    // ---------------- Department Code Validation ----------------
    const code = data.departmentCode?.trim() || "";
    if (!code) {
      newErrors.departmentCode = tCommon("validation.required");
    } else {
      if (code.length < 2) {
        newErrors.departmentCode = tCommon("validation.minLength", { count: 2 });
      } else if (code.length > 50) {
        newErrors.departmentCode = tCommon("validation.maxLength", { count: 50 });
      } else if (/^0+$/.test(code)) {
        newErrors.departmentCode = "Department Code cannot consist only of zeros";
      } else if (!/[a-zA-Z0-9]/.test(code)) {
        newErrors.departmentCode = "Department Code must contain at least one letter or digit";
      } else if (!/^[A-Za-z0-9]+([A-Za-z0-9\s_-]*[A-Za-z0-9]+)*$/.test(code)) {
        newErrors.departmentCode = tCommon("validation.alphanumericUnderscore", { label: t("form.fields.departmentCode") });
      }
    }

    // ---------------- Department Name Validation ----------------
    const name = data.departmentName?.trim() || "";
    if (!name) {
      newErrors.departmentName = tCommon("validation.required");
    } else {
      if (name.length < 3) {
        newErrors.departmentName = tCommon("validation.minLength", { count: 3 });
      } else if (name.length > 100) {
        newErrors.departmentName = tCommon("validation.maxLength", { count: 100 });
      } else if (!/[\p{L}]/u.test(name)) {
        newErrors.departmentName = "Department Name must contain at least one letter";
      } else if (/^[0-9\s,.\-\/()]+$/.test(name)) {
        newErrors.departmentName = "Department Name cannot consist only of numbers or punctuation";
      } else if (!/^[\p{L}\p{M}\p{N}]+(([\p{L}\p{M}\p{N}\/,.\-()&]|\s(?!\s))*[\p{L}\p{M}\p{N}]+)*$/u.test(name)) {
        newErrors.departmentName = "Department Name contains invalid characters or consecutive spaces";
      }
    }

    // ---------------- Local Name Validation ----------------
    const nameLocal = data.departmentNameLocal?.trim() || "";
    if (nameLocal) {
      if (nameLocal.length < 3) {
        newErrors.departmentNameLocal = tCommon("validation.minLength", { count: 3 });
      } else if (nameLocal.length > 100) {
        newErrors.departmentNameLocal = tCommon("validation.maxLength", { count: 100 });
      } else if (!/[\p{L}]/u.test(nameLocal)) {
        newErrors.departmentNameLocal = "Local Name must contain at least one letter";
      }
    }



    // ---------------- Description Validation ----------------
    const desc = data.departmentDescription?.trim() || "";
    if (desc) {
      if (desc.length > 500) {
        newErrors.departmentDescription = tCommon("validation.maxLength", { count: 500 });
      } else if (!/[\p{L}\p{N}]/u.test(desc)) {
        newErrors.departmentDescription = "Description must contain at least one letter or digit";
      }
    }

    return newErrors;
  }, [tCommon, t]);

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
      payload.append("departmentIcon", "");
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

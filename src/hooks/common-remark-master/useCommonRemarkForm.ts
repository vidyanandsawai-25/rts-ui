import React, { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import type { CommonRemark, CommonRemarkFormModel, RemarkCategory } from "@/types/common-remark-master/common-remark.types";
import { saveCommonRemarkAction } from "@/app/[locale]/property-tax/common-remark-master/actions";
import {
  validateRemarkType,
  validateCustomRemarkType,
  validateRemark,
  validateIsActive,
} from "@/lib/api/common-remark-master/common-remark-validation";

interface UseCommonRemarkFormProps {
  id: number | null;
  initialData?: CommonRemark | null;
  categories: RemarkCategory[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function useCommonRemarkForm({
  id,
  initialData,
  categories,
  onSuccess,
  onCancel,
}: UseCommonRemarkFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [, startTransition] = useTransition();
  const isEdit = id != null;

  const t = useTranslations("remarkMaster");
  const tCommon = useTranslations("common");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CommonRemarkFormModel>({
    id: initialData?.id ?? undefined,
    remarkType: initialData?.remarkTypeId ? String(initialData.remarkTypeId) : "",
    remark: initialData?.remark ?? "",
    isActive: initialData?.isActive ?? true,
  });

  const [customRemarkType, setCustomRemarkType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(true);

  const validate = useCallback((data: CommonRemarkFormModel, customTypeVal: string) => {
    const e: Record<string, string> = {};

    const remarkTypeErr = validateRemarkType(data.remarkType);
    if (remarkTypeErr) {
      e.remarkType = t(remarkTypeErr);
    }

    const customRemarkTypeErr = validateCustomRemarkType(customTypeVal, data.remarkType);
    if (customRemarkTypeErr) {
      e.customRemarkType = t(customRemarkTypeErr) || "Invalid custom remark type.";
    }

    const remarkErr = validateRemark(data.remark);
    if (remarkErr) {
      e.remark = t(remarkErr);
    }

    const isActiveErr = validateIsActive(data.isActive, isEdit);
    if (isActiveErr) {
      e.isActive = t(isActiveErr);
    }

    return e;
  }, [t, isEdit]);

  const showError = useCallback((field: string) =>
    touched[field] && !!errors[field],
    [touched, errors]
  );

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  }, []);

  const handleSelectChange = useCallback((
    _e: React.ChangeEvent<HTMLSelectElement>,
    value: string
  ) => {
    setFormData((p) => ({ ...p, remarkType: value }));
    setErrors((p) => ({ ...p, remarkType: "", customRemarkType: "" }));
    if (value !== "Other") {
      setCustomRemarkType("");
    }
  }, []);

  const handleCustomTypeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCustomRemarkType(value);
    setErrors((p) => ({ ...p, customRemarkType: "" }));
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const valData = { ...formData, [name]: value };
    const ctVal = name === "customRemarkType" ? value : customRemarkType;
    const fieldErrors = validate(valData, ctVal);
    setErrors((p) => ({ ...p, [name]: fieldErrors[name] }));
  }, [formData, customRemarkType, validate]);

  const closeAndRoute = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      startTransition(() => {
        router.push(`/${locale}/property-tax/common-remark-master`);
      });
    }, 300);
  }, [router, locale]);

  const handleCancel = useCallback(() => {
    onCancel();
    closeAndRoute();
  }, [onCancel, closeAndRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      remarkType: true,
      customRemarkType: true,
      remark: true,
    });

    const v = validate(formData, customRemarkType);
    setErrors(v);

    if (Object.keys(v).length) {
      toast.error(tCommon("errors.validationError") || "Please fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      if (formData.id) {
        fd.append("id", String(formData.id));
      }
      fd.append("remarkType", formData.remarkType);
      if (formData.remarkType === "Other") {
        fd.append("customRemarkType", customRemarkType.trim());
      }
      fd.append("remark", formData.remark);
      fd.append("isActive", String(formData.isActive));
      fd.append("locale", locale);

      const res = await saveCommonRemarkAction(isEdit ? String(formData.id) : "", fd);

      if (res?.ok) {
        toast.success(
          res.mode === "update"
            ? t("messages.updateSuccess")
            : t("messages.addSuccess")
        );
        onSuccess();
        closeAndRoute();
        startTransition(() => {
          router.refresh();
        });
        return;
      }

      if (res && !res.ok) {
        if (res.error === "duplicate") {
          setErrors({
            remark: t("apiErrors.duplicateRecord"),
          });
          toast.error(t("apiErrors.duplicateRecord"));
        } else if (res.error === "invalid_remarkType") {
          setErrors({
            remarkType: t("form.validation.remarkTypeRequired"),
          });
          toast.error(t("form.validation.remarkTypeRequired"));
        } else if (res.error === "invalid_remark") {
          setErrors({
            remark: t("form.validation.remarkRequired"),
          });
          toast.error(t("form.validation.remarkRequired"));
        } else if (res.error === "invalid_id") {
          toast.error(t("apiErrors.invalidData"));
        } else {
          toast.error(res.message || tCommon("errors.operationFailed"));
        }
        return;
      }

      toast.error(tCommon("errors.operationFailed"));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || tCommon("errors.operationFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = useCallback(() => {
    setFormData((p) => ({ ...p, isActive: !p.isActive }));
  }, []);

  return {
    formData,
    customRemarkType,
    categories,
    errors,
    isSubmitting,
    open,
    isEdit,
    t,
    tCommon,
    showError,
    handleChange,
    handleSelectChange,
    handleCustomTypeChange,
    handleBlur,
    handleCancel,
    handleSubmit,
    handleToggleStatus,
  };
}

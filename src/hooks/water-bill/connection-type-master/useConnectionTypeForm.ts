import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ConnectionTypeFormModel, ConnectionType } from "@/types/waterBill/connectionTypeMaster.types";
import {
  createConnectionTypeAction,
  updateConnectionTypeAction,
} from "@/app/[locale]/water-bill/connection-type-master/actions";

export function useConnectionTypeForm(id: number | null, initialData?: ConnectionType) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname() || "";
  const isUnified = pathname.includes("/water-bill/water-connection-master/connection-type");
  const listUrl = isUnified
    ? `/${locale}/water-bill/water-connection-master/connection-type`
    : `/${locale}/water-bill/connection-type-master`;
  const t = useTranslations("connectionTypeMaster.connectionType");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState<ConnectionTypeFormModel>({
    connectionTypeCode: initialData?.connectionTypeCode ?? "",
    connectionType: initialData?.connectionType ?? "",
    description: initialData?.description ?? "",
    isActive: initialData?.isActive ?? true,
  });
  
  const [touched, setTouched] = useState<Partial<Record<keyof ConnectionTypeFormModel, boolean>>>({});

  const validate = useCallback(
    (data: ConnectionTypeFormModel) => {
      const errs: Partial<Record<keyof ConnectionTypeFormModel, string>> = {};
      if (!data.connectionTypeCode?.trim()) {
        errs.connectionTypeCode = t("validation.connectionTypeCodeRequired") || "Connection Type Code is required";
      } else if (data.connectionTypeCode.trim().length > 30) {
        errs.connectionTypeCode = t("validation.connectionTypeCodeLength") || "Code cannot exceed 30 characters";
      }
      if (!data.connectionType.trim()) {
        errs.connectionType = t("validation.connectionTypeRequired");
      } else if (data.connectionType.length > 100) {
        errs.connectionType = t("validation.connectionTypeLength") || "Connection Type cannot exceed 100 characters";
      }
      if (!data.description.trim()) {
        errs.description = t("validation.descriptionRequired");
      } else if (data.description.length > 300) {
        errs.description = t("validation.descriptionLength") || "Description cannot exceed 300 characters";
      }
      return errs;
    },
    [t]
  );

  const errors = validate(formData);

  const showError = (field: keyof ConnectionTypeFormModel) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: keyof ConnectionTypeFormModel, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof ConnectionTypeFormModel) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    router.push(listUrl);
  }, [router, listUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmittedOnce(true);
    const validationErrs = validate(formData);
    if (Object.keys(validationErrs).length > 0) return;

    setIsSubmitting(true);
    try {
      const code = (formData.connectionTypeCode || "").trim().toUpperCase().slice(0, 30);

      const submitData = {
        connectionTypeCode: code,
        connectionType: formData.connectionType.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      const result = isEdit
        ? await updateConnectionTypeAction(id!, submitData)
        : await createConnectionTypeAction(submitData);

      if (result.success) {
        toast.success(isEdit ? t("messages.updateSuccess") : t("messages.createSuccess"));
        setOpen(false);
        router.push(listUrl);
      } else {
        const rawError = result.error ?? tCommon("errors.generic");
        // Strip any function name prefix like "createConnectionType: "
        const cleanError = rawError.replace(/^([a-zA-Z0-9_]+:\s*)+/, "").trim();
        const isDuplicate = result.statusCode === 409 || /already exists|duplicate/i.test(cleanError);
        const finalMessage = isDuplicate
          ? (t("messages.duplicateError") || "A record with the same details already exists.")
          : cleanError;

        toast.error(finalMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isEdit,
    open,
    isSubmitting,
    formData,
    errors,
    showError,
    handleChange,
    handleBlur,
    handleClose,
    handleSubmit,
    t,
    tCommon
  };
}

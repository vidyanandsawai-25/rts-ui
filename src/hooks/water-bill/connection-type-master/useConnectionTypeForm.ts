import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { ConnectionTypeFormModel, ConnectionType } from "@/types/waterBill/connectionTypeMaster.types";
import { ALPHANUMERIC_WITH_SPACES_SANITIZE } from "@/lib/utils/validation-rules";
import {
  createConnectionTypeAction,
  updateConnectionTypeAction,
  getConnectionTypePagedAction
} from "@/app/[locale]/water-bill/connection-type-master/actions";

export function useConnectionTypeForm(id: number | null, initialData?: ConnectionType) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname() || "";
  const isUnified = pathname.includes("/water-bill/connection-type-master/connection-type");
  const listUrl = isUnified
    ? `/${locale}/water-bill/connection-type-master/connection-type`
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
      if (data.description.trim() && data.description.length > 300) {
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
    let sanitizedValue = value;
    if (typeof value === "string") {
      sanitizedValue = value
        .normalize("NFC")
        .replace(ALPHANUMERIC_WITH_SPACES_SANITIZE, "")
        .replace(/\s{2,}/g, " ");
    }
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
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
      const typeName = formData.connectionType.trim();

      const allRecords = await getConnectionTypePagedAction(1, 10000);
      const isCodeDup = allRecords.items.some(x => x.connectionTypeCode?.trim().toLowerCase() === code.toLowerCase() && x.id !== id);
      const isNameDup = allRecords.items.some(x => x.connectionType.trim().toLowerCase() === typeName.toLowerCase() && x.id !== id);

      if (isCodeDup || isNameDup) {
        if (isCodeDup) toast.error(t("messages.duplicateCodeError") || "Connection Type Code already exists.");
        if (isNameDup) toast.error(t("messages.duplicateNameError") || "Connection Type already exists.");
        setIsSubmitting(false);
        return;
      }

      const submitData = {
        connectionTypeCode: code,
        connectionType: typeName,
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

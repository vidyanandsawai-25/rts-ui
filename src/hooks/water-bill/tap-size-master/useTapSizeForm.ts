import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import type { TapSizeFormModel, TapSize } from "@/types/waterBill/tapSizeMaster.types";
import { formatNominalSize, parseNominalSizeFromTapSize } from "@/lib/api/waterBill/tapSizeMaster.utils";
import {
  createTapSizeAction,
  updateTapSizeAction,
} from "@/app/[locale]/water-bill/tap-size-master/actions";

export function useTapSizeForm(id: number | null, initialData?: TapSize) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("tapSizeMaster.tapSize");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const listUrl = `/${locale}/water-bill/tap-size-master`;

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState<TapSizeFormModel>({
    tapSizeCode: initialData?.tapSizeCode ?? "",
    tapSize: initialData?.tapSize ?? "",
    nominalSizeValue:
      initialData?.nominalSizeValue != null
        ? formatNominalSize(initialData.nominalSizeValue, "")
        : "",
    sizeUnit: initialData?.sizeUnit ?? "",
    isActive: initialData?.isActive ?? true,
  });
  
  const [touched, setTouched] = useState<Partial<Record<keyof TapSizeFormModel, boolean>>>({});
  const isNominalUserEdited = useRef(Boolean(initialData?.nominalSizeValue));
  const isUnitUserEdited = useRef(Boolean(initialData?.sizeUnit));

  const validate = useCallback(
    (data: TapSizeFormModel) => {
      const errs: Partial<Record<keyof TapSizeFormModel, string>> = {};
      if (!data.tapSizeCode?.trim()) {
        errs.tapSizeCode = t("validation.tapSizeCodeRequired");
      } else if (data.tapSizeCode.trim().length > 30) {
        errs.tapSizeCode = t("validation.tapSizeCodeLength");
      }
      if (!data.tapSize?.trim()) {
        errs.tapSize = t("validation.tapSizeRequired");
      } else if (data.tapSize.length > 100) {
        errs.tapSize = t("validation.tapSizeLength");
      }
      if (data.nominalSizeValue === "" || data.nominalSizeValue === null || data.nominalSizeValue === undefined) {
        errs.nominalSizeValue = t("validation.nominalSizeValueRequired");
      } else if (isNaN(Number(data.nominalSizeValue))) {
        errs.nominalSizeValue = t("validation.nominalSizeValueInvalid");
      }
      if (!data.sizeUnit?.trim()) {
        errs.sizeUnit = t("validation.sizeUnitRequired");
      } else if (data.sizeUnit.length > 20) {
        errs.sizeUnit = t("validation.sizeUnitLength");
      }
      return errs;
    },
    [t]
  );

  const errors = validate(formData);

  const showError = (field: keyof TapSizeFormModel) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: keyof TapSizeFormModel, value: string | number | boolean) => {
    if (field === "tapSize") {
      const strVal = String(value);
      const parsed = parseNominalSizeFromTapSize(strVal);

      setFormData((prev) => ({
        ...prev,
        tapSize: strVal,
        ...(!isNominalUserEdited.current && parsed.nominalSizeValue !== undefined
          ? { nominalSizeValue: parsed.nominalSizeValue }
          : {}),
        ...(!isUnitUserEdited.current && parsed.sizeUnit ? { sizeUnit: parsed.sizeUnit } : {}),
      }));
      return;
    }

    if (field === "nominalSizeValue") {
      isNominalUserEdited.current = value !== "";
    } else if (field === "sizeUnit") {
      isUnitUserEdited.current = value !== "";
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof TapSizeFormModel) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "tapSize") {
      const parsed = parseNominalSizeFromTapSize(formData.tapSize);
      if (!isNominalUserEdited.current && parsed.nominalSizeValue !== undefined) {
        setFormData((prev) => ({ ...prev, nominalSizeValue: parsed.nominalSizeValue! }));
      }
      if (!isUnitUserEdited.current && parsed.sizeUnit) {
        setFormData((prev) => ({ ...prev, sizeUnit: parsed.sizeUnit! }));
      }
    } else if (
      field === "nominalSizeValue" &&
      formData.nominalSizeValue !== "" &&
      formData.nominalSizeValue !== null &&
      formData.nominalSizeValue !== undefined
    ) {
      const formatted = formatNominalSize(formData.nominalSizeValue, "");
      if (formatted !== formData.nominalSizeValue) {
        setFormData((prev) => ({ ...prev, nominalSizeValue: formatted }));
      }
    }
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
      const code = (formData.tapSizeCode || "").trim().toUpperCase().slice(0, 30);

      const submitData = {
        tapSizeCode: code,
        tapSize: formData.tapSize.trim(),
        nominalSizeValue: formData.nominalSizeValue,
        sizeUnit: formData.sizeUnit?.trim() || null,
        isActive: formData.isActive,
      };

      const result = isEdit
        ? await updateTapSizeAction(id!, submitData)
        : await createTapSizeAction(submitData);

      if (result.success) {
        toast.success(isEdit ? t("messages.updateSuccess") : t("messages.createSuccess"));
        setOpen(false);
        router.push(listUrl);
      } else {
        const rawError = result.error ?? tCommon("errors.generic");
        // Strip any function name prefix like "createTapSize: "
        const cleanError = rawError.replace(/^([a-zA-Z0-9_]+:\s*)+/, "").trim();
        const isDuplicate = result.statusCode === 409 || /already exists|duplicate/i.test(cleanError);
        const finalMessage = isDuplicate
          ? t("messages.duplicateError")
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

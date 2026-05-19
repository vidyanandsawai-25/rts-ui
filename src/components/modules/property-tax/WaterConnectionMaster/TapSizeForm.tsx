"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Drawer,
  CancelButton,
  SaveButton,
  Input,
  Label,
  ValidationMessage,
  ToggleSwitch,
} from "@/components/common";

import type { TapSize, TapSizeFormModel } from "@/types/water-connection.types";
import {
  createTapSizeAction,
  updateTapSizeAction,
} from "@/app/[locale]/property-tax/water-connection-master/actions";

const MAX_CODE = 10;
const MAX_NAME = 50;

export interface TapSizeFormProps {
  id: number | null;
  initialData?: TapSize;
}

export function TapSizeForm({ id, initialData }: Readonly<TapSizeFormProps>) {
  const router = useRouter();
  const t = useTranslations("waterConnectionMaster.tapSize");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState<TapSizeFormModel>({
    sizeCode: initialData?.sizeCode ?? "",
    sizeName: initialData?.sizeName ?? "",
    isActive: initialData?.isActive ?? true,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof TapSizeFormModel, boolean>>>({});

  const validate = useCallback(
    (data: TapSizeFormModel) => {
      const errs: Partial<Record<keyof TapSizeFormModel, string>> = {};
      if (!data.sizeCode.trim())
        errs.sizeCode = t("validation.sizeCodeRequired");
      else if (data.sizeCode.length > MAX_CODE)
        errs.sizeCode = t("validation.sizeCodeLength", { count: MAX_CODE });
      if (!data.sizeName.trim())
        errs.sizeName = t("validation.sizeNameRequired");
      else if (data.sizeName.length > MAX_NAME)
        errs.sizeName = t("validation.sizeNameLength", { count: MAX_NAME });
      return errs;
    },
    [t]
  );

  const errors = validate(formData);

  const showError = (field: keyof TapSizeFormModel) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: keyof TapSizeFormModel, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof TapSizeFormModel) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmittedOnce(true);
    if (Object.keys(validate(formData)).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateTapSizeAction(id!, formData)
        : await createTapSizeAction(formData);

      if (result.success) {
        toast.success(isEdit ? t("messages.updateSuccess") : t("messages.createSuccess"));
        setOpen(false);
        router.back();
      } else {
        toast.error(result.error ?? tCommon("errors.unexpectedError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      title={isEdit ? t("editTitle") : t("addTitle")}
      footer={
        <>
          <CancelButton
            label={tCommon("buttons.cancel")}
            onClick={handleClose}
            disabled={isSubmitting}
          />
          <SaveButton
            label={isEdit ? tCommon("buttons.update") : tCommon("buttons.save")}
            type="submit"
            form="tap-size-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form
        id="tap-size-form"
        onSubmit={handleSubmit}
        className="space-y-5 p-5"
        noValidate
      >
        <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="tap-size-isActive">
              {t("form.isActive.label")}
            </Label>
            <ToggleSwitch
              checked={formData.isActive}
              onChange={() => handleChange("isActive", !formData.isActive)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tap-size-code" required>
              {t("form.sizeCode.label")}
            </Label>
            <Input
              id="tap-size-code"
              value={formData.sizeCode}
              onChange={(e) => handleChange("sizeCode", e.target.value)}
              onBlur={() => handleBlur("sizeCode")}
              placeholder={t("form.sizeCode.placeholder")}
              maxLength={MAX_CODE}
              aria-invalid={showError("sizeCode") ? "true" : "false"}
              aria-describedby={showError("sizeCode") ? "tap-size-code-error" : undefined}
            />
            <ValidationMessage
              id="tap-size-code-error"
              message={errors.sizeCode}
              visible={showError("sizeCode")}
            />
          </div>

          <div>
            <Label htmlFor="tap-size-name" required>
              {t("form.sizeName.label")}
            </Label>
            <Input
              id="tap-size-name"
              value={formData.sizeName}
              onChange={(e) => handleChange("sizeName", e.target.value)}
              onBlur={() => handleBlur("sizeName")}
              placeholder={t("form.sizeName.placeholder")}
              maxLength={MAX_NAME}
              aria-invalid={showError("sizeName") ? "true" : "false"}
              aria-describedby={showError("sizeName") ? "tap-size-name-error" : undefined}
            />
            <ValidationMessage
              id="tap-size-name-error"
              message={errors.sizeName}
              visible={showError("sizeName")}
            />
          </div>
        </div>
      </form>
    </Drawer>
  );
}

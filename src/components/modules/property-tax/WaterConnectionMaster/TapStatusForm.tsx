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

import type { TapStatus, TapStatusFormModel } from "@/types/water-connection.types";
import {
  createTapStatusAction,
  updateTapStatusAction,
} from "@/app/[locale]/property-tax/water-connection-master/actions";

const MAX_CODE = 10;
const MAX_NAME = 50;

export interface TapStatusFormProps {
  id: number | null;
  initialData?: TapStatus;
}

export function TapStatusForm({ id, initialData }: Readonly<TapStatusFormProps>) {
  const router = useRouter();
  const t = useTranslations("waterConnectionMaster.tapStatus");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState<TapStatusFormModel>({
    statusCode: initialData?.statusCode ?? "",
    statusName: initialData?.statusName ?? "",
    isActive: initialData?.isActive ?? true,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof TapStatusFormModel, boolean>>>({});

  const validate = useCallback(
    (data: TapStatusFormModel) => {
      const errs: Partial<Record<keyof TapStatusFormModel, string>> = {};
      if (!data.statusCode.trim())
        errs.statusCode = t("validation.statusCodeRequired");
      else if (data.statusCode.length > MAX_CODE)
        errs.statusCode = t("validation.statusCodeLength", { count: MAX_CODE });
      if (!data.statusName.trim())
        errs.statusName = t("validation.statusNameRequired");
      else if (data.statusName.length > MAX_NAME)
        errs.statusName = t("validation.statusNameLength", { count: MAX_NAME });
      return errs;
    },
    [t]
  );

  const errors = validate(formData);

  const showError = (field: keyof TapStatusFormModel) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: keyof TapStatusFormModel, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof TapStatusFormModel) => {
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
        ? await updateTapStatusAction(id!, formData)
        : await createTapStatusAction(formData);

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
            form="tap-status-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form
        id="tap-status-form"
        onSubmit={handleSubmit}
        className="space-y-5 p-5"
        noValidate
      >
        <div className="rounded-xl border border-gray-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="tap-status-isActive">
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
            <Label htmlFor="tap-status-code" required>
              {t("form.statusCode.label")}
            </Label>
            <Input
              id="tap-status-code"
              value={formData.statusCode}
              onChange={(e) => handleChange("statusCode", e.target.value)}
              onBlur={() => handleBlur("statusCode")}
              placeholder={t("form.statusCode.placeholder")}
              maxLength={MAX_CODE}
              aria-invalid={showError("statusCode") ? "true" : "false"}
              aria-describedby={showError("statusCode") ? "tap-status-code-error" : undefined}
            />
            <ValidationMessage
              id="tap-status-code-error"
              message={errors.statusCode}
              visible={showError("statusCode")}
            />
          </div>

          <div>
            <Label htmlFor="tap-status-name" required>
              {t("form.statusName.label")}
            </Label>
            <Input
              id="tap-status-name"
              value={formData.statusName}
              onChange={(e) => handleChange("statusName", e.target.value)}
              onBlur={() => handleBlur("statusName")}
              placeholder={t("form.statusName.placeholder")}
              maxLength={MAX_NAME}
              aria-invalid={showError("statusName") ? "true" : "false"}
              aria-describedby={showError("statusName") ? "tap-status-name-error" : undefined}
            />
            <ValidationMessage
              id="tap-status-name-error"
              message={errors.statusName}
              visible={showError("statusName")}
            />
          </div>
        </div>
      </form>
    </Drawer>
  );
}

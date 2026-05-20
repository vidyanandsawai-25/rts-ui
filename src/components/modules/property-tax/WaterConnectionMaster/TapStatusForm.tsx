"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Droplets } from "lucide-react";

import {
  Drawer,
  CancelButton,
  SaveButton,
  Input,
  Label,
  ValidationMessage,
  StatusToggleField,
} from "@/components/common";

import { MandatoryFieldsNotice } from "@/components/modules/property-tax/Floormaster/MandatoryFieldsNotice";

import type { TapStatus, TapStatusFormModel } from "@/types/water-connection.types";
import {
  createTapStatusAction,
  updateTapStatusAction,
} from "@/app/[locale]/property-tax/water-connection-master/actions";

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

  const [formData, setFormData] = useState<Omit<TapStatusFormModel, "statusCode">>({
    statusName: initialData?.statusName ?? "",
    isActive: initialData?.isActive ?? true,
  });
  const [touched, setTouched] = useState<Partial<Record<"statusName", boolean>>>({});

  const validate = useCallback(
    (data: typeof formData) => {
      const errs: Partial<Record<"statusName", string>> = {};
      if (!data.statusName.trim())
        errs.statusName = t("validation.statusNameRequired");
      else if (data.statusName.length > MAX_NAME)
        errs.statusName = t("validation.statusNameLength", { count: MAX_NAME });
      return errs;
    },
    [t]
  );

  const errors = validate(formData);

  const showError = (field: "statusName") =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: "statusName" | "isActive", value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: "statusName") => {
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
      const payload: TapStatusFormModel = { ...formData };
      const result = isEdit
        ? await updateTapStatusAction(id!, payload)
        : await createTapStatusAction(payload);

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
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
            <Droplets size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("editTitle") : t("addTitle")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("editSubtitle") : t("addSubtitle")}
            </div>
          </div>
        </div>
      }
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
        className="space-y-5 bg-[#F8FAFF] p-5"
        noValidate
      >
        <StatusToggleField
          isActive={formData.isActive}
          onChange={() => handleChange("isActive", !formData.isActive)}
          labels={{
            title: t("form.activeStatusTitle"),
            activeText: t("form.activeStatusOn"),
            inactiveText: t("form.activeStatusOff"),
          }}
        />

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

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}

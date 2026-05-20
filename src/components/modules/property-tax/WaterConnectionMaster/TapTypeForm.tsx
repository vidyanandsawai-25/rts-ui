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

import type { TapType, TapTypeFormModel } from "@/types/water-connection.types";
import {
  createTapTypeAction,
  updateTapTypeAction,
} from "@/app/[locale]/property-tax/water-connection-master/actions";

const MAX_CODE = 10;
const MAX_NAME = 50;

export interface TapTypeFormProps {
  id: number | null;
  initialData?: TapType;
}

export function TapTypeForm({ id, initialData }: Readonly<TapTypeFormProps>) {
  const router = useRouter();
  const t = useTranslations("waterConnectionMaster.tapType");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState<TapTypeFormModel>({
    typeCode: initialData?.typeCode ?? "",
    typeName: initialData?.typeName ?? "",
    isActive: initialData?.isActive ?? true,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof TapTypeFormModel, boolean>>>({});

  const validate = useCallback(
    (data: TapTypeFormModel) => {
      const errs: Partial<Record<keyof TapTypeFormModel, string>> = {};
      if (!data.typeCode.trim())
        errs.typeCode = t("validation.typeCodeRequired");
      else if (data.typeCode.length > MAX_CODE)
        errs.typeCode = t("validation.typeCodeLength", { count: MAX_CODE });
      if (!data.typeName.trim())
        errs.typeName = t("validation.typeNameRequired");
      else if (data.typeName.length > MAX_NAME)
        errs.typeName = t("validation.typeNameLength", { count: MAX_NAME });
      return errs;
    },
    [t]
  );

  const errors = validate(formData);

  const showError = (field: keyof TapTypeFormModel) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: keyof TapTypeFormModel, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof TapTypeFormModel) => {
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
        ? await updateTapTypeAction(id!, formData)
        : await createTapTypeAction(formData);

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
            form="tap-type-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form
        id="tap-type-form"
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

        <div className="space-y-4">
          <div>
            <Label htmlFor="tap-type-code" required>
              {t("form.typeCode.label")}
            </Label>
            <Input
              id="tap-type-code"
              value={formData.typeCode}
              onChange={(e) => handleChange("typeCode", e.target.value)}
              onBlur={() => handleBlur("typeCode")}
              placeholder={t("form.typeCode.placeholder")}
              maxLength={MAX_CODE}
              aria-invalid={showError("typeCode") ? "true" : "false"}
              aria-describedby={showError("typeCode") ? "tap-type-code-error" : undefined}
            />
            <ValidationMessage
              id="tap-type-code-error"
              message={errors.typeCode}
              visible={showError("typeCode")}
            />
          </div>

          <div>
            <Label htmlFor="tap-type-name" required>
              {t("form.typeName.label")}
            </Label>
            <Input
              id="tap-type-name"
              value={formData.typeName}
              onChange={(e) => handleChange("typeName", e.target.value)}
              onBlur={() => handleBlur("typeName")}
              placeholder={t("form.typeName.placeholder")}
              maxLength={MAX_NAME}
              aria-invalid={showError("typeName") ? "true" : "false"}
              aria-describedby={showError("typeName") ? "tap-type-name-error" : undefined}
            />
            <ValidationMessage
              id="tap-type-name-error"
              message={errors.typeName}
              visible={showError("typeName")}
            />
          </div>
        </div>

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}

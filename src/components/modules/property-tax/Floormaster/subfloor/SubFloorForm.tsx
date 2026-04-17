"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Layers, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Drawer } from "@/components/common/Drawer";
import { CancelButton, Input, SaveButton } from "@/components/common";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { cn } from "@/lib/utils/cn";
import { validateForm, commonValidations, hasErrors } from "@/lib/utils/validation";

import type { SubFloor, SubFloorFormModel } from "@/types/floor.types";
import {
  createSubFloorAction,
  updateSubFloorAction,
  checkSubFloorCodeExistsAction,
} from "@/app/[locale]/property-tax/floormaster/actions";

/* ================= CONSTANTS ================= */

const CODE_MAX = 10;
// Allow alphanumeric and underscore - validation will enforce "not at start/end" rule
const CODE_REGEX = /^[A-Za-z0-9_]*$/;

/* ================= TYPES ================= */

const DEFAULT_VALUES: SubFloorFormModel = {
  subFloorCode: "",
  description: "",
  isActive: true,
};

type Props =
  | { mode: "add"; initialData?: never }
  | { mode: "edit"; initialData: SubFloor };

function ValidationMessage({
  message,
  visible,
}: {
  message?: string;
  visible: boolean;
}) {
  if (!visible || !message) return null;

  return (
    <div className="mt-1 flex items-center gap-2 text-sm text-red-600">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}

export default function SubFloorForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const t = useTranslations("floor.subfloor");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  const initial = useMemo<SubFloorFormModel>(() => {
    if (!isEdit) return DEFAULT_VALUES;

    const s = props.initialData;

    return {
      subFloorCode: s.subFloorCode ?? "",
      description: s.description ?? "",
      isActive: s.isActive ?? true,
    };
  }, [isEdit, props.initialData]);

  const [formData, setFormData] = useState(initial);
  const [errors, setErrors] =
    useState<Partial<Record<keyof SubFloorFormModel, string>>>({});
  const [touched, setTouched] =
    useState<Partial<Record<keyof SubFloorFormModel, boolean>>>({});

  const isActive = formData.isActive;

  useEffect(() => {
    setFormData(initial);
  }, [initial]);

  const handleClose = () => {
    setOpen(false);
    router.back();
  };

  /* ================= VALIDATION ================= */

  // Component-specific validators
  const subFloorValidators = useMemo(() => ({
    subFloorCode: commonValidations.masterCode(
      (key: string, values?: Record<string, string | number | Date>) => t(key, values),
      CODE_MAX
    ),
    description: commonValidations.masterDescription(
      (key: string, values?: Record<string, string | number | Date>) => t(key, values),
      100
    ),
    isActive: (value: unknown) => {
      if (typeof value !== "boolean") {
        return t("validation.required");
      }
      return undefined;
    },
  }), [t, tCommon]);

  const validate = useCallback(
    (data: SubFloorFormModel) => {
      return validateForm(data, subFloorValidators);
    },
    [subFloorValidators]
  );

  const showError = (field: keyof SubFloorFormModel) =>
    Boolean(touched[field] && errors[field]);

  /* ================= CHANGE ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof SubFloorFormModel;

    if (key === "subFloorCode") {
      if (value.length > CODE_MAX) return;
      if (!CODE_REGEX.test(value) && value !== "") return;
    }

    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ================= BLUR ================= */

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof SubFloorFormModel;

    setTouched((prev) => ({ ...prev, [key]: true }));

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (key === "subFloorCode" && !validationErrors.subFloorCode) {
      setCheckingCode(true);
      try {
        const result = await checkSubFloorCodeExistsAction(
          formData.subFloorCode.trim(),
          isEdit ? props.initialData.subFloorId : undefined
        );

        if (!result.success) throw new Error(result.error);

        if (result.data?.exists) {
          setErrors((prev) => ({
            ...prev,
            subFloorCode: t("validation.duplicateCode"),
          }));
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : tCommon("errors.saveFailed")
        );
      } finally {
        setCheckingCode(false);
      }
    }
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      toast.error(tCommon("errors.fixValidation"));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: SubFloorFormModel = {
        subFloorCode: formData.subFloorCode.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      const result = isEdit
        ? await updateSubFloorAction(
            props.initialData.subFloorId,
            payload
          )
        : await createSubFloorAction(payload);

      if (!result.success) throw new Error(result.error);

      toast.success(
        isEdit
          ? t("messages.updateSuccess")
          : t("messages.createSuccess")
      );

      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : tCommon("errors.saveFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Drawer
      open={open}
      onClose={handleClose}
   
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-indigo-600 rounded-lg text-white">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("form.editTitle") : t("form.addTitle")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit
                ? t("form.editSubtitle")
                : t("form.addSubtitle")}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton label={tCommon("actions.cancel")} onClick={handleClose} />
          <SaveButton
            label={isEdit ? tCommon("actions.update") : tCommon("actions.save")}
            type="submit"
            form="subfloor-form"
            isLoading={isSubmitting || checkingCode}
          />
        </>
      }
    >
      <form
        id="subfloor-form"
        onSubmit={handleSubmit}
        className="space-y-6 p-5"
      >
        {/* Active Toggle - Show at top for edit mode */}
        {isEdit && (
          <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-4">
            <div
              className={cn(
                "rounded-xl p-2 flex items-center justify-between",
                isActive
                  ? "border border-blue-200 bg-[#F0F6FF]"
                  : "border border-gray-200 bg-gray-50"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-800"
                  )}
                >
                  {isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
                </div>

                <div>
                  <div className="font-medium text-gray-700">
                    {t("form.activeStatusTitle")}
                    <span className="text-red-600 ml-1">*</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {isActive
                      ? t("form.activeStatusOn")
                      : t("form.activeStatusOff")}
                  </div>
                </div>
              </div>

              <ToggleSwitch
                checked={isActive}
                onChange={() =>
                  setFormData((p) => ({
                    ...p,
                    isActive: !p.isActive,
                  }))
                }
                showPopup={false}
              />
            </div>
          </div>
        )}

        <Input
          name="subFloorCode"
          label={t("form.code")}
          required
          value={formData.subFloorCode}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("form.codePlaceholder")}
        />
        <ValidationMessage
          message={errors.subFloorCode}
          visible={showError("subFloorCode")}
        />

        <Input
          name="description"
          label={t("form.description")}
          required
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("form.descriptionPlaceholder")}
        />
        <ValidationMessage
          message={errors.description}
          visible={showError("description")}
        />


         <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              <AlertCircle size={16} />
              <span>
                {t("note.mandatory")}
              </span>
            </div>
      </form>
    </Drawer>
  );
}
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Layers, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

import { Drawer } from "@/components/common/Drawer";
import { CancelButton, Input, SaveButton } from "@/components/common";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { cn } from "@/lib/utils/cn";
import { validateForm, commonValidations, hasErrors } from "@/lib/utils/validation";

import type { SubFloor, SubFloorFormModel } from "@/types/floor.types";
import {
  createSubFloorAction,
  updateSubFloorAction,
} from "@/app/[locale]/property-tax/floormaster/actions";

/* ================= CONSTANTS ================= */

const CODE_MAX = 10;
// Allow alphanumeric and underscore - validation will enforce "not at start/end" rule
const CODE_REGEX = /^\w*$/;

/* ================= PROPS ================= */
export interface SubFloorFormProps {
  subFloorId: number | null;
  initialData?: SubFloor;
}

function ValidationMessage({
  message,
  visible,
}: Readonly<{
  message?: string;
  visible: boolean;
}>) {
  if (!visible || !message) return null;

  return (
    <div className="mt-1 flex items-center gap-2 text-sm text-red-600">
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}

/* ================= MAIN ================= */
export default function SubFloorForm({
  subFloorId,
  initialData,
}: Readonly<SubFloorFormProps>) {
  const router = useRouter();
  const isEdit = Boolean(subFloorId);

  const t = useTranslations("floor.subfloor");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initial = useMemo<SubFloorFormModel>(() => {
    if (!initialData) {
      return {
        subFloorCode: "",
        description: "",
        isActive: true,
      };
    }

    return {
      subFloorCode: initialData.subFloorCode ?? "",
      description: initialData.description ?? "",
      isActive: initialData.isActive ?? true,
    };
  }, [initialData]);

  const [formData, setFormData] = useState(initial);
  const [errors, setErrors] =
    useState<Partial<Record<keyof SubFloorFormModel, string>>>({});
  const [touched, setTouched] =
    useState<Partial<Record<keyof SubFloorFormModel, boolean>>>({});

  const isActive = formData.isActive;

  useEffect(() => {
    setFormData(initial);
  }, [initial]);

  const handleClose = useCallback(() => {
    setOpen(false);
    router.push(`/${locale}/property-tax/floormaster/subfloor`);
  }, [router, locale, setOpen]);

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

    // Note: Duplicate code check disabled until checkSubFloorCodeExistsAction is implemented
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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

      // Add subFloorId for updates
      if (isEdit && initialData?.subFloorId) {
        payload.subFloorId = initialData.subFloorId;
      }

      const result = isEdit
        ? await updateSubFloorAction(payload)
        : await createSubFloorAction(payload);

      if (!result.success) throw new Error(result.message);

      toast.success(
        isEdit
          ? t("messages.updateSuccess")
          : t("messages.createSuccess")
      );

      handleClose();
      router.refresh();
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
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg text-white">
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
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form
        id="subfloor-form"
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#F8FAFF] p-5"
      >
        {/* Active Toggle - Show at top for edit mode */}
        {isEdit && (
          <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-4">
            <div
              className={cn(
                "rounded-xl p-3 flex items-center justify-between",
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
                      : "bg-gray-200 text-gray-900"
                  )}
                >
                  {isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
                </div>

                <div>
                  <div className="font-medium text-gray-900">
                    {t("form.activeStatusTitle")}
                  </div>
                  <div className="text-sm text-gray-500">
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

        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
          <Input
            name="subFloorCode"
            label={t("form.code")}
            required
            value={formData.subFloorCode}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={t("form.codePlaceholder")}
            fullWidth
            className="text-gray-700"
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
            fullWidth
            className="text-gray-700"
          />
          <ValidationMessage
            message={errors.description}
            visible={showError("description")}
          />
        </div>

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
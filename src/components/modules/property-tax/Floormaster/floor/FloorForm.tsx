"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Building, CheckCircle2, X} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Drawer } from "@/components/common/Drawer";
import { CancelButton, Input, SaveButton } from "@/components/common";
import { ToggleSwitch } from "@/components/common/ToggleSwitch";
import { cn } from "@/lib/utils/cn";
import { validateForm, commonValidations, hasErrors } from "@/lib/utils/validation";

import type { Floor, FloorFormModel } from "@/types/floor.types";
import {
  createFloorAction,
  updateFloorAction,
  checkFloorSequenceExistsAction,
  checkFloorCodeExistsAction,
} from "@/app/[locale]/property-tax/floormaster/actions";

/* ================= CONSTANTS ================= */

const CODE_MAX = 5;
// Allow alphanumeric and underscore - validation will enforce "not at start/end" rule
const CODE_REGEX = /^[A-Za-z0-9_]*$/;

const DEFAULT_VALUES: FloorFormModel = {
  floorCode: "",
  description: "",
  sequenceNo: 0,
  isActive: true,
};

type Props =
  | { mode: "add"; initialData?: never }
  | { mode: "edit"; initialData: Floor };

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

export default function FloorForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";

  const t = useTranslations("floor.floor");
  const tCommon = useTranslations("common");

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingCode, setCheckingCode] = useState(false);

  // /* ================= INITIAL DATA ================= */

  const initial = useMemo<FloorFormModel>(() => {
    if (!isEdit) return DEFAULT_VALUES;

    const f = props.initialData;

    return {
      floorCode: f.floorCode ?? "",
      description: f.description ?? "",
      sequenceNo: f.sequenceNo ?? 0,
      isActive: f.isActive ?? true,
    };
  }, [isEdit, props.initialData]);

  const [formData, setFormData] = useState(initial);
  const [errors, setErrors] =
    useState<Partial<Record<keyof FloorFormModel, string>>>({});
  const [touched, setTouched] =
    useState<Partial<Record<keyof FloorFormModel, boolean>>>({});

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
  const floorValidators = useMemo(() => ({
    floorCode: commonValidations.masterCode(
      (key: string, values?: Record<string, string | number | Date>) => t(key, values),
      CODE_MAX
    ),
    description: commonValidations.masterDescription(
      (key: string, values?: Record<string, string | number | Date>) => t(key, values),
      100
    ),
    sequenceNo: (value: unknown) => {
      const numVal = Number(value);
      if (!Number.isFinite(numVal) || numVal <= 0) {
        return t("validation.mustBeNumber");
      }
      return undefined;
    },
    isActive: (value: unknown) => {
      if (typeof value !== "boolean") {
        return t("validation.required");
      }
      return undefined;
    },
  }), [t, tCommon]);

  const validate = useCallback(
    (data: FloorFormModel) => {
      return validateForm(data, floorValidators);
    },
    [floorValidators]
  );

  const showError = (field: keyof FloorFormModel) =>
    Boolean(touched[field] && errors[field]);

  /* ================= CHANGE ================= */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const key = name as keyof FloorFormModel;

    if (key === "floorCode") {
      if (value.length > CODE_MAX) return;
      if (!CODE_REGEX.test(value) && value !== "") return;
    }

    setFormData((prev) => ({
      ...prev,
      [key]:
        key === "sequenceNo"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
  };

  /* ================= BLUR ================= */

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const key = e.target.name as keyof FloorFormModel;

    setTouched((prev) => ({ ...prev, [key]: true }));

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    /* ==== Sequence duplicate check ==== */
    

    if (key === "sequenceNo" && !validationErrors.sequenceNo) {
      const result = await checkFloorSequenceExistsAction(
        formData.sequenceNo,
        isEdit ? String(props.initialData.floorId) : undefined
      );

      if (!result.success)
        return toast.error(result.error);

      if (result.data?.exists) {
        setErrors((prev) => ({
          ...prev,
          sequenceNo: t("validation.duplicateSequenceNo"),
        }));
      }
    }

    /* ==== Code duplicate check ==== */

    if (
      key === "floorCode" &&
      !validationErrors.floorCode
    ) {
      setCheckingCode(true);

      try {
        const result = await checkFloorCodeExistsAction(
          formData.floorCode.trim(),
          isEdit ? props.initialData.floorId : undefined
        );

        if (!result.success)
          throw new Error(result.error);

        if (result.data?.exists) {
          setErrors((prev) => ({
            ...prev,
            floorCode: t("validation.duplicateFloorCode"),
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
      const payload: FloorFormModel = {
        floorCode: formData.floorCode.trim(),
        description: formData.description.trim(),
        sequenceNo: Number(formData.sequenceNo),
        isActive: formData.isActive,
      };

      const result = isEdit
        ? await updateFloorAction(
            props.initialData.floorId, 
            payload
          )
        : await createFloorAction(payload);

      if (!result.success)
        throw new Error(result.error);

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
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white">
            <Building size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit
                ? t("form.editTitle")
                : t("form.addTitle")}
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
          <CancelButton
            label={tCommon("actions.cancel")}
            onClick={handleClose}
          />
          <SaveButton
            label={
              isEdit
                ? tCommon("actions.update")
                : tCommon("actions.save")
            }
            type="submit"
            form="floor-form"
            isLoading={isSubmitting||checkingCode}
          />
        </>
      }
    >
      <form
        id="floor-form"
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#F8FAFF] p-5"
      >
        {/* Active Toggle - Show for edit mode */}
        {isEdit && (
          <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-4">
            <div
              className={cn(
                "rounded-xl p-2 flex items-center justify-between transition-colors",
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
                  {isActive ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <X size={18} />
                  )}
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

        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">

          {/* Floor Code */}
          <div className="flex flex-col">
            <Input
              name="floorCode"
              label={t("form.floorCode")}
              required
              value={formData.floorCode}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
              placeholder={t("form.floorCodePlaceholder")}
            />
            <ValidationMessage
              message={errors.floorCode}
              visible={showError("floorCode")}
            />
          </div>

          {/* Regional Name */}
          <div className="flex flex-col">
            <Input
              name="description"
              label={t("form.regionalName")}
              required
              value={formData.description}
              placeholder={t("form.regionalNamePlaceholder")}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
            />
            <ValidationMessage
              message={errors.description}
              visible={showError("description")}
            />
          </div>

          {/* Sequence */}
          <div className="flex flex-col">
            <Input
              name="sequenceNo"
              label={t("form.sequenceNo")}
              required
              type="number"
              value={formData.sequenceNo === 0 ? "" : formData.sequenceNo}
              placeholder={t("form.sequenceNoPlaceholder")}
              onChange={handleChange}
              onBlur={handleBlur}
              fullWidth
            />
            <ValidationMessage
              message={errors.sequenceNo}
              visible={showError("sequenceNo")}
            />
          </div>
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


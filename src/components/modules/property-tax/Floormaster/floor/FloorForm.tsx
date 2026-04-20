"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  AlertCircle,
  CheckCircle2,
  Layers,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import {
  Input,
  CancelButton,
  SaveButton,
  ToggleSwitch,
  ValidationMessage,
} from "@/components/common";

import {
  createFloorAction,
  updateFloorAction,
} from "@/app/[locale]/property-tax/floormaster/actions";

import { FloorFormModel, Floor } from "@/types/floor.types";
import { FloorFormFields } from "./FloorFormFields";
import { cn } from "@/lib/utils/cn";
import type React from "react";
import {
  CODE_REGEX,
  CODE_SANITIZE,
  DESCRIPTION_REGEX,
  DESCRIPTION_SANITIZE,
} from "@/lib/utils/validation";
import { StatusToggleField } from "../StatusToggleField";

/* ================= CONSTANTS ================= */
const FLOOR_CODE_MAX = 7;
const DESCRIPTION_MAX = 100;

/* ================= PROPS ================= */
export interface FloorFormProps {
  floorId: number | null;
  initialData?: Floor;
}

/* ================= MAIN ================= */
export default function FloorForm({
  floorId,
  initialData,
}: Readonly<FloorFormProps>) {
  const router = useRouter();
  const t = useTranslations("floor.floor");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(floorId);

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState<FloorFormModel>({
    floorId: initialData?.floorId,
    floorCode: initialData?.floorCode ?? "",
    description: initialData?.description ?? "",
    sequenceNo: initialData?.sequenceNo ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FloorFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const locale = useLocale();
  const handleClose = useCallback(() => {
    setOpen(false);
    router.push(`/${locale}/property-tax/floormaster/floor`);
  }, [router, locale, setOpen]);

  /* ================= VALIDATION ================= */
  const validate = useCallback(
    (data: FloorFormModel): Partial<Record<keyof FloorFormModel, string>> => {
      const e: Partial<Record<keyof FloorFormModel, string>> = {};

      const floorCode = data.floorCode.trim();
      const description = data.description.trim();

      if (!floorCode) {
        e.floorCode = t("form.validation.codeRequired");
      } else if (floorCode.length > FLOOR_CODE_MAX) {
        e.floorCode = t("form.validation.codeMaxLength", { count: FLOOR_CODE_MAX });
      } else if (!CODE_REGEX.test(floorCode)) {
        e.floorCode = t("form.validation.codeFormat");
      }

      if (!description) {
        e.description = t("form.validation.descriptionRequired");
      } else if (description.length > DESCRIPTION_MAX) {
        e.description = t("form.validation.descriptionMaxLength", { count: DESCRIPTION_MAX });
      } else if (!DESCRIPTION_REGEX.test(description)) {
        e.description = t("form.validation.descriptionFormat");
      }

      if (!Number.isFinite(data.sequenceNo) || data.sequenceNo < 0) {
        e.sequenceNo = t("validation.mustBeNumber");
      }

      if (!data.isActive && !isEdit) {
        e.isActive = t("form.validation.mustBeActive");
      }

      return e;
    },
    [isEdit, t]
  );

  const showError = (field: keyof FloorFormModel): boolean =>
    (submittedOnce || touched[field]) && !!errors[field];

  /* ================= CHANGE ================= */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "description") {
      newValue = newValue.replace(DESCRIPTION_SANITIZE, "");
      if (newValue.length > DESCRIPTION_MAX) {
        newValue = newValue.substring(0, DESCRIPTION_MAX);
      }
    }

    if (name === "floorCode") {
      newValue = newValue.replace(CODE_SANITIZE, "");
      if (newValue.length > FLOOR_CODE_MAX) {
        newValue = newValue.substring(0, FLOOR_CODE_MAX);
      }
    }

    setFormData((p) => ({
      ...p,
      [name]: name === "sequenceNo" ? Number(newValue) : newValue,
    }));
  };

  /* ================= BLUR ================= */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({
      ...formData,
      [name]: name === "sequenceNo" ? Number(value) : value,
    });

    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof FloorFormModel;
      
      if (fieldErrors[fieldName]) {
        newErrors[fieldName] = fieldErrors[fieldName];
      } else {
        delete newErrors[fieldName];
      }
      
      return newErrors;
    });
  };

  /* ================= ERROR HELPER ================= */
  const getErrorMessage = (result: { statusCode?: number; message?: string }): string => {
    if (result.statusCode === 409) return t("apiErrors.duplicateRecord");
    if (result.statusCode === 400) {
      const msg = result.message?.toLowerCase() || "";
      if (msg.includes("duplicate") || msg.includes("already exists")) {
        return t("apiErrors.duplicateRecord");
      }
      return result.message || t("apiErrors.invalidData");
    }
    if (result.statusCode === 404) return t("apiErrors.notFound");
    if (result.statusCode === 401 || result.statusCode === 403) return tCommon("errors.unauthorized");
    if (result.statusCode && result.statusCode >= 500) return tCommon("errors.serverError");
    if (result.message) return result.message;
    return t("apiErrors.operationFailed");
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmittedOnce(true);

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateFloorAction(formData)
        : await createFloorAction(formData);

      if (!result.success) {
        toast.error(getErrorMessage(result));
        return;
      }

      const successMessage = isEdit
        ? t("messages.updateSuccess", { code: formData.floorCode })
        : t("messages.createSuccess", { code: formData.floorCode });

      toast.success(successMessage);
      handleClose();
      router.refresh();

    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : t("apiErrors.operationFailed");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (): void => {
    setFormData((p) => ({ ...p, isActive: !p.isActive }));
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
          <CancelButton
            label={tCommon("buttons.cancel")}
            onClick={handleClose}
            disabled={isSubmitting}
          />
          <SaveButton
            label={isEdit ? tCommon("actions.update") : tCommon("actions.save")}
            type="submit"
            form="form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form
        id="form"
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#F8FAFF] p-5"
      >
          {isEdit && (
            <StatusToggleField
              isActive={formData.isActive}
              onChange={handleToggleStatus}
              error={errors.isActive}
              labels={{
                title: t("form.activeStatusTitle"),
                activeText: t("form.activeStatusOn"),
                inactiveText: t("form.activeStatusOff"),
              }}
            />
          )}

          <FloorFormFields
            formData={formData}
            errors={errors}
            showError={showError}
            onChange={handleChange}
            onBlur={handleBlur}
            labels={{
              floorCode: t("form.floorCode"),
              floorCodePlaceholder: t("form.floorCodePlaceholder"),
              description: t("form.description"),
              descriptionPlaceholder: t("form.descriptionPlaceholder"),
              sequenceNo: t("form.sequenceNo"),
            }}
          />

          <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            <AlertCircle size={16} />
            <span>
              {tCommon("note.mandatory")}
            </span>
          </div>
      </form>
    </Drawer>
  );
}
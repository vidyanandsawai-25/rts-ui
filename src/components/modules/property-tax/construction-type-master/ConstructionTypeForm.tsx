"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  AlertCircle,
  CheckCircle2,
  HardHat,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Drawer } from "@/components/common/Drawer";
import { Input, CancelButton, SaveButton, ToggleSwitch, ValidationMessage } from "@/components/common";
import {
  createConstructionAction,
  updateConstructionAction,
} from "@/app/[locale]/property-tax/constructiontype/action";
import { ConstructionTypeFormModel, ConstructionType } from "@/types/construction.types";
import { cn } from "@/lib/utils/cn";
import type React from "react";
import { CONSTRUCTION_CODE_REGEX, CONSTRUCTION_CODE_SANITIZE, DESCRIPTION_REGEX, DESCRIPTION_SANITIZE } from "@/lib/utils/validation";

const CONSTRUCTION_CODE_MAX = 7;
const DESCRIPTION_MAX = 100;

/* ================= MAIN ================= */
export interface ConstructionTypeFormProps {
  constructionTypeId: number | null;
  initialData?: ConstructionType;
}

export default function ConstructionTypeForm({
  constructionTypeId,
  initialData,
}: ConstructionTypeFormProps) {
  const router = useRouter();
  const t = useTranslations("construction.constructionType");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(constructionTypeId);

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [formData, setFormData] = useState<ConstructionTypeFormModel>({
    constructionTypeId: initialData?.constructionTypeId,
    constructionCode: initialData?.constructionCode ?? "",
    description: initialData?.description ?? "",
    searchSequence: initialData?.searchSequence ?? 0,
    isActive: initialData?.isActive ?? true,
    updatedBy: 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ConstructionTypeFormModel, string>>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const locale = useLocale();
  const handleClose = useCallback(() => {
    setOpen(false);
    router.push(`/${locale}/property-tax/constructiontype`);
  }, [router, locale, setOpen]);

  /* ================= VALIDATION ================= */
  const validate = useCallback(
    (data: ConstructionTypeFormModel): Partial<Record<keyof ConstructionTypeFormModel, string>> => {
      const e: Partial<Record<keyof ConstructionTypeFormModel, string>> = {};

      if (!data.constructionCode.trim()) {
        e.constructionCode = t("form.validation.constructionCodeRequired");
      } else if (data.constructionCode.length > CONSTRUCTION_CODE_MAX) {
        e.constructionCode = t("form.validation.constructionCodeMaxLength");
      } else if (!CONSTRUCTION_CODE_REGEX.test(data.constructionCode)) {
        e.constructionCode = t("form.validation.constructionCodeFormat");
      }

      if (!data.description.trim()) {
        e.description = t("form.validation.descriptionRequired");
      } else if (data.description.length > DESCRIPTION_MAX) {
        e.description = t("form.validation.descriptionMaxLength");
      } else if (!DESCRIPTION_REGEX.test(data.description)) {
        e.description = t("form.validation.descriptionFormat");
      }

      if (!Number.isFinite(data.searchSequence) || data.searchSequence < 0) {
        e.searchSequence = t("form.validation.sequenceInvalid");
      }

      if (!data.isActive && !isEdit) {
        e.isActive = t("form.validation.mustBeActive");
      }

      return e;
    },
    [isEdit, t]
  );

  const showError = (field: keyof ConstructionTypeFormModel): boolean =>
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

    if (name === "constructionCode") {
      // Only allow alphanumeric characters using shared sanitize regex
      newValue = newValue.replace(CONSTRUCTION_CODE_SANITIZE, "");
      if (newValue.length > CONSTRUCTION_CODE_MAX) {
        newValue = newValue.substring(0, CONSTRUCTION_CODE_MAX);
      }
    }

   

    setFormData((p) => ({
      ...p,
      [name]: name === "searchSequence" ? Number(newValue) : newValue,
    }));
  };

  /* ================= BLUR ================= */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({
      ...formData,
      [name]: name === "searchSequence" ? Number(value) : value,
    });

    setErrors((p) => {
      const newErrors = { ...p };
      const fieldName = name as keyof ConstructionTypeFormModel;
      
      if (fieldErrors[fieldName]) {
        newErrors[fieldName] = fieldErrors[fieldName];
      } else {
        delete newErrors[fieldName];
      }
      
      return newErrors;
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
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
        ? await updateConstructionAction(formData)
        : await createConstructionAction(formData);

      if (!result.success) {
        // Map API error to localized message based on status code
        let errorMessage = t("apiErrors.operationFailed");

        if (result.statusCode === 409) {
          // 409 Conflict - Duplicate record (Construction Code or Description)
          errorMessage = t("apiErrors.duplicateRecord");
        } else if (result.statusCode === 400) {
          // 400 Bad Request - Validation errors
          const msg = result.message?.toLowerCase() || "";
          if (msg.includes("duplicate") || msg.includes("already exists")) {
            // Duplicate detected in validation
            errorMessage = t("apiErrors.duplicateRecord");
          } else {
            // Other validation errors
            errorMessage = result.message || t("apiErrors.invalidData");
          }
        } else if (result.statusCode === 404) {
          errorMessage = t("apiErrors.notFound");
        } else if (result.statusCode === 401 || result.statusCode === 403) {
          errorMessage = tCommon("errors.unauthorized");
        } else if (result.statusCode && result.statusCode >= 500) {
          errorMessage = tCommon("errors.serverError");
        } else if (result.message) {
          // If we have a specific message, use it as fallback
          errorMessage = result.message;
        }

        toast.error(errorMessage);
        return;
      }

      // Success - Status 200/201
      const successMessage = isEdit
        ? t("success.updated", { code: formData.constructionCode })
        : t("success.created", { code: formData.constructionCode });

      toast.success(successMessage);
      handleClose();
      router.refresh();

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = (): void => {
    setIsActive((prev) => {
      const newValue = !prev;
      setFormData((p) => ({ ...p, isActive: newValue }));
      return newValue;
    });
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
            <HardHat size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("form.editTitle") : t("form.addTitle")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit
                ? t("form.editSubtitle")
                : t("form.subtitle")}
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
            label={isEdit ? t("form.actions.update") : t("form.actions.save")}
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
        <>

        {
          isEdit &&(
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
                      "h-9 w-9 flex items-center justify-center rounded-full",
                      isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-900"
                    )}
                  >
                    {isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{t("form.status.label")}</div>
                    <div className="text-sm text-gray-500">
                      {t("form.status.description")}
                      {isActive ? ` ${tCommon("status.active")}` : ` ${tCommon("status.inactive")}`}
                    </div>
                  </div>
                </div>

                {isEdit && (
                  <ToggleSwitch
                    checked={isActive}
                    onChange={handleToggleStatus}
                    showPopup={false}

                  />
                )}
              </div>

              <ValidationMessage
                message={errors.isActive}
                visible={!!errors.isActive}
              />
            </div>
          )
        }
          <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">

            <Input
              name="constructionCode"
              label={t("form.fields.constructionCode.label")}
                required
                placeholder={t("form.fields.constructionCode.placeholder")}
                value={formData.constructionCode}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                className="text-gray-700"
              />
              <ValidationMessage
                message={errors.constructionCode}
                visible={showError("constructionCode")}
              />

              <Input
                name="description"
                label={t("form.fields.description.label")}
                required={true}
                placeholder={t("form.fields.description.placeholder")}
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                fullWidth
                className="text-gray-700"
              />
              <ValidationMessage
                message={errors.description}
                visible={showError("description")}
              />

              
              
                  <Input
                    name="searchSequence"
                    label={t("form.fields.searchSequence.label")}
                    type="number"
                    min={0}
                    value={formData.searchSequence}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    required
                    className="text-gray-700"
                  />
                  <ValidationMessage
                    message={errors.searchSequence}
                    visible={showError("searchSequence")}
                  />
               

                {/* <div>
                  <Input
                    name="searchKey"
                    label={t("form.fields.searchKey.label")}
                    required
                    placeholder={t("form.fields.searchKey.placeholder")}
                    value={formData.searchKey}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                    className="text-gray-700"
                  />
                  <ValidationMessage
                    message={errors.searchKey}
                    visible={showError("searchKey")}
                  />
                </div> */}
             
            </div>

           

            <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              <AlertCircle size={16} />
              <span>
                {tCommon("note.mandatory")}
              </span>
            </div>
          </>
      </form>
    </Drawer>
  );
}
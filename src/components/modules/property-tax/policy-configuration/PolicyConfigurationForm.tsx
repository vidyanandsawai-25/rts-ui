"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { toast } from "sonner";

import { CancelButton, SaveButton } from "@/components/common";
import { MandatoryFieldsNotice } from "./components/MandatoryFieldsNotice";
import type { PolicyConfigurationFormModel } from "@/types/policy-configuration.types";
import { CODE_SANITIZE, DESCRIPTION_SANITIZE, TEXT_SANITIZE } from "@/lib/utils/validation-rules";
import { savePolicyConfiguration } from "@/app/[locale]/property-tax/policy-configuration/action";
import { Drawer } from "@/components/common/Drawer";
import { useTranslations, useLocale } from "next-intl";
import { FormFieldsSection } from "./components/FormFieldsSection";
import { StatusToggleSection } from "./components/StatusToggleSection";
import {
  validateValueByDataType,
  sanitizeValueByDataType,
} from "@/lib/validations/policy-configuration-datatype";

export interface PolicyConfigurationFormProps {
  initialData: PolicyConfigurationFormModel | null;
}

/**
 * Agar stored value (e.g. "1" ya "0") allowedValues list mein nahi hai,
 * toh BIT legacy mapping lagao:
 *   "1" → pehla option (e.g. "Enable")
 *   "0" → doosra option (e.g. "Disable")
 * Agar value already list mein hai toh as-is return karo.
 */
function resolveValueFromAllowedList(value: string, allowedValues: string | null): string {
  if (!allowedValues || !allowedValues.trim()) return value;

  const options = allowedValues
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

  // Direct match — already correct
  if (options.includes(value)) return value;

  // Legacy BIT mapping: "1" → first option, "0" → second option
  if (value === "1" && options.length >= 1) return options[0];
  if (value === "0" && options.length >= 2) return options[1];

  // Fallback: first option
  return options[0] ?? value;
}

/**
 * initialData ko process karke form ke liye ready karo.
 * policyValue aur defaultValue ko allowedValues se match karo.
 */
function prepareInitialData(
  data: PolicyConfigurationFormModel | null
): PolicyConfigurationFormModel {
  if (!data) {
    return {
      id: undefined,
      policyCode: "",
      category: "",
      displayName: "",
      description: "",
      dataType: "",
      policyValue: "",
      defaultValue: "",
      unit: "",
      effectiveFrom: "",
      effectiveTo: null,
      allowedValues: null,
      isActive: true,
    };
  }

  return {
    ...data,
    unit: data.unit ?? "",
    effectiveFrom: data.effectiveFrom ?? "",
    policyValue: resolveValueFromAllowedList(data.policyValue ?? "", data.allowedValues ?? null),
    defaultValue: resolveValueFromAllowedList(data.defaultValue ?? "", data.allowedValues ?? null),
  };
}

export default function PolicyConfigurationForm({ initialData }: PolicyConfigurationFormProps) {
  const router = useRouter();
  const isEdit = initialData?.id != null;

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useTranslations("policyConfiguration");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [formData, setFormData] = useState<PolicyConfigurationFormModel>(
    () => prepareInitialData(initialData)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const validate = useCallback(
    (data: PolicyConfigurationFormModel) => {
      const e: Record<string, string> = {};

      if (!data.policyCode.trim()) e.policyCode = t("form.validation.policyCodeRequired");
      if (!data.category.trim()) e.category = t("form.validation.categoryRequired");
      if (!data.displayName.trim()) e.displayName = t("form.validation.displayNameRequired");
      if (!data.description.trim()) e.description = t("form.validation.descriptionRequired");
      if (!data.dataType.trim()) e.dataType = t("form.validation.dataTypeRequired");
      if (!data.policyValue.trim()) e.policyValue = t("form.validation.policyValueRequired");
      if (!data.defaultValue.trim()) e.defaultValue = t("form.validation.defaultValueRequired");
      // unit is optional for all data types
      if (!data.effectiveFrom?.trim()) e.effectiveFrom = t("form.validation.effectiveFromRequired");

      // Skip dataType-based validation when allowedValues present
      // (values come from dropdown, already constrained to valid list)
      const hasAllowedValues = !!(data.allowedValues && data.allowedValues.trim());

      if (!hasAllowedValues && data.policyValue.trim() && data.dataType.trim()) {
        const err = validateValueByDataType(data.policyValue, data.dataType);
        if (err) e.policyValue = t(err);
      }

      if (!hasAllowedValues && data.defaultValue.trim() && data.dataType.trim()) {
        const err = validateValueByDataType(data.defaultValue, data.dataType);
        if (err) e.defaultValue = t(err);
      }

      return e;
    },
    [t]
  );

  const showError = (field: keyof PolicyConfigurationFormModel) =>
    touched[field] && !!errors[field];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let sanitizedValue = value;

    if (name === "policyCode") {
      sanitizedValue = value.replace(CODE_SANITIZE, "").toUpperCase().substring(0, 40);
    } else if (name === "displayName") {
      sanitizedValue = value.replace(TEXT_SANITIZE, "").substring(0, 40);
    } else if (name === "description") {
      sanitizedValue = value.replace(DESCRIPTION_SANITIZE, "").substring(0, 100);
    } else if (name === "policyValue" || name === "defaultValue") {
      if (formData.dataType && !formData.allowedValues) {
        sanitizedValue = sanitizeValueByDataType(value, formData.dataType);
      } else {
        sanitizedValue = value.replace(TEXT_SANITIZE, "").substring(0, 40);
      }
    } else if (name === "unit") {
      sanitizedValue = value.replace(/[^\p{L}\p{M}\p{N}\s,.\-\/&%]/gu, "").substring(0, 10);
    }

    setFormData((p) => ({ ...p, [name]: sanitizedValue }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, value: string) => {
    const { name } = e.target;
    setFormData((p) => {
      const updated = { ...p, [name]: value };
      if (name === "dataType" && value !== p.dataType) {
        updated.policyValue = "";
        updated.defaultValue = "";
        if (value.toUpperCase() === "BIT") {
          updated.unit = "";
        }
      }
      return updated;
    });
    if (name === "dataType") {
      const isBit = value.toUpperCase() === "BIT";
      setErrors((p) => ({
        ...p,
        [name]: "",
        policyValue: "",
        defaultValue: "",
        ...(isBit ? { unit: "" } : {}),
      }));
    } else {
      setErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  const handleSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const fieldErrors = validate({ ...formData, [name]: value });
    setErrors((p) => ({ ...p, [name]: fieldErrors[name] ?? "" }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    const fieldErrors = validate({ ...formData, [name]: value });
    setErrors((p) => ({ ...p, [name]: fieldErrors[name] ?? "" }));
  };

  const handleToggleStatus = () => {
    setFormData((p) => ({ ...p, isActive: !p.isActive }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      policyCode: true,
      category: true,
      displayName: true,
      description: true,
      dataType: true,
      policyValue: true,
      defaultValue: true,
      unit: true,
      effectiveFrom: true,
    });

    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      toast.error(t("form.validation.fixErrors"));
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("locale", locale);
      fd.append("policyCode", formData.policyCode);
      fd.append("category", formData.category);
      fd.append("displayName", formData.displayName);
      fd.append("description", formData.description);
      fd.append("dataType", formData.dataType);
      fd.append("policyValue", formData.policyValue);
      fd.append("defaultValue", formData.defaultValue);
      fd.append("unit", formData.unit ?? "");
      fd.append("effectiveFrom", formData.effectiveFrom);
      fd.append("effectiveTo", formData.effectiveTo ?? "");
      fd.append("allowedValues", formData.allowedValues ?? "");
      fd.append("isActive", String(formData.isActive));

      const res = await savePolicyConfiguration(isEdit ? String(formData.id) : "", fd);

      if (res?.ok) {
        toast.success(
          res.mode === "update"
            ? t("form.messages.updateSuccess")
            : t("form.messages.createSuccess")
        );
        setOpen(false);
        router.push(`/${locale}/property-tax/policy-configuration`);
        router.refresh();
        return;
      }

      if (res && !res.ok) {
        if (res.error === "duplicate") {
          setErrors({ policyCode: t("form.validation.duplicateRecord") });
          toast.error(t("form.validation.duplicateError"));
        } else if (res.error === "invalid_id") {
          toast.error(t("form.messages.invalidIdError"));
        } else {
          toast.error(t("form.messages.error"));
        }
        return;
      }

      toast.error(t("form.messages.error"));
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message ?? t("form.messages.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md text-white">
            <Settings size={20} />
          </div>
          <div>
            <div className="text-lg font-bold text-blue-900">
              {isEdit ? t("form.editTitle") : t("form.addTitle")}
            </div>
            <div className="text-sm text-slate-500">
              {isEdit ? t("form.editSubtitle") : t("form.subtitle")}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <CancelButton label={t("form.actions.cancel")} onClick={handleClose} />
          <SaveButton
            label={isEdit ? t("form.actions.update") : t("form.actions.save")}
            type="submit"
            form="policy-config-form"
            isLoading={isSubmitting}
          />
        </>
      }
    >
      <form id="policy-config-form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
        <StatusToggleSection
          isEdit={isEdit}
          isActive={formData.isActive}
          onToggle={handleToggleStatus}
          t={t}
        />

        <FormFieldsSection
          formData={formData}
          errors={errors}
          showError={showError}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          onBlur={handleBlur}
          onSelectBlur={handleSelectBlur}
          t={t}
        />

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}

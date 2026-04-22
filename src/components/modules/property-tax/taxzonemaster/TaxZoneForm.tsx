"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

import { CancelButton, SaveButton } from "@/components/common";
import type { TaxZoneFormModel } from "@/types/taxzone.types";
import { saveTaxZone } from "@/app/[locale]/property-tax/taxzone/action";
import { Drawer } from "@/components/common/Drawer";
import { useTranslations, useLocale } from "next-intl";
import { CODE_REGEX, CODE_SANITIZE, DESCRIPTION_REGEX, DESCRIPTION_SANITIZE } from "@/lib/utils/validation-rules";
import { StatusToggleCard } from "./StatusToggleCard";
import { FormFieldsSection } from "./FormFieldsSection";
import { MandatoryFieldsNotice } from "./MandatoryFieldsNotice";



const ZONE_NO_MAX = 10;

export interface TaxZoneFormProps {
  initialData: TaxZoneFormModel | null;
}

export default function TaxZoneForm({ initialData }: TaxZoneFormProps) {
  const router = useRouter();
   const isEdit = initialData?.taxZoneId != null;

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = useTranslations("taxZone");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  // ✅ Initialize form data from server-side props
  const [formData, setFormData] = useState<TaxZoneFormModel>(
    initialData ?? {
      taxZoneId: undefined,
      taxZoneNo: "",
      taxZoneType: "",
      remark: "",
      isActive: true,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleClose = useCallback(() => {
    setOpen(false);
    router.back();
  }, [router]);

  const validate = useCallback((data: TaxZoneFormModel) => {
    const e: Record<string, string> = {};

    // Zone No: Use CODE_REGEX (alphanumeric, underscore only in between)
    if (!data.taxZoneNo.trim()) {
      e.taxZoneNo = t("form.validation.zoneNoRequired")
    } else if (data.taxZoneNo.length > ZONE_NO_MAX) {
      e.taxZoneNo = t("form.validation.zoneNoMax");
    } else if (!CODE_REGEX.test(data.taxZoneNo)) {
      e.taxZoneNo = t("form.validation.zoneNoFormat")
    }

    // Zone Type: Use DESCRIPTION_REGEX (special chars in between, single space only)
    if (!data.taxZoneType.trim()) {
      e.taxZoneType = t("form.validation.zoneTypeRequired");
    } else if (!DESCRIPTION_REGEX.test(data.taxZoneType)) {
      e.taxZoneType = t("form.validation.zoneTypeFormat");
    }

    // Remark: Use DESCRIPTION_REGEX (special chars in between, single space only)
    if (!data.remark?.trim()) {
      e.remark = t("form.validation.remarkRequired");
    } else if (!DESCRIPTION_REGEX.test(data.remark)) {
      e.remark = t("form.validation.remarkFormat");
    }

    return e;
  }, [t]);

  const showError = (field: keyof TaxZoneFormModel) =>
    touched[field] && !!errors[field];

  // ✅ No need for useEffect - data comes from server via props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "taxZoneNo") {
      if (newValue.length > ZONE_NO_MAX) return;
      newValue = newValue.replace(CODE_SANITIZE, ""); // Sanitize Zone No (alphanumeric and underscore)
    }

    if (name === "taxZoneType" || name === "remark") {
      newValue = newValue.replace(DESCRIPTION_SANITIZE, ""); // Sanitize (multilingual with punctuation)    
    }

    setFormData((p) => ({ ...p, [name]: newValue }));

    // ✅ Clear existing error while typing
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const fieldErrors = validate({ ...formData, [name]: value });
    setErrors((p) => ({ ...p, [name]: fieldErrors[name] }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched on submit
    setTouched({
      taxZoneNo: true,
      taxZoneType: true,
      remark: true,
    });

    // 1) basic required/regex validation
    const v = validate(formData);
    setErrors(v);

    if (Object.keys(v).length) {
      toast.error(t("form.validation.fixErrors") || "Please fix validation errors");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare FormData
      const fd = new FormData();
      fd.append("taxZoneNo", formData.taxZoneNo);
      fd.append("taxZoneType", formData.taxZoneType);
      fd.append("remark", formData.remark);
      fd.append("isActive", String(formData.isActive));
      fd.append("locale", locale);

      const res = await saveTaxZone(isEdit ? String(formData.taxZoneId) : "", fd);

      if (res?.ok) {
        toast.success(
          res.mode === "update"
            ? t("form.messages.updateSuccess") 
            : t("form.messages.createSuccess") 
        );
        setOpen(false);
        router.push(`/${locale}/property-tax/taxzone`);
        router.refresh();
        return;
      }

      // Handle specific error types
      if (res && !res.ok) {
        if (res.error === "duplicate") {
          // Show duplicate error for both fields
          setErrors({
            taxZoneNo: t("form.validation.duplicateRecord") ,
            taxZoneType: t("form.validation.duplicateRecord") 
          });
          toast.error(
            t("form.validation.duplicateError")
          );
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

  const handleToggleStatus = () => {
    setFormData((p) => ({ ...p, isActive: !p.isActive }));
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      className="border-l-4 border-[#4F6A94]"
      title={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md text-white shadow">
            <MapPin size={20} />
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
          <CancelButton
            label={t("form.actions.cancel")}
            onClick={handleClose}
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
      <form id="form" onSubmit={handleSubmit} className="space-y-6 bg-[#F8FAFF] p-5">
        {isEdit && (
          <StatusToggleCard
            isActive={formData.isActive}
            onToggle={handleToggleStatus}
            activeLabel={t("form.status.active")}
            inactiveLabel={t("form.status.inactive")}
            statusLabel={t("form.status.label")}
          />
        )}

        <FormFieldsSection
          formData={formData}
          errors={errors}
          showError={showError}
          onChange={handleChange}
          onBlur={handleBlur}
          t={t}
        />

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}


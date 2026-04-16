"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, MapPin, X } from "lucide-react";
import { toast } from "sonner";

import { CancelButton, Input, SaveButton, ToggleSwitch, ValidationMessage } from "@/components/common";

import type { TaxZoneFormModel } from "@/types/taxzone.types";
import { cn } from "@/lib/utils/cn";
import { saveTaxZone } from "@/app/[locale]/property-tax/taxzone/action";
import { Drawer } from "@/components/common/Drawer";
import { useTranslations, useLocale } from "next-intl";
import { TEXT_ALLOWED, TEXT_SANITIZE, ZONE_NO_ALLOWED, ZONE_NO_SANITIZE } from "@/lib/utils/validation";



const ZONE_NO_MAX = 10;

export interface TaxZoneFormProps {
  initialData: TaxZoneFormModel | null;
}

export default function TaxZoneForm({ initialData }: TaxZoneFormProps) {
  const router = useRouter();
   const isEdit = initialData?.taxZoneId != null;

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

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

    if (!data.taxZoneNo.trim()) {
      e.taxZoneNo = t("form.validation.zoneNoRequired")
    } else if (data.taxZoneNo.length > ZONE_NO_MAX) {
      e.taxZoneNo = t("form.validation.zoneNoMax");
    } else if (!ZONE_NO_ALLOWED.test(data.taxZoneNo)) {
      e.taxZoneNo = t("form.validation.zoneNoFormat")
    }

    if (!data.taxZoneType.trim()) {
      e.taxZoneType = t("form.validation.zoneTypeRequired");
    } else if (!TEXT_ALLOWED.test(data.taxZoneType)) {
      e.taxZoneType = t("form.validation.zoneTypeFormat");
    }

    if (!data.remark?.trim()) {
      e.remark = t("form.validation.remarkRequired");
    } else if (!TEXT_ALLOWED.test(data.remark)) {
      e.remark = t("form.validation.remarkFormat");
    }

    return e;
  }, [t]);

  const showError = (field: keyof TaxZoneFormModel) =>
    (submittedOnce || touched[field]) && !!errors[field];

  // ✅ No need for useEffect - data comes from server via props

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "taxZoneNo") {
      if (newValue.length > ZONE_NO_MAX) return;
      newValue = newValue.replace(ZONE_NO_SANITIZE, ""); // Sanitize for Zone Number (allow marks for Devanagari)
    }

    if (name === "taxZoneType" || name === "remark") {
      newValue = newValue.replace(TEXT_SANITIZE, ""); // Sanitize for Zone Type and Remark
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
    setSubmittedOnce(true);

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
            ? t("form.messages.updateSuccess") || "Zone updated successfully"
            : t("form.messages.createSuccess") || "Zone created successfully"
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
            taxZoneNo: t("form.validation.duplicateRecord") || "This record already exists",
            taxZoneType: t("form.validation.duplicateRecord") || "This record already exists",
          });
          toast.error(
            res.message || 
            t("form.validation.duplicateError") || 
            "This record already exists. Please check Zone No and Zone Type - duplicates not allowed."
          );
        } else {
          toast.error(res.message || t("form.messages.error") || "Something went wrong");
        }
        return;
      }

      toast.error(t("form.messages.error") || "Something went wrong");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message ?? t("form.messages.error") ?? "Something went wrong");
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
        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-4 space-y-4">
          <div
            className={cn(
              "rounded-xl p-2 flex items-center justify-between transition-colors",
              formData.isActive ? "border border-blue-200 bg-[#F0F6FF]" : "border border-gray-200 bg-gray-50"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  formData.isActive ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-500"
                )}
              >
                {formData.isActive ? <CheckCircle2 size={18} /> : <X size={18} />}
              </div>

              <div>
                <div className={cn("font-medium", formData.isActive ? "text-[#1E3A8A]" : "text-gray-700")}>
                  {/* Active Status */}
                  {t("form.status.label")}
                </div>
                <div className={cn("text-sm", formData.isActive ? "text-gray-500" : "text-gray-400")}>
                  {/* {formData.isActive ? "Zone is currently active" : "Zone is currently inactive"} */}
                  {formData.isActive
                    ? t("form.status.active")
                    : t("form.status.inactive")}
                </div>
              </div>
            </div>

            <ToggleSwitch checked={formData.isActive} onChange={handleToggleStatus} showPopup={false} />
          </div>
        </div>

        <div className="rounded-xl border border-[#DCEAFF] bg-slate-50 p-5 space-y-4">
          <Input
            name="taxZoneNo"
            label={t("form.fields.zoneNo.label")}
            required={true}
            value={formData.taxZoneNo}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={t("form.fields.zoneNo.placeholder")}
            fullWidth
          />
          <ValidationMessage message={errors.taxZoneNo} visible={showError("taxZoneNo")} />

          <Input
            name="taxZoneType"
            label={t("form.fields.zoneType.label")}
            required={true}
            value={formData.taxZoneType}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={t("form.fields.zoneType.placeholder")}
            fullWidth
          />
          <ValidationMessage message={errors.taxZoneType} visible={showError("taxZoneType")} />

          <Input
            name="remark"
            label={t("form.fields.remark.label")}
            required={true}
            value={formData.remark}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={t("form.fields.remark.placeholder")}
            fullWidth
          />
          <ValidationMessage message={errors.remark} visible={showError("remark")} />
        </div>

        {/* STATUS BLOCK (UI like your ConstructionType) */}
      

        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          <AlertCircle size={16} />
          {/* <span>
            Fields marked with <b>*</b> are mandatory
          </span> */}
          <span>{tCommon("note.mandatory")}</span>
        </div>
      </form>
    </Drawer>
  );
}


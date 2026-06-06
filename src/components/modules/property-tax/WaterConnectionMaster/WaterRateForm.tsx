"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Droplets } from "lucide-react";

import {
  Drawer,
  CancelButton,
  SaveButton,
  Input,
  Select,
  ValidationMessage,
} from "@/components/common";
import { StatusToggleField } from "./StatusToggleField";

import { MandatoryFieldsNotice } from "@/components/modules/property-tax/Floormaster/MandatoryFieldsNotice";

import type { WaterRate, WaterRateFormModel } from "@/types/water-connection.types";
import {
  createWaterRateAction,
  updateWaterRateAction,
  fetchTapTypePagedAction,
  fetchTapSizePagedAction,
  fetchFinancialYearsPagedAction,
} from "@/app/[locale]/property-tax/water-connection-master/actions";

export interface WaterRateFormProps {
  id: number | null;
  initialData?: WaterRate;
}

export function WaterRateForm({ id, initialData }: Readonly<WaterRateFormProps>) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("waterConnectionMaster.waterRate");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(id);

  const listUrl = `/${locale}/property-tax/water-connection-master/water-rate`;

  const [open, setOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  const [formData, setFormData] = useState({
    waterConnectionTypeId: initialData?.waterConnectionTypeId ? String(initialData.waterConnectionTypeId) : "",
    waterConnectionSizeId: initialData?.waterConnectionSizeId ? String(initialData.waterConnectionSizeId) : "",
    financeYearId: initialData?.financeYearId ? String(initialData.financeYearId) : "",
    yearlyRate: initialData?.yearlyRate != null ? String(initialData.yearlyRate) : "",
    isActive: initialData?.isActive ?? true,
  });

  const [touched, setTouched] = useState<Partial<Record<keyof typeof formData, boolean>>>({});

  // Dropdown options states
  const [types, setTypes] = useState<{ label: string; value: string }[]>([]);
  const [sizes, setSizes] = useState<{ label: string; value: string }[]>([]);
  const [years, setYears] = useState<{ label: string; value: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Load dropdown options
  useEffect(() => {
    async function loadOptions() {
      try {
        const [typeRes, sizeRes, yearRes] = await Promise.all([
          fetchTapTypePagedAction(1, 1000),
          fetchTapSizePagedAction(1, 1000),
          fetchFinancialYearsPagedAction(),
        ]);
        
        setTypes(
          (typeRes.items || [])
            .filter((t) => t.isActive || t.waterConnectionTypeId === initialData?.waterConnectionTypeId)
            .map((t) => ({
              label: t.typeName,
              value: String(t.waterConnectionTypeId),
            }))
        );

        setSizes(
          (sizeRes.items || [])
            .filter((s) => s.isActive || s.waterConnectionSizeId === initialData?.waterConnectionSizeId)
            .map((s) => ({
              label: s.displayLabel || s.sizeName,
              value: String(s.waterConnectionSizeId),
            }))
        );

        setYears(
          (yearRes.items || [])
            .filter((y) => y.isActive || y.id === initialData?.financeYearId)
            .map((y) => ({
              label: y.yearCode || String(y.year),
              value: String(y.id),
            }))
        );
      } catch (err) {
        toast.error("Failed to load options");
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [initialData]);

  const validate = useCallback(
    (data: typeof formData) => {
      const errs: Partial<Record<keyof typeof formData, string>> = {};
      if (!data.waterConnectionTypeId)
        errs.waterConnectionTypeId = t("validation.typeRequired");
      if (!data.waterConnectionSizeId)
        errs.waterConnectionSizeId = t("validation.sizeRequired");
      if (!data.financeYearId)
        errs.financeYearId = t("validation.yearRequired");
      if (!data.yearlyRate)
        errs.yearlyRate = t("validation.rateRequired");
      else {
        const rate = Number(data.yearlyRate);
        if (Number.isNaN(rate) || rate <= 0 || !/^\d+$/.test(data.yearlyRate)) {
          errs.yearlyRate = t("validation.rateInvalid");
        } else if (data.yearlyRate.length > 5) {
          errs.yearlyRate = t("validation.rateMaxDigits");
        }
      }
      return errs;
    },
    [t]
  );

  const errors = validate(formData);

  const showError = (field: keyof typeof formData) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    router.push(listUrl);
  }, [router, listUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || loadingOptions) return;
    setSubmittedOnce(true);
    if (Object.keys(validate(formData)).length > 0) return;

    setIsSubmitting(true);
    try {
      const payload: WaterRateFormModel = {
        waterConnectionTypeId: Number(formData.waterConnectionTypeId),
        waterConnectionSizeId: Number(formData.waterConnectionSizeId),
        financeYearId: Number(formData.financeYearId),
        yearlyRate: Number(formData.yearlyRate),
        isActive: formData.isActive,
      };

      const result = isEdit
        ? await updateWaterRateAction(id!, payload)
        : await createWaterRateAction(payload);

      if (result.success) {
        toast.success(isEdit ? t("messages.updateSuccess") : t("messages.createSuccess"));
        setOpen(false);
        router.push(listUrl);
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
            label={isEdit ? tCommon("buttons.edit") : tCommon("buttons.save")}
            type="submit"
            form="water-rate-form"
            isLoading={isSubmitting || loadingOptions}
          />
        </>
      }
    >
      <form
        id="water-rate-form"
        onSubmit={handleSubmit}
        className="space-y-5 bg-[#F8FAFF] p-5"
        noValidate
      >
        {isEdit && (
          <StatusToggleField
            isActive={formData.isActive}
            onChange={() => handleChange("isActive", !formData.isActive)}
            labels={{
              title: t("form.activeStatusTitle"),
              activeText: t("form.activeStatusOn"),
              inactiveText: t("form.activeStatusOff"),
            }}
          />
        )}

        <div className="space-y-4">
          {/* Connection Type Dropdown */}
          <div>
            <Select
              label={t("form.connectionType.label")}
              required
              options={types}
              value={formData.waterConnectionTypeId}
              onChange={(_e, val) => handleChange("waterConnectionTypeId", val)}
              onBlur={() => handleBlur("waterConnectionTypeId")}
              placeholder={t("form.connectionType.placeholder")}
              disabled={loadingOptions}
              error={showError("waterConnectionTypeId") ? errors.waterConnectionTypeId : undefined}
            />
          </div>

          {/* Connection Size Dropdown */}
          <div>
            <Select
              label={t("form.connectionSize.label")}
              required
              options={sizes}
              value={formData.waterConnectionSizeId}
              onChange={(_e, val) => handleChange("waterConnectionSizeId", val)}
              onBlur={() => handleBlur("waterConnectionSizeId")}
              placeholder={t("form.connectionSize.placeholder")}
              disabled={loadingOptions}
              error={showError("waterConnectionSizeId") ? errors.waterConnectionSizeId : undefined}
            />
          </div>

          {/* Finance Year Dropdown */}
          <div>
            <Select
              label={t("form.financeYear.label")}
              required
              options={years}
              value={formData.financeYearId}
              onChange={(_e, val) => handleChange("financeYearId", val)}
              onBlur={() => handleBlur("financeYearId")}
              placeholder={t("form.financeYear.placeholder")}
              disabled={loadingOptions}
              error={showError("financeYearId") ? errors.financeYearId : undefined}
            />
          </div>

          {/* Yearly Rate Input */}
          <div>
            <Input
              label={t("form.yearlyRate.label")}
              required
              id="water-yearly-rate"
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={formData.yearlyRate}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
                handleChange("yearlyRate", digits);
              }}
              onBlur={() => handleBlur("yearlyRate")}
              placeholder={t("form.yearlyRate.placeholder")}
              aria-invalid={showError("yearlyRate") ? "true" : "false"}
              aria-describedby={showError("yearlyRate") ? "water-yearly-rate-error" : undefined}
            />
            <ValidationMessage
              id="water-yearly-rate-error"
              message={errors.yearlyRate}
              visible={showError("yearlyRate")}
            />
          </div>
        </div>

        <MandatoryFieldsNotice message={tCommon("note.mandatory")} />
      </form>
    </Drawer>
  );
}

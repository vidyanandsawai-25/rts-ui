"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Drawer, CancelButton, SaveButton, Input, Select, ValidationMessage, FormStatusToggle } from "@/components/common";
import type { TariffChargeData } from "@/types/water-bill/tariff-workbench/tariffWorkbench.types";

export interface TariffChargeLookupOption {
  value: string;
  label: string;
}

export interface TariffChargeDetailFormData {
  tariffId: number;
  chargeHeadId: number;
  geographyUnitId: number | null;
  amount: number;
  isDynamic: boolean;
  isMandatory: boolean;
  sequenceNo: number;
  isActive: boolean;
}

export interface TariffChargeDetailFormProps {
  open: boolean;
  initialData?: TariffChargeData | null;
  tariffOptions?: TariffChargeLookupOption[];
  chargeHeadOptions?: TariffChargeLookupOption[];
  geographyUnitOptions?: TariffChargeLookupOption[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: TariffChargeDetailFormData) => void | Promise<void>;
}

export function TariffChargeDetailForm({
  open,
  initialData,
  tariffOptions = [],
  chargeHeadOptions = [],
  geographyUnitOptions = [],
  isSubmitting = false,
  onClose,
  onSubmit,
}: TariffChargeDetailFormProps) {
  const t = useTranslations("tariffWorkbench");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(initialData);

  const boolOptions = [
    { value: "true", label: t("table.yes") },
    { value: "false", label: t("table.no") },
  ];

  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [formData, setFormData] = useState<TariffChargeDetailFormData>({
    tariffId: initialData?.tariffId ?? 0,
    chargeHeadId: initialData?.chargeHeadId ?? 0,
    geographyUnitId: initialData?.geographyUnitId ?? null,
    amount: initialData?.amount ?? 0,
    isDynamic: initialData?.isDynamic ?? false,
    isMandatory: initialData?.isMandatory ?? true,
    sequenceNo: initialData?.sequenceNo ?? 1,
    isActive: initialData?.isActive ?? true,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof TariffChargeDetailFormData, boolean>>>({});
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open);
    setPrevInitialData(initialData);
    setFormData({
      tariffId: initialData?.tariffId ?? 0,
      chargeHeadId: initialData?.chargeHeadId ?? 0,
      geographyUnitId: initialData?.geographyUnitId ?? null,
      amount: initialData?.amount ?? 0,
      isDynamic: initialData?.isDynamic ?? false,
      isMandatory: initialData?.isMandatory ?? true,
      sequenceNo: initialData?.sequenceNo ?? 1,
      isActive: initialData?.isActive ?? true,
    });
    setSubmittedOnce(false);
    setTouched({});
  }

  const validate = useCallback((data: TariffChargeDetailFormData) => {
    const errs: Partial<Record<keyof TariffChargeDetailFormData, string>> = {};
    if (data.tariffId <= 0) errs.tariffId = t("errors.tariffNameRequired") || "Tariff Name is required";
    if (data.chargeHeadId <= 0) errs.chargeHeadId = t("errors.chargeHeadRequired") || "Charge Head is required";
    if (data.amount < 0) errs.amount = t("errors.amountInvalid") || "Amount must be >= 0";
    if (data.sequenceNo < 1) errs.sequenceNo = t("errors.sequenceNoInvalid") || "Sequence must be >= 1";
    return errs;
  }, [t]);

  const errors = validate(formData);
  const showError = (field: keyof TariffChargeDetailFormData) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);
  const visibleTariffOptions = initialData?.tariffId && !tariffOptions.some((option) => option.value === String(initialData.tariffId))
    ? [{ value: String(initialData.tariffId), label: initialData.tariffName }, ...tariffOptions]
    : tariffOptions;
  const visibleChargeHeadOptions = initialData?.chargeHeadId && !chargeHeadOptions.some((option) => option.value === String(initialData.chargeHeadId))
    ? [{ value: String(initialData.chargeHeadId), label: initialData.chargeHeadName }, ...chargeHeadOptions]
    : chargeHeadOptions;
  const visibleGeographyUnitOptions = initialData?.geographyUnitId != null && !geographyUnitOptions.some((option) => option.value === String(initialData.geographyUnitId))
    ? [{ value: String(initialData.geographyUnitId), label: initialData.geographyUnitName }, ...geographyUnitOptions]
    : geographyUnitOptions;

  const handleChange = (field: keyof TariffChargeDetailFormData, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof TariffChargeDetailFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedOnce(true);
    if (Object.keys(validate(formData)).length > 0) return;
    onSubmit(formData);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="md"
      title={
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-2 text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
            {t("table.chargeHeadName") || "Charge Detail"}
          </div>
          <div className="text-xl font-bold text-slate-900">
            {isEdit ? t("editChargeDetailTitle") || "Edit Charge Detail" : t("addChargeDetailTitle") || "Add Charge Detail"}
          </div>
          {initialData?.tariffName && (
            <div className="text-xs text-slate-500 font-normal">{initialData.tariffName}</div>
          )}
          {initialData?.chargeHeadName && (
            <div className="text-xs text-slate-400 font-normal">{initialData.chargeHeadName}</div>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <CancelButton label={tCommon("buttons.cancel")} onClick={onClose} disabled={isSubmitting} />
          <SaveButton label={t("form.saveRecord") || "Save"} type="submit" form="tariff-charge-detail-form" isLoading={isSubmitting} />
        </div>
      }
    >
      <form id="tariff-charge-detail-form" onSubmit={handleSubmit} className="p-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          {isEdit && (
            <div className="col-span-1 md:col-span-2">
              <FormStatusToggle
                isEdit={isEdit}
                isActive={Boolean(formData.isActive)}
                onChange={(checked) => handleChange("isActive", checked)}
                statusLabel={formData.isActive ? tCommon("status.active") : tCommon("status.inactive")}
                description={formData.isActive ? t("form.activeStatusOn") : t("form.activeStatusOff")}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          <div className="space-y-1">
            <Select
              required
              label={t("table.tariffName")}
              value={formData.tariffId ? String(formData.tariffId) : ""}
              onChange={(e) => handleChange("tariffId", Number(e.target.value))}
              onBlur={() => handleBlur("tariffId")}
              options={visibleTariffOptions}
              placeholder={tCommon("select.placeholder") || "-- select --"}
              className={showError("tariffId") ? "!border-red-500 focus:!ring-red-500 [&>button]:!border-red-500 [&>button]:focus:!ring-red-400" : ""}
            />
            <ValidationMessage message={errors.tariffId} visible={showError("tariffId")} />
          </div>

          <div className="space-y-1">
            <Select
              required
              label={t("table.chargeHeadName") }
              value={formData.chargeHeadId ? String(formData.chargeHeadId) : ""}
              onChange={(e) => handleChange("chargeHeadId", Number(e.target.value))}
              onBlur={() => handleBlur("chargeHeadId")}
              options={visibleChargeHeadOptions}
              placeholder={tCommon("select.placeholder") || "-- select --"}
              className={showError("chargeHeadId") ? "!border-red-500 focus:!ring-red-500 [&>button]:!border-red-500 [&>button]:focus:!ring-red-400" : ""}
            />
            <ValidationMessage message={errors.chargeHeadId} visible={showError("chargeHeadId")} />
          </div>

          <div className="space-y-1 col-span-1 md:col-span-2">
            <Select
              label={t("table.geographyUnit")}
              value={formData.geographyUnitId != null ? String(formData.geographyUnitId) : ""}
              onChange={(e) => handleChange("geographyUnitId", e.target.value ? Number(e.target.value) : null)}
              onBlur={() => handleBlur("geographyUnitId")}
              options={visibleGeographyUnitOptions}
              placeholder={tCommon("select.placeholder") || "-- select --"}
            />
          </div>

          <div className="space-y-1 col-span-1 md:col-span-2">
            <Input
              required
              type="number"
              label={t("table.amount")}
              placeholder="0"
              value={String(formData.amount)}
              onChange={(e) => handleChange("amount", Number(e.target.value))}
              onBlur={() => handleBlur("amount")}
              className={showError("amount") ? "!border-red-500 focus:!ring-red-500" : ""}
            />
            <ValidationMessage message={errors.amount} visible={showError("amount")} />
          </div>

          <div className="space-y-1">
            <Select
              label={t("table.isDynamic") }
              value={String(formData.isDynamic)}
              onChange={(e) => handleChange("isDynamic", e.target.value === "true")}
              options={boolOptions}
              placeholder={tCommon("select.placeholder") || "-- select --"}
            />
          </div>

          <div className="space-y-1">
            <Select
              label={t("table.isMandatory")}
              value={String(formData.isMandatory)}
              onChange={(e) => handleChange("isMandatory", e.target.value === "true")}
              options={boolOptions}
              placeholder={tCommon("select.placeholder") || "-- select --"}
            />
          </div>

          <div className="space-y-1">
            <Input
              required
              type="number"
              label={t("table.sequenceNo")}
              placeholder="1"
              value={String(formData.sequenceNo)}
              onChange={(e) => handleChange("sequenceNo", Number(e.target.value))}
              onBlur={() => handleBlur("sequenceNo")}
              className={showError("sequenceNo") ? "!border-red-500 focus:!ring-red-500" : ""}
            />
            <ValidationMessage message={errors.sequenceNo} visible={showError("sequenceNo")} />
          </div>
        </div>
      </form>
    </Drawer>
  );
}

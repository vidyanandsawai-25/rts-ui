"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Drawer, CancelButton, SaveButton, Input, Select, ValidationMessage, FormStatusToggle } from "@/components/common";
import type { TariffSlabData } from "@/types/water-bill/tariff-workbench/tariffWorkbench.types";

export interface TariffSlabLookupOption {
  value: string;
  label: string;
}

export interface TariffSlabFormData {
  tariffId: number;
  geographyUnitId: number | null;
  fromUnit: number;
  toUnit: number;
  unitRate: number;
  fixedCharge: number;
  minimumCharge: number;
  maximumCharge: number | null;
  perConnectionAmount: number | null;
  formulaCode: string;
  isActive: boolean;
}

export interface TariffSlabFormProps {
  open: boolean;
  initialData?: TariffSlabData | null;
  defaultTariffId?: number;
  tariffOptions?: TariffSlabLookupOption[];
  geographyUnitOptions?: TariffSlabLookupOption[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (data: TariffSlabFormData) => void | Promise<void>;
}

export function TariffSlabForm({
  open,
  initialData,
  defaultTariffId,
  tariffOptions = [],
  geographyUnitOptions = [],
  isSubmitting = false,
  onClose,
  onSubmit,
}: TariffSlabFormProps) {
  const t = useTranslations("tariffWorkbench");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(initialData);

  const formulaCodeOptions = [
    { value: "UNIT_RATE", label: t("form.formulaCodes.unitRate") },
    { value: "FLAT_RATE", label: t("form.formulaCodes.flatRate") },
    { value: "SLAB_RATE", label: t("form.formulaCodes.slabRate") },
    { value: "PER_CONNECTION", label: t("form.formulaCodes.perConnection") },
  ];

  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [formData, setFormData] = useState<TariffSlabFormData>({
    tariffId: initialData?.tariffId ?? defaultTariffId ?? 0,
    geographyUnitId: initialData?.geographyUnitId ?? null,
    fromUnit: initialData?.fromUnit ?? 0,
    toUnit: initialData?.toUnit ?? 0,
    unitRate: initialData?.unitRate ?? 0,
    fixedCharge: initialData?.fixedCharge ?? 0,
    minimumCharge: initialData?.minimumCharge ?? 0,
    maximumCharge: initialData?.maximumCharge ?? null,
    perConnectionAmount: initialData?.perConnectionAmount ?? null,
    formulaCode: initialData?.formulaCode ?? "UNIT_RATE",
    isActive: initialData?.isActive ?? true,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof TariffSlabFormData, boolean>>>({});
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open);
    setPrevInitialData(initialData);
    setFormData({
      tariffId: initialData?.tariffId ?? defaultTariffId ?? 0,
      geographyUnitId: initialData?.geographyUnitId ?? null,
      fromUnit: initialData?.fromUnit ?? 0,
      toUnit: initialData?.toUnit ?? 0,
      unitRate: initialData?.unitRate ?? 0,
      fixedCharge: initialData?.fixedCharge ?? 0,
      minimumCharge: initialData?.minimumCharge ?? 0,
      maximumCharge: initialData?.maximumCharge ?? null,
      perConnectionAmount: initialData?.perConnectionAmount ?? null,
      formulaCode: initialData?.formulaCode ?? "UNIT_RATE",
      isActive: initialData?.isActive ?? true,
    });
    setSubmittedOnce(false);
    setTouched({});
  }

  const validate = useCallback((data: TariffSlabFormData) => {
    const errs: Partial<Record<keyof TariffSlabFormData, string>> = {};
    if (data.tariffId <= 0) errs.tariffId = t("errors.tariffNameRequired") || "Tariff Name is required";
    if (data.fromUnit < 0) errs.fromUnit = t("errors.fromUnitInvalid") || "From unit must be >= 0";
    if (data.toUnit <= 0) errs.toUnit = t("errors.toUnitInvalid") || "To unit must be > 0";
    if (data.fromUnit >= data.toUnit) errs.toUnit = t("errors.toUnitGtFromUnit") || "To unit must be greater than from unit";
    if (data.unitRate < 0) errs.unitRate = t("errors.unitRateInvalid") || "Unit rate must be >= 0";
    if (!data.formulaCode) errs.formulaCode = t("errors.formulaCodeRequired") || "Formula code is required";
    return errs;
  }, [t]);

  const errors = validate(formData);
  const showError = (field: keyof TariffSlabFormData) =>
    Boolean((submittedOnce || touched[field]) && errors[field]);
  const visibleTariffOptions = initialData?.tariffId && !tariffOptions.some((option) => option.value === String(initialData.tariffId))
    ? [{ value: String(initialData.tariffId), label: initialData.tariffName }, ...tariffOptions]
    : tariffOptions;
  const visibleGeographyUnitOptions = initialData?.geographyUnitId != null && !geographyUnitOptions.some((option) => option.value === String(initialData.geographyUnitId))
    ? [{ value: String(initialData.geographyUnitId), label: initialData.geographyUnitName }, ...geographyUnitOptions]
    : geographyUnitOptions;

  const handleChange = (field: keyof TariffSlabFormData, value: string | number | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof TariffSlabFormData) => {
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
            {t("table.rateSlabs") || "Tariff Slab"}
          </div>
          <div className="text-xl font-bold text-slate-900">
            {isEdit ? t("editSlabTitle") || "Edit Slab Detail" : t("addSlabTitle") || "Add Slab Detail"}
          </div>
          {initialData?.tariffName && (
            <div className="text-xs text-slate-500 font-normal">{initialData.tariffName}</div>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <CancelButton label={tCommon("buttons.cancel")} onClick={onClose} disabled={isSubmitting} />
          <SaveButton label={t("form.saveRecord") || "Save"} type="submit" form="tariff-slab-form" isLoading={isSubmitting} />
        </div>
      }
    >
      <form id="tariff-slab-form" onSubmit={handleSubmit} className="p-6 bg-white">
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
              label={t("table.tariffName") || "Tariff Name"}
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
              label={t("table.geographyUnit")}
              value={formData.geographyUnitId != null ? String(formData.geographyUnitId) : ""}
              onChange={(e) => handleChange("geographyUnitId", e.target.value ? Number(e.target.value) : null)}
              onBlur={() => handleBlur("geographyUnitId")}
              options={visibleGeographyUnitOptions}
              placeholder={tCommon("select.placeholder") || "-- select --"}
            />
          </div>

          <div className="space-y-1">
            <Input
              required
              type="number"
              label={t("table.fromUnit")}
              placeholder="0"
              value={String(formData.fromUnit)}
              onChange={(e) => handleChange("fromUnit", Number(e.target.value))}
              onBlur={() => handleBlur("fromUnit")}
              className={showError("fromUnit") ? "!border-red-500 focus:!ring-red-500" : ""}
            />
            <ValidationMessage message={errors.fromUnit} visible={showError("fromUnit")} />
          </div>

          <div className="space-y-1">
            <Input
              required
              type="number"
              label={t("table.toUnit")}
              placeholder="99999"
              value={String(formData.toUnit)}
              onChange={(e) => handleChange("toUnit", Number(e.target.value))}
              onBlur={() => handleBlur("toUnit")}
              className={showError("toUnit") ? "!border-red-500 focus:!ring-red-500" : ""}
            />
            <ValidationMessage message={errors.toUnit} visible={showError("toUnit")} />
          </div>

          <div className="space-y-1">
            <Input
              required
              type="number"
              label={t("table.unitRate")}
              placeholder="0"
              value={String(formData.unitRate)}
              onChange={(e) => handleChange("unitRate", Number(e.target.value))}
              onBlur={() => handleBlur("unitRate")}
              className={showError("unitRate") ? "!border-red-500 focus:!ring-red-500" : ""}
            />
            <ValidationMessage message={errors.unitRate} visible={showError("unitRate")} />
          </div>

          <div className="space-y-1">
            <Input
              type="number"
              label={t("table.fixedCharge")}
              placeholder="0"
              value={String(formData.fixedCharge)}
              onChange={(e) => handleChange("fixedCharge", Number(e.target.value))}
              onBlur={() => handleBlur("fixedCharge")}
            />
          </div>

          <div className="space-y-1">
            <Input
              type="number"
              label={t("table.minimumCharge")}
              placeholder="0"
              value={String(formData.minimumCharge)}
              onChange={(e) => handleChange("minimumCharge", Number(e.target.value))}
              onBlur={() => handleBlur("minimumCharge")}
            />
          </div>

          <div className="space-y-1">
            <Input
              type="number"
              label={t("table.maximumCharge")}
              placeholder="—"
              value={formData.maximumCharge != null ? String(formData.maximumCharge) : ""}
              onChange={(e) => handleChange("maximumCharge", e.target.value !== "" ? Number(e.target.value) : null)}
              onBlur={() => handleBlur("maximumCharge")}
            />
          </div>

          <div className="space-y-1">
            <Input
              type="number"
              label={t("table.perConnectionAmount")}
              placeholder="—"
              value={formData.perConnectionAmount != null ? String(formData.perConnectionAmount) : ""}
              onChange={(e) => handleChange("perConnectionAmount", e.target.value !== "" ? Number(e.target.value) : null)}
              onBlur={() => handleBlur("perConnectionAmount")}
            />
          </div>

          <div className="space-y-1">
            <Select
              required
              label={t("table.formulaCode")}
              value={formData.formulaCode}
              onChange={(e) => handleChange("formulaCode", e.target.value)}
              onBlur={() => handleBlur("formulaCode")}
              options={formulaCodeOptions}
              placeholder={tCommon("select.placeholder") || "-- select --"}
              className={showError("formulaCode") ? "!border-red-500 focus:!ring-red-500 [&>button]:!border-red-500 [&>button]:focus:!ring-red-400" : ""}
            />
            <ValidationMessage message={errors.formulaCode} visible={showError("formulaCode")} />
          </div>
        </div>
      </form>
    </Drawer>
  );
}

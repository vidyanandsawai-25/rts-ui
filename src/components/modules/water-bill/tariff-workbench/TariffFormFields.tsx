"use client";

import { WATER_BILL_ENUMS } from "@/constants/waterBill.constants";
import {
  Input,
  Select,
  TextArea,
  ValidationMessage,
  StatusToggleCard,
} from "@/components/common";
import type { CreateTariffWorkbenchDto } from "@/types/waterBill/tariffWorkbench.types";

interface TariffFormFieldsProps {
  formData: CreateTariffWorkbenchDto;
  errors: Partial<Record<keyof CreateTariffWorkbenchDto, string>>;
  showError: (field: keyof CreateTariffWorkbenchDto) => boolean;
  handleChange: (field: keyof CreateTariffWorkbenchDto, value: string | number | boolean | null) => void;
  handleBlur: (field: keyof CreateTariffWorkbenchDto) => void;
  isSubmitting?: boolean;
  financialYearOptions?: { value: string; label: string }[];
  connectionTypeOptions?: { value: string; label: string }[];
  connectionCategoryOptions?: { value: string; label: string }[];
  billingMethodOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
  t: (key: string, values?: Record<string, string | number>) => string;
  tCommon: (key: string) => string;
}

export function TariffFormFields({
  formData,
  errors,
  showError,
  handleChange,
  handleBlur,
  isSubmitting = false,
  financialYearOptions = [],
  connectionTypeOptions,
  connectionCategoryOptions,
  billingMethodOptions,
  statusOptions,
  t,
  tCommon,
}: TariffFormFieldsProps) {
  const defaultBillingMethods = WATER_BILL_ENUMS.BILLING_METHODS.map((method) => ({
    value: method,
    label: method,
  }));

  const defaultStatuses = WATER_BILL_ENUMS.STATUSES.map((status) => ({
    value: status,
    label: status === "Draft" ? (t("form.status.draft") || "Draft") : (t("form.status.published") || "Published"),
  }));

  const selectPlaceholder = tCommon("select.placeholder") || "-- select --";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
      {/* Tariff Code */}
      <div className="space-y-1">
        <Input
          required
          label={t("form.tariffCode.label")}
          placeholder={t("form.tariffCode.placeholder")}
          value={formData.tariffCode}
          onChange={(e) => handleChange("tariffCode", e.target.value)}
          onBlur={() => handleBlur("tariffCode")}
          error={showError("tariffCode") ? errors.tariffCode : undefined}
        />
        <ValidationMessage message={errors.tariffCode} visible={showError("tariffCode")} />
      </div>

      {/* Tariff Name */}
      <div className="space-y-1">
        <Input
          required
          label={t("form.tariffName.label")}
          placeholder={t("form.tariffName.placeholder")}
          value={formData.tariffName}
          onChange={(e) => handleChange("tariffName", e.target.value)}
          onBlur={() => handleBlur("tariffName")}
          error={showError("tariffName") ? errors.tariffName : undefined}
        />
        <ValidationMessage message={errors.tariffName} visible={showError("tariffName")} />
      </div>

      {/* Financial Year */}
      <div className="space-y-1">
        <Select
          label={t("form.financialYear.label")}
          value={formData.financialYearId ? String(formData.financialYearId) : ""}
          onChange={(e) => handleChange("financialYearId", e.target.value ? Number(e.target.value) : 0)}
          onBlur={() => handleBlur("financialYearId")}
          options={financialYearOptions}
          placeholder={selectPlaceholder}
          error={showError("financialYearId") ? errors.financialYearId : undefined}
        />
        <ValidationMessage message={errors.financialYearId} visible={showError("financialYearId")} />
      </div>

      {/* Connection Type */}
      <div className="space-y-1">
        <Select
          label={t("form.connectionType.label")}
          value={formData.connectionTypeId ? String(formData.connectionTypeId) : ""}
          onChange={(e) => handleChange("connectionTypeId", e.target.value ? Number(e.target.value) : null)}
          options={connectionTypeOptions || []}
          placeholder={t("form.connectionType.placeholder") || selectPlaceholder}
        />
      </div>

      {/* Connection Category */}
      <div className="space-y-1">
        <Select
          label={t("form.connectionCategory.label")}
          value={formData.connectionCategoryId ? String(formData.connectionCategoryId) : ""}
          onChange={(e) => handleChange("connectionCategoryId", e.target.value ? Number(e.target.value) : null)}
          options={connectionCategoryOptions || []}
          placeholder={t("form.connectionCategory.placeholder") || selectPlaceholder}
        />
      </div>

      {/* Billing Method */}
      <div className="space-y-1">
        <Select
          label={t("form.billingMethod.label")}
          value={formData.billingMethod || ""}
          onChange={(e) => handleChange("billingMethod", e.target.value)}
          onBlur={() => handleBlur("billingMethod")}
          options={billingMethodOptions && billingMethodOptions.length > 0 ? billingMethodOptions : defaultBillingMethods}
          placeholder={t("form.billingMethod.placeholder") || selectPlaceholder}
          error={showError("billingMethod") ? errors.billingMethod : undefined}
        />
        <ValidationMessage message={errors.billingMethod} visible={showError("billingMethod")} />
      </div>

      {/* Effective From */}
      <div className="space-y-1">
        <Input
          required
          type="date"
          label={t("form.effectiveFrom.label")}
          value={formData.effectiveFrom}
          onChange={(e) => handleChange("effectiveFrom", e.target.value)}
          onBlur={() => handleBlur("effectiveFrom")}
          error={showError("effectiveFrom") ? errors.effectiveFrom : undefined}
        />
        <ValidationMessage message={errors.effectiveFrom} visible={showError("effectiveFrom")} />
      </div>

      {/* Effective To */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("form.effectiveTo.label")}
          value={formData.effectiveTo || ""}
          onChange={(e) => handleChange("effectiveTo", e.target.value)}
          onBlur={() => handleBlur("effectiveTo")}
          error={showError("effectiveTo") ? errors.effectiveTo : undefined}
        />
        <ValidationMessage message={errors.effectiveTo} visible={showError("effectiveTo")} />
      </div>

      {/* Version No */}
      <div className="space-y-1">
        <Input
          type="number"
          label={t("form.versionNo.label")}
          placeholder={t("form.versionNo.placeholder")}
          value={formData.versionNo ?? 1}
          onChange={(e) => handleChange("versionNo", Number(e.target.value))}
        />
      </div>

      {/* Status */}
      <div className="space-y-1">
        <Select
          label={t("form.status.label")}
          value={formData.status || "Draft"}
          onChange={(e) => handleChange("status", e.target.value)}
          options={statusOptions && statusOptions.length > 0 ? statusOptions : defaultStatuses}
          placeholder={t("form.status.placeholder") || selectPlaceholder}
        />
      </div>

      {/* Description */}
      <div className="col-span-1 md:col-span-2 space-y-1">
        <TextArea
          label={t("form.description.label")}
          rows={3}
          value={formData.description || ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={t("form.description.placeholder")}
        />
      </div>

      {/* Active Status Card */}
      <div className="col-span-1 md:col-span-2 pt-1">
        <StatusToggleCard
          isActive={formData.isActive}
          onToggle={(checked) => handleChange("isActive", checked)}
          statusLabel={t("table.isActive")}
          description={formData.isActive ? t("form.activeStatusOn") : t("form.activeStatusOff")}
          activeLabel={tCommon("status.active")}
          inactiveLabel={tCommon("status.inactive")}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}
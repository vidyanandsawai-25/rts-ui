import { useTranslations } from "next-intl";
import {
  Input,
  Select,
  Label,
  ValidationMessage,
  Option,
  FormStatusToggle,
  ToggleSwitch,
} from "@/components/common";
import type { BillingPeriodInput } from "@/types/waterBill/billingPeriodMaster.types";

interface BillingPeriodFormFieldsProps {
  formData: BillingPeriodInput;
  errors: Partial<Record<keyof BillingPeriodInput, string>>;
  showError: (field: keyof BillingPeriodInput) => boolean;
  handleChange: (field: keyof BillingPeriodInput, value: string | number | boolean) => void;
  handleBlur: (field: keyof BillingPeriodInput) => void;
  financialYearOptions: Option[];
  billingFrequencyOptions: Option[];
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function BillingPeriodFormFields({
  formData,
  errors,
  showError,
  handleChange,
  handleBlur,
  financialYearOptions,
  billingFrequencyOptions,
  isSubmitting = false,
  isEdit = false,
}: BillingPeriodFormFieldsProps) {
  const t = useTranslations("billingPeriodMaster");

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Financial Year */}
      <div className="space-y-1">
        <Label required>{t("form.financialYear.label")}</Label>
        <Select
          options={financialYearOptions}
          value={formData.financialYearId ? String(formData.financialYearId) : ""}
          onChange={(e) => handleChange("financialYearId", e.target.value ? Number(e.target.value) : "")}
          onBlur={() => handleBlur("financialYearId")}
          placeholder={t("form.financialYear.placeholder")}
          className={showError("financialYearId") ? "!border-red-500 focus:!ring-red-500" : ""}
        />
        <ValidationMessage message={errors.financialYearId} visible={showError("financialYearId")} />
      </div>

      {/* Billing Frequency */}
      <div className="space-y-1">
        <Label required>{t("form.billingFrequency.label")}</Label>
        <Select
          options={billingFrequencyOptions}
          value={formData.billingFrequencyId ? String(formData.billingFrequencyId) : ""}
          onChange={(e) => handleChange("billingFrequencyId", e.target.value ? Number(e.target.value) : "")}
          onBlur={() => handleBlur("billingFrequencyId")}
          placeholder={t("form.billingFrequency.placeholder")}
          className={showError("billingFrequencyId") ? "!border-red-500 focus:!ring-red-500" : ""}
        />
        <ValidationMessage message={errors.billingFrequencyId} visible={showError("billingFrequencyId")} />
      </div>

      {/* Period From */}
      <div className="space-y-1">
        <Input
          required
          type="date"
          label={t("form.periodFrom.label")}
          value={formData.periodFromDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("periodFromDate", e.target.value)}
          onBlur={() => handleBlur("periodFromDate")}
          className={showError("periodFromDate") ? "!border-red-500 focus:!ring-red-500" : ""}
        />
        <ValidationMessage message={errors.periodFromDate} visible={showError("periodFromDate")} />
      </div>

      {/* Period To */}
      <div className="space-y-1">
        <Input
          required
          type="date"
          label={t("form.periodTo.label")}
          value={formData.periodToDate}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("periodToDate", e.target.value)}
          onBlur={() => handleBlur("periodToDate")}
          className={showError("periodToDate") ? "!border-red-500 focus:!ring-red-500" : ""}
        />
        <ValidationMessage message={errors.periodToDate} visible={showError("periodToDate")} />
      </div>

      {/* Bill Generation Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("form.billGenerationDate.label")}
          value={formData.billGenerationDate ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("billGenerationDate", e.target.value)}
        />
      </div>

      {/* Due Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("form.dueDate.label")}
          value={formData.dueDate ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("dueDate", e.target.value)}
        />
      </div>

      {/* Grace Days */}
      <div className="space-y-1">
        <Input
          type="number"
          min={0}
          label={t("form.graceDays.label")}
          placeholder={t("form.graceDays.placeholder")}
          value={formData.graceDays}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("graceDays", e.target.value === "" ? "" : Number(e.target.value))}
        />
      </div>

      {/* Reading Approval Required */}
      <div className="space-y-1">
        <Label>{t("form.readingApproval.label")}</Label>
        <div className="h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-xs">
          <span className="text-sm font-medium text-slate-800">
            {Boolean(formData.isReadingApprovalRequired) ? t("form.enabled") : t("form.disabled")}
          </span>
          <ToggleSwitch
            checked={Boolean(formData.isReadingApprovalRequired)}
            onChange={(val) => handleChange("isReadingApprovalRequired", val)}
            showPopup={false}
          />
        </div>
      </div>

      {/* Current Penalty Start Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("table.currentPenaltyStartDate")}
          value={formData.currentPenaltyStartDate ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("currentPenaltyStartDate", e.target.value)}
        />
      </div>

      {/* Current Penalty End Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("table.currentPenaltyEndDate")}
          value={formData.currentPenaltyEndDate ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("currentPenaltyEndDate", e.target.value)}
        />
      </div>

      {/* Pending Penalty Start Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("table.pendingPenaltyStartDate")}
          value={formData.pendingPenaltyStartDate ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("pendingPenaltyStartDate", e.target.value)}
        />
      </div>

      {/* Pending Penalty End Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("table.pendingPenaltyEndDate")}
          value={formData.pendingPenaltyEndDate ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("pendingPenaltyEndDate", e.target.value)}
        />
      </div>

      {/* Sequence No */}
      <div className="space-y-1">
        <Input
          type="number"
          min={1}
          label={t("form.sequenceNo.label")}
          placeholder={t("form.sequenceNo.placeholder")}
          value={formData.sequenceNo}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("sequenceNo", e.target.value === "" ? "" : Number(e.target.value))}
          onBlur={() => handleBlur("sequenceNo")}
        />
      </div>

      </div>

      <FormStatusToggle
        isEdit={isEdit}
        isActive={Boolean(formData.isActive)}
        onChange={(val) => handleChange("isActive", val)}
        isSubmitting={isSubmitting}
        statusLabel={t("table.isActive")}
        description={formData.isActive ? t("form.activeStatusOn") : t("form.activeStatusOff")}
      />
    </>
  );
}

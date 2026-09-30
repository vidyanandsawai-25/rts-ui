import { useTranslations } from "next-intl";
import { Input, Select, Label, ValidationMessage } from "@/components/common";
import type {
  BillingPeriodInput,
  BillingPeriodMaster,
  DropdownOption,
} from "@/types/water-bill/billing-configuration/billingPeriodMaster.types";
import {
  useBillingPeriodFormFields,
  MAX_GRACE_DAYS,
} from "@/hooks/water-bill/billing-configuration/billing-period-master/useBillingPeriodFormFields";
import { BillingPeriodPenaltyFields } from "./BillingPeriodPenaltyFields";
import { BillingPeriodStatusBanners } from "./BillingPeriodStatusBanners";

interface BillingPeriodFormFieldsProps {
  formData: BillingPeriodInput;
  errors: Partial<Record<keyof BillingPeriodInput, string>>;
  showError: (field: keyof BillingPeriodInput) => boolean;
  handleChange: (field: keyof BillingPeriodInput, value: string | number | boolean) => void;
  handleUpdate: (updates: Partial<BillingPeriodInput>) => void;
  handleBlur: (field: keyof BillingPeriodInput) => void;
  financialYearOptions: DropdownOption[];
  billingFrequencyOptions: DropdownOption[];
  existingPeriods?: BillingPeriodMaster[];
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function BillingPeriodFormFields({
  formData,
  errors,
  showError,
  handleChange,
  handleUpdate,
  handleBlur,
  financialYearOptions,
  billingFrequencyOptions,
  existingPeriods = [],
  isSubmitting = false,
  isEdit = false,
}: BillingPeriodFormFieldsProps) {
  const t = useTranslations("billingPeriodMaster");

  const {
    handleYearChange,
    handleFrequencyChange,
    handleDueDateChange,
    handleGraceDaysChange,
    handleCurrentPenaltyStartChange,
    handleCurrentPenaltyEndChange,
    handlePendingPenaltyStartChange,
    handlePendingPenaltyEndChange,
    existingCount,
    periodsPerYear,
    isMaxLimitReached,
  } = useBillingPeriodFormFields({
    formData,
    financialYearOptions,
    billingFrequencyOptions,
    existingPeriods,
    isEdit,
    handleChange,
    handleUpdate,
  });

  const err = (field: keyof BillingPeriodInput) =>
    showError(field) ? "!border-red-500 focus:!ring-red-500" : "";

  return (
    <>
      <BillingPeriodStatusBanners
        isEdit={isEdit}
        isActive={Boolean(formData.isActive)}
        isSubmitting={isSubmitting}
        isMaxLimitReached={isMaxLimitReached}
        periodsPerYear={periodsPerYear}
        existingCount={existingCount}
        financialYearId={formData.financialYearId}
        t={t}
        onActiveChange={(val) => handleChange("isActive", val)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Financial Year */}
        <div className="space-y-1">
          <Label required>{t("form.financialYear.label")}</Label>
          <Select
            options={financialYearOptions}
            value={formData.financialYearId ? String(formData.financialYearId) : ""}
            onChange={(e) => handleYearChange(e.target.value)}
            onBlur={() => handleBlur("financialYearId")}
            placeholder={t("form.financialYear.placeholder")}
            className={err("financialYearId")}
          />
          <ValidationMessage
            message={errors.financialYearId}
            visible={showError("financialYearId")}
          />
        </div>

        {/* Billing Frequency */}
        <div className="space-y-1">
          <Label required>{t("form.billingFrequency.label")}</Label>
          <Select
            options={billingFrequencyOptions}
            value={formData.billingFrequencyId ? String(formData.billingFrequencyId) : ""}
            onChange={(e) => handleFrequencyChange(e.target.value)}
            onBlur={() => handleBlur("billingFrequencyId")}
            placeholder={t("form.billingFrequency.placeholder")}
            className={err("billingFrequencyId")}
          />
          <ValidationMessage
            message={errors.billingFrequencyId}
            visible={showError("billingFrequencyId")}
          />
        </div>

        {/* Period From */}
        <div className="space-y-1">
          <Input
            required
            disabled
            type="date"
            label={t("form.periodFrom.label")}
            value={formData.periodFromDate}
            min="1900-01-01"
            max="2099-12-31"
            className={err("periodFromDate")}
          />
          <ValidationMessage
            message={errors.periodFromDate}
            visible={showError("periodFromDate")}
          />
        </div>

        {/* Period To */}
        <div className="space-y-1">
          <Input
            required
            disabled
            type="date"
            label={t("form.periodTo.label")}
            value={formData.periodToDate}
            min={formData.periodFromDate ? String(formData.periodFromDate) : "1900-01-01"}
            max="2099-12-31"
            className={err("periodToDate")}
          />
          <ValidationMessage message={errors.periodToDate} visible={showError("periodToDate")} />
        </div>

        {/* Bill Generation Date */}
        <div className="space-y-1">
          <Input
            type="date"
            label={t("form.billGenerationDate.label")}
            value={formData.billGenerationDate ?? ""}
            min="1900-01-01"
            max="2099-12-31"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("billGenerationDate", e.target.value)
            }
            onBlur={() => handleBlur("billGenerationDate")}
            className={err("billGenerationDate")}
          />
          <ValidationMessage
            message={errors.billGenerationDate}
            visible={showError("billGenerationDate")}
          />
        </div>

        {/* Due Date */}
        <div className="space-y-1">
          <Input
            required
            type="date"
            label={t("form.dueDate.label")}
            value={formData.dueDate ?? ""}
            min="1900-01-01"
            max="2099-12-31"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleDueDateChange(e.target.value)
            }
            onBlur={() => handleBlur("dueDate")}
            className={err("dueDate")}
          />
          <ValidationMessage message={errors.dueDate} visible={showError("dueDate")} />
        </div>

        {/* Grace Days */}
        <div className="space-y-1">
          <Input
            required
            type="number"
            min={0}
            max={MAX_GRACE_DAYS}
            label={t("form.graceDays.label")}
            placeholder={t("form.graceDays.placeholder")}
            value={formData.graceDays}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleGraceDaysChange(e.target.value)
            }
            onBlur={() => handleBlur("graceDays")}
            className={err("graceDays")}
          />
          <ValidationMessage message={errors.graceDays} visible={showError("graceDays")} />
        </div>

        {/* Penalty Dates Subcomponent */}
        <BillingPeriodPenaltyFields
          formData={formData}
          showError={showError}
          errors={errors}
          err={err}
          handleBlur={handleBlur}
          handleChange={handleChange}
          handleCurrentPenaltyStartChange={handleCurrentPenaltyStartChange}
          handleCurrentPenaltyEndChange={handleCurrentPenaltyEndChange}
          handlePendingPenaltyStartChange={handlePendingPenaltyStartChange}
          handlePendingPenaltyEndChange={handlePendingPenaltyEndChange}
        />
      </div>
    </>
  );
}

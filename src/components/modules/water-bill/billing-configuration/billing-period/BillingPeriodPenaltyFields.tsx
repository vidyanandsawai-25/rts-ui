import { useTranslations } from "next-intl";
import { Input, ValidationMessage } from "@/components/common";
import type { BillingPeriodInput } from "@/types/water-bill/billing-configuration/billingPeriodMaster.types";

interface BillingPeriodPenaltyFieldsProps {
  formData: BillingPeriodInput;
  showError: (field: keyof BillingPeriodInput) => boolean;
  errors: Partial<Record<keyof BillingPeriodInput, string>>;
  err: (field: keyof BillingPeriodInput) => string;
  handleBlur: (field: keyof BillingPeriodInput) => void;
  handleChange: (field: keyof BillingPeriodInput, value: string | number | boolean) => void;
  handleCurrentPenaltyStartChange: (val: string) => void;
  handleCurrentPenaltyEndChange: (val: string) => void;
  handlePendingPenaltyStartChange: (val: string) => void;
  handlePendingPenaltyEndChange?: (val: string) => void;
}

export function BillingPeriodPenaltyFields({
  formData,
  showError,
  errors,
  err,
  handleBlur,
  handleChange,
  handleCurrentPenaltyStartChange,
  handleCurrentPenaltyEndChange,
  handlePendingPenaltyStartChange,
  handlePendingPenaltyEndChange,
}: BillingPeriodPenaltyFieldsProps) {
  const t = useTranslations("billingPeriodMaster");

  return (
    <>
      {/* Current Penalty Start Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("table.currentPenaltyStartDate")}
          value={formData.currentPenaltyStartDate ?? ""}
          min="1900-01-01"
          max="2099-12-31"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleCurrentPenaltyStartChange(e.target.value)
          }
          onBlur={() => handleBlur("currentPenaltyStartDate")}
          className={err("currentPenaltyStartDate")}
        />
        <ValidationMessage
          message={errors.currentPenaltyStartDate}
          visible={showError("currentPenaltyStartDate")}
        />
      </div>

      {/* Current Penalty End Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("table.currentPenaltyEndDate")}
          value={formData.currentPenaltyEndDate ?? ""}
          min="1900-01-01"
          max="2099-12-31"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleCurrentPenaltyEndChange(e.target.value)
          }
          onBlur={() => handleBlur("currentPenaltyEndDate")}
          className={err("currentPenaltyEndDate")}
        />
        <ValidationMessage
          message={errors.currentPenaltyEndDate}
          visible={showError("currentPenaltyEndDate")}
        />
      </div>

      {/* Pending Penalty Start Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("table.pendingPenaltyStartDate")}
          value={formData.pendingPenaltyStartDate ?? ""}
          min="1900-01-01"
          max="2099-12-31"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handlePendingPenaltyStartChange(e.target.value)
          }
          onBlur={() => handleBlur("pendingPenaltyStartDate")}
          className={err("pendingPenaltyStartDate")}
        />
        <ValidationMessage
          message={errors.pendingPenaltyStartDate}
          visible={showError("pendingPenaltyStartDate")}
        />
      </div>

      {/* Pending Penalty End Date */}
      <div className="space-y-1">
        <Input
          type="date"
          label={t("table.pendingPenaltyEndDate")}
          value={formData.pendingPenaltyEndDate ?? ""}
          min="1900-01-01"
          max="2099-12-31"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handlePendingPenaltyEndChange
              ? handlePendingPenaltyEndChange(e.target.value)
              : handleChange("pendingPenaltyEndDate", e.target.value)
          }
          onBlur={() => handleBlur("pendingPenaltyEndDate")}
          className={err("pendingPenaltyEndDate")}
        />
        <ValidationMessage
          message={errors.pendingPenaltyEndDate}
          visible={showError("pendingPenaltyEndDate")}
        />
      </div>
    </>
  );
}

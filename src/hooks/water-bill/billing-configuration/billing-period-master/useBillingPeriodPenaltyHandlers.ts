import { useTranslations } from "next-intl";
import { useToast } from "@/components/common";
import type { BillingPeriodInput } from "@/types/water-bill/billing-configuration/billingPeriodMaster.types";
import { addDays } from "../../../../lib/utils/water-bill/billing-configuration/billingPeriodCalculation.utils";

interface UseBillingPeriodPenaltyHandlersParams {
  formData: BillingPeriodInput;
  handleChange: (field: keyof BillingPeriodInput, value: string | number | boolean) => void;
  handleUpdate: (updates: Partial<BillingPeriodInput>) => void;
}

export function useBillingPeriodPenaltyHandlers({
  formData,
  handleChange,
  handleUpdate,
}: UseBillingPeriodPenaltyHandlersParams) {
  const t = useTranslations("billingPeriodMaster");
  const { error } = useToast();

  const handleCurrentPenaltyStartChange = (val: string) => {
    if (val && formData.dueDate && val < formData.dueDate) {
      error(t("validation.currentPenaltyStartAfterDueDate"));
      return;
    }
    handleChange("currentPenaltyStartDate", val);
  };

  const handleCurrentPenaltyEndChange = (val: string) => {
    if (!val) {
      handleUpdate({ currentPenaltyEndDate: "", pendingPenaltyStartDate: "" });
      return;
    }
    const cleanDate = val.split("T")[0];
    if (formData.currentPenaltyStartDate && cleanDate < formData.currentPenaltyStartDate) {
      error(t("validation.currentPenaltyEndAfterStart"));
      return;
    }
    const pendingStart = addDays(cleanDate, 1);
    handleUpdate({
      currentPenaltyEndDate: cleanDate,
      pendingPenaltyStartDate: pendingStart,
    });
  };

  const handlePendingPenaltyStartChange = (val: string) => {
    if (!val) {
      handleChange("pendingPenaltyStartDate", "");
      return;
    }
    const cleanDate = val.split("T")[0];
    if (formData.currentPenaltyEndDate && cleanDate <= formData.currentPenaltyEndDate) {
      error(t("validation.pendingPenaltyStartNotBeforeCurrentPenaltyEnd"));
      return;
    }
    if (formData.pendingPenaltyEndDate && cleanDate > formData.pendingPenaltyEndDate) {
      error(t("validation.pendingPenaltyEndAfterStart"));
    }
    handleChange("pendingPenaltyStartDate", cleanDate);
  };

  const handlePendingPenaltyEndChange = (val: string) => {
    if (!val) {
      handleChange("pendingPenaltyEndDate", "");
      return;
    }
    const cleanDate = val.split("T")[0];
    if (formData.pendingPenaltyStartDate && cleanDate < formData.pendingPenaltyStartDate) {
      error(t("validation.pendingPenaltyEndAfterStart"));
    }
    handleChange("pendingPenaltyEndDate", cleanDate);
  };

  return {
    handleCurrentPenaltyStartChange,
    handleCurrentPenaltyEndChange,
    handlePendingPenaltyStartChange,
    handlePendingPenaltyEndChange,
  };
}

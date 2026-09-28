import type {
  BillingPeriodInput,
  BillingPeriodTranslator,
} from "@/types/water-bill/billing-configuration/billingPeriodMaster.types";
import { diffDays } from "@/lib/utils/water-bill/billing-configuration/billingPeriodCalculation.utils";

export function validateBillingPeriodFormData(
  data: BillingPeriodInput,
  t: BillingPeriodTranslator
): Partial<Record<keyof BillingPeriodInput, string>> {
  const errs: Partial<Record<keyof BillingPeriodInput, string>> = {};

  const fyId = Number(data.financialYearId);
  if (!fyId || isNaN(fyId) || fyId <= 0) {
    errs.financialYearId = t("validation.financialYearRequired");
  }

  const bfId = Number(data.billingFrequencyId);
  if (!bfId || isNaN(bfId) || bfId <= 0) {
    errs.billingFrequencyId = t("validation.billingFrequencyRequired");
  }

  if (!data.periodFromDate) {
    errs.periodFromDate = t("validation.periodFromDateRequired");
  }

  if (!data.periodToDate) {
    errs.periodToDate = t("validation.periodToDateRequired");
  } else if (data.periodFromDate && new Date(data.periodToDate) <= new Date(data.periodFromDate)) {
    errs.periodToDate = t("validation.periodToDateAfterFromDate");
  }

  if (data.periodToDate) {
    const graceDays =
      typeof data.graceDays === "number"
        ? data.graceDays
        : parseInt(String(data.graceDays || "0"), 10);

    if (data.dueDate) {
      if (data.dueDate < data.periodToDate) {
        errs.dueDate = t("validation.dueDateAfterPeriodTo");
      }
      const expectedGraceDays = diffDays(data.periodToDate, data.dueDate);
      if (expectedGraceDays > 31) {
        errs.dueDate = errs.dueDate || t("validation.dueDateMaxOneMonth");
      }
      if (graceDays !== expectedGraceDays && data.dueDate >= data.periodToDate) {
        errs.graceDays = t("validation.graceDaysMismatch");
      }
    }

    if (graceDays < 0) {
      errs.graceDays = errs.graceDays || t("validation.graceDaysPositive");
    } else if (graceDays > 31) {
      errs.graceDays = errs.graceDays || t("validation.graceDaysMax", { count: 31 });
    }
  }

  if (data.billGenerationDate) {
    const genDate = data.billGenerationDate.split("T")[0];
    if (data.periodToDate) {
      const periodTo = data.periodToDate.split("T")[0];
      if (genDate < periodTo) {
        errs.billGenerationDate = t("validation.billGenerationNotBeforePeriodTo");
      }
    }
    if (data.dueDate) {
      const dueDate = data.dueDate.split("T")[0];
      if (genDate > dueDate) {
        errs.billGenerationDate = t("validation.billGenerationNotAfterDueDate");
      }
    }
  }

  if (data.currentPenaltyStartDate && data.dueDate) {
    const penaltyStart = new Date(data.currentPenaltyStartDate);
    const dueDate = new Date(data.dueDate);
    if (!isNaN(penaltyStart.getTime()) && !isNaN(dueDate.getTime()) && penaltyStart < dueDate) {
      errs.currentPenaltyStartDate = t("validation.currentPenaltyStartAfterDueDate");
    }
  }

  if (data.currentPenaltyEndDate && data.currentPenaltyStartDate) {
    const penaltyEnd = new Date(data.currentPenaltyEndDate);
    const penaltyStart = new Date(data.currentPenaltyStartDate);
    if (!isNaN(penaltyEnd.getTime()) && !isNaN(penaltyStart.getTime()) && penaltyEnd < penaltyStart) {
      errs.currentPenaltyEndDate = t("validation.currentPenaltyEndAfterStart");
    }
  }

  if (data.pendingPenaltyStartDate && data.currentPenaltyEndDate) {
    const pendingStart = new Date(data.pendingPenaltyStartDate);
    const currentEnd = new Date(data.currentPenaltyEndDate);
    if (!isNaN(pendingStart.getTime()) && !isNaN(currentEnd.getTime()) && pendingStart < currentEnd) {
      errs.pendingPenaltyStartDate = t("validation.pendingPenaltyStartNotBeforeCurrentPenaltyEnd");
    }
  }

  if (data.pendingPenaltyEndDate && data.pendingPenaltyStartDate) {
    const penaltyEnd = new Date(data.pendingPenaltyEndDate);
    const penaltyStart = new Date(data.pendingPenaltyStartDate);
    if (!isNaN(penaltyEnd.getTime()) && !isNaN(penaltyStart.getTime()) && penaltyEnd < penaltyStart) {
      errs.pendingPenaltyEndDate = t("validation.pendingPenaltyEndAfterStart");
    }
  }
  return errs;
}

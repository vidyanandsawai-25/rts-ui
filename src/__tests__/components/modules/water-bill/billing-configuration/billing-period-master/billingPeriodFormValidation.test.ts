import { describe, it, expect } from "vitest";
import { validateBillingPeriodFormData } from "@/components/modules/water-bill/billing-configuration/billing-period/billingPeriodFormValidation";
import type { BillingPeriodInput } from "@/types/water-bill/billing-configuration/billingPeriodMaster.types";

describe("billingPeriodFormValidation", () => {
  const t = (key: string) => key;

  const validForm: BillingPeriodInput = {
    financialYearId: 1,
    billingFrequencyId: 10,
    periodFromDate: "2026-04-01",
    periodToDate: "2026-04-30",
    dueDate: "2026-04-30",
    graceDays: 0,
    currentPenaltyStartDate: "2026-05-01",
    currentPenaltyEndDate: "2026-05-15",
    pendingPenaltyStartDate: "2026-05-16",
    isActive: true,
  };

  it("passes validation for valid form data", () => {
    const errors = validateBillingPeriodFormData(validForm, t);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("fails if required fields are missing", () => {
    const errors = validateBillingPeriodFormData(
      {
        financialYearId: "",
        billingFrequencyId: "",
        periodFromDate: "",
        periodToDate: "",
        graceDays: 0,
        isActive: true,
      },
      t
    );

    expect(errors.financialYearId).toBe("validation.financialYearRequired");
    expect(errors.billingFrequencyId).toBe("validation.billingFrequencyRequired");
    expect(errors.periodFromDate).toBe("validation.periodFromDateRequired");
    expect(errors.periodToDate).toBe("validation.periodToDateRequired");
    expect(errors.dueDate).toBe("validation.dueDateRequired");
  });

  it("validates Due Date and Grace Days within 31 days", () => {
    const errors = validateBillingPeriodFormData(
      {
        ...validForm,
        periodToDate: "2026-05-31",
        dueDate: "2026-07-16", // 46 days later
        graceDays: 46,
      },
      t
    );

    expect(errors.dueDate).toBe("validation.dueDateMaxOneMonth");
    expect(errors.graceDays).toBe("validation.graceDaysMax");
  });

  it("detects Grace Days mismatch when grace days does not equal date delta", () => {
    const errors = validateBillingPeriodFormData(
      {
        ...validForm,
        periodToDate: "2026-05-31",
        dueDate: "2026-06-10", // 10 days
        graceDays: 5, // mismatch
      },
      t
    );

    expect(errors.graceDays).toBe("validation.graceDaysMismatch");
  });

  it("validates penalty dates sequence", () => {
    const errors = validateBillingPeriodFormData(
      {
        ...validForm,
        dueDate: "2026-05-31",
        currentPenaltyStartDate: "2026-05-20", // Before Due Date
        currentPenaltyEndDate: "2026-05-15", // Before Start Date
        pendingPenaltyStartDate: "2026-05-10", // Before Current End Date
      },
      t
    );

    expect(errors.currentPenaltyStartDate).toBe("validation.currentPenaltyStartAfterDueDate");
    expect(errors.currentPenaltyEndDate).toBe("validation.currentPenaltyEndAfterStart");
    expect(errors.pendingPenaltyStartDate).toBe(
      "validation.pendingPenaltyStartNotBeforeCurrentPenaltyEnd"
    );
  });

  it("shows validation message on currentPenaltyStartDate when currentPenaltyStartDate is changed to be after end date", () => {
    const errors = validateBillingPeriodFormData(
      {
        ...validForm,
        dueDate: "2026-04-30",
        currentPenaltyStartDate: "2026-06-01", // After End Date
        currentPenaltyEndDate: "2026-05-01",
      },
      t,
      "currentPenaltyStartDate"
    );

    expect(errors.currentPenaltyStartDate).toBe("validation.currentPenaltyStartNotAfterEnd");
    expect(errors.currentPenaltyEndDate).toBeUndefined();
  });

  it("shows validation message on currentPenaltyEndDate when currentPenaltyEndDate is changed to be before start date", () => {
    const errors = validateBillingPeriodFormData(
      {
        ...validForm,
        dueDate: "2026-04-30",
        currentPenaltyStartDate: "2026-05-01",
        currentPenaltyEndDate: "2026-04-20", // Before Start Date
      },
      t,
      "currentPenaltyEndDate"
    );

    expect(errors.currentPenaltyEndDate).toBe("validation.currentPenaltyEndAfterStart");
    expect(errors.currentPenaltyStartDate).toBeUndefined();
  });
});

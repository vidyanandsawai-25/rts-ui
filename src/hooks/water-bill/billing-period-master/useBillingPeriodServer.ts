import type {
  CreateBillingPeriodDto,
  UpdateBillingPeriodDto,
  BillingPeriodValidationResult,
  BillingPeriodInput,
  BillingPeriodTranslator,
} from "@/types/waterBill/billingPeriodMaster.types";

export type { BillingPeriodValidationResult, BillingPeriodInput, BillingPeriodTranslator };

const formatDateOrNull = (dateStr?: string | null): string | null => {
  if (!dateStr || !dateStr.trim()) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/**
 * Server-side hook logic for validating Billing Period Master inputs
 */
export function validateBillingPeriodInput(
  input: BillingPeriodInput,
  t: BillingPeriodTranslator
): BillingPeriodValidationResult {
  const errors: Record<string, string[]> = {};

  // 1. Period Code
  if (input.billingPeriodCode && input.billingPeriodCode.trim().length > 30) {
    errors.billingPeriodCode = [t("validation.billingPeriodCodeLength", { count: 30 })];
  }

  // 2. Financial Year
  const fyId = typeof input.financialYearId === "number"
    ? input.financialYearId
    : parseInt(String(input.financialYearId || ""), 10);
  if (isNaN(fyId) || fyId <= 0) {
    errors.financialYearId = [t("validation.financialYearRequired")];
  }

  // 3. Billing Frequency
  const bfId = typeof input.billingFrequencyId === "number"
    ? input.billingFrequencyId
    : parseInt(String(input.billingFrequencyId || ""), 10);
  if (isNaN(bfId) || bfId <= 0) {
    errors.billingFrequencyId = [t("validation.billingFrequencyRequired")];
  }

  // 4. Period From Date
  if (!input.periodFromDate || !input.periodFromDate.trim()) {
    errors.periodFromDate = [t("validation.periodFromDateRequired")];
  } else {
    const from = new Date(input.periodFromDate);
    if (isNaN(from.getTime())) {
      errors.periodFromDate = [t("validation.periodFromDateInvalid")];
    }
  }

  // 5. Period To Date
  if (!input.periodToDate || !input.periodToDate.trim()) {
    errors.periodToDate = [t("validation.periodToDateRequired")];
  } else {
    const to = new Date(input.periodToDate);
    if (isNaN(to.getTime())) {
      errors.periodToDate = [t("validation.periodToDateInvalid")];
    } else if (input.periodFromDate) {
      const from = new Date(input.periodFromDate);
      if (!isNaN(from.getTime()) && to <= from) {
        errors.periodToDate = [t("validation.periodToDateAfterFromDate")];
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Server-side hook logic for mapping and sanitizing Create DTO
 */
export function mapToCreateBillingPeriodDto(input: BillingPeriodInput): CreateBillingPeriodDto {
  const fyId = typeof input.financialYearId === "number"
    ? input.financialYearId
    : parseInt(String(input.financialYearId || "0"), 10);

  const bfId = typeof input.billingFrequencyId === "number"
    ? input.billingFrequencyId
    : parseInt(String(input.billingFrequencyId || "0"), 10);

  const grace = typeof input.graceDays === "number"
    ? input.graceDays
    : parseInt(String(input.graceDays || "0"), 10);

  const seq = typeof input.sequenceNo === "number"
    ? input.sequenceNo
    : parseInt(String(input.sequenceNo || "1"), 10);

  const code = (input.billingPeriodCode || `BP-${fyId}-${bfId}-${seq}`).trim().toUpperCase();

  return {
    billingPeriodCode: code,
    financialYearId: fyId,
    billingFrequencyId: bfId,
    periodFromDate: new Date(input.periodFromDate).toISOString(),
    periodToDate: new Date(input.periodToDate).toISOString(),
    billGenerationDate: formatDateOrNull(input.billGenerationDate),
    dueDate: formatDateOrNull(input.dueDate),
    graceDays: isNaN(grace) ? 0 : grace,
    currentPenaltyStartDate: formatDateOrNull(input.currentPenaltyStartDate),
    currentPenaltyEndDate: formatDateOrNull(input.currentPenaltyEndDate),
    pendingPenaltyStartDate: formatDateOrNull(input.pendingPenaltyStartDate),
    pendingPenaltyEndDate: formatDateOrNull(input.pendingPenaltyEndDate),
    isReadingApprovalRequired: typeof input.isReadingApprovalRequired === "boolean"
      ? input.isReadingApprovalRequired
      : input.isReadingApprovalRequired === "true",
    sequenceNo: isNaN(seq) || seq < 1 ? 1 : seq,
    isActive: typeof input.isActive === "boolean"
      ? input.isActive
      : input.isActive === "true" || input.isActive === undefined,
  };
}

/**
 * Server-side hook logic for mapping and sanitizing Update DTO
 */
export function mapToUpdateBillingPeriodDto(id: number, input: BillingPeriodInput): UpdateBillingPeriodDto {
  const createDto = mapToCreateBillingPeriodDto(input);
  return {
    id,
    ...createDto,
  };
}

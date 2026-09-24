import type {
  CreateBillingFrequencyMasterDto,
  UpdateBillingFrequencyMasterDto,
  BillingFrequencyValidationResult,
  BillingFrequencyInput,
  BillingFrequencyTranslator,
} from "@/types/waterBill/billingFrequencyMaster.types";

export type { BillingFrequencyValidationResult, BillingFrequencyInput, BillingFrequencyTranslator };

/**
 * Server-side hook logic for validating Billing Frequency Master inputs
 */
export function validateBillingFrequencyInput(
  input: BillingFrequencyInput,
  t: BillingFrequencyTranslator
): BillingFrequencyValidationResult {
  const errors: Record<string, string[]> = {};

  // 1. Billing Frequency validation
  if (!input.billingFrequency || !input.billingFrequency.trim()) {
    errors.billingFrequency = [t("validation.billingFrequencyRequired")];
  } else if (input.billingFrequency.trim().length > 100) {
    errors.billingFrequency = [t("validation.billingFrequencyLength", { count: 100 })];
  }

  // 2. Periods Per Year validation
  const periods = typeof input.periodsPerYear === "number"
    ? input.periodsPerYear
    : parseInt(String(input.periodsPerYear || ""), 10);

  if (isNaN(periods) || periods < 1) {
    errors.periodsPerYear = [t("validation.periodsPerYearRequired")];
  }

  // 3. Description validation
  if (input.description && input.description.length > 300) {
    errors.description = [t("validation.descriptionLength", { count: 300 })];
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Server-side hook logic for mapping and sanitizing Create DTO
 */
export function mapToCreateBillingFrequencyDto(input: BillingFrequencyInput): CreateBillingFrequencyMasterDto {
  const autoCode = (input.billingFrequencyCode || input.billingFrequency || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const periods = typeof input.periodsPerYear === "number"
    ? input.periodsPerYear
    : parseInt(String(input.periodsPerYear || "1"), 10);

  return {
    billingFrequencyCode: autoCode,
    billingFrequency: input.billingFrequency.trim(),
    periodsPerYear: isNaN(periods) ? 1 : periods,
    description: input.description?.trim() || undefined,
    isActive: typeof input.isActive === "boolean" ? input.isActive : input.isActive === "true" || input.isActive === undefined,
  };
}

/**
 * Server-side hook logic for mapping and sanitizing Update DTO
 */
export function mapToUpdateBillingFrequencyDto(id: number, input: BillingFrequencyInput): UpdateBillingFrequencyMasterDto {
  const autoCode = (input.billingFrequencyCode || input.billingFrequency || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  const periods = typeof input.periodsPerYear === "number"
    ? input.periodsPerYear
    : parseInt(String(input.periodsPerYear || "1"), 10);

  return {
    id,
    billingFrequencyCode: autoCode,
    billingFrequency: input.billingFrequency.trim(),
    periodsPerYear: isNaN(periods) ? 1 : periods,
    description: input.description?.trim() || undefined,
    isActive: typeof input.isActive === "boolean" ? input.isActive : input.isActive === "true" || input.isActive === undefined,
  };
}

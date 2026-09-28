import type {
  CreateBillingFrequencyMasterDto,
  UpdateBillingFrequencyMasterDto,
  BillingFrequencyValidationResult,
  BillingFrequencyInput,
  BillingFrequencyTranslator,
} from "@/types/water-bill/billing-configuration/billingFrequencyMaster.types";

export type { BillingFrequencyValidationResult, BillingFrequencyInput, BillingFrequencyTranslator };

/**
 * Server-side hook logic for validating Billing Frequency Master inputs
 */
export function validateBillingFrequencyInput(
  input: BillingFrequencyInput,
  t: BillingFrequencyTranslator,
  existingRecords: { id?: number; billingFrequency: string; periodsPerYear: number }[] = []
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
  if (!input.description || !input.description.trim()) {
    errors.description = [t("validation.descriptionRequired")];
  } else if (input.description.length > 300) {
    errors.description = [t("validation.descriptionLength", { count: 300 })];
  }

  // 4. Duplicate validation
  const inputFrequency = (input.billingFrequency || "").trim().toLowerCase();

  const isDuplicateFrequency = existingRecords.some((record) => {
    if (input.id !== undefined && input.id !== null && Number(record.id) === Number(input.id)) return false;
    return record.billingFrequency.trim().toLowerCase() === inputFrequency;
  });

  const isDuplicatePeriods = existingRecords.some((record) => {
    if (input.id !== undefined && input.id !== null && Number(record.id) === Number(input.id)) return false;
    return record.periodsPerYear === periods;
  });

  if (isDuplicateFrequency || isDuplicatePeriods) {
    const commonMsg = t("validation.duplicateEntry");
    errors.duplicate = [commonMsg];
    if (isDuplicateFrequency && !errors.billingFrequency) {
      errors.billingFrequency = [commonMsg];
    }
    if (isDuplicatePeriods && !errors.periodsPerYear) {
      errors.periodsPerYear = [commonMsg];
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
    sequenceNo: input.sequenceNo ? Number(input.sequenceNo) : undefined,
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
    sequenceNo: input.sequenceNo ? Number(input.sequenceNo) : undefined,
    isActive: typeof input.isActive === "boolean" ? input.isActive : input.isActive === "true" || input.isActive === undefined,
  };
}

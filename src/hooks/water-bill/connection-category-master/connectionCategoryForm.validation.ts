import type { ConnectionCategoryFormModel } from "@/types/waterBill/connectionCategoryMaster.types";

export const METERED_BILLING_METHODS = ["Metered", "Slab", "Telescopic", "Hybrid"] as const;
export const NON_METERED_BILLING_METHODS = ["Flat", "Fixed", "Annual"] as const;

export function validateConnectionCategoryForm(
  data: ConnectionCategoryFormModel,
  t: (key: string) => string
): Partial<Record<keyof ConnectionCategoryFormModel, string>> {
  const errs: Partial<Record<keyof ConnectionCategoryFormModel, string>> = {};

  if (!data.connectionCategoryCode?.trim()) {
    errs.connectionCategoryCode = t("validation.connectionCategoryCodeRequired") || "Connection Category Code is required";
  } else if (data.connectionCategoryCode.trim().length > 30) {
    errs.connectionCategoryCode = t("validation.connectionCategoryCodeLength") || "Code cannot exceed 30 characters";
  }

  if (!data.connectionCategory?.trim()) {
    errs.connectionCategory = t("validation.connectionCategoryRequired") || "Connection Category is required";
  } else if (data.connectionCategory.length > 150) {
    errs.connectionCategory = t("validation.connectionCategoryLength") || "Category name cannot exceed 150 characters";
  }

  if (data.billingFrequencyId === null || data.billingFrequencyId === undefined) {
    errs.billingFrequencyId = t("validation.billingFrequencyRequired") || "Please select a billing frequency";
  }

  if (!data.billingMethod?.trim()) {
    errs.billingMethod = t("validation.billingMethodRequired") || "Billing Method is required";
  } else if (data.isMetered && (NON_METERED_BILLING_METHODS as readonly string[]).includes(data.billingMethod)) {
    errs.billingMethod = t("validation.billingMethodInvalid") || "Selected billing method is not valid for metered connections";
  } else if (!data.isMetered && (METERED_BILLING_METHODS as readonly string[]).includes(data.billingMethod)) {
    errs.billingMethod = t("validation.billingMethodInvalid") || "Selected billing method is not valid for non-metered connections";
  }

  if (data.description && data.description.length > 300) {
    errs.description = t("validation.descriptionLength") || "Description cannot exceed 300 characters";
  }

  return errs;
}

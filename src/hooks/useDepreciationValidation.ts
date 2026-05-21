import { useCallback } from "react";

type RangeValidationResult = {
  valid: boolean;
  minError: string | null;
  maxError: string | null;
};

type TranslationFn = (key: string) => string;

type ExistingRange = { min: number; max: number };

export function useDepreciationValidation(t: TranslationFn) {
  /**
   * Returns the first existing range that [newMin, newMax] overlaps with, or null if none.
   * Uses inclusive boundary comparison: ranges sharing an endpoint are considered overlapping.
   * NOTE: Only checks ranges visible on the current page. The server is the
   * authoritative guard for ranges on other pages (returns 409 on conflict).
   */
  const checkOverlap = useCallback(
    (newMin: number, newMax: number, existingRanges: ExistingRange[]): ExistingRange | null => {
      return existingRanges.find((r) => newMin <= r.max && newMax >= r.min) ?? null;
    },
    []
  );

  /**
   * Validate basic rules for min and max values
   */
  const validateBasicRules = useCallback((min: string, max: string) => {
    const errors = { minError: null as string | null, maxError: null as string | null };

    // Required validation
    if (!min) errors.minError = t("errors.minMax");
    if (!max) errors.maxError = t("errors.minMax");
    if (errors.minError || errors.maxError) return errors;

    // Number validation - allow negative for now to catch them in next step
    if (!/^-?\d+$/.test(min)) errors.minError = t("errors.mustBeNumber");
    if (!/^-?\d+$/.test(max)) errors.maxError = t("errors.mustBeNumber");
    if (errors.minError || errors.maxError) return errors;

    const minNum = Number(min);
    const maxNum = Number(max);

    // Negative validation (after ensuring it's a valid number)
    if (minNum < 0) errors.minError = t("errors.cannotBeNegative");
    if (maxNum < 0) errors.maxError = t("errors.cannotBeNegative");
    if (errors.minError || errors.maxError) return errors;

    // Range and limit validation
    if (minNum > 999) errors.minError = t("errors.mustBe999OrLess");
    if (maxNum > 999) errors.maxError = t("errors.mustBe999OrLess");
    if (minNum >= maxNum) errors.maxError = t("errors.invalidRange");

    return errors;
  }, [t]);

  /**
   * Validate min and max values with basic rules (no overlap check)
   */
  const validateMinMax = useCallback(
    (min: string, max: string): RangeValidationResult => {
      const { minError, maxError } = validateBasicRules(min, max);
      const valid = !minError && !maxError;
      
      return { valid, minError, maxError };
    },
    [validateBasicRules]
  );

  /**
   * Sanitize input value - allow only digits up to 3 characters.
   * Numeric range validation is enforced separately by `validateBasicRules` (0-999).
   */
  const sanitizeInput = useCallback((value: string): string => {
    return value.replaceAll(/\D/g, "").slice(0, 3);
  }, []);

  return {
    validateMinMax,
    sanitizeInput,
    checkOverlap,
  };
}

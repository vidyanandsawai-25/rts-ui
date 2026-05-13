import { useCallback } from "react";

type RangeValidationResult = {
  valid: boolean;
  minError: string | null;
  maxError: string | null;
};

type TranslationFn = (key: string) => string;

/**
 * Custom hook for depreciation range validation
 * Note: Overlap validation is handled server-side only
 */
export function useDepreciationValidation(t: TranslationFn) {
  /**
   * NOTE: Overlap validation is handled server-side only.
   * Client-side validation was removed because it only checks the current
   * paginated page and can miss overlaps with ranges on other pages.
   * The server has full visibility and will reject overlapping ranges.
   */
  const checkOverlap = useCallback((): boolean => {
    // Always return false - defer to server-side validation
    return false;
  }, []);

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
    if (minNum > 9999) errors.minError = t("errors.mustBe9999OrLess");
    if (maxNum > 9999) errors.maxError = t("errors.mustBe9999OrLess");
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
   * Sanitize input value - allow only digits up to 3 characters (max value 999)
   */
  const sanitizeInput = useCallback((value: string): string => {
    return value.replaceAll(/\D/g, "").slice(0, 4);
  }, []);

  return {
    validateMinMax,
    sanitizeInput,
    checkOverlap,
  };
}

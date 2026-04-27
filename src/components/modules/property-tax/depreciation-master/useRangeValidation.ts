import { useCallback } from "react";

type RangeRow = {
  id: string;
  min: number;
  max: number;
  label: string;
};

type RangeValidationResult = {
  valid: boolean;
  minError: string | null;
  maxError: string | null;
};

type TranslationFn = (key: string) => string;

/**
 * Custom hook for range validation including overlap detection
 */
export function useRangeValidation(t: TranslationFn, existingRanges: RangeRow[]) {
  /**
   * Check if a new range overlaps with any existing range
   */
  const checkOverlap = useCallback(
    (min: number, max: number): boolean => {
      return existingRanges.some((range) => {
        // Check if the new range overlaps with existing range
        // Overlap occurs if: newMin <= existingMax AND newMax >= existingMin
        return min <= range.max && max >= range.min;
      });
    },
    [existingRanges]
  );

  /**
   * Validate min and max values with all rules including overlap check
   */
  const validateMinMax = useCallback(
    (min: string, max: string): RangeValidationResult => {
      let valid = true;
      let minError: string | null = null;
      let maxError: string | null = null;

      // Required
      if (!min) {
        minError = t("errors.minMax");
        valid = false;
      }
      if (!max) {
        maxError = t("errors.minMax");
        valid = false;
      }

      // Must be number
      if (min && !/^\d+$/.test(min)) {
        minError = t("errors.mustBeNumber") || "Must be a valid number";
        valid = false;
      }
      if (max && !/^\d+$/.test(max)) {
        maxError = t("errors.mustBeNumber") || "Must be a valid number";
        valid = false;
      }

      // No negative
      if (min && Number(min) < 0) {
        minError = "Cannot be negative";
        valid = false;
      }
      if (max && Number(max) < 0) {
        maxError = "Cannot be negative";
        valid = false;
      }

      // Max limit (9999)
      if (min && Number(min) > 9999) {
        minError = "Must be 9999 or less";
        valid = false;
      }
      if (max && Number(max) > 9999) {
        maxError = "Must be 9999 or less";
        valid = false;
      }

      // Min < Max
      if (min && max && Number(min) >= Number(max)) {
        maxError = t("errors.invalidRange");
        valid = false;
      }

      // Overlap check - only if basic validation passed
      if (valid && min && max) {
        const hasOverlap = checkOverlap(Number(min), Number(max));
        if (hasOverlap) {
          minError = t("errors.overlap") || "Range overlaps with existing range";
          valid = false;
        }
      }

      return { valid, minError, maxError };
    },
    [t, checkOverlap]
  );

  /**
   * Sanitize input value - allow only digits up to 4 characters
   */
  const sanitizeInput = useCallback((value: string): string => {
    // Remove non-digits and limit to 4 characters
    return value.replace(/\D/g, "").slice(0, 4);
  }, []);

  return {
    validateMinMax,
    sanitizeInput,
    checkOverlap,
  };
}

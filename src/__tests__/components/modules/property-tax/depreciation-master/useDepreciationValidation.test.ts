import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useDepreciationValidation } from "@/hooks/useDepreciationValidation";

// Mock translation function
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    "errors.minMax": "Please enter both min and max",
    "errors.mustBeNumber": "Must be a valid number",
    "errors.invalidRange": "Min must be less than max",
    "errors.cannotBeNegative": "Cannot be negative",
    "errors.mustBe100OrLess": "Must be 100 or less",
    "errors.mustBe99OrLess": "Must be 99 or less",
  };
  return translations[key] || key;
});

describe("useDepreciationValidation", () => {
  beforeEach(() => {
    mockT.mockClear();
  });

  describe("validateMinMax - Client-side validation only", () => {
    it("should return valid for a correct range", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("11", "19");

      expect(validation.valid).toBe(true);
      expect(validation.minError).toBeNull();
      expect(validation.maxError).toBeNull();
    });

    it("should return error when min is empty", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("", "10");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Please enter both min and max");
    });

    it("should return error when max is empty", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("5", "");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Please enter both min and max");
    });

    it("should return error when both min and max are empty", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("", "");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Please enter both min and max");
      expect(validation.maxError).toBe("Please enter both min and max");
    });

    it("should return error when min is not a number", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("abc", "10");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Must be a valid number");
    });

    it("should return error when max is not a number", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("5", "xyz");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Must be a valid number");
    });

    it("should return error when min is negative", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("-5", "10");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Cannot be negative");
    });

    it("should return error when max is negative", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("5", "-10");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Cannot be negative");
    });

    it("should return error when min is greater than max", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("20", "10");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Min must be less than max");
    });

    it("should return error when min equals max", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("10", "10");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Min must be less than max");
    });

    it("should return error when min exceeds 100", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("101", "150");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Must be 100 or less");
    });

    it("should return error when max exceeds 100", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("10", "101");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Must be 100 or less");
    });

    it("should accept max value of exactly 100", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("0", "100");

      expect(validation.valid).toBe(true);
      expect(validation.maxError).toBeNull();
    });

    it("should accept valid range within 0–100", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("0", "50");

      expect(validation.valid).toBe(true);
      expect(validation.minError).toBeNull();
      expect(validation.maxError).toBeNull();
    });

    it("should accept valid range that would overlap (since overlap validation is server-side)", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      const validation = result.current.validateMinMax("5", "10");

      expect(validation.valid).toBe(true);
      expect(validation.minError).toBeNull();
      expect(validation.maxError).toBeNull();
    });
  });

  describe("checkOverlap - Always returns false (server-side validation)", () => {
    it("should always return false since overlap validation is server-side", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));
      expect(result.current.checkOverlap()).toBe(false);
    });
  });

  describe("sanitizeInput", () => {
    it("should remove non-digit characters and limit to 3 chars", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));

      expect(result.current.sanitizeInput("abc123")).toBe("123");
      expect(result.current.sanitizeInput("12.34")).toBe("123");
      expect(result.current.sanitizeInput("-50")).toBe("50");
      expect(result.current.sanitizeInput("1a2b3c")).toBe("123");
    });

    it("should limit input to 3 characters", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));

      expect(result.current.sanitizeInput("1234")).toBe("123");
      expect(result.current.sanitizeInput("123456789")).toBe("123");
    });

    it("should return empty string for non-numeric input", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));

      expect(result.current.sanitizeInput("abc")).toBe("");
      expect(result.current.sanitizeInput("!@#$")).toBe("");
    });

    it("should handle empty input", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));

      expect(result.current.sanitizeInput("")).toBe("");
    });

    it("should preserve valid numeric input up to 3 digits", () => {
      const { result } = renderHook(() => useDepreciationValidation(mockT));

      expect(result.current.sanitizeInput("999")).toBe("999");
      expect(result.current.sanitizeInput("0")).toBe("0");
      expect(result.current.sanitizeInput("100")).toBe("100");
    });
  });
});

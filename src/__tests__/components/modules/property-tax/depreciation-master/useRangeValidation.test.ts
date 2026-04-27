import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useRangeValidation } from "@/components/modules/property-tax/depreciation-master/useRangeValidation";

// Mock translation function
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    "errors.minMax": "Please enter both min and max",
    "errors.mustBeNumber": "Must be a valid number",
    "errors.invalidRange": "Min must be less than max",
    "errors.overlap": "Range overlaps with existing range",
  };
  return translations[key] || key;
});

describe("useRangeValidation", () => {
  const existingRanges = [
    { id: "5-10", min: 5, max: 10, label: "5-10" },
    { id: "20-30", min: 20, max: 30, label: "20-30" },
    { id: "50-60", min: 50, max: 60, label: "50-60" },
  ];

  beforeEach(() => {
    mockT.mockClear();
  });

  describe("validateMinMax", () => {
    it("should return valid for a correct non-overlapping range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("11", "19");

      expect(validation.valid).toBe(true);
      expect(validation.minError).toBeNull();
      expect(validation.maxError).toBeNull();
    });

    it("should return error when min is empty", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("", "10");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Please enter both min and max");
    });

    it("should return error when max is empty", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("5", "");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Please enter both min and max");
    });

    it("should return error when both min and max are empty", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("", "");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Please enter both min and max");
      expect(validation.maxError).toBe("Please enter both min and max");
    });

    it("should return error when min is not a number", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("abc", "10");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Must be a valid number");
    });

    it("should return error when max is not a number", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("5", "xyz");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Must be a valid number");
    });

    it("should return error when min is greater than max", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("20", "10");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Min must be less than max");
    });

    it("should return error when min equals max", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("10", "10");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Min must be less than max");
    });

    it("should return error when min exceeds 9999", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("10000", "20000");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Must be 9999 or less");
    });

    it("should return error when max exceeds 9999", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("100", "10000");

      expect(validation.valid).toBe(false);
      expect(validation.maxError).toBe("Must be 9999 or less");
    });
  });

  describe("checkOverlap", () => {
    it("should detect overlap when new range is completely inside existing range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("6", "9");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Range overlaps with existing range");
    });

    it("should detect overlap when new range starts inside existing range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("8", "15");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Range overlaps with existing range");
    });

    it("should detect overlap when new range ends inside existing range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("1", "7");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Range overlaps with existing range");
    });

    it("should detect overlap when new range completely contains existing range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("1", "15");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Range overlaps with existing range");
    });

    it("should detect overlap when new range exactly matches existing range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("5", "10");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Range overlaps with existing range");
    });

    it("should NOT detect overlap when new range is completely before existing range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("1", "4");

      expect(validation.valid).toBe(true);
    });

    it("should NOT detect overlap when new range is completely after existing range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("61", "70");

      expect(validation.valid).toBe(true);
    });

    it("should NOT detect overlap when new range is between existing ranges", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      const validation = result.current.validateMinMax("11", "19");

      expect(validation.valid).toBe(true);
    });

    it("should detect overlap when new range touches boundary of existing range", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, existingRanges));
      // Range 5-10 exists, testing 10-15 which touches at 10
      const validation = result.current.validateMinMax("10", "15");

      expect(validation.valid).toBe(false);
      expect(validation.minError).toBe("Range overlaps with existing range");
    });
  });

  describe("sanitizeInput", () => {
    it("should remove non-digit characters", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, []));
      
      expect(result.current.sanitizeInput("abc123")).toBe("123");
      expect(result.current.sanitizeInput("12.34")).toBe("1234");
      expect(result.current.sanitizeInput("-50")).toBe("50");
      expect(result.current.sanitizeInput("1a2b3c")).toBe("123");
    });

    it("should limit input to 4 characters", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, []));
      
      expect(result.current.sanitizeInput("12345")).toBe("1234");
      expect(result.current.sanitizeInput("123456789")).toBe("1234");
    });

    it("should return empty string for non-numeric input", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, []));
      
      expect(result.current.sanitizeInput("abc")).toBe("");
      expect(result.current.sanitizeInput("!@#$")).toBe("");
    });

    it("should handle empty input", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, []));
      
      expect(result.current.sanitizeInput("")).toBe("");
    });

    it("should preserve valid numeric input", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, []));
      
      expect(result.current.sanitizeInput("1234")).toBe("1234");
      expect(result.current.sanitizeInput("0")).toBe("0");
      expect(result.current.sanitizeInput("99")).toBe("99");
    });
  });

  describe("with empty existing ranges", () => {
    it("should allow any valid range when no existing ranges", () => {
      const { result } = renderHook(() => useRangeValidation(mockT, []));
      
      const validation1 = result.current.validateMinMax("0", "100");
      expect(validation1.valid).toBe(true);

      const validation2 = result.current.validateMinMax("500", "1000");
      expect(validation2.valid).toBe(true);
    });
  });
});

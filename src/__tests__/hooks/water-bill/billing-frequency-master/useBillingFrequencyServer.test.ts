import { describe, it, expect } from "vitest";
import {
  validateBillingFrequencyInput,
  mapToCreateBillingFrequencyDto,
  mapToUpdateBillingFrequencyDto,
} from "@/hooks/water-bill/billing-frequency-master/useBillingFrequencyServer";
import type { BillingFrequencyInput } from "@/types/waterBill/billingFrequencyMaster.types";

describe("useBillingFrequencyServer - Unit Tests", () => {
  const mockT = (key: string, values?: Record<string, string | number | Date>) => {
    if (values && "count" in values) {
      return `${key}_${values.count}`;
    }
    return key;
  };

  describe("validateBillingFrequencyInput", () => {
    it("should return valid result for correct input", () => {
      const input: BillingFrequencyInput = {
        billingFrequencyCode: "MONTHLY",
        billingFrequency: "Monthly",
        periodsPerYear: 12,
        description: "Monthly billing frequency",
        isActive: true,
      };

      const result = validateBillingFrequencyInput(input, mockT);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should fail validation when billingFrequency is missing or empty", () => {
      const input: BillingFrequencyInput = {
        billingFrequencyCode: "MONTHLY",
        billingFrequency: "   ",
        periodsPerYear: 12,
      };

      const result = validateBillingFrequencyInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.billingFrequency).toContain("validation.billingFrequencyRequired");
    });

    it("should fail validation when periodsPerYear is invalid or missing", () => {
      const input: BillingFrequencyInput = {
        billingFrequencyCode: "MONTHLY",
        billingFrequency: "Monthly",
        periodsPerYear: 0,
      };

      const result = validateBillingFrequencyInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.periodsPerYear).toContain("validation.periodsPerYearRequired");
    });
  });

  describe("mapToCreateBillingFrequencyDto", () => {
    it("should correctly map, sanitize, and auto-generate uppercase no-space code from billingFrequency", () => {
      const input: BillingFrequencyInput = {
        billingFrequencyCode: "",
        billingFrequency: "  Monthly bf  ",
        periodsPerYear: 12,
        isActive: "true",
      };

      const dto = mapToCreateBillingFrequencyDto(input);
      expect(dto.billingFrequencyCode).toBe("MONTHLYBF");
      expect(dto.billingFrequency).toBe("Monthly bf");
      expect(dto.periodsPerYear).toBe(12);
      expect(dto.isActive).toBe(true);
    });
  });

  describe("mapToUpdateBillingFrequencyDto", () => {
    it("should correctly map, sanitize, and auto-generate uppercase no-space code with ID", () => {
      const input: BillingFrequencyInput = {
        id: 5,
        billingFrequencyCode: "",
        billingFrequency: "  Monthly bf  ",
        periodsPerYear: 12,
        isActive: true,
      };

      const dto = mapToUpdateBillingFrequencyDto(5, input);
      expect(dto.id).toBe(5);
      expect(dto.billingFrequencyCode).toBe("MONTHLYBF");
      expect(dto.billingFrequency).toBe("Monthly bf");
      expect(dto.periodsPerYear).toBe(12);
      expect(dto.isActive).toBe(true);
    });
  });
});

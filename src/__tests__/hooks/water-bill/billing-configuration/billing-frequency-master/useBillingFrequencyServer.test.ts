import { describe, it, expect } from "vitest";
import {
  validateBillingFrequencyInput,
  mapToCreateBillingFrequencyDto,
  mapToUpdateBillingFrequencyDto,
} from "@/hooks/water-bill/billing-configuration/billing-frequency-master/useBillingFrequencyServer";
import type { BillingFrequencyInput } from "@/types/water-bill/billing-configuration/billingFrequencyMaster.types";

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
        description: "Valid description",
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
        description: "Valid description",
      };

      const result = validateBillingFrequencyInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.periodsPerYear).toContain("validation.periodsPerYearRequired");
    });

    it("should fail validation when description is missing or empty", () => {
      const input: BillingFrequencyInput = {
        billingFrequencyCode: "MONTHLY",
        billingFrequency: "Monthly",
        periodsPerYear: 12,
        description: "   ",
      };

      const result = validateBillingFrequencyInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.description).toContain("validation.descriptionRequired");
    });

    it("should detect duplicate billing frequency name or periodsPerYear", () => {
      const existing = [
        { id: 1, billingFrequency: "Monthly", periodsPerYear: 12 },
        { id: 2, billingFrequency: "Quarterly", periodsPerYear: 4 },
      ];

      // Duplicate periodsPerYear
      const input1: BillingFrequencyInput = {
        billingFrequencyCode: "CUSTOM",
        billingFrequency: "Custom",
        periodsPerYear: 12,
        description: "Valid description",
      };
      const result1 = validateBillingFrequencyInput(input1, mockT, existing);
      expect(result1.isValid).toBe(false);
      expect(result1.errors.periodsPerYear).toContain("validation.duplicateEntry");
      expect(result1.errors.duplicate).toContain("validation.duplicateEntry");

      // Duplicate frequency name
      const input2: BillingFrequencyInput = {
        billingFrequencyCode: "MONTHLY",
        billingFrequency: "Monthly",
        periodsPerYear: 6,
        description: "Valid description",
      };
      const result2 = validateBillingFrequencyInput(input2, mockT, existing);
      expect(result2.isValid).toBe(false);
      expect(result2.errors.billingFrequency).toContain("validation.duplicateEntry");
      expect(result2.errors.duplicate).toContain("validation.duplicateEntry");

      // Updating existing record #1 (Monthly, 12) with its own values should be valid
      const input3: BillingFrequencyInput = {
        id: 1,
        billingFrequencyCode: "MONTHLY",
        billingFrequency: "Monthly",
        periodsPerYear: 12,
        description: "Updated description",
      };
      const result3 = validateBillingFrequencyInput(input3, mockT, existing);
      expect(result3.isValid).toBe(true);
      expect(result3.errors).toEqual({});
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

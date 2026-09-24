import { describe, it, expect } from "vitest";
import {
  validateBillingPeriodInput,
  mapToCreateBillingPeriodDto,
  mapToUpdateBillingPeriodDto,
} from "@/hooks/water-bill/billing-period-master/useBillingPeriodServer";
import type { BillingPeriodInput } from "@/types/waterBill/billingPeriodMaster.types";

describe("useBillingPeriodServer - Unit Tests", () => {
  const mockT = (key: string, values?: Record<string, string | number | Date>) => {
    if (values && "count" in values) {
      return `${key}_${values.count}`;
    }
    return key;
  };

  describe("validateBillingPeriodInput", () => {
    it("should return valid result for correct input", () => {
      const input: BillingPeriodInput = {
        billingPeriodCode: "BP-1-1-1",
        financialYearId: 1,
        billingFrequencyId: 1,
        periodFromDate: "2026-04-01",
        periodToDate: "2026-04-30",
        sequenceNo: 1,
        isActive: true,
      };

      const result = validateBillingPeriodInput(input, mockT);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should fail validation when financialYearId is missing or invalid", () => {
      const input: BillingPeriodInput = {
        financialYearId: 0,
        billingFrequencyId: 1,
        periodFromDate: "2026-04-01",
        periodToDate: "2026-04-30",
      };

      const result = validateBillingPeriodInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.financialYearId).toContain("validation.financialYearRequired");
    });

    it("should fail validation when billingFrequencyId is missing or invalid", () => {
      const input: BillingPeriodInput = {
        financialYearId: 1,
        billingFrequencyId: 0,
        periodFromDate: "2026-04-01",
        periodToDate: "2026-04-30",
      };

      const result = validateBillingPeriodInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.billingFrequencyId).toContain("validation.billingFrequencyRequired");
    });

    it("should fail validation when periodFromDate is missing or invalid", () => {
      const input: BillingPeriodInput = {
        financialYearId: 1,
        billingFrequencyId: 1,
        periodFromDate: "invalid-date",
        periodToDate: "2026-04-30",
      };

      const result = validateBillingPeriodInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.periodFromDate).toContain("validation.periodFromDateInvalid");
    });

    it("should fail validation when periodToDate is missing or invalid", () => {
      const input: BillingPeriodInput = {
        financialYearId: 1,
        billingFrequencyId: 1,
        periodFromDate: "2026-04-01",
        periodToDate: "invalid-date",
      };

      const result = validateBillingPeriodInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.periodToDate).toContain("validation.periodToDateInvalid");
    });

    it("should fail validation when periodToDate is before periodFromDate", () => {
      const input: BillingPeriodInput = {
        financialYearId: 1,
        billingFrequencyId: 1,
        periodFromDate: "2026-05-01",
        periodToDate: "2026-04-30",
      };

      const result = validateBillingPeriodInput(input, mockT);
      expect(result.isValid).toBe(false);
      expect(result.errors.periodToDate).toContain("validation.periodToDateAfterFromDate");
    });
  });

  describe("mapToCreateBillingPeriodDto", () => {
    it("should correctly map, sanitize, and auto-generate code from IDs and SequenceNo", () => {
      const input: BillingPeriodInput = {
        billingPeriodCode: "",
        financialYearId: 2,
        billingFrequencyId: 3,
        sequenceNo: 4,
        periodFromDate: "2026-04-01",
        periodToDate: "2026-04-30",
        isActive: "true",
      };

      const dto = mapToCreateBillingPeriodDto(input);
      expect(dto.billingPeriodCode).toBe("BP-2-3-4");
      expect(dto.financialYearId).toBe(2);
      expect(dto.billingFrequencyId).toBe(3);
      expect(dto.sequenceNo).toBe(4);
      expect(dto.periodFromDate).toBe(new Date("2026-04-01").toISOString());
      expect(dto.periodToDate).toBe(new Date("2026-04-30").toISOString());
      expect(dto.isActive).toBe(true);
    });

    it("should handle existing billing period code if provided", () => {
      const input: BillingPeriodInput = {
        billingPeriodCode: "EXISTING-CODE",
        financialYearId: 1,
        billingFrequencyId: 1,
        periodFromDate: "2026-04-01",
        periodToDate: "2026-04-30",
      };

      const dto = mapToCreateBillingPeriodDto(input);
      expect(dto.billingPeriodCode).toBe("EXISTING-CODE");
    });
  });

  describe("mapToUpdateBillingPeriodDto", () => {
    it("should correctly map and include ID", () => {
      const input: BillingPeriodInput = {
        id: 10,
        billingPeriodCode: "BP-UPDATE",
        financialYearId: 1,
        billingFrequencyId: 1,
        periodFromDate: "2026-04-01",
        periodToDate: "2026-04-30",
        isActive: true,
      };

      const dto = mapToUpdateBillingPeriodDto(10, input);
      expect(dto.id).toBe(10);
      expect(dto.billingPeriodCode).toBe("BP-UPDATE");
      expect(dto.isActive).toBe(true);
    });
  });
});

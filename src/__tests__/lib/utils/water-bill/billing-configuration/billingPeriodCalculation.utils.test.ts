import { describe, it, expect } from "vitest";
import {
  parseDateComponents,
  addDays,
  diffDays,
  getFrequencyPeriodsPerYear,
  calculatePeriodToDate,
  calculateNextPeriodFromDate,
} from "@/lib/utils/water-bill/billing-configuration/billingPeriodCalculation.utils";
import type { BillingPeriodMaster, DropdownOption } from "@/types/water-bill/billing-configuration/billingPeriodMaster.types";

describe("billingPeriodCalculation.utils", () => {
  describe("parseDateComponents", () => {
    it("parses YYYY-MM-DD format correctly", () => {
      expect(parseDateComponents("2026-04-01")).toEqual({ y: 2026, m: 4, d: 1 });
      expect(parseDateComponents("2026-12-31")).toEqual({ y: 2026, m: 12, d: 31 });
    });

    it("parses MM/DD/YYYY format correctly", () => {
      expect(parseDateComponents("04/01/2026")).toEqual({ y: 2026, m: 4, d: 1 });
      expect(parseDateComponents("12/31/2026")).toEqual({ y: 2026, m: 12, d: 31 });
    });

    it("parses ISO date strings correctly", () => {
      expect(parseDateComponents("2026-05-01T00:00:00.000Z")).toEqual({ y: 2026, m: 5, d: 1 });
    });

    it("returns null for invalid or empty inputs", () => {
      expect(parseDateComponents("")).toBeNull();
      expect(parseDateComponents(null)).toBeNull();
      expect(parseDateComponents("invalid-date")).toBeNull();
    });
  });

  describe("addDays", () => {
    it("adds calendar days across month boundaries", () => {
      expect(addDays("2026-04-30", 1)).toBe("2026-05-01");
      expect(addDays("2026-05-31", 1)).toBe("2026-06-01");
      expect(addDays("2026-05-31", 31)).toBe("2026-07-01");
      expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    });

    it("returns empty string on empty input", () => {
      expect(addDays("", 1)).toBe("");
    });
  });

  describe("diffDays", () => {
    it("returns 0 when dates are the same", () => {
      expect(diffDays("2026-05-31", "2026-05-31")).toBe(0);
    });

    it("calculates exact calendar days between two dates", () => {
      expect(diffDays("2026-05-31", "2026-06-30")).toBe(30);
      expect(diffDays("2026-05-31", "2026-07-01")).toBe(31);
      expect(diffDays("2026-04-01", "2026-04-30")).toBe(29);
    });

    it("returns 0 if end is before start", () => {
      expect(diffDays("2026-06-01", "2026-05-01")).toBe(0);
    });
  });

  describe("getFrequencyPeriodsPerYear", () => {
    it("extracts periodsPerYear from DropdownOption data", () => {
      const option: DropdownOption = {
        value: "1",
        label: "Monthly",
        data: { periodsPerYear: 12 },
      };
      expect(getFrequencyPeriodsPerYear(option)).toBe(12);
    });

    it("returns 0 for missing or invalid data", () => {
      expect(getFrequencyPeriodsPerYear(undefined)).toBe(0);
      expect(getFrequencyPeriodsPerYear({ value: "1", label: "Custom" })).toBe(0);
    });
  });

  describe("calculatePeriodToDate", () => {
    it("calculates monthly period to date (1 month offset)", () => {
      expect(calculatePeriodToDate("2026-04-01", 12)).toBe("2026-04-30");
      expect(calculatePeriodToDate("2026-05-01", 12)).toBe("2026-05-31");
      expect(calculatePeriodToDate("2026-06-01", 12)).toBe("2026-06-30");
    });

    it("calculates quarterly period to date (3 months offset)", () => {
      expect(calculatePeriodToDate("2026-04-01", 4)).toBe("2026-06-30");
      expect(calculatePeriodToDate("2026-07-01", 4)).toBe("2026-09-30");
    });

    it("calculates half-yearly period to date (6 months offset)", () => {
      expect(calculatePeriodToDate("2026-04-01", 2)).toBe("2026-09-30");
    });

    it("calculates yearly period to date (12 months offset)", () => {
      expect(calculatePeriodToDate("2026-04-01", 1)).toBe("2027-03-31");
    });
  });

  describe("calculateNextPeriodFromDate", () => {
    const existingMonthly: BillingPeriodMaster[] = [
      {
        id: 1,
        billingPeriodCode: "2026-M1",
        financialYearId: 1,
        billingFrequencyId: 10,
        periodFromDate: "2026-04-01",
        periodToDate: "2026-04-30",
        graceDays: 0,
        isActive: true,
      },
    ];

    it("returns yearStartDate when no matching existing periods exist", () => {
      expect(calculateNextPeriodFromDate("2026-04-01", [], 1, 10)).toBe("2026-04-01");
      expect(calculateNextPeriodFromDate("2026-04-01", existingMonthly, 1, 20)).toBe("2026-04-01");
    });

    it("returns next day after latest existing period to date", () => {
      expect(calculateNextPeriodFromDate("2026-04-01", existingMonthly, 1, 10)).toBe("2026-05-01");
    });
  });
});

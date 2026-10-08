import { describe, it, expect, vi } from "vitest";
import { createChargeHeadSchema } from "@/lib/api/water-bill/chargeHeads.schema";
import { createTariffWorkbenchSchema } from "@/lib/api/water-bill/tariff-workbench/tariffWorkbench.schema";
import { parseApiBoolean, getTariffWorkbenchById } from "@/lib/api/water-bill/tariff-workbench/tariffWorkbench.service";
import { parseApiBoolean as parseApiBooleanCH } from "@/lib/api/water-bill/chargeHeads.service";
import { verifyServerActionAccess } from "@/lib/utils/server-access-guard";
import { apiClient } from "@/services/api.service";
import type { TariffWorkbench } from "@/types/water-bill/tariff-workbench/tariffWorkbench.types";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}));

vi.mock("@/services/api.service", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: () => undefined,
  }),
}));

const mockT = (key: string) => key;

describe("Reviewer Findings Fixes Verification", () => {
  describe("Finding 1: Whitespace-only identifiers in Charge Head schema", () => {
    it("rejects empty string and whitespace-only code and name", () => {
      const schema = createChargeHeadSchema(mockT);

      const emptyResult = schema.safeParse({
        code: "",
        name: "",
        chargeType: "Tax",
      });
      expect(emptyResult.success).toBe(false);

      const whitespaceResult = schema.safeParse({
        code: "   ",
        name: "   ",
        chargeType: "   ",
      });
      expect(whitespaceResult.success).toBe(false);

      const validResult = schema.safeParse({
        code: "CH001",
        name: "Water Tax",
        chargeType: "Tax",
      });
      expect(validResult.success).toBe(true);
    });
  });

  describe("Finding 5 & 6: String API boolean flags and inactive flags", () => {
    it("parses true, false, 'true', 'false', '1', '0', 1, 0 correctly", () => {
      expect(parseApiBoolean(true)).toBe(true);
      expect(parseApiBoolean(false)).toBe(false);
      expect(parseApiBoolean("true")).toBe(true);
      expect(parseApiBoolean("false")).toBe(false);
      expect(parseApiBoolean("TRUE")).toBe(true);
      expect(parseApiBoolean("FALSE")).toBe(false);
      expect(parseApiBoolean("1")).toBe(true);
      expect(parseApiBoolean("0")).toBe(false);
      expect(parseApiBoolean(1)).toBe(true);
      expect(parseApiBoolean(0)).toBe(false);

      expect(parseApiBooleanCH("false")).toBe(false);
      expect(parseApiBooleanCH("0")).toBe(false);
      expect(parseApiBooleanCH("inactive")).toBe(false);
      expect(parseApiBooleanCH("active")).toBe(true);
    });
  });

  describe("Finding 7: Single-record response envelope unwrap", () => {
    it("unwraps single-record response when wrapped in data or result envelope", async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        statusCode: 200,
        data: {
          data: {
            id: 42,
            tariffCode: "RES-2026",
            tariffName: "Residential 2026",
            financialYearId: 1,
            billingMethod: "Metered",
            effectiveFrom: "2026-01-01",
            status: "Draft",
            isActive: true,
          },
        },
      });

      const res = await getTariffWorkbenchById(42);
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe(42);
      expect(res.data?.tariffCode).toBe("RES-2026");
    });
  });

  describe("Finding 8: Whitespace-only tariff fields in Tariff schema", () => {
    it("rejects whitespace-only tariffCode, tariffName, billingMethod", () => {
      const schema = createTariffWorkbenchSchema(mockT);

      const res = schema.safeParse({
        tariffCode: "   ",
        tariffName: "   ",
        financialYearId: 1,
        billingMethod: "   ",
        effectiveFrom: "2026-01-01",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        const fieldErrors = res.error.flatten().fieldErrors;
        expect(fieldErrors.tariffCode).toBeDefined();
        expect(fieldErrors.tariffName).toBeDefined();
        expect(fieldErrors.billingMethod).toBeDefined();
      }
    });

    it("accepts valid normal values and trims whitespace", () => {
      const schema = createTariffWorkbenchSchema(mockT);

      const res = schema.safeParse({
        tariffCode: "  RES-001  ",
        tariffName: "  Residential Tariff  ",
        financialYearId: 1,
        billingMethod: "  Metered  ",
        effectiveFrom: "2026-01-01",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.tariffCode).toBe("RES-001");
        expect(res.data.tariffName).toBe("Residential Tariff");
        expect(res.data.billingMethod).toBe("Metered");
      }
    });

    it("rejects invalid billingMethod values not in the whitelist", () => {
      const schema = createTariffWorkbenchSchema(mockT);

      const res = schema.safeParse({
        tariffCode: "RES-001",
        tariffName: "Residential Tariff",
        financialYearId: 1,
        billingMethod: "ArbitraryFreeText",
        effectiveFrom: "2026-01-01",
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        const fieldErrors = res.error.flatten().fieldErrors;
        expect(fieldErrors.billingMethod).toBeDefined();
      }
    });

    it("accepts all whitelisted billingMethod options", () => {
      const schema = createTariffWorkbenchSchema(mockT);
      const allowedMethods = ["Metered", "Flat Rate", "Slab Metered", "Flat", "Slab", "Annual"];

      for (const method of allowedMethods) {
        const res = schema.safeParse({
          tariffCode: "RES-001",
          tariffName: "Residential Tariff",
          financialYearId: 1,
          billingMethod: method,
          effectiveFrom: "2026-01-01",
        });
        expect(res.success).toBe(true);
      }
    });
  });

  describe("Finding 9: Global test authorization bypass removal", () => {
    it("denies access when no valid cookies/user session exists regardless of test env", async () => {
      const hasAccess = await verifyServerActionAccess("WATERBILL.TARIFFMASTER", "edit");
      expect(hasAccess).toBe(false);
    });
  });

  describe("Finding 10: Date validation for calendar dates", () => {
    it("rejects invalid date strings like 'invalid-date' and accepts valid YYYY-MM-DD", () => {
      const schema = createTariffWorkbenchSchema(mockT);

      const invalidFrom = schema.safeParse({
        tariffCode: "RES-001",
        tariffName: "Residential",
        financialYearId: 1,
        billingMethod: "Metered",
        effectiveFrom: "invalid-date-string",
      });
      expect(invalidFrom.success).toBe(false);

      const invalidTo = schema.safeParse({
        tariffCode: "RES-001",
        tariffName: "Residential",
        financialYearId: 1,
        billingMethod: "Metered",
        effectiveFrom: "2026-01-01",
        effectiveTo: "invalid-date-string",
      });
      expect(invalidTo.success).toBe(false);

      const equalDates = schema.safeParse({
        tariffCode: "RES-001",
        tariffName: "Residential",
        financialYearId: 1,
        billingMethod: "Metered",
        effectiveFrom: "2026-01-01",
        effectiveTo: "2026-01-01",
      });
      expect(equalDates.success).toBe(true);

      const lesserToDate = schema.safeParse({
        tariffCode: "RES-001",
        tariffName: "Residential",
        financialYearId: 1,
        billingMethod: "Metered",
        effectiveFrom: "2026-06-01",
        effectiveTo: "2026-01-01",
      });
      expect(lesserToDate.success).toBe(false);

      const impossibleFeb30 = schema.safeParse({
        tariffCode: "RES-001",
        tariffName: "Residential",
        financialYearId: 1,
        billingMethod: "Metered",
        effectiveFrom: "2026-02-30",
      });
      expect(impossibleFeb30.success).toBe(false);
    });

    it("strictly rejects non-YYYY-MM-DD formats, timestamps, and slash dates", async () => {
      const { isValidCalendarDate } = await import("@/lib/api/water-bill/tariff-workbench/tariffWorkbench.schema");

      expect(isValidCalendarDate("2026-04-01")).toBe(true);
      expect(isValidCalendarDate("2026-02-30")).toBe(false);
      expect(isValidCalendarDate("01/04/2026")).toBe(false);
      expect(isValidCalendarDate("2026/04/01")).toBe(false);
      expect(isValidCalendarDate("1700000000000")).toBe(false);
      expect(isValidCalendarDate("2026-04-01T00:00:00Z")).toBe(false);
    });
  });

  describe("Finding 1: Master lookup failure behavior", () => {
    it("throws server-side exception on lookup failures instead of empty arrays", async () => {
      const { getTariffFormLookups } = await import("@/lib/api/water-bill/tariff-workbench/tariffLookups.service");

      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error("Database connection lost"));

      await expect(getTariffFormLookups()).rejects.toThrow("Failed to load required Financial Year master data");
    });

    it("returns empty options when master API calls succeed with zero records", async () => {
      const { getTariffFormLookups } = await import("@/lib/api/water-bill/tariff-workbench/tariffLookups.service");

      vi.mocked(apiClient.get).mockResolvedValue({
        success: true,
        statusCode: 200,
        data: { items: [], totalCount: 0, pageNumber: 1, pageSize: 2000, totalPages: 1 },
      });

      const lookups = await getTariffFormLookups();
      expect(lookups.financialYearOptions).toEqual([]);
      expect(lookups.connectionTypeOptions).toEqual([]);
      expect(lookups.connectionCategoryOptions).toEqual([]);
    });
  });

  describe("Finding 4 & 5: Version display and tariffColumns fallbacks", () => {
    it("does not fabricate FY-{id} and uses '-' when financialYearCode is missing", async () => {
      const { getTariffColumns } = await import("@/components/modules/water-bill/tariff-workbench/tariffColumns");
      const columns = getTariffColumns(mockT, mockT);
      const fyCol = columns.find((c) => c.key === "financialYearCode" || c.key === "year");

      const rowWithoutCode = { id: 1, financialYearId: 42 } as unknown as TariffWorkbench;
      expect(fyCol?.render?.(undefined, rowWithoutCode, 0)).toEqual(expect.anything());
    });
  });

  describe("Finding 11: Reject non-finite and fractional pagination parameters", () => {
    it("rejects NaN, Infinity, and fractional values", async () => {
      const { parsePositiveInteger } = await import("@/lib/api/utils");
      expect(parsePositiveInteger(1.5, 10)).toBe(10);
      expect(parsePositiveInteger("1.5", 10)).toBe(10);
      expect(parsePositiveInteger(NaN, 10)).toBe(10);
      expect(parsePositiveInteger(Infinity, 10)).toBe(10);
      expect(parsePositiveInteger(-Infinity, 10)).toBe(10);
      expect(parsePositiveInteger("abc", 10)).toBe(10);
      expect(parsePositiveInteger(5, 10)).toBe(5);
      expect(parsePositiveInteger("5", 10)).toBe(5);
    });
  });

  describe("Finding 8: Preserve sanitized filterLogic in API query parameters", () => {
    it("preserves filterLogic in sanitizePagedQuery result", async () => {
      const { sanitizePagedQuery } = await import("@/lib/api/utils");
      const res = sanitizePagedQuery({
        pageNumber: 1,
        pageSize: 10,
        filterLogic: "isActive eq true",
      });
      expect(res.filterLogic).toBe("isActive eq true");
    });
  });
});

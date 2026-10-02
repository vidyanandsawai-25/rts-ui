import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { getTariffColumns } from "@/components/modules/water-bill/tariff-workbench/tariffColumns";
import type { TariffWorkbench as TariffWorkbenchType } from "@/types/waterBill/tariffWorkbench.types";

describe("tariffColumns Tests", () => {
  const mockT = (key: string) => key;
  const mockTCommon = (key: string) => key;
  const mockOnSort = vi.fn();

  const sampleRow: TariffWorkbenchType = {
    id: 1,
    tariffCode: "RES-MTR-2026",
    tariffName: "Residential Metered",
    financialYearId: 1,
    connectionTypeId: 1,
    connectionCategoryId: 1,
    billingMethod: "Metered",
    effectiveFrom: "2026-04-01T00:00:00.000Z",
    effectiveTo: "2027-03-31T00:00:00.000Z",
    versionNo: 1,
    status: "Published",
    description: "Test Description",
    isActive: true,
    financialYearCode: "2026-27",
    connectionTypeName: "Residential",
    connectionCategoryName: "Regular",
    slabsCount: 2,
  };

  it("should return the correct number of column definitions", () => {
    const columns = getTariffColumns(mockT, mockTCommon);
    expect(columns.length).toBe(11);
  });

  it("should format tariff code, billing method, and version correctly", () => {
    const columns = getTariffColumns(mockT, mockTCommon);

    const codeCol = columns.find((c) => c.key === "tariffCode");
    const billingCol = columns.find((c) => c.key === "billingMethod");
    const versionCol = columns.find((c) => c.key === "versionNo");
    const statusCol = columns.find((c) => c.key === "status");

    expect(codeCol?.render?.(sampleRow.tariffCode, sampleRow, 0)).toBeDefined();
    expect(billingCol?.render?.(sampleRow.billingMethod, sampleRow, 0)).toBe("Metered");
    expect(versionCol?.render?.(sampleRow.versionNo, sampleRow, 0)).toBe("v1");
    expect(statusCol?.render?.(sampleRow.status, sampleRow, 0)).toBeDefined();
  });

  it("should format date fields correctly", () => {
    const columns = getTariffColumns(mockT, mockTCommon);

    const effectiveFromCol = columns.find((c) => c.key === "effectiveFrom");
    const effectiveToCol = columns.find((c) => c.key === "effectiveTo");

    expect(effectiveFromCol?.render?.("2026-04-01T00:00:00.000Z", sampleRow, 0)).toBe("01-04-2026");
    expect(effectiveToCol?.render?.("2027-03-31T00:00:00.000Z", sampleRow, 0)).toBe("31-03-2027");
    expect(effectiveToCol?.render?.(null, sampleRow, 0)).toBe("-");
  });

  it("should trigger sort callback when sortable column header is clicked", () => {
    const columns = getTariffColumns(mockT, mockTCommon, "tariffCode", "asc", mockOnSort);

    const codeCol = columns.find((c) => c.key === "tariffCode");
    expect(codeCol).toBeDefined();

    if (typeof codeCol?.label !== "string") {
      render(codeCol!.label);
      const sortButton = screen.getByRole("button");
      fireEvent.click(sortButton);

      expect(mockOnSort).toHaveBeenCalledWith("tariffCode");
    }
  });
});

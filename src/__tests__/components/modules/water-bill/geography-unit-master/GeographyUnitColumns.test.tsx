import { getGeographyUnitColumns } from "@/components/modules/water-bill/geography-unit-master/GeographyUnitColumns";
import type { GeographyUnit } from "@/types/geographyUnit.types";

describe("getGeographyUnitColumns", () => {
  const mockT = vi.fn((key: string) => key);

  it("returns the correct number of columns", () => {
    const columns = getGeographyUnitColumns(mockT);
    expect(columns).toHaveLength(5);
    expect(columns.map((c) => c.key)).toEqual([
      "geographyUnitCode",
      "geographyUnitName",
      "geographyTypeName",
      "parentGeographyUnitName",
      "isActive",
    ]);
  });

  it("correctly renders column values using the render function", () => {
    const columns = getGeographyUnitColumns(mockT);
    const dummyRow = {} as GeographyUnit;

    const colCode = columns.find((c) => c.key === "geographyUnitCode");
    expect(colCode?.render?.("ZONE-1", dummyRow, 0)).toBe("ZONE-1");
    expect(colCode?.render?.(null as unknown as string, dummyRow, 0)).toBe("");

    const colName = columns.find((c) => c.key === "geographyUnitName");
    expect(colName?.render?.("Zone 1", dummyRow, 0)).toBe("Zone 1");

    const colType = columns.find((c) => c.key === "geographyTypeName");
    expect(colType?.render?.("Zone", dummyRow, 0)).toBe("Zone");
  });

  it("renders a placeholder for a missing parent unit", () => {
    const columns = getGeographyUnitColumns(mockT);
    const dummyRow = {} as GeographyUnit;

    const colParent = columns.find((c) => c.key === "parentGeographyUnitName");
    expect(colParent?.render?.("Ward 1", dummyRow, 0)).toBe("Ward 1");
    expect(colParent?.render?.(null as unknown as string, dummyRow, 0)).toBe("—");
  });

  it("marks the status column as a status column", () => {
    const columns = getGeographyUnitColumns(mockT);
    const colStatus = columns.find((c) => c.key === "isActive");
    expect(colStatus?.isStatus).toBe(true);
  });
});

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { getPropertyColumns } from "@/components/modules/property-tax/zone-master/properties/propertyColumns";
import { WardItem } from "@/types/wardMaster.types";

// Mock the StatusBadge component
vi.mock("@/components/common", () => ({
  StatusBadge: ({ label, variant }: { label: string; variant: string }) => (
    <span data-testid="status-badge" data-variant={variant}>{label}</span>
  ),
}));

describe("propertyColumns", () => {
  const mockT = vi.fn((key: string) => key);
  const mockWards: WardItem[] = [
    { 
      id: 1, 
      wardNo: "W01", 
      zoneId: 1,
      description: "Ward 1", 
      isActive: true, 
      sequenceNo: 1,
      createdDate: "2024-01-01T00:00:00Z",
      updatedDate: null
    }, 
  ];
  const mockCategoryMap = { 1: "Residential" };
  const mockPropertyTypeMap = { 1: "Flat" };

  const params = {
    t: mockT,
    pageNumber: 1,
    pageSize: 10,
    wards: mockWards,
    categoryMap: mockCategoryMap,
    propertyTypeMap: mockPropertyTypeMap,
  };

  it("should return the correct number of columns", () => {
    const columns = getPropertyColumns(params);
    expect(columns).toHaveLength(6);
  });

  it("should correctly render serial number", () => {
    const columns = getPropertyColumns(params);
    const srNoColumn = columns.find((c) => c.key === "srNo");
    expect(srNoColumn?.render?.(null, {}, 0)).toBe(1);
    expect(srNoColumn?.render?.(null, {}, 5)).toBe(6);
  });

  it("should correctly render ward number", () => {
    const columns = getPropertyColumns(params);
    const wardNoColumn = columns.find((c) => c.key === "wardNo");
    expect(wardNoColumn?.render?.(null, { wardId: 1 }, 0)).toBe("W01");
    expect(wardNoColumn?.render?.(null, { wardId: 2 }, 0)).toBe("-");
  });

  it("should correctly render property number and partition number", () => {
    const columns = getPropertyColumns(params);
    const propertyNoColumn = columns.find((c) => c.key === "propertyNo");
    const partitionNoColumn = columns.find((c) => c.key === "partitionNo");
    
    expect(propertyNoColumn?.render?.("P123", {}, 0)).toBe("P123");
    expect(propertyNoColumn?.render?.(null, {}, 0)).toBe("-");
    
    expect(partitionNoColumn?.render?.("01", {}, 0)).toBe("01");
    expect(partitionNoColumn?.render?.(null, {}, 0)).toBe("-");
  });

  it("should correctly render category as a StatusBadge", () => {
    const columns = getPropertyColumns(params);
    const categoryColumn = columns.find((c) => c.key === "categoryId");
    
    const result = categoryColumn?.render?.(1, {}, 0);
    const { getByTestId } = render(<>{result}</>);
    const badge = getByTestId("status-badge");
    
    expect(badge.textContent).toBe("Residential");
    expect(badge.getAttribute("data-variant")).toBe("info");
    
    expect(categoryColumn?.render?.(null, {}, 0)).toBe("-");
    expect(categoryColumn?.render?.(99, {}, 0)).toBe("-");
  });

  it("should correctly render property type from row type field", () => {
    const columns = getPropertyColumns(params);
    const typeColumn = columns.find((c) => c.key === "propertyTypeId");
    
    const result = typeColumn?.render?.(null, { type: "Custom Type" }, 0);
    const { getByText } = render(<>{result}</>);
    expect(getByText("Custom Type")).toBeDefined();
  });

  it("should correctly render property type from mapping", () => {
    const columns = getPropertyColumns(params);
    const typeColumn = columns.find((c) => c.key === "propertyTypeId");

    const result = typeColumn?.render?.(1, {}, 0);
    const { getByTestId } = render(<>{result}</>);
    const badge = getByTestId("status-badge");
    expect(badge.textContent).toBe("Flat");
    expect(badge.getAttribute("data-variant")).toBe("pending");
  });

  it("should render '-' for empty property type", () => {
    const columns = getPropertyColumns(params);
    const typeColumn = columns.find((c) => c.key === "propertyTypeId");
    expect(typeColumn?.render?.(null, {}, 0)).toBe("-");
  });
});

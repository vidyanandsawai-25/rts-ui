import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAssessmentYearRangeColumns } from "@/components/modules/property-tax/assessment-year-range/shared/AssessmentYearRangeColumns";
import type { AssessmentYearRangeRV } from "@/types/assessment-year-range.types";

describe("getAssessmentYearRangeColumns", () => {
  const mockT = vi.fn((key: string) => key);
  const mockTCommon = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the correct number of columns", () => {
    const columns = getAssessmentYearRangeColumns<AssessmentYearRangeRV>(mockT, mockTCommon);
    expect(columns).toHaveLength(3);
    expect(columns.map(c => c.key)).toEqual(["fromYear", "toYear", "isActive"]);
  });

  it("has correct labels for each column", () => {
    getAssessmentYearRangeColumns<AssessmentYearRangeRV>(mockT, mockTCommon);
    
    expect(mockT).toHaveBeenCalledWith("list.table.fromYear");
    expect(mockT).toHaveBeenCalledWith("list.table.toYear");
    expect(mockT).toHaveBeenCalledWith("list.table.status");
  });

  it("marks isActive column with isStatus flag", () => {
    const columns = getAssessmentYearRangeColumns<AssessmentYearRangeRV>(mockT, mockTCommon);
    
    const isActiveCol = columns.find(c => c.key === "isActive");
    expect(isActiveCol?.isStatus).toBe(true);
  });

  it("has correct widths for columns", () => {
    const columns = getAssessmentYearRangeColumns<AssessmentYearRangeRV>(mockT, mockTCommon);
    
    columns.forEach(col => {
      expect(col.width).toBe("25%");
    });
  });

  it("renders fromYear correctly", () => {
    const columns = getAssessmentYearRangeColumns<AssessmentYearRangeRV>(mockT, mockTCommon);
    const fromYearCol = columns.find(c => c.key === "fromYear");
    
    const mockRow: AssessmentYearRangeRV = {
      yearRangeRVId: 1,
      fromYear: 2020,
      toYear: 2025,
      isActive: true,
      createdDate: "2026-01-01",
      updatedDate: null,
    };
    
    const rendered = fromYearCol?.render?.(2020, mockRow, 0);
    expect(rendered).toBe(2020);
  });

  it("renders toYear correctly", () => {
    const columns = getAssessmentYearRangeColumns<AssessmentYearRangeRV>(mockT, mockTCommon);
    const toYearCol = columns.find(c => c.key === "toYear");
    
    const mockRow: AssessmentYearRangeRV = {
      yearRangeRVId: 1,
      fromYear: 2020,
      toYear: 2025,
      isActive: true,
      createdDate: "2026-01-01",
      updatedDate: null,
    };
    
    const rendered = toYearCol?.render?.(2025, mockRow, 0);
    expect(rendered).toBe(2025);
  });
});

import { describe, it, expect, vi } from "vitest";
import { getSubTypeColumns } from "@/components/modules/property-tax/typeofusemaster/TypeOfUseMasterColumns";
import type { UseSubType } from "@/types/typeOfUse.types";

// Mock translation function
const mockT = vi.fn((key: string) => {
  const translations: Record<string, string> = {
    "table.columns.serial": "#",
    "table.columns.subTypeName": "Sub-Type Name",
    "table.columns.searchSequence": "Search Sequence",
    "table.columns.status": "Status",
    "table.columns.actions": "Actions",
    "status.active": "Active",
    "status.inactive": "Inactive",
  };
  return translations[key] || key;
});

describe("TypeOfUseMasterColumns", () => {
  describe("getSubTypeColumns", () => {
    it("should return column definitions", () => {
      const columns = getSubTypeColumns(mockT);

      expect(columns).toBeDefined();
      expect(Array.isArray(columns)).toBe(true);
      expect(columns.length).toBeGreaterThan(0);
    });

    it("should have correct column headers", () => {
      const columns = getSubTypeColumns(mockT);

      const headers = columns.map(col => col.header);
      
      expect(headers).toContain("#");
      expect(headers).toContain("Sub-Type Name");
      expect(headers).toContain("Search Sequence");
      expect(headers).toContain("Status");
      expect(headers).toContain("Actions");
    });

    it("should have serial number column", () => {
      const columns = getSubTypeColumns(mockT);
      
      const serialColumn = columns.find(col => col.header === "#");
      expect(serialColumn).toBeDefined();
      expect(serialColumn?.id).toBe("serial");
    });

    it("should have description column", () => {
      const columns = getSubTypeColumns(mockT);
      
      const descColumn = columns.find(col => col.header === "Sub-Type Name");
      expect(descColumn).toBeDefined();
      expect(descColumn?.id).toBe("description");
    });

    it("should have search sequence column", () => {
      const columns = getSubTypeColumns(mockT);
      
      const seqColumn = columns.find(col => col.header === "Search Sequence");
      expect(seqColumn).toBeDefined();
      expect(seqColumn?.id).toBe("searchSequence");
    });

    it("should have status column", () => {
      const columns = getSubTypeColumns(mockT);
      
      const statusColumn = columns.find(col => col.header === "Status");
      expect(statusColumn).toBeDefined();
      expect(statusColumn?.id).toBe("status");
    });

    it("should have actions column", () => {
      const columns = getSubTypeColumns(mockT);
      
      const actionsColumn = columns.find(col => col.header === "Actions");
      expect(actionsColumn).toBeDefined();
      expect(actionsColumn?.id).toBe("actions");
    });

    it("should render serial numbers correctly", () => {
      const columns = getSubTypeColumns(mockT);
      const serialColumn = columns.find(col => col.id === "serial");

      const mockRow: UseSubType = {
        subTypeOfUseId: 1,
        description: "Test",
        typeOfUseId: 1,
        searchSequence: 1,
        isActive: true,
        status: "Active",
      };

      // Test with different indices
      expect(serialColumn?.cell).toBeDefined();
      if (serialColumn?.cell && typeof serialColumn.cell === "function") {
        // Cell function should receive row and context
        const result1 = serialColumn.cell({ row: mockRow, index: 0 });
        expect(result1).toBe(1);

        const result2 = serialColumn.cell({ row: mockRow, index: 9 });
        expect(result2).toBe(10);
      }
    });

    it("should render description correctly", () => {
      const columns = getSubTypeColumns(mockT);
      const descColumn = columns.find(col => col.id === "description");

      const mockRow: UseSubType = {
        subTypeOfUseId: 1,
        description: "Ground Floor",
        typeOfUseId: 1,
        searchSequence: 1,
        isActive: true,
        status: "Active",
      };

      expect(descColumn?.cell).toBeDefined();
      if (descColumn?.cell && typeof descColumn.cell === "function") {
        const result = descColumn.cell({ row: mockRow });
        expect(result).toBe("Ground Floor");
      }
    });

    it("should render search sequence correctly", () => {
      const columns = getSubTypeColumns(mockT);
      const seqColumn = columns.find(col => col.id === "searchSequence");

      const mockRow: UseSubType = {
        subTypeOfUseId: 1,
        description: "Test",
        typeOfUseId: 1,
        searchSequence: 5,
        isActive: true,
        status: "Active",
      };

      expect(seqColumn?.cell).toBeDefined();
      if (seqColumn?.cell && typeof seqColumn.cell === "function") {
        const result = seqColumn.cell({ row: mockRow });
        expect(result).toBe(5);
      }
    });

    it("should use translation function for headers", () => {
      getSubTypeColumns(mockT);

      expect(mockT).toHaveBeenCalledWith("table.columns.serial");
      expect(mockT).toHaveBeenCalledWith("table.columns.subTypeName");
      expect(mockT).toHaveBeenCalledWith("table.columns.searchSequence");
      expect(mockT).toHaveBeenCalledWith("table.columns.status");
      expect(mockT).toHaveBeenCalledWith("table.columns.actions");
    });

    it("should handle missing or null values gracefully", () => {
      const columns = getSubTypeColumns(mockT);
      const descColumn = columns.find(col => col.id === "description");

      const mockRowWithNull: UseSubType = {
        subTypeOfUseId: 1,
        description: "",
        typeOfUseId: 1,
        searchSequence: 0,
        isActive: true,
        status: "Active",
      };

      if (descColumn?.cell && typeof descColumn.cell === "function") {
        const result = descColumn.cell({ row: mockRowWithNull });
        expect(result).toBe("");
      }
    });
  });

  describe("SubTypeTableRow type", () => {
    it("should accept valid UseSubType objects", () => {
      const validRow: UseSubType = {
        subTypeOfUseId: 1,
        description: "Test SubType",
        typeOfUseId: 1,
        searchSequence: 1,
        isActive: true,
        status: "Active",
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };

      expect(validRow).toBeDefined();
      expect(validRow.subTypeOfUseId).toBe(1);
      expect(validRow.description).toBe("Test SubType");
    });
  });
});

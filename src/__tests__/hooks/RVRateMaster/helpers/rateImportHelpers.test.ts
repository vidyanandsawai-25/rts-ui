import { describe, it, expect } from "vitest";
import { 
  parseCsvContent, 
  validateFileType,
  applyImportedEditsToMatrix 
} from "@/hooks/RVRateMaster/helpers/rateImportHelpers";
import type { IZoneDescription, RateCategory } from "@/types/RVRateMaster";

describe("rateImportHelpers", () => {
  const mockRateCategories: RateCategory[] = [
    { constructionId: "1", constructionCode: "RCC", description: "RCC Building" },
    { constructionId: "2", constructionCode: "LOAD", description: "Load Bearing" },
    { constructionId: "3", constructionCode: "MUD", description: "Mud Building" },
  ];

  const mockZoneDescriptions: IZoneDescription[] = [
    { taxZoneId: 1, zoneNo: "Z1", description: "Zone 1" },
    { taxZoneId: 2, zoneNo: "Z2", description: "Zone 2" },
  ];

  describe("validateFileType", () => {
    it("should accept CSV files", () => {
      const file = new File([""], "test.csv", { type: "text/csv" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should accept files with .csv extension", () => {
      const file = new File([""], "test.csv", { type: "application/octet-stream" });
      expect(validateFileType(file)).toBe(true);
    });

    it("should reject non-CSV files", () => {
      const file = new File([""], "test.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      expect(validateFileType(file)).toBe(false);
    });

    it("should reject files without .csv extension", () => {
      const file = new File([""], "test.txt", { type: "text/plain" });
      expect(validateFileType(file)).toBe(false);
    });
  });

  describe("parseCsvContent", () => {
    it("should parse CSV content correctly", () => {
      const csvContent = `Tax Zone No,RCC (Rs./Sq.mtr),LOAD (Rs./Sq.mtr),MUD (Rs./Sq.mtr)
Z1,100,80,50
Z2,90,70,40`;

      const result = parseCsvContent(csvContent, mockZoneDescriptions, mockRateCategories);

      expect(result.zoneEdits).toBeDefined();
      expect(result.zoneEdits["Z1"]).toBeDefined();
      expect(result.zoneEdits["Z1"]["RCC"]).toBe(100);
      expect(result.zoneEdits["Z1"]["LOAD"]).toBe(80);
      expect(result.zoneEdits["Z1"]["MUD"]).toBe(50);
    });

    it("should return imported rate count", () => {
      const csvContent = `Tax Zone No,RCC (Rs./Sq.mtr),LOAD (Rs./Sq.mtr),MUD (Rs./Sq.mtr)
Z1,100,80,50
Z2,90,70,40`;

      const result = parseCsvContent(csvContent, mockZoneDescriptions, mockRateCategories);

      expect(result.importedRateCount).toBeGreaterThan(0);
    });

    it("should handle CSV with headers and empty data rows", () => {
      const csvContent = `Tax Zone No,RCC (Rs./Sq.mtr),LOAD (Rs./Sq.mtr),MUD (Rs./Sq.mtr)
Z1,0,0,0
Z2,0,0,0`;

      // CSV with only zero values should return empty results (zero values are skipped)
      const result = parseCsvContent(csvContent, mockZoneDescriptions, mockRateCategories);

      expect(Object.keys(result.zoneEdits)).toHaveLength(0);
      expect(result.importedRateCount).toBe(0);
    });

    it("should throw error on invalid file", () => {
      const csvContent = ``;

      expect(() => parseCsvContent(csvContent, mockZoneDescriptions, mockRateCategories)).toThrow();
    });

    it("should parse numeric values correctly", () => {
      const csvContent = `Tax Zone No,RCC (Rs./Sq.mtr),LOAD (Rs./Sq.mtr),MUD (Rs./Sq.mtr)
Z1,100.5,80.25,50.75`;

      const result = parseCsvContent(csvContent, mockZoneDescriptions, mockRateCategories);

      expect(result.zoneEdits["Z1"]["RCC"]).toBeCloseTo(100.5);
      expect(result.zoneEdits["Z1"]["LOAD"]).toBeCloseTo(80.25);
      expect(result.zoneEdits["Z1"]["MUD"]).toBeCloseTo(50.75);
    });

    it("should skip zones not in zone descriptions", () => {
      const csvContent = `Tax Zone No,RCC (Rs./Sq.mtr),LOAD (Rs./Sq.mtr),MUD (Rs./Sq.mtr)
Z1,100,80,50
Z99,90,70,40`;

      const result = parseCsvContent(csvContent, mockZoneDescriptions, mockRateCategories);

      expect(result.zoneEdits["Z1"]).toBeDefined();
      expect(result.zoneEdits["Z99"]).toBeUndefined();
    });
  });

  describe("applyImportedEditsToMatrix", () => {
    const existingMatrix = [
      { id: 1, zoneNo: "Z1", RCC: 50, LOAD: 40, MUD: 30 },
      { id: 2, zoneNo: "Z2", RCC: 45, LOAD: 35, MUD: 25 },
    ];

    it("should apply imported edits to matching zones", () => {
      const importedEdits: Record<string, Record<string, number>> = {
        "Z1": { RCC: 100, LOAD: 80, MUD: 50 },
      };

      const result = applyImportedEditsToMatrix(existingMatrix, importedEdits);

      expect(result[0].RCC).toBe(100);
      expect(result[0].LOAD).toBe(80);
      expect(result[0].MUD).toBe(50);
      // Z2 should remain unchanged
      expect(result[1].RCC).toBe(45);
    });

    it("should handle zones not in import data", () => {
      const importedEdits: Record<string, Record<string, number>> = {
        "Z1": { RCC: 100, LOAD: 80, MUD: 50 },
      };

      const result = applyImportedEditsToMatrix(existingMatrix, importedEdits);

      // Z2 should remain unchanged
      expect(result[1].zoneNo).toBe("Z2");
      expect(result[1].RCC).toBe(45);
      expect(result[1].LOAD).toBe(35);
    });

    it("should handle partial rate updates", () => {
      const importedEdits: Record<string, Record<string, number>> = {
        "Z1": { RCC: 100 },
      };

      const result = applyImportedEditsToMatrix(existingMatrix, importedEdits);

      expect(result[0].RCC).toBe(100);
      // Other values should remain unchanged
      expect(result[0].LOAD).toBe(40);
      expect(result[0].MUD).toBe(30);
    });

    it("should handle empty import data", () => {
      const result = applyImportedEditsToMatrix(existingMatrix, {});

      // Should return original matrix unchanged
      expect(result).toEqual(existingMatrix);
    });
  });
});

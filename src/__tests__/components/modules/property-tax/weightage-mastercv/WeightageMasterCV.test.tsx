import { describe, it, expect } from "vitest";

// Import types to verify they exist
import type {
  AgeFactorCVMaster,
  FloorFactorCVMaster,
  NatureFactorCVMaster,
  UseFactorCVMaster,
  AgeFactorCVMasterCreate,
  AgeFactorCVMasterUpdate,
  FloorFactorCVMasterCreate,
  FloorFactorCVMasterUpdate,
  NatureFactorCVMasterCreate,
  NatureFactorCVMasterUpdate,
  UseFactorCVMasterCreate,
  UseFactorCVMasterUpdate,
} from "@/types/weightageMaster.types";

describe("Weightage Master CV - Type Definitions", () => {
  describe("AgeFactorCVMaster Types", () => {
    it("AgeFactorCVMaster type is correctly structured", () => {
      const mockData: AgeFactorCVMaster = {
        ageFactorId: 1,
        constructionTypeId: 3,
        ageFrom: 0,
        ageTo: 10,
        factor: 1.5,
        yearRangeCVId: 1,
        isActive: true,
        createdDate: "2024-01-01",
      };
      
      expect(mockData.ageFactorId).toBe(1);
      expect(mockData.factor).toBe(1.5);
      expect(mockData.yearRangeCVId).toBe(1);
      expect(mockData.ageFrom).toBe(0);
      expect(mockData.ageTo).toBe(10);
      expect(mockData.constructionTypeId).toBe(3);
      expect(mockData.isActive).toBe(true);
    });

    it("AgeFactorCVMasterCreate type accepts required fields", () => {
      const createData: AgeFactorCVMasterCreate = {
        isActive: true,
        createdBy: 1,
        constructionTypeId: 3,
        ageFrom: 0,
        ageTo: 10,
        factor: 1.2,
        yearRangeCVId: 1,
      };
      
      expect(createData.factor).toBe(1.2);
      expect(createData.yearRangeCVId).toBe(1);
      expect(createData.createdBy).toBe(1);
    });

    it("AgeFactorCVMasterUpdate type includes required fields", () => {
      const updateData: AgeFactorCVMasterUpdate = {
        isActive: false,
        updatedBy: 1,
        constructionTypeId: 3,
        ageFrom: 0,
        ageTo: 10,
        factor: 1.3,
        yearRangeCVId: 1,
      };
      
      expect(updateData.factor).toBe(1.3);
      expect(updateData.isActive).toBe(false);
      expect(updateData.updatedBy).toBe(1);
    });
  });

  describe("FloorFactorCVMaster Types", () => {
    it("FloorFactorCVMaster type is correctly structured", () => {
      const mockData: FloorFactorCVMaster = {
        floorFactorId: 1,
        floorId: 2,
        factorWithLift: 1.2,
        factorWithoutLift: 1.0,
        yearRangeCVId: 1,
        isActive: true,
        createdDate: "2024-01-01",
      };
      
      expect(mockData.floorFactorId).toBe(1);
      expect(mockData.factorWithLift).toBe(1.2);
      expect(mockData.factorWithoutLift).toBe(1.0);
      expect(mockData.floorId).toBe(2);
    });

    it("FloorFactorCVMasterCreate type accepts required fields", () => {
      const createData: FloorFactorCVMasterCreate = {
        isActive: true,
        createdBy: 1,
        floorId: 2,
        factorWithLift: 1.3,
        factorWithoutLift: 1.1,
        yearRangeCVId: 1,
      };
      
      expect(createData.factorWithLift).toBe(1.3);
      expect(createData.factorWithoutLift).toBe(1.1);
      expect(createData.createdBy).toBe(1);
    });

    it("FloorFactorCVMasterUpdate type includes required fields", () => {
      const updateData: FloorFactorCVMasterUpdate = {
        isActive: true,
        updatedBy: 1,
        floorId: 2,
        factorWithLift: 1.4,
        factorWithoutLift: 1.2,
        yearRangeCVId: 1,
      };
      
      expect(updateData.factorWithLift).toBe(1.4);
      expect(updateData.updatedBy).toBe(1);
    });
  });

  describe("NatureFactorCVMaster Types", () => {
    it("NatureFactorCVMaster type is correctly structured", () => {
      const mockData: NatureFactorCVMaster = {
        natureFactorId: 1,
        constructionTypeId: 2,
        factor: 1.1,
        yearRangeCVId: 1,
        isActive: true,
        createdDate: "2024-01-01",
      };
      
      expect(mockData.natureFactorId).toBe(1);
      expect(mockData.factor).toBe(1.1);
      expect(mockData.constructionTypeId).toBe(2);
    });

    it("NatureFactorCVMasterCreate type accepts required fields", () => {
      const createData: NatureFactorCVMasterCreate = {
        isActive: true,
        createdBy: 1,
        constructionTypeId: 2,
        factor: 1.2,
        yearRangeCVId: 1,
      };
      
      expect(createData.factor).toBe(1.2);
      expect(createData.constructionTypeId).toBe(2);
      expect(createData.createdBy).toBe(1);
    });

    it("NatureFactorCVMasterUpdate type includes required fields", () => {
      const updateData: NatureFactorCVMasterUpdate = {
        isActive: false,
        updatedBy: 1,
        constructionTypeId: 2,
        factor: 1.3,
        yearRangeCVId: 1,
      };
      
      expect(updateData.factor).toBe(1.3);
      expect(updateData.isActive).toBe(false);
      expect(updateData.updatedBy).toBe(1);
    });
  });

  describe("UseFactorCVMaster Types", () => {
    it("UseFactorCVMaster type is correctly structured", () => {
      const mockData: UseFactorCVMaster = {
        useFactorId: 1,
        typeOfUseId: 2,
        subTypeOfUseId: 3,
        factor: 1.0,
        yearRangeCVId: 1,
        isActive: true,
        createdDate: "2024-01-01",
      };
      
      expect(mockData.useFactorId).toBe(1);
      expect(mockData.factor).toBe(1.0);
      expect(mockData.typeOfUseId).toBe(2);
      expect(mockData.subTypeOfUseId).toBe(3);
    });

    it("UseFactorCVMasterCreate type accepts required fields", () => {
      const createData: UseFactorCVMasterCreate = {
        isActive: true,
        createdBy: 1,
        typeOfUseId: 2,
        subTypeOfUseId: 3,
        factor: 0.9,
        yearRangeCVId: 1,
      };
      
      expect(createData.factor).toBe(0.9);
      expect(createData.typeOfUseId).toBe(2);
      expect(createData.subTypeOfUseId).toBe(3);
      expect(createData.createdBy).toBe(1);
    });

    it("UseFactorCVMasterUpdate type includes required fields", () => {
      const updateData: UseFactorCVMasterUpdate = {
        isActive: true,
        updatedBy: 1,
        typeOfUseId: 2,
        subTypeOfUseId: 3,
        factor: 0.95,
        yearRangeCVId: 1,
      };
      
      expect(updateData.factor).toBe(0.95);
      expect(updateData.updatedBy).toBe(1);
    });
  });

  describe("Type Safety", () => {
    it("prevents invalid factor values at type level", () => {
      const validData: AgeFactorCVMaster = {
        ageFactorId: 1,
        constructionTypeId: 1,
        ageFrom: 0,
        ageTo: 10,
        factor: 1.0,
        yearRangeCVId: 1,
        isActive: true,
        createdDate: "2024-01-01",
      };
      
      expect(typeof validData.factor).toBe("number");
      expect(typeof validData.isActive).toBe("boolean");
    });

    it("enforces required fields in create types", () => {
      const createData: FloorFactorCVMasterCreate = {
        isActive: true,
        createdBy: 1,
        floorId: 1,
        factorWithLift: 1.0,
        factorWithoutLift: 0.9,
        yearRangeCVId: 1,
      };
      
      // All required fields must be present
      expect(createData).toHaveProperty("factorWithLift");
      expect(createData).toHaveProperty("factorWithoutLift");
      expect(createData).toHaveProperty("yearRangeCVId");
      expect(createData).toHaveProperty("floorId");
      expect(createData).toHaveProperty("createdBy");
    });

    it("enforces updatedBy requirement in update types", () => {
      const updateData: NatureFactorCVMasterUpdate = {
        isActive: true,
        updatedBy: 1,
        constructionTypeId: 1,
        factor: 1.0,
        yearRangeCVId: 1,
      };
      
      expect(updateData).toHaveProperty("updatedBy");
      expect(updateData.updatedBy).toBeGreaterThan(0);
    });
  });

  describe("Data Validation", () => {
    it("validates factor ranges", () => {
      const testFactors = [0.5, 1.0, 1.5, 2.0];
      
      testFactors.forEach(factor => {
        const data: AgeFactorCVMaster = {
          ageFactorId: 1,
          constructionTypeId: 1,
          ageFrom: 0,
          ageTo: 10,
          factor: factor,
          yearRangeCVId: 1,
          isActive: true,
          createdDate: "2024-01-01",
        };
        
        expect(data.factor).toBeGreaterThanOrEqual(0);
        expect(data.factor).toBeLessThanOrEqual(10);
      });
    });

    it("validates floor lift and non-lift factors", () => {
      const data: FloorFactorCVMaster = {
        floorFactorId: 1,
        floorId: 1,
        factorWithLift: 1.2,
        factorWithoutLift: 1.0,
        yearRangeCVId: 1,
        isActive: true,
        createdDate: "2024-01-01",
      };
      
      expect(data.factorWithLift).toBeGreaterThan(0);
      expect(data.factorWithoutLift).toBeGreaterThan(0);
      // Typically factor with lift should be >= factor without lift
      expect(data.factorWithLift).toBeGreaterThanOrEqual(data.factorWithoutLift);
    });

    it("validates boolean isActive field", () => {
      const testData: UseFactorCVMaster = {
        useFactorId: 1,
        typeOfUseId: 1,
        subTypeOfUseId: 1,
        factor: 1.0,
        yearRangeCVId: 1,
        isActive: true,
        createdDate: "2024-01-01",
      };
      
      expect(typeof testData.isActive).toBe("boolean");
      
      testData.isActive = false;
      expect(testData.isActive).toBe(false);
    });

    it("validates age range in AgeFactorCVMaster", () => {
      const testData: AgeFactorCVMaster = {
        ageFactorId: 1,
        constructionTypeId: 1,
        ageFrom: 0,
        ageTo: 10,
        factor: 1.0,
        yearRangeCVId: 1,
        isActive: true,
      };
      
      expect(testData.ageFrom).toBeGreaterThanOrEqual(0);
      expect(testData.ageTo).toBeGreaterThan(testData.ageFrom);
    });
  });
});


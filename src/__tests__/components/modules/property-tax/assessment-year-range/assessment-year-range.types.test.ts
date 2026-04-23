import { describe, it, expect } from "vitest";
import {
  isAssessmentYearRangeRV,
  isAssessmentYearRangeCV,
  getAssessmentYearRangeId,
  type AssessmentYearRangeRV,
  type AssessmentYearRangeCV,
  type AssessmentYearRange,
} from "@/types/assessment-year-range.types";

describe("Assessment Year Range Types", () => {
  const mockRVEntity: AssessmentYearRangeRV = {
    yearRangeRVId: 1,
    fromYear: 2020,
    toYear: 2025,
    isActive: true,
    createdDate: "2026-01-01T00:00:00Z",
    updatedDate: null,
  };

  const mockCVEntity: AssessmentYearRangeCV = {
    yearRangeCVId: 2,
    fromYear: 2018,
    toYear: 2023,
    isActive: false,
    createdDate: "2026-01-01T00:00:00Z",
    updatedDate: "2026-02-01T00:00:00Z",
  };

  describe("isAssessmentYearRangeRV", () => {
    it("returns true for RV entity", () => {
      expect(isAssessmentYearRangeRV(mockRVEntity)).toBe(true);
    });

    it("returns false for CV entity", () => {
      expect(isAssessmentYearRangeRV(mockCVEntity)).toBe(false);
    });
  });

  describe("isAssessmentYearRangeCV", () => {
    it("returns true for CV entity", () => {
      expect(isAssessmentYearRangeCV(mockCVEntity)).toBe(true);
    });

    it("returns false for RV entity", () => {
      expect(isAssessmentYearRangeCV(mockRVEntity)).toBe(false);
    });
  });

  describe("getAssessmentYearRangeId", () => {
    it("returns yearRangeRVId for RV entity", () => {
      expect(getAssessmentYearRangeId(mockRVEntity)).toBe(1);
    });

    it("returns yearRangeCVId for CV entity", () => {
      expect(getAssessmentYearRangeId(mockCVEntity)).toBe(2);
    });

    it("handles entities with ID of 0", () => {
      const entityWithZeroId: AssessmentYearRangeRV = {
        ...mockRVEntity,
        yearRangeRVId: 0,
      };
      expect(getAssessmentYearRangeId(entityWithZeroId)).toBe(0);
    });
  });

  describe("Type structure validation", () => {
    it("RV entity has all required fields", () => {
      const rv: AssessmentYearRangeRV = mockRVEntity;
      
      expect(rv).toHaveProperty("yearRangeRVId");
      expect(rv).toHaveProperty("fromYear");
      expect(rv).toHaveProperty("toYear");
      expect(rv).toHaveProperty("isActive");
      expect(rv).toHaveProperty("createdDate");
      expect(rv).toHaveProperty("updatedDate");
    });

    it("CV entity has all required fields", () => {
      const cv: AssessmentYearRangeCV = mockCVEntity;
      
      expect(cv).toHaveProperty("yearRangeCVId");
      expect(cv).toHaveProperty("fromYear");
      expect(cv).toHaveProperty("toYear");
      expect(cv).toHaveProperty("isActive");
      expect(cv).toHaveProperty("createdDate");
      expect(cv).toHaveProperty("updatedDate");
    });

    it("AssessmentYearRange union type works with both RV and CV", () => {
      const entities: AssessmentYearRange[] = [mockRVEntity, mockCVEntity];
      
      expect(entities).toHaveLength(2);
      expect(getAssessmentYearRangeId(entities[0])).toBe(1);
      expect(getAssessmentYearRangeId(entities[1])).toBe(2);
    });
  });

  describe("Field value types", () => {
    it("fromYear and toYear are numbers", () => {
      expect(typeof mockRVEntity.fromYear).toBe("number");
      expect(typeof mockRVEntity.toYear).toBe("number");
    });

    it("isActive is boolean", () => {
      expect(typeof mockRVEntity.isActive).toBe("boolean");
      expect(typeof mockCVEntity.isActive).toBe("boolean");
    });

    it("createdDate is string", () => {
      expect(typeof mockRVEntity.createdDate).toBe("string");
    });

    it("updatedDate can be null or string", () => {
      expect(mockRVEntity.updatedDate).toBeNull();
      expect(typeof mockCVEntity.updatedDate).toBe("string");
    });
  });
});

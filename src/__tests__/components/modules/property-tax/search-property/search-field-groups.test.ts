import { describe, expect, it } from "vitest";
import {
  applyTabSearchCriteria,
  hasTabSearchInput,
} from "@/components/modules/property-tax/search-property/search-field-groups";
import { INITIAL_SEARCH_CRITERIA } from "@/components/modules/property-tax/search-property/constants";
import type { SearchCriteria } from "@/types/property-search.types";

describe("search-field-groups", () => {
  describe("applyTabSearchCriteria", () => {
    it("clears kyc fields when quick search tab is active", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        upicId: "ABC123",
        holderName: "John Doe",
        mobile: "9876543210",
      };

      const result = applyTabSearchCriteria(criteria, "quick-search");

      expect(result.upicId).toBe("ABC123");
      expect(result.holderName).toBe("");
      expect(result.mobile).toBe("");
    });

    it("clears quick search fields when kyc tab is active", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        upicId: "ABC123",
        holderName: "John Doe",
      };

      const result = applyTabSearchCriteria(criteria, "kyc");

      expect(result.upicId).toBe("");
      expect(result.holderName).toBe("John Doe");
    });
  });

  describe("hasTabSearchInput", () => {
    it("detects quick search input", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        upicId: "ABC123",
      };

      expect(hasTabSearchInput(criteria, "quick-search")).toBe(true);
      expect(hasTabSearchInput(criteria, "kyc")).toBe(false);
    });

    it("detects kyc search input", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        holderName: "John Doe",
      };

      expect(hasTabSearchInput(criteria, "kyc")).toBe(true);
      expect(hasTabSearchInput(criteria, "quick-search")).toBe(false);
    });
  });
});

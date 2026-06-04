import { describe, expect, it } from "vitest";
import { validatePropertySearchCriteria } from "@/lib/validations/property-search.validation";
import {
  getPropertySearchFieldErrors,
  validateSearchFieldValue,
} from "@/lib/validations/property-search-field-rules";
import { sanitizePropertySearchField } from "@/lib/validations/property-search-input-sanitizers";
import { INITIAL_SEARCH_CRITERIA } from "@/components/modules/property-tax/search-property/constants";
import type { SearchCriteria } from "@/types/property-search.types";

const t = (key: string) => key;

describe("property-search-field-rules", () => {
  it("accepts valid property numbers", () => {
    expect(validateSearchFieldValue("propertyNoFrom", "10", t)).toBeNull();
    expect(validateSearchFieldValue("propertyNoFrom", "123456", t)).toBeNull();
  });

  it("rejects invalid property numbers", () => {
    expect(validateSearchFieldValue("propertyNoFrom", "P-2023-001", t)).toBe(
      "propertyNoInvalid"
    );
    expect(validateSearchFieldValue("propertyNoFrom", "10/A", t)).toBe(
      "propertyNoInvalid"
    );
    expect(validateSearchFieldValue("propertyNoFrom", "@123", t)).toBe(
      "propertyNoInvalid"
    );
  });

  it("rejects over-length property numbers", () => {
    const tooLong = "A".repeat(21);
    expect(validateSearchFieldValue("propertyNoFrom", tooLong, t)).toBe(
      "propertyNoInvalid"
    );
  });

  it("validates UPIC ID format", () => {
    expect(validateSearchFieldValue("upicId", "ABC123", t)).toBeNull();
    expect(validateSearchFieldValue("upicId", "ABC-123", t)).toBe(
      "upicIdInvalid"
    );
    expect(validateSearchFieldValue("upicId", "ABC@123", t)).toBe(
      "upicIdInvalid"
    );
  });

  it("validates Old Property No format", () => {
    expect(validateSearchFieldValue("oldPropertyNo", "OLD123", t)).toBeNull();
    expect(validateSearchFieldValue("oldPropertyNo", "OLD-123", t)).toBe(
      "oldPropertyNoInvalid"
    );
    expect(validateSearchFieldValue("oldPropertyNo", "OLD/123", t)).toBe(
      "oldPropertyNoInvalid"
    );
  });

  it("validates sub zone as alphanumeric only", () => {
    expect(validateSearchFieldValue("subZoneNo", "CSN005A", t)).toBeNull();
    expect(validateSearchFieldValue("subZoneNo", "12/3", t)).toBe(
      "subZoneNoInvalid"
    );
  });

  it("validates person names", () => {
    expect(validateSearchFieldValue("holderName", "John Doe", t)).toBeNull();
    expect(validateSearchFieldValue("holderName", "राम प्रसाद", t)).toBeNull();
    expect(validateSearchFieldValue("holderName", "John123", t)).toBe(
      "holderNameInvalid"
    );
  });

  it("validates mobile numbers", () => {
    expect(validateSearchFieldValue("mobile", "9876543210", t)).toBeNull();
    expect(validateSearchFieldValue("mobile", "123", t)).toBe("mobileInvalid");
    expect(validateSearchFieldValue("mobile", "5876543210", t)).toBe(
      "mobileInvalid"
    );
  });

  it("blocks HTML and validates words in address", () => {
    expect(validateSearchFieldValue("address", "<script>alert(1)</script>", t)).toBe(
      "addressInvalid"
    );
    expect(validateSearchFieldValue("address", "Lodha Amara Kolshet Road", t)).toBeNull();
    expect(validateSearchFieldValue("address", "सनराइज को-ऑपरेटिव हाउसिंग सोसायटी", t)).toBeNull();

    // Verify 500 words limit
    const tooManyWords = Array(501).fill("word").join(" ");
    expect(validateSearchFieldValue("address", tooManyWords, t)).toBe(
      "addressInvalid"
    );
  });

  it("validates rateable value format", () => {
    expect(validateSearchFieldValue("rateableValueFrom", "1234", t)).toBeNull();
    expect(validateSearchFieldValue("rateableValueFrom", "123.45", t)).toBe(
      "rateableValueInvalid"
    );
    expect(validateSearchFieldValue("rateableValueFrom", "-100", t)).toBe(
      "rateableValueInvalid"
    );
    expect(validateSearchFieldValue("rateableValueFrom", "+50", t)).toBe(
      "rateableValueInvalid"
    );
  });
});

describe("property-search-input-sanitizers", () => {
  it("strips invalid special characters from property no", () => {
    expect(sanitizePropertySearchField("propertyNoFrom", "P#001")).toBe("001");
    expect(sanitizePropertySearchField("propertyNoFrom", "12/34")).toBe("1234");
  });

  it("limits mobile to digits only", () => {
    expect(sanitizePropertySearchField("mobile", "98ab76543210")).toBe(
      "9876543210"
    );
  });

  it("collapses multiple spaces in names", () => {
    expect(sanitizePropertySearchField("holderName", "John   Doe")).toBe(
      "John Doe"
    );
  });

  it("preserves Devanagari characters in names, societies, and addresses", () => {
    expect(sanitizePropertySearchField("holderName", "राम प्रसाद")).toBe("राम प्रसाद");
    expect(sanitizePropertySearchField("societyName", "सनराइज को-ऑपरेटिव हाउसिंग सोसायटी")).toBe("सनराइज को-ऑपरेटिव हाउसिंग सोसायटी");
    expect(sanitizePropertySearchField("address", "Lodha Amara, Kolshet Road - 400607")).toBe("Lodha Amara, Kolshet Road - 400607");
    expect(sanitizePropertySearchField("address", " Lodha  Amara ")).toBe("Lodha Amara ");
  });

  it("strips invalid characters from rateable value", () => {
    expect(sanitizePropertySearchField("rateableValueFrom", "-123")).toBe("123");
    expect(sanitizePropertySearchField("rateableValueTo", "45.67")).toBe("4567");
    expect(sanitizePropertySearchField("rateableValueFrom", "+5e3")).toBe("53");
  });
});

describe("property-search.validation", () => {
  describe("validatePropertySearchCriteria", () => {
    it("requires zone when ward is selected", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        wardId: 5,
      };

      const result = validatePropertySearchCriteria(criteria, "quick-search", t);

      expect(result).toEqual({ valid: false, message: "wardRequiresZone" });
    });

    it("rejects quick search when propertyNoTo is set without propertyNoFrom", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        propertyNoTo: "100",
      };

      const result = validatePropertySearchCriteria(criteria, "quick-search", t);

      expect(result).toEqual({ valid: false, message: "propertyNoFromRequired" });
    });

    it("rejects invalid property number range", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        propertyNoFrom: "200",
        propertyNoTo: "100",
      };

      const result = validatePropertySearchCriteria(criteria, "quick-search", t);

      expect(result).toEqual({ valid: false, message: "propertyNoRangeInvalid" });
    });

    it("rejects invalid mobile on kyc tab", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        mobile: "123",
      };

      const result = validatePropertySearchCriteria(criteria, "kyc", t);

      expect(result).toEqual({ valid: false, message: "mobileInvalid" });
    });

    it("requires at least one active search field", () => {
      const result = validatePropertySearchCriteria(
        INITIAL_SEARCH_CRITERIA,
        "quick-search",
        t
      );

      expect(result).toEqual({ valid: false, message: "noSearchCriteria" });
    });

    it("accepts a stat-card status filter without other criteria", () => {
      const result = validatePropertySearchCriteria(
        INITIAL_SEARCH_CRITERIA,
        "quick-search",
        t,
        "Register Property"
      );

      expect(result).toEqual({ valid: true });
    });

    it("accepts valid quick search criteria", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        upicId: "ABC123",
      };

      const result = validatePropertySearchCriteria(criteria, "quick-search", t);

      expect(result).toEqual({ valid: true });
    });

    it("accepts valid kyc search criteria", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        holderName: "John Doe",
      };

      const result = validatePropertySearchCriteria(criteria, "kyc", t);

      expect(result).toEqual({ valid: true });
    });

    it("returns field errors for invalid quick search input", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        upicId: "bad@id",
      };

      const errors = getPropertySearchFieldErrors(criteria, "quick-search", t);

      expect(errors.upicId).toBe("upicIdInvalid");
    });

    it("returns field errors for invalid values-dues input", () => {
      const criteria: SearchCriteria = {
        ...INITIAL_SEARCH_CRITERIA,
        rateableValueFrom: "bad-value",
      };

      const errors = getPropertySearchFieldErrors(criteria, "values-dues", t);

      expect(errors.rateableValueFrom).toBe("rateableValueInvalid");
    });
  });
});

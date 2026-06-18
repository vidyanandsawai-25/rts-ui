import { describe, expect, it } from "vitest";
import {
  isPropertySearchApiItem,
  normalizePropertySearchItem,
  normalizePropertySearchResponse,
} from "@/lib/api/property-search/guards/property-item-guards";

describe("property-item-guards", () => {
  it("accepts PropertyId and Id aliases from the API", () => {
    expect(isPropertySearchApiItem({ PropertyId: 42, PropertyNo: "P-1" })).toBe(
      true
    );
    expect(isPropertySearchApiItem({ Id: 7, propertyNo: "P-2" })).toBe(true);
  });

  it("normalizes envelope responses with PascalCase item fields", () => {
    const result = normalizePropertySearchResponse({
      success: true,
      items: {
        Items: [
          {
            PropertyId: 101,
            UpicId: "UPIC-101",
            ZoneName: "East",
            WardName: "Ward 01",
            PropertyNo: "P-2023-001",
            PartitionNo: "0",
          },
        ],
        TotalCount: 1,
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      propertyId: 101,
      id: "UPIC-101",
      upicId: "UPIC-101",
      zone: "East",
      ward: "Ward 01",
      propertyNo: "P-2023-001",
    });
  });

  it("keeps missing text fields as empty strings, not display placeholders", () => {
    const result = normalizePropertySearchItem({
      propertyId: 202,
      upicId: "UPIC-202",
      zoneName: null,
      wardName: "  ",
      propertyNo: null,
      partitionNo: "",
    });

    expect(result.upicId).toBe("UPIC-202");
    expect(result.zone).toBe("");
    expect(result.ward).toBe("");
    expect(result.propertyNo).toBe("");
    expect(result.partitionNo).toBe("");
    expect(result.zone).not.toBe("-");
    expect(result.ward).not.toBe("-");
    expect(result.propertyNo).not.toBe("-");
    expect(result.partitionNo).not.toBe("-");
  });

  it("normalizes scientific notation and decimal mobile numbers", () => {
    const result1 = normalizePropertySearchItem({
      propertyId: 301,
      mobile: "9.93027e+009",
    });
    expect(result1.mobile).toBe("9930270000");

    const result2 = normalizePropertySearchItem({
      propertyId: 302,
      mobile: "9930270000.0",
    });
    expect(result2.mobile).toBe("9930270000");

    const result3 = normalizePropertySearchItem({
      propertyId: 303,
      mobile: "9930270000",
    });
    expect(result3.mobile).toBe("9930270000");

    const result4 = normalizePropertySearchItem({
      propertyId: 304,
      mobile: "N/A",
    });
    expect(result4.mobile).toBe("N/A");
  });

  it("normalizes scientific notation and decimal numbers for all text fields", () => {
    const result = normalizePropertySearchItem({
      propertyId: 401,
      propertyNo: "1.2345e+004",
      citySurveyNo: "789.00",
      partitionNo: "12.3",
      address: "123 Main St. Bldg 4.0",
    });
    expect(result.propertyNo).toBe("12345");
    expect(result.citySurveyNo).toBe("789");
    expect(result.partitionNo).toBe("12.3");
    expect(result.address).toBe("123 Main St. Bldg 4.0");
  });
});

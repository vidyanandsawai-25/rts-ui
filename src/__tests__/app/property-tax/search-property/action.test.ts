import { describe, it, expect, vi, beforeEach } from "vitest";
import { filterPropertiesAction } from "@/app/[locale]/property-tax/search-property/action";
import { searchProperties } from "@/lib/api/property-search";
import type { SearchResult } from "@/types/property-search.types";
import { INITIAL_SEARCH_CRITERIA } from "@/components/modules/property-tax/search-property/constants";

// Mock the API client
vi.mock("@/lib/api/property-search", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/property-search")>();
  return {
    ...actual,
    searchProperties: vi.fn(),
  };
});

describe("filterPropertiesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should keep property 10-C when searching for 10-C", async () => {
    const mockResults: SearchResult[] = [
      {
        id: "prop-1",
        propertyId: 1,
        upicId: "UPIC001",
        zone: "Z1",
        ward: "W1",
        propertyNo: "10",
        partitionNo: "0",
        oldPropertyNo: "",
        citySurveyNo: "",
        plotNo: "",
        wingFlatNo: "",
        propertyCount: 1,
        category: "Residential",
        description: "",
        mobile: "",
        alternateMobile: "",
        holderName: "John",
        holderNameMarathi: "",
        occupierName: "",
        occupierNameMarathi: "",
        shopBuildingName: "",
        societyName: "",
        address: "",
        rv: 1000,
        cv: null,
        totalTax: 100,
        status: "Register Property",
      },
      {
        id: "prop-2",
        propertyId: 2,
        upicId: "UPIC002",
        zone: "Z1",
        ward: "W1",
        propertyNo: "10",
        partitionNo: "C",
        oldPropertyNo: "",
        citySurveyNo: "",
        plotNo: "",
        wingFlatNo: "",
        propertyCount: 1,
        category: "Residential",
        description: "",
        mobile: "",
        alternateMobile: "",
        holderName: "Jane",
        holderNameMarathi: "",
        occupierName: "",
        occupierNameMarathi: "",
        shopBuildingName: "",
        societyName: "",
        address: "",
        rv: 2000,
        cv: null,
        totalTax: 200,
        status: "Register Property",
      },
    ];

    vi.mocked(searchProperties).mockResolvedValue({
      items: mockResults,
      totalCount: 2,
      pageNumber: 1,
      pageSize: -1,
      totalPages: 1,
      hasPrevious: false,
      hasNext: false,
    });

    const criteria = {
      ...INITIAL_SEARCH_CRITERIA,
      propertyNoFrom: "10-C",
      propertyNoTo: "",
    };

    const response = await filterPropertiesAction(null, criteria, true, "quick-search");

    expect(response.error).toBeNull();
    expect(response.results).toHaveLength(1);
    expect(response.results[0].propertyNo).toBe("10");
    expect(response.results[0].partitionNo).toBe("C");
  });
});

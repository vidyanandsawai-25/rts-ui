import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { usePropertyAmenityData } from "@/components/modules/property-tax/zone-master/properties/components/hooks/usePropertyAmenityData";
import {
  fetchSocietyDetailsByPropertyAction,
  getSocietyAmenityDetailsAction,
} from "@/app/[locale]/property-tax/zone-master/actions";
import { SocietyDetailItem } from "@/types/zone-master/properties/societyDetails.types";

// Mock actions
vi.mock("@/app/[locale]/property-tax/zone-master/actions", () => ({
  fetchSocietyDetailsByPropertyAction: vi.fn(),
  getSocietyAmenityDetailsAction: vi.fn(),
}));

describe("usePropertyAmenityData", () => {
  const mockWings: Partial<SocietyDetailItem>[] = [
    {
      id: 10,
      propertyId: 1,
      wingId: 1,
      wingName: "Wing AAA",
    },
    {
      id: 11,
      propertyId: 1,
      wingId: null as any,
      wingName: "Building Society",
    },
    {
      id: 12,
      propertyId: 1,
      wingId: undefined as any,
      wingName: "Wing BBB",
    },
    {
      id: 13,
      propertyId: 1,
      wingId: "null" as any,
      wingName: "Wing CCC",
    },
    {
      id: 14,
      propertyId: 1,
      wingId: 2,
      wingName: null as any,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should format wingOptions correctly and handle null/undefined/null-string wingId and wingName", async () => {
    vi.mocked(fetchSocietyDetailsByPropertyAction).mockResolvedValue({
      success: true,
      data: {
        items: mockWings as SocietyDetailItem[],
        totalCount: mockWings.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
      },
    });

    const { result } = renderHook(() => usePropertyAmenityData({ propertyId: "1" }));

    await waitFor(() => {
      expect(result.current.wingsLoading).toBe(false);
    });

    expect(fetchSocietyDetailsByPropertyAction).toHaveBeenCalledWith(1);
    expect(result.current.wingOptions).toEqual([
      { label: "1 - Wing AAA", value: "10" },
      { label: "Building Society", value: "11" },
      { label: "Wing BBB", value: "12" },
      { label: "Wing CCC", value: "13" },
      { label: "2", value: "14" },
    ]);
  });
});

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePropertySearchResults } from "@/hooks/property-search/usePropertySearchResults";
import type { SearchResult } from "@/types/property-search.types";

function makeResult(id: string, propertyId = 1): SearchResult {
  return {
    id,
    propertyId,
    upicId: "",
    zone: "",
    ward: "",
    propertyNo: "",
    partitionNo: "",
    oldPropertyNo: "",
    citySurveyNo: "",
    plotNo: "",
    wingFlatNo: "",
    propertyCount: 0,
    category: "",
    description: "",
    mobile: "",
    alternateMobile: "",
    holderName: "",
    holderNameMarathi: "",
    occupierName: "",
    occupierNameMarathi: "",
    shopBuildingName: "",
    societyName: "",
    address: "",
    rv: 0,
    cv: null,
    totalTax: 0,
    status: "Register Property",
  };
}

describe("usePropertySearchResults", () => {
  it("resets page number when the result set identity changes", () => {
    const firstPage = Array.from({ length: 15 }, (_, index) =>
      makeResult(`a-${index + 1}`)
    );
    const secondPage = Array.from({ length: 15 }, (_, index) =>
      makeResult(`b-${index + 1}`)
    );

    const { result, rerender } = renderHook(
      ({ results }) => usePropertySearchResults({ results }),
      { initialProps: { results: firstPage } }
    );

    act(() => {
      result.current.handlePageChange(2);
    });
    expect(result.current.pageNumber).toBe(2);

    rerender({ results: secondPage });
    expect(result.current.pageNumber).toBe(1);
  });

  it("keeps page number when the same result set is re-rendered", () => {
    const results = Array.from({ length: 15 }, (_, index) =>
      makeResult(`a-${index + 1}`)
    );

    const { result, rerender } = renderHook(
      ({ results: currentResults }) =>
        usePropertySearchResults({ results: currentResults }),
      { initialProps: { results } }
    );

    act(() => {
      result.current.handlePageChange(2);
    });
    expect(result.current.pageNumber).toBe(2);

    rerender({ results: [...results] });
    expect(result.current.pageNumber).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import { buildPropertySearchPayload } from "@/lib/api/property-search/build-search-payload";
import { INITIAL_SEARCH_CRITERIA } from "@/components/modules/property-tax/search-property/constants";

describe("buildPropertySearchPayload", () => {
  it("maps property type to PropertyAssessmentStatusId", () => {
    const payload = buildPropertySearchPayload(
      null,
      { ...INITIAL_SEARCH_CRITERIA, propertyType: "1" },
      true,
      "quick-search"
    );

    expect(payload.propertyAssessmentStatusId).toBe(1);
    expect(payload.dashboardFilter).toBe(0);
    expect(payload.pageSize).toBe(-1);
  });

  it("does not send dashboard filter from type filter when assessment status is selected", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        propertyType: "1",
        typeFilter: "surveyCompleted",
      },
      true,
      "quick-search"
    );

    expect(payload.propertyAssessmentStatusId).toBe(1);
    expect(payload.dashboardFilter).toBe(0);
  });

  it("still maps type filter to dashboard filter when assessment status is not selected", () => {
    const payload = buildPropertySearchPayload(
      null,
      { ...INITIAL_SEARCH_CRITERIA, typeFilter: "surveyCompleted" },
      true,
      "quick-search"
    );

    expect(payload.propertyAssessmentStatusId).toBeUndefined();
    expect(payload.dashboardFilter).toBe(3);
  });
});

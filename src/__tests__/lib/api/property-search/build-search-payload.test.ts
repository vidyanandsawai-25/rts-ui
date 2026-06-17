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

  it("maps values-dues top RV search to RVorCV, AmountFilterOperator, and TopCount", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        rateableValueFilter: "top",
        rateableValueFrom: "1",
      },
      true,
      "values-dues"
    );

    expect(payload.rvOrCv).toBe("RV");
    expect(payload.amountFilterOperator).toBe("top");
    expect(payload.topCount).toBe(1);
    expect(payload.amountValue).toBeUndefined();
    expect(payload.pageSize).toBe(-1);
    expect(payload.pageNumber).toBe(1);
  });

  it("defaults TopCount to 1 when top filter has no count", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        rateableValueFilter: "top",
        rateableValueFrom: "",
      },
      true,
      "values-dues"
    );

    expect(payload.topCount).toBe(1);
  });

  it("maps values-dues exact search to AmountFilterOperator=Equals and AmountValue", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        rateableValueFilter: "exact",
        rateableValueFrom: "1224880",
      },
      true,
      "values-dues"
    );

    expect(payload.amountFilterOperator).toBe("Equals");
    expect(payload.amountValue).toBe(1224880);
    expect(payload.rvOrCv).toBe("RV");
    expect(payload.pageSize).toBe(-1);
    expect(payload.pageNumber).toBe(1);
  });

  it("handles commas and decimals in rateableValue values-dues payload building", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        rateableValueFilter: "exact",
        rateableValueFrom: "1,07,45,17,92,073.64",
      },
      true,
      "values-dues"
    );

    expect(payload.amountValue).toBe(107451792073.64);
  });

  it("maps values-dues between search to AmountValue and AmountTo only", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        rateableValueFilter: "between",
        rateableValueFrom: "1224866",
        rateableValueTo: "1224874",
      },
      true,
      "values-dues"
    );

    expect(payload.amountValue).toBe(1224866);
    expect(payload.amountTo).toBe(1224874);
    expect(payload.rvOrCv).toBe("RV");
    expect(payload.amountFilterOperator).toBeUndefined();
    expect(payload.pageSize).toBe(-1);
    expect(payload.pageNumber).toBe(1);
  });

  it("omits propertyNoFrom and propertyNoTo from payload when they are different (range search)", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        propertyNoFrom: "50",
        propertyNoTo: "100",
      },
      true,
      "quick-search"
    );

    expect(payload.propertyNoFrom).toBeUndefined();
    expect(payload.propertyNoTo).toBeUndefined();
  });

  it("keeps propertyNoFrom and propertyNoTo in payload when only propertyNoFrom is provided", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        propertyNoFrom: "100",
        propertyNoTo: "",
      },
      true,
      "quick-search"
    );

    expect(payload.propertyNoFrom).toBe("100");
    expect(payload.propertyNoTo).toBe("100");
  });

  it("keeps propertyNoFrom and propertyNoTo in payload when they are equal", () => {
    const payload = buildPropertySearchPayload(
      null,
      {
        ...INITIAL_SEARCH_CRITERIA,
        propertyNoFrom: "100",
        propertyNoTo: "100",
      },
      true,
      "quick-search"
    );

    expect(payload.propertyNoFrom).toBe("100");
    expect(payload.propertyNoTo).toBe("100");
  });
});

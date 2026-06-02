import {
  applyTabSearchCriteria,
} from "@/components/modules/property-tax/search-property/search-field-groups";
import type { PropertySearchCriteriaPayload } from "@/types/property-search-api.types";
import type {
  PropertyStatus,
  SearchCriteria,
  SearchTab,
} from "@/types/property-search.types";
import {
  getDashboardFilterForStatus,
  getDashboardFilterForTypeFilter,
} from "./dashboard-filter";

function normalizeMobileForApi(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  return digits || undefined;
}

/** UI filter keys ΓåÆ .NET `AmountFilterOperator` query values. */
const AMOUNT_FILTER_OPERATOR_BY_UI: Record<string, string> = {
  exact: "Equals",
  moreThan: "GreaterThan",
  lessThan: "LessThan",
  top: "top",
};

function resolveValuesDuesRvOrCv(
  criteria: SearchCriteria
): PropertySearchCriteriaPayload["rvOrCv"] | undefined {
  if (criteria.rateableValueFilter.trim() !== "") {
    return "RV";
  }
  return undefined;
}

function getValuesDuesAmountFields(criteria: SearchCriteria): {
  filterType: string;
  amountFrom: string;
  amountTo: string;
} {
  return {
    filterType: criteria.rateableValueFilter,
    amountFrom: criteria.rateableValueFrom,
    amountTo: criteria.rateableValueTo,
  };
}

function parsePositiveNumber(value: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseAmount(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Client-side table pagination: request all rows from the API. */
function withUnpagedResults(
  payload: PropertySearchCriteriaPayload
): PropertySearchCriteriaPayload {
  return { ...payload, pageNumber: 1, pageSize: -1 };
}

function resolveDashboardFilter(
  selectedStatus: PropertyStatus | null,
  typeFilter: string,
  hasPropertyAssessmentStatus: boolean
): number {
  // Assessment status uses PropertyAssessmentStatusId — do not combine with dashboard filters.
  if (hasPropertyAssessmentStatus) {
    return 0;
  }
  return (
    getDashboardFilterForStatus(selectedStatus) ||
    getDashboardFilterForTypeFilter(typeFilter)
  );
}

/**
 * Maps UI search criteria to the .NET `/Property/search` query payload.
 * Only fields for the active tab are forwarded.
 */
export function buildPropertySearchPayload(
  selectedStatus: PropertyStatus | null,
  searchCriteria: SearchCriteria,
  isSearchActive: boolean,
  activeTab: SearchTab
): PropertySearchCriteriaPayload {
  const propertyAssessmentStatusId = parseInt(searchCriteria.propertyType, 10);
  const hasPropertyAssessmentStatus =
    Number.isFinite(propertyAssessmentStatusId) &&
    propertyAssessmentStatusId > 0;

  const payload: PropertySearchCriteriaPayload = {
    zoneId: searchCriteria.zoneId || undefined,
    wardId: searchCriteria.wardId || undefined,
    dashboardFilter: resolveDashboardFilter(
      selectedStatus,
      searchCriteria.typeFilter,
      hasPropertyAssessmentStatus
    ),
  };

  const categoryId = parseInt(searchCriteria.propertyDescription, 10);
  if (Number.isFinite(categoryId) && categoryId > 0) {
    payload.categoryId = categoryId;
  }

  if (hasPropertyAssessmentStatus) {
    payload.propertyAssessmentStatusId = propertyAssessmentStatusId;
  }

  if (!isSearchActive) {
    return withUnpagedResults(payload);
  }

  const criteria = applyTabSearchCriteria(searchCriteria, activeTab);

  if (activeTab === "quick-search") {
    return withUnpagedResults({
      ...payload,
      propertyNoFrom: criteria.propertyNoFrom || undefined,
      propertyNoTo: criteria.propertyNoTo || undefined,
      oldPropertyNo: criteria.oldPropertyNo || undefined,
      upicId: criteria.upicId || undefined,
      citySurveyNo: criteria.citySurveyNo || undefined,
      subZoneNo: criteria.subZoneNo || undefined,
      plotNo: criteria.plotNo || undefined,
    });
  }

  if (activeTab === "values-dues") {
    const rvOrCv = resolveValuesDuesRvOrCv(criteria);
    const { filterType, amountFrom, amountTo } = getValuesDuesAmountFields(criteria);

    const valuesPayload: PropertySearchCriteriaPayload = {
      ...payload,
      rvOrCv,
    };

    if (!filterType) {
      return withUnpagedResults(valuesPayload);
    }

    if (filterType === "between") {
      const amountValue = parseAmount(amountFrom);
      const amountToValue = parseAmount(amountTo);
      if (amountValue == null || amountToValue == null) {
        return withUnpagedResults(valuesPayload);
      }
      // Between: AmountValue + AmountTo (no AmountFilterOperator).
      return withUnpagedResults({
        ...valuesPayload,
        amountValue,
        amountTo: amountToValue,
      });
    }

    if (filterType === "exact") {
      const amountValue = parseAmount(amountFrom);
      if (amountValue == null) {
        return withUnpagedResults(valuesPayload);
      }
      // Exact Value (UI) ΓåÆ AmountFilterOperator=Equals + AmountValue.
      return withUnpagedResults({
        ...valuesPayload,
        amountFilterOperator: "Equals",
        amountValue,
      });
    }

    const operator = AMOUNT_FILTER_OPERATOR_BY_UI[filterType];
    if (operator) {
      valuesPayload.amountFilterOperator = operator;
    }

    if (filterType === "top") {
      valuesPayload.topCount = parsePositiveNumber(amountFrom) ?? 1;
      return withUnpagedResults(valuesPayload);
    }

    const amountValue = parseAmount(amountFrom);
    if (amountValue != null) {
      valuesPayload.amountValue = amountValue;
    }

    return withUnpagedResults(valuesPayload);
  }

  return withUnpagedResults({
    ...payload,
    holderName: criteria.holderName || undefined,
    occupierName: criteria.occupierName || undefined,
    mobile: normalizeMobileForApi(criteria.mobile),
    shopBuildingName: criteria.shopBuildingName || undefined,
    societyName: criteria.societyName || undefined,
    address: criteria.address || undefined,
  });
}

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
    pageNumber: 1,
    pageSize: -1,
  };

  const categoryId = parseInt(searchCriteria.propertyDescription, 10);
  if (Number.isFinite(categoryId) && categoryId > 0) {
    payload.categoryId = categoryId;
  }

  if (hasPropertyAssessmentStatus) {
    payload.propertyAssessmentStatusId = propertyAssessmentStatusId;
  }

  if (!isSearchActive) {
    return payload;
  }

  const criteria = applyTabSearchCriteria(searchCriteria, activeTab);

  if (activeTab === "quick-search") {
    return {
      ...payload,
      propertyNoFrom: criteria.propertyNoFrom || undefined,
      propertyNoTo: criteria.propertyNoTo || undefined,
      oldPropertyNo: criteria.oldPropertyNo || undefined,
      upicId: criteria.upicId || undefined,
      citySurveyNo: criteria.citySurveyNo || undefined,
      subZoneNo: criteria.subZoneNo || undefined,
      plotNo: criteria.plotNo || undefined,
    };
  }

  return {
    ...payload,
    holderName: criteria.holderName || undefined,
    occupierName: criteria.occupierName || undefined,
    mobile: normalizeMobileForApi(criteria.mobile),
    shopBuildingName: criteria.shopBuildingName || undefined,
    societyName: criteria.societyName || undefined,
    address: criteria.address || undefined,
  };
}

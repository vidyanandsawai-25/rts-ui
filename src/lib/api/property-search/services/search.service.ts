/**
 * Property search + dashboard stats services.
 */

import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { createLogger } from "@/lib/utils/server-logger";
import type { PagedResponse } from "@/types/common.types";
import type { PropertySearchCriteriaPayload } from "@/types/property-search-api.types";
import type {
  PropertyStatsData,
  SearchResult,
} from "@/types/property-search.types";
import { normalizePropertySearchResponse } from "../guards/property-item-guards";
import { normalizeDashboardStatsResponse } from "../guards/dashboard-stats-guards";

const logger = createLogger("property-search/search");

function buildSearchParams(criteria: PropertySearchCriteriaPayload): string {
  const params = new URLSearchParams();
  if (criteria.zoneId) params.set("ZoneId", String(criteria.zoneId));
  if (criteria.wardId) params.set("WardId", String(criteria.wardId));
  if (criteria.categoryId) params.set("CategoryId", String(criteria.categoryId));
  if (criteria.propertyAssessmentStatusId) {
    params.set(
      "PropertyAssessmentStatusId",
      String(criteria.propertyAssessmentStatusId)
    );
  }
  if (criteria.propertyNoFrom)
    params.set("PropertyNoFrom", criteria.propertyNoFrom);
  if (criteria.propertyNoTo) params.set("PropertyNoTo", criteria.propertyNoTo);
  if (criteria.oldPropertyNo)
    params.set("OldPropertyNo", criteria.oldPropertyNo);
  if (criteria.upicId) params.set("UPICId", criteria.upicId);
  if (criteria.citySurveyNo) params.set("CSN", criteria.citySurveyNo);
  if (criteria.subZoneNo) params.set("SubZoneNo", criteria.subZoneNo);
  if (criteria.plotNo) params.set("PlotNo", criteria.plotNo);
  if (criteria.holderName) params.set("OwnerName", criteria.holderName);
  if (criteria.occupierName) params.set("OccupierName", criteria.occupierName);
  if (criteria.mobile) params.set("MobileNo", criteria.mobile);
  if (criteria.shopBuildingName)
    params.set("FlatOrShopName", criteria.shopBuildingName);
  if (criteria.societyName) params.set("SocietyName", criteria.societyName);
  if (criteria.address) params.set("Address", criteria.address);
  if (criteria.dashboardFilter != null && criteria.dashboardFilter > 0) {
    params.set("DashboardFilter", String(criteria.dashboardFilter));
  }
  if (criteria.valuationMethod) params.set("ValuationMethod", criteria.valuationMethod);
  if (criteria.equals) params.set("Equals", criteria.equals);
  if (criteria.greaterThan) params.set("GreaterThan", criteria.greaterThan);
  if (criteria.lessThan) params.set("LessThan", criteria.lessThan);
  if (criteria.between) params.set("Between", criteria.between);
  if (criteria.top) params.set("Top", criteria.top);
  if (criteria.pageNumber) params.set("PageNumber", String(criteria.pageNumber));
  if (criteria.pageSize != null)
    params.set("PageSize", String(criteria.pageSize));
  return params.toString();
}

export async function searchProperties(
  criteria: PropertySearchCriteriaPayload
): Promise<PagedResponse<SearchResult>> {
  const response = await apiClient.get<unknown>(
    `/Property/search?${buildSearchParams(criteria)}`
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || "Failed to search properties",
      "Property search failed"
    );
  }

  return normalizePropertySearchResponse(response.data);
}

export async function fetchPropertyStats(): Promise<PropertyStatsData[]> {
  try {
    const response = await apiClient.get<unknown>(
      "/Property/search/dashboard-stats"
    );

    if (!response.success || response.data == null) {
      logger.warn("Dashboard stats request failed", {
        statusCode: response.statusCode,
      });
      return [];
    }

    return normalizeDashboardStatsResponse(response.data);
  } catch (error) {
    logger.error("Failed to fetch property stats", { error: error as Error });
    return [];
  }
}

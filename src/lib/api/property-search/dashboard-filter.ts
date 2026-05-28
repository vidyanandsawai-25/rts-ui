import {
  TYPE_FILTER_OPTIONS,
  type TypeFilterOption,
} from "@/components/modules/property-tax/search-property/constants";
import type { PropertyStatus } from "@/types/property-search.types";

/** Maps stat-card labels to `/Property/search` DashboardFilter query values. */
export const DASHBOARD_FILTER_BY_STATUS: Record<PropertyStatus, number> = {
  "Register Property": 1,
  "Geo-Sequencing": 2,
  "Survey": 3,
  "Data Processing": 4,
  "Quality Analysis": 5,
  "Assessment Completed": 6,
};

export function getDashboardFilterForStatus(
  status: PropertyStatus | null
): number {
  if (status && status in DASHBOARD_FILTER_BY_STATUS) {
    return DASHBOARD_FILTER_BY_STATUS[status];
  }
  return 0;
}

const TYPE_FILTER_DASHBOARD_MAP: Record<TypeFilterOption, number> = {
  surveyCompleted: DASHBOARD_FILTER_BY_STATUS.Survey,
  dataEntryCompleted: DASHBOARD_FILTER_BY_STATUS["Data Processing"],
  qcCompleted: DASHBOARD_FILTER_BY_STATUS["Quality Analysis"],
  noticeDistributed: DASHBOARD_FILTER_BY_STATUS["Assessment Completed"],
};

/** Maps the Type Filter dropdown to `/Property/search` DashboardFilter values. */
export function getDashboardFilterForTypeFilter(typeFilter: string): number {
  if (
    typeFilter &&
    (TYPE_FILTER_OPTIONS as readonly string[]).includes(typeFilter)
  ) {
    return TYPE_FILTER_DASHBOARD_MAP[typeFilter as TypeFilterOption];
  }
  return 0;
}

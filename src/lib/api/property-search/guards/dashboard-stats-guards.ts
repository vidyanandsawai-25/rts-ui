/**
 * Dashboard stats type guards and normalization for the Property Search
 * stat cards (`/Property/search/dashboard-stats`).
 */

import type {
  PropertyDashboardStatsApiItem,
  PropertyDashboardStatsApiResponse,
} from "@/types/property-search-api.types";
import type {
  PropertyStatsData,
  PropertyStatus,
} from "@/types/property-search.types";

function toCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function isPropertyDashboardStatsApiItem(
  value: unknown
): value is PropertyDashboardStatsApiItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    "registeredPropertyCount" in obj &&
    "geoSequencingPropertyCount" in obj &&
    "surveyPropertyCount" in obj &&
    ("dataProcessingPropertyCount" in obj || "otherPropertyCount" in obj) &&
    ("qualityAnalysisPropertyCount" in obj || "unassessedPropertyCount" in obj) &&
    ("assessmentCompletedPropertyCount" in obj || "assessedPropertyCount" in obj)
  );
}

function normalizeDashboardStatsItem(
  data: Record<string, unknown>
): PropertyDashboardStatsApiItem {
  return {
    registeredPropertyCount: toCount(data.registeredPropertyCount),
    geoSequencingPropertyCount: toCount(data.geoSequencingPropertyCount),
    surveyPropertyCount: toCount(data.surveyPropertyCount),
    dataProcessingPropertyCount: toCount(
      data.dataProcessingPropertyCount ?? data.otherPropertyCount
    ),
    qualityAnalysisPropertyCount: toCount(
      data.qualityAnalysisPropertyCount ?? data.unassessedPropertyCount
    ),
    assessmentCompletedPropertyCount: toCount(
      data.assessmentCompletedPropertyCount ?? data.assessedPropertyCount
    ),
  };
}

const DASHBOARD_STATS_CARD_MAP: ReadonlyArray<{
  label: PropertyStatus;
  key: keyof PropertyDashboardStatsApiItem;
}> = [
  { label: "Register Property", key: "registeredPropertyCount" },
  { label: "Geo-Sequencing", key: "geoSequencingPropertyCount" },
  { label: "Survey", key: "surveyPropertyCount" },
  { label: "Data Processing", key: "dataProcessingPropertyCount" },
  { label: "Quality Analysis", key: "qualityAnalysisPropertyCount" },
  { label: "Assessment Completed", key: "assessmentCompletedPropertyCount" },
];

export function normalizeDashboardStatsResponse(
  data: unknown
): PropertyStatsData[] {
  let statsItem: PropertyDashboardStatsApiItem | null = null;

  if (isPropertyDashboardStatsApiItem(data)) {
    statsItem = normalizeDashboardStatsItem(
      data as unknown as Record<string, unknown>
    );
  } else if (
    typeof data === "object" &&
    data !== null &&
    isPropertyDashboardStatsApiItem(
      (data as PropertyDashboardStatsApiResponse).items
    )
  ) {
    const envelope = data as PropertyDashboardStatsApiResponse;
    if (envelope.success === false) {
      return [];
    }
    statsItem = normalizeDashboardStatsItem(
      envelope.items as unknown as Record<string, unknown>
    );
  }

  if (!statsItem) {
    return [];
  }

  return DASHBOARD_STATS_CARD_MAP.map(({ label, key }) => ({
    label,
    value: String(statsItem![key]),
  }));
}

"use server";

import type {
  PropertyStatsData,
  PropertyStatus,
  SearchCriteria,
  SearchResult,
  SearchTab,
} from "@/types/property-search.types";
import type {
  ZoneApiResponse,
  WardApiResponse,
  LookupOptionsApiResponse,
} from "@/types/property-search-api.types";
import type { PropertyAssessmentStatusOption } from "@/types/property-assessment-status.types";
import type { PropertyTypeCategory } from "@/types/property-type-category.types";
import { getPropertyAssessmentStatuses } from "@/lib/api/property-assessment-status.service";
import { getPropertyTypeCategories } from "@/lib/api/property-type-category.service";
import { buildPropertySearchPayload } from "@/lib/api/property-search/build-search-payload";
import {
  fetchPropertyStats,
  searchProperties,
  fetchLookupOptions,
  fetchWardsByZone,
  fetchZones,
} from "@/lib/api/property-search";
import { resolveSearchErrorMessage } from "@/lib/api/property-search/resolve-search-error-message";

/* ================= CONSTANTS ================= */

const DEFAULT_STATS: PropertyStatsData[] = [
  { label: "Register Property", value: "0" },
  { label: "Geo-Sequencing", value: "0" },
  { label: "Survey", value: "0" },
  { label: "Data Processing", value: "0" },
  { label: "Quality Analysis", value: "0" },
  { label: "Assessment Completed", value: "0" },
];

function parsePositiveInteger(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseNumericPart(value: string): number | null {
  const match = value.match(/^\d+/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function comparePropertyNo(a: string, b: string): number {
  const cleanA = a.trim();
  const cleanB = b.trim();

  const numA = parseNumericPart(cleanA);
  const numB = parseNumericPart(cleanB);

  if (numA !== null && numB !== null) {
    if (numA !== numB) {
      return numA - numB;
    }
    return cleanA.localeCompare(cleanB, undefined, { numeric: true, sensitivity: "base" });
  }

  if (numA !== null) return -1;
  if (numB !== null) return 1;

  return cleanA.localeCompare(cleanB, undefined, { numeric: true, sensitivity: "base" });
}

function filterByPropertyNumberRange(
  results: SearchResult[],
  searchCriteria: SearchCriteria
): SearchResult[] {
  const from = parsePositiveInteger(searchCriteria.propertyNoFrom);
  let to = parsePositiveInteger(searchCriteria.propertyNoTo);

  if (from != null && to == null) {
    to = from;
  }

  if (from == null && to == null) {
    return results;
  }

  return results.filter((item) => {
    const propertyNo = parseNumericPart(item.propertyNo || "");
    if (propertyNo == null) {
      return false;
    }

    if (from != null && propertyNo < from) {
      return false;
    }

    if (to != null && propertyNo > to) {
      return false;
    }

    return true;
  });
}

/* ================= ZONE / WARD / LOOKUP ================= */

export async function listZonesAction(): Promise<ZoneApiResponse[]> {
  return fetchZones();
}

export async function listWardsByZoneAction(
  zoneId: number
): Promise<WardApiResponse[]> {
  const resolvedZoneId = Number(zoneId);
  if (!Number.isFinite(resolvedZoneId) || resolvedZoneId <= 0) {
    return [];
  }
  return fetchWardsByZone(resolvedZoneId);
}

export async function listLookupOptionsAction(
  zoneId?: number | null,
  wardId?: number | null
): Promise<LookupOptionsApiResponse> {
  return fetchLookupOptions(zoneId, wardId);
}

export async function listPropertyAssessmentStatusesAction(): Promise<
  PropertyAssessmentStatusOption[]
> {
  try {
    const statuses = await getPropertyAssessmentStatuses();
    return statuses
      .filter((status) => status.isActive)
      .sort((a, b) => a.statusName.localeCompare(b.statusName, "en"))
      .map((status) => ({
        id: status.id,
        label: formatAssessmentStatusLabel(status.statusName),
      }));
  } catch {
    return [];
  }
}

function formatAssessmentStatusLabel(statusName: string): string {
  return statusName
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export async function listPropertyTypeCategoriesAction(): Promise<
  PropertyTypeCategory[]
> {
  try {
    const categories = await getPropertyTypeCategories();
    return categories
      .filter((category) => category.isActive)
      .sort((a, b) =>
        a.propertyTypeCategory.localeCompare(b.propertyTypeCategory, "mr")
      );
  } catch {
    return [];
  }
}

/* ================= MAIN SEARCH ================= */

/**
 * Wraps the .NET `/api/Property/search` endpoint.
 *
 * Stat cards set `DashboardFilter` (1–6) via the URL `status` param.
 * Form search (`isActive=1`) adds tab-specific Quick Search / KYC filters.
 * All requests use `PageSize=-1` so the table can paginate client-side.
 */
export async function filterPropertiesAction(
  selectedStatus: PropertyStatus | null,
  searchCriteria: SearchCriteria,
  isSearchActive: boolean,
  activeTab: SearchTab
): Promise<{ results: SearchResult[]; error: string | null }> {
  if (!isSearchActive && !selectedStatus) {
    return { results: [], error: null };
  }

  const payload = buildPropertySearchPayload(
    selectedStatus,
    searchCriteria,
    isSearchActive,
    activeTab
  );

  try {
    const result = await searchProperties(payload);
    const normalizedResults = result.items ?? [];
    const shouldEnforcePropertyNoRange =
      isSearchActive && activeTab === "quick-search";

    const filteredResults = shouldEnforcePropertyNoRange
      ? filterByPropertyNumberRange(normalizedResults, searchCriteria)
      : normalizedResults;

    const sortedResults = [...filteredResults].sort((a, b) =>
      comparePropertyNo(a.propertyNo, b.propertyNo)
    );

    return { results: sortedResults, error: null };
  } catch (err) {
    const message =
      err instanceof Error
          ? resolveSearchErrorMessage(err)
          : "Property search failed. Please review your filters and try again.";

    return { results: [], error: message };
  }
}

/* ================= STATS ================= */

export async function getPropertyStatsAction(): Promise<PropertyStatsData[]> {
  const stats = await fetchPropertyStats();
  // Return empty array fallback if API fails, UI will use DEFAULT_STATS
  return stats.length > 0 ? stats : DEFAULT_STATS;
}

/* ================= WARD OPTIONS (legacy signature kept for compat) ================= */

export async function getWardOptionsAction(zone: string): Promise<string[]> {
  // Legacy mock signature kept; new code should call `listWardsByZoneAction`
  // with a numeric zoneId. Stub returns an empty array.
  void zone;
  return [];
}

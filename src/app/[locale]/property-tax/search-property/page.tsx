import React from "react";
import { PropertySearch } from "@/components/modules/property-tax/search-property";
import {
  PROPERTY_STATUSES,
  type LookupOptions,
  type PropertySearchPageProps,
  type PropertySearchRawParams,
  type PropertyStatus,
  type SearchCriteria,
  type SearchTab,
  type WardOption,
  type ZoneOption,
  type PropertyDescriptionOption,
} from "@/types/property-search.types";
import type { PropertyAssessmentStatusOption } from "@/types/property-assessment-status.types";
import {
  LEGACY_TYPE_FILTER_VALUES,
  TYPE_FILTER_OPTIONS,
} from "@/components/modules/property-tax/search-property/constants";
import {
  filterPropertiesAction,
  getPropertyStatsAction,
  listLookupOptionsAction,
  listPropertyAssessmentStatusesAction,
  listPropertyTypeCategoriesAction,
  listWardsByZoneAction,
  listZonesAction,
  listAllWardsAction,
} from "./action";

const EMPTY_LOOKUP = {
  propertyNos: [] as string[],
  oldPropertyNos: [] as string[],
  upicIds: [] as string[],
  csns: [] as string[],
  subZoneNos: [] as string[],
};

/* ================= SANITIZATION ================= */

const VALID_TABS = ["quick-search", "kyc", "values-dues"] as const;

const trim = (value: string | undefined): string => (value ?? "").trim();

function toInt(raw: string | undefined): number {
  const parsed = parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function sanitizeStatus(raw: string | undefined): PropertyStatus | null {
  if (!raw) return null;
  return (PROPERTY_STATUSES as readonly string[]).includes(raw)
    ? (raw as PropertyStatus)
    : null;
}

function hasKycParams(raw: PropertySearchRawParams): boolean {
  return (
    trim(raw.holderName) !== "" ||
    trim(raw.occupierName) !== "" ||
    trim(raw.mobile) !== "" ||
    trim(raw.shopBuildingName) !== "" ||
    trim(raw.societyName) !== "" ||
    trim(raw.address) !== ""
  );
}

function sanitizeTab(
  raw: string | undefined,
  rawParams: PropertySearchRawParams
): SearchTab {
  if (raw && (VALID_TABS as readonly string[]).includes(raw)) {
    return raw as SearchTab;
  }
  if (hasKycParams(rawParams)) {
    return "kyc";
  }
  return "quick-search";
}

function sanitizePropertyType(raw: string | undefined): string {
  const id = toInt(raw);
  return id > 0 ? String(id) : "";
}

function sanitizeTypeFilter(raw: string | undefined): string {
  const value = trim(raw);
  if (!value) return "";
  if ((TYPE_FILTER_OPTIONS as readonly string[]).includes(value)) {
    return value;
  }
  return LEGACY_TYPE_FILTER_VALUES[value] ?? "";
}

function buildCriteria(raw: PropertySearchRawParams): SearchCriteria {
  return {
    propertyType: sanitizePropertyType(raw.propertyType),
    typeFilter: sanitizeTypeFilter(raw.typeFilter),
    propertyDescription: trim(raw.propertyDescription),
    zoneId: toInt(raw.zoneId as string | undefined),
    wardId: toInt(raw.wardId as string | undefined),
    scanQR: trim(raw.scanQR),
    propertyNoFrom: trim(raw.propertyNoFrom),
    propertyNoTo: trim(raw.propertyNoTo),
    oldPropertyNo: trim(raw.oldPropertyNo),
    upicId: trim(raw.upicId),
    citySurveyNo: trim(raw.citySurveyNo),
    subZoneNo: trim(raw.subZoneNo),
    plotNo: trim(raw.plotNo),
    holderName: trim(raw.holderName),
    occupierName: trim(raw.occupierName),
    mobile: trim(raw.mobile),
    shopBuildingName: trim(raw.shopBuildingName),
    societyName: trim(raw.societyName),
    address: trim(raw.address),
    valuesZone: trim(raw.valuesZone),
    valuesWard: trim(raw.valuesWard),
    valuationMethod: trim(raw.valuationMethod),
    rateableValueFilter: trim(raw.rateableValueFilter),
    rateableValueFrom: trim(raw.rateableValueFrom),
    rateableValueTo: trim(raw.rateableValueTo),
    capitalValueFilter: trim(raw.capitalValueFilter),
    capitalValueFrom: trim(raw.capitalValueFrom),
    capitalValueTo: trim(raw.capitalValueTo),
    taxDefaulter: trim(raw.taxDefaulter),
    taxDefaulterFromValue: trim(raw.taxDefaulterFromValue),
    taxDefaulterToValue: trim(raw.taxDefaulterToValue),
    betweenValue: trim(raw.betweenValue),
  };
}

function resolveSearchCriteriaForFetch(
  criteria: SearchCriteria,
  isSearchActive: boolean,
  selectedStatus: PropertyStatus | null
): SearchCriteria {
  if (isSearchActive || selectedStatus !== null) {
    return criteria;
  }

  // Keep default table data until the user clicks Search or a stat card.
  return { ...criteria, zoneId: 0, wardId: 0 };
}

/* ================= PAGE ================= */

export const dynamic = "force-dynamic";

export default async function PropertySearchPage({
  searchParams,
}: PropertySearchPageProps): Promise<React.ReactElement> {
  const raw = await searchParams;
  const selectedStatus = sanitizeStatus(raw.status);
  const initialCriteria = buildCriteria(raw);
  const activeTab = sanitizeTab(raw.tab, raw);
  const isSearchActive = raw.isActive === "1";
  const searchCriteriaForFetch = resolveSearchCriteriaForFetch(
    initialCriteria,
    isSearchActive,
    selectedStatus
  );

  const hasZone = initialCriteria.zoneId > 0;

  // Parallel SSR fetches. Heavy data sources (zones, categories, lookup)
  // are cached at the fetch layer; lookup is skipped entirely when no zone
  // is selected to save a needless round trip.
  // Default property records load on every visit. Stat cards filter immediately.
  // Form filters apply only after Search (`isActive=1`). Draft zone/ward URL
  // params load dropdown options but do not filter the table until Search.
  const [zones, propertyAssessmentStatuses, propertyTypeCategories, wards, lookup, searchOutcome, stats, allWards] =
    await Promise.all([
      listZonesAction(),
      listPropertyAssessmentStatusesAction(),
      listPropertyTypeCategoriesAction(),
      hasZone
        ? listWardsByZoneAction(initialCriteria.zoneId)
        : Promise.resolve([]),
      hasZone
        ? listLookupOptionsAction(initialCriteria.zoneId, initialCriteria.wardId)
        : Promise.resolve(EMPTY_LOOKUP),
      filterPropertiesAction(
        selectedStatus,
        searchCriteriaForFetch,
        isSearchActive,
        activeTab
      ),
      getPropertyStatsAction(),
      listAllWardsAction(),
    ]);

  const propertyTypeOptions: PropertyAssessmentStatusOption[] =
    propertyAssessmentStatuses;

  const propertyDescriptionOptions: PropertyDescriptionOption[] =
    propertyTypeCategories.map((category) => ({
      id: category.id,
      label: category.propertyTypeCategory,
    }));

  const zoneOptions: ZoneOption[] = zones.map((z) => {
    const zoneNo = z.zoneNo?.trim();
    const desc = z.description?.trim();
    const label =
      zoneNo && desc && zoneNo !== desc ? `${zoneNo} - ${desc}` : desc || zoneNo || "";
    return {
      id: z.zoneId,
      label,
    };
  });

  const wardOptions: WardOption[] = wards
    .filter((w) => w.zoneId === initialCriteria.zoneId)
    .map((w) => ({
    id: w.wardId,
    label: w.description?.trim() ? w.description : w.wardNo,
    zoneId: w.zoneId,
  }));

  const allWardOptions: WardOption[] = allWards.map((w) => {
    const wardNo = w.wardNo?.trim();
    const desc = w.description?.trim();
    const label =
      wardNo && desc && wardNo !== desc ? `${wardNo} - ${desc}` : desc || wardNo || "";
    return {
      id: w.wardId,
      label,
      zoneId: w.zoneId,
    };
  });

  const lookupOptions: LookupOptions = {
    propertyNos: lookup.propertyNos,
    oldPropertyNos: lookup.oldPropertyNos,
    upicIds: lookup.upicIds,
    csns: lookup.csns,
    subZoneNos: lookup.subZoneNos,
  };

  return (
    <PropertySearch
      results={searchOutcome.results}
      totalCount={searchOutcome.results.length}
      stats={stats}
      zoneOptions={zoneOptions}
      wardOptions={wardOptions}
      allWardOptions={allWardOptions}
      propertyTypeOptions={propertyTypeOptions}
      propertyDescriptionOptions={propertyDescriptionOptions}
      lookupOptions={lookupOptions}
      selectedStatus={selectedStatus}
      isSearchActive={isSearchActive}
      activeTab={activeTab}
      criteria={initialCriteria}
      searchError={searchOutcome.error}
    />
  );
}

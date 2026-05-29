import type { SearchCriteria, SearchTab } from "@/types/property-search.types";

type StringCriteriaField = {
  [K in keyof SearchCriteria]: SearchCriteria[K] extends string ? K : never;
}[keyof SearchCriteria];

/** Shared top-row filters — apply on both Quick Search and KYC Search. */
export const TOP_FILTER_FIELDS: ReadonlyArray<keyof SearchCriteria> = [
  "propertyType",
  "typeFilter",
  "propertyDescription",
  "zoneId",
  "wardId",
];

/** UI-only fields that must not be written to the URL until the API supports them. */
export const NON_PERSISTED_CRITERIA_FIELDS: ReadonlySet<keyof SearchCriteria> =
  new Set([]);

/** Quick Search tab fields (Property No range counts as two keys). */
export const QUICK_SEARCH_FIELDS: ReadonlyArray<StringCriteriaField> = [
  "propertyNoFrom",
  "propertyNoTo",
  "oldPropertyNo",
  "upicId",
  "citySurveyNo",
  "subZoneNo",
  "plotNo",
];

/** KYC Search tab fields — first row (compact) and second row (wider). */
export const KYC_COMPACT_FIELDS: ReadonlyArray<StringCriteriaField> = [
  "holderName",
  "occupierName",
  "mobile",
];

export const KYC_WIDE_FIELDS: ReadonlyArray<StringCriteriaField> = [
  "shopBuildingName",
  "societyName",
  "address",
];

export const KYC_SEARCH_FIELDS: ReadonlyArray<StringCriteriaField> = [
  ...KYC_COMPACT_FIELDS,
  ...KYC_WIDE_FIELDS,
];

export const KYC_UI_FIELDS: ReadonlyArray<StringCriteriaField> = KYC_SEARCH_FIELDS;

const QUICK_SEARCH_FIELD_SET = new Set<keyof SearchCriteria>(QUICK_SEARCH_FIELDS);
const KYC_SEARCH_FIELD_SET = new Set<keyof SearchCriteria>(KYC_SEARCH_FIELDS);

function isNonEmptyCriteriaValue(
  key: keyof SearchCriteria,
  value: SearchCriteria[keyof SearchCriteria]
): boolean {
  if (key === "zoneId" || key === "wardId") {
    return typeof value === "number" && value > 0;
  }
  return typeof value === "string" && value.trim() !== "";
}

function fieldsForTab(tab: SearchTab): ReadonlyArray<keyof SearchCriteria> {
  return tab === "quick-search" ? QUICK_SEARCH_FIELDS : KYC_SEARCH_FIELDS;
}

/** Fields that may be written to the URL / sent to the API for the active tab. */
export function getActiveSearchFields(tab: SearchTab): ReadonlyArray<keyof SearchCriteria> {
  return [...TOP_FILTER_FIELDS, ...fieldsForTab(tab)];
}

export function hasTabSearchInput(
  criteria: SearchCriteria,
  tab: SearchTab
): boolean {
  return getActiveSearchFields(tab).some((field) =>
    isNonEmptyCriteriaValue(field, criteria[field])
  );
}

function clearStringCriteriaField(
  criteria: SearchCriteria,
  field: StringCriteriaField
): void {
  criteria[field] = "";
}

/** Strip inactive-tab and disabled fields before URL persistence or API calls. */
export function applyTabSearchCriteria(
  criteria: SearchCriteria,
  tab: SearchTab
): SearchCriteria {
  const next: SearchCriteria = { ...criteria };

  if (tab === "quick-search") {
    for (const field of KYC_SEARCH_FIELDS) {
      clearStringCriteriaField(next, field);
    }
    return next;
  }

  for (const field of QUICK_SEARCH_FIELDS) {
    clearStringCriteriaField(next, field);
  }
  return next;
}

export function clearTabFieldsFromParams(
  params: URLSearchParams,
  tab: SearchTab
): void {
  const fieldsToClear =
    tab === "quick-search" ? KYC_SEARCH_FIELDS : QUICK_SEARCH_FIELDS;

  for (const field of fieldsToClear) {
    params.delete(field);
  }
}

export function isQuickSearchField(field: keyof SearchCriteria): boolean {
  return QUICK_SEARCH_FIELD_SET.has(field);
}

export function isKycSearchField(field: keyof SearchCriteria): boolean {
  return KYC_SEARCH_FIELD_SET.has(field);
}

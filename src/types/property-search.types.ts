/**
 * Property Search Types
 * Domain models and component prop shapes for the Property Search screen
 * (Property Tax → Search Property).
 */

import type { ReactNode, RefObject } from "react";
import type { PropertyAssessmentStatusOption } from "@/types/property-assessment-status.types";

/* ================= STATUS ================= */

export type PropertyStatus =
  | "Register Property"
  | "Geo-Sequencing"
  | "Survey"
  | "Data Processing"
  | "Quality Analysis"
  | "Assessment Completed";

export const PROPERTY_STATUSES: readonly PropertyStatus[] = [
  "Register Property",
  "Geo-Sequencing",
  "Survey",
  "Data Processing",
  "Quality Analysis",
  "Assessment Completed",
] as const;

/* ================= SEARCH CRITERIA ================= */

export interface SearchCriteria {
  // Top filters
  /** Selected Property Assessment Status ID as string. Empty = not selected. */
  propertyType: string;
  typeFilter: string;
  /** Selected Property Type Category ID as string (Property Description filter). Empty = not selected. */
  propertyDescription: string;
  /** Selected Zone ID (foreign key into ZoneMaster). 0 = not selected. */
  zoneId: number;
  /** Selected Ward ID (foreign key into WardMaster). 0 = not selected. */
  wardId: number;
  // Quick Search
  scanQR: string;
  propertyNoFrom: string;
  propertyNoTo: string;
  oldPropertyNo: string;
  upicId: string;
  citySurveyNo: string;
  subZoneNo: string;
  plotNo: string;
  // KYC
  holderName: string;
  occupierName: string;
  mobile: string;
  shopBuildingName: string;
  societyName: string;
  address: string;
  // Values & Dues
  valuesZone: string;
  valuesWard: string;
  valuationMethod: string;
  rateableValueFilter: string;
  rateableValueFrom: string;
  rateableValueTo: string;
  capitalValueFilter: string;
  capitalValueFrom: string;
  capitalValueTo: string;
  taxDefaulter: string;
  taxDefaulterFromValue: string;
  taxDefaulterToValue: string;
  betweenValue: string;
}

/* ================= RESULT ================= */

export interface SearchResult {
  /** Index signature for MasterTable compatibility */
  [key: string]: unknown;
  /** UPIC ID acts as the unique identifier */
  id: string;
  /** UPIC ID from backend database, empty string if null */
  upicId: string;
  /** Backend property ID — used for PTIS deep links */
  propertyId: number;
  zone: string;
  ward: string;
  propertyNo: string;
  /** Sub-partition within the property (used when navigating to PTIS for auto-load). */
  partitionNo: string;
  oldPropertyNo: string;
  citySurveyNo: string;
  plotNo: string;
  wingFlatNo: string;
  propertyCount: number;
  category: string;
  description: string;
  mobile: string;
  holderName: string;
  holderNameMarathi: string;
  occupierName: string;
  occupierNameMarathi: string;
  shopBuildingName: string;
  societyName: string;
  address: string;
  /** Rateable Value */
  rv: number;
  /** Capital Value — null when not assessed */
  cv: number | null;
  totalTax: number;
  status: PropertyStatus;
}

/* ================= STATS ================= */

export interface PropertyStatsData {
  label: PropertyStatus;
  value: string;
}

/* ================= COLUMN ================= */

export interface PropertySearchColumn {
  key: keyof SearchResult | string;
  label: string;
  render?: (value: unknown, row: SearchResult) => ReactNode;
}

/* ================= SEARCH TAB ================= */

export type SearchTab = "quick-search" | "kyc" | "values-dues";

/* ================= COMPONENT PROPS ================= */

/**
 * Props for the top-level `PropertySearch` client component.
 * All data is SSR-fetched and delivered as props; the component
 * synchronizes its UI state to the URL via `router.push`.
 */
export interface ZoneOption {
  id: number;
  label: string;
}

export interface WardOption {
  id: number;
  label: string;
  zoneId: number;
}

export interface PropertyDescriptionOption {
  id: number;
  label: string;
}

export interface LookupOptions {
  propertyNos: string[];
  oldPropertyNos: string[];
  upicIds: string[];
  csns: string[];
  subZoneNos: string[];
}

export interface PropertySearchProps {
  results: SearchResult[];
  totalCount: number;
  stats: PropertyStatsData[];
  zoneOptions: ZoneOption[];
  wardOptions: WardOption[];
  propertyTypeOptions: PropertyAssessmentStatusOption[];
  propertyDescriptionOptions: PropertyDescriptionOption[];
  lookupOptions: LookupOptions;
  selectedStatus: PropertyStatus | null;
  isSearchActive: boolean;
  activeTab: SearchTab;
  criteria: SearchCriteria;
  searchError?: string | null;
}

export interface PropertyStatsProps {
  selectedStatus: PropertyStatus | null;
  onStatusClick: (status: PropertyStatus) => void;
  statsData: PropertyStatsData[];
  disabled?: boolean;
  containerRef?: RefObject<HTMLDivElement | null>;
}

export interface PropertySearchFormProps {
  initialCriteria: SearchCriteria;
  activeTab: SearchTab;
  /** Stat-card filter from URL; counts as search criteria for validation. */
  selectedStatus?: PropertyStatus | null;
  zoneOptions: ZoneOption[];
  wardOptions: WardOption[];
  propertyTypeOptions: PropertyAssessmentStatusOption[];
  propertyDescriptionOptions: PropertyDescriptionOption[];
  lookupOptions: LookupOptions;
  onSearch: (criteria: SearchCriteria, tab: SearchTab) => void;
  onReset: () => void;
  onTabChange: (tab: SearchTab) => void;
  disabled?: boolean;
  /** Disables only Search/Reset while a URL navigation is in progress. */
  searchPending?: boolean;
}

export interface PropertySearchResultsProps {
  selectedStatus: PropertyStatus | null;
  isSearchActive: boolean;
  results: SearchResult[];
  loading?: boolean;
  searchError?: string | null;
}

/* ================= SELECT OPTION ================= */

export interface PropertySearchSelectOption {
  label: string;
  value: string;
}

/* ================= SUBCOMPONENT PROPS ================= */

export type SearchFieldErrorMap = Partial<
  Record<keyof SearchCriteria, string>
>;

export interface LookupInputProps {
  id: string;
  label: string;
  placeholder?: string;
  tooltip?: string;
  value: string;
  options: string[];
  error?: string;
  onChange: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  maxLength?: number;
}



export interface UpicLinkCellProps {
  upicId: string;
  propertyId: number;
  locale: string;
  copyLabel: string;
}

export interface CopyCellProps {
  value: string;
  label: string;
}

export interface RvCvCellProps {
  rv: number;
  cv: number | null;
}

export interface PropertyStatVisual {
  label: PropertyStatus;
  i18nKey: string;
  iconName: PropertyStatIconName;
  idleGradient: string;
  idleBorder: string;
  idleLabel: string;
  idleCount: string;
  iconBg: string;
  iconColor: string;
  hoverShadow: string;
  activeGradient: string;
  activeRing: string;
  activeBar: string;
}

export type PropertyStatIconName =
  | "register-property"
  | "geo-sequencing"
  | "survey"
  | "data-processing"
  | "quality-analysis"
  | "assessment-completed";

export interface StatCardProps {
  visual: PropertyStatVisual;
  count: string;
  index: number;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}

/* ================= HOOK PROPS ================= */

export interface UsePropertySearchNavigationProps {
  startTransition: (callback: () => void) => void;
}

export interface UsePropertySearchFiltersProps {
  lookupOptions: LookupOptions;
  propertyNoFrom: string;
}

export interface UsePropertySearchFormProps {
  initialCriteria: SearchCriteria;
  activeTab: SearchTab;
  selectedStatus?: PropertyStatus | null;
  onSearch: (criteria: SearchCriteria, tab: SearchTab) => void;
  onReset: () => void;
  validationT: (key: SearchValidationKey) => string;
}

export interface UsePropertySearchResultsProps {
  results: SearchResult[];
}

/* ================= VALIDATION ================= */

export type SearchValidationKey =
  | "wardRequiresZone"
  | "propertyNoFromRequired"
  | "propertyNoRangeInvalid"
  | "propertyNoInvalid"
  | "oldPropertyNoInvalid"
  | "upicIdInvalid"
  | "citySurveyNoInvalid"
  | "subZoneNoInvalid"
  | "plotNoInvalid"
  | "holderNameInvalid"
  | "occupierNameInvalid"
  | "mobileInvalid"
  | "shopBuildingNameInvalid"
  | "societyNameInvalid"
  | "addressInvalid"
  | "rateableValueBetweenRequired"
  | "capitalValueBetweenRequired"
  | "rateableValueInvalid"
  | "noSearchCriteria";

export type SearchValidationResult =
  | { valid: true }
  | { valid: false; message: string };

/* ================= PAGE / ERROR ================= */

export type PropertySearchRawParams = Partial<
  Record<keyof SearchCriteria | "status" | "isActive" | "tab", string>
>;

export interface PropertySearchPageProps {
  readonly searchParams: Promise<PropertySearchRawParams>;
}

export interface PropertySearchErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Type definitions for Apartment QC Details API
 * Endpoint: GET /api/Property/apartmentQC-details
 */

/**
 * Individual apartment QC detail item
 */
export interface ApartmentQCDetail {
  /** Unique identifier */
  id: number;
  /** Property details identifier */
  pdnId: number | null;
  /** Tax zone identifier */
  taxZoneId: number | null;
  /** Zone number */
  zoneNo: string | null;
  /** Property number */
  propertyNo: string;
  /** Old property number */
  oldPropertyNo: string | null;
  /** Ward identifier */
  wardId: number;
  /** Mobile number */
  mobileNo: string | null;
  /** Email address */
  emailId: string | null;
  /** Occupancy certificate date */
  ocDate: string | null;
  /** Flat or shop number */
  flatOrShopNo: string | null;
  /** Flat or shop name */
  flatOrShopName: string | null;
  /** Flat or shop number in English */
  flatOrShopNoEnglish: string | null;
  /** Flat or shop name in English */
  flatOrShopNameEnglish: string | null;
  /** Owner name */
  ownerName: string | null;
  /** Owner name in English */
  ownerNameEnglish: string | null;
  /** Occupier name */
  occupierName: string | null;
  /** Occupier name in English */
  occupierNameEnglish: string | null;
  /** Property type id (new field) */
  propertyType?: number | null;
  /** Yearly rent amount */
  rentYearly: number | null;
  /** Monthly rent amount */
  rentMonthly: number | null;
  /** Renter name */
  renterName: string | null;
  /** Renter name in English */
  renterNameEnglish: string | null;
  /** Type of use */
  typeOfUse: string | null;
  /** Property type */
  type: string | null;
  /** Part type */
  partType: string | null;
  /** Wing name from the API (new field) */
  wing?: string | null;
  /** Floor */
  floor: string | null;
  /** Sub floor */
  subFloor: string | null;
  /** Sub type of use (new field) */
  subTypeOfUse?: string | null;
  /** Construction year */
  constructionYear: string | null;
  /** Assessment year */
  assessmentYear: string | null;
  /** Construction type */
  constructionType: string | null;
  /** Old construction area */
  oldConstructionArea: number | null;
  /** Old rateable value */
  oldRV: number | null;
  /** Old total tax */
  oldTotalTax: number | null;
  /** RV or CV value */
  rVorCVValue: number | null;
  /** Capital value */
  capitalValue: number | null;
  /** Rateable value */
  rateableValue: number | null;
  /** New tax total */
  newTaxTotal: number | null;
  /** New tax total CV */
  newTaxTotalCV: number | null;
  /** New tax total RV */
  newTaxTotalRV: number | null;
  /** Yearly rent from API (new field) */
  yearlyRent?: number | null;
  /** Monthly rate (new field) */
  monthlyRate?: number | null;
  /** Yearly rate (new field) */
  yearlyRate?: number | null;
  /** Depreciation (new field) */
  depreciation?: number | null;
  /** Annual rental value (new field) */
  annualRentalValue?: number | null;
  /** Maintenance (new field) */
  maintenance?: number | null;
  /** SDRR (new field) */
  sdrr?: number | null;
  /** Base value (new field) */
  baseValue?: number | null;
  /** Floor factor (new field) */
  floorFactor?: string | number | null;
  /** Age factor (new field) */
  ageFactor?: string | number | null;
  /** Nature factor (new field) */
  natureFactor?: string | number | null;
  /** Use factor (new field) */
  useFactor?: string | number | null;
  /** Floor factor identifier (new field) */
  floorFactorId?: number | null;
  /** Age factor identifier (new field) */
  ageFactorId?: number | null;
  /** Nature factor identifier (new field) */
  natureFactorId?: number | null;
  /** Use factor identifier (new field) */
  useFactorId?: number | null;
  /** Carpet area in square meters */
  carpetASqMtr: number | null;
  /** Carpet area in square feet */
  carpetASqFt: number | null;
  /** Built-up area in square meters */
  builtupASqMtr: number | null;
  /** Built-up area in square feet */
  builtupASqFt: number | null;
  /** Building number */
  buildingNo?: string | null;
  /** Society name */
  society?: string | null;
  /** BHK */
  bhk?: string | number | null;
  /** Toilet count */
  toiletCount?: string | number | null;
  /** Remark */
  remark?: string | null;
  /** Wing name */
  wingName?: string | null;
}

/**
 * Complete apartment QC details response
 * The API returns a nested structure: { success, message, items: { items: [], totalCount, ... } }
 */
export interface ApartmentQCResponse {
  /** Success status */
  success: boolean;
  /** Response message */
  message: string;
  /** Nested paginated items object */
  items: PagedResponse<ApartmentQCDetail>;
  /** List of errors if any */
  errors: string[] | null;
}

/**
 * Search parameters for apartment QC
 */
export interface ApartmentQCSearchParams {
  wardId?: number | string;
  propertyNo?: string;
  propertyDetailsId?: number | string;
  partType?: string;
  type?: string;
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  sortOrder?: string;
  filterLogic?: number;
}

/**
 * Generic paged response
 */
export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * Tab type for apartment QC view
 */
export type ApartmentQCTab = 'rateable' | 'capital' | 'dual';

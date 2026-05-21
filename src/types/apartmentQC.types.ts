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
  pdnId: number;
  /** Tax zone identifier */
  taxZoneId: number;
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
  /** Yearly rent amount */
  rentYearly: number;
  /** Monthly rent amount */
  rentMonthly: number;
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
  /** Floor */
  floor: string | null;
  /** Sub floor */
  subFloor: string | null;
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
  rVorCVValue: number;
  /** Capital value */
  capitalValue: number;
  /** Rateable value */
  rateableValue: number;
  /** New tax total */
  newTaxTotal: number;
  /** New tax total CV */
  newTaxTotalCV: number;
  /** New tax total RV */
  newTaxTotalRV: number;
  /** Carpet area in square meters */
  carpetASqMtr: number;
  /** Carpet area in square feet */
  carpetASqFt: number;
  /** Built-up area in square meters */
  builtupASqMtr: number;
  /** Built-up area in square feet */
  builtupASqFt: number;
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

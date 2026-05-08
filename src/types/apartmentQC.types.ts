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
  /** Tax zone identifier */
  taxZoneId: number;
  /** Zone number */
  zoneNo: string;
  /** Property number */
  propertyNo: string;
  /** Old property number */
  oldPropertyNo: string;
  /** Ward identifier */
  wardId: number;
  /** Mobile number */
  mobileNo: string;
  /** Email address */
  emailId: string;
  /** Occupancy certificate date */
  ocDate: string | null;
  /** Flat or shop number */
  flatOrShopNo: string;
  /** Flat or shop name */
  flatOrShopName: string;
  /** Flat or shop number in English */
  flatOrShopNoEnglish: string;
  /** Flat or shop name in English */
  flatOrShopNameEnglish: string;
  /** Owner name */
  ownerName: string;
  /** Owner name in English */
  ownerNameEnglish: string;
  /** Occupier name */
  occupierName: string;
  /** Occupier name in English */
  occupierNameEnglish: string;
  /** Yearly rent amount */
  rentYearly: number;
  /** Monthly rent amount */
  rentMonthly: number;
  /** Renter name */
  renterName: string;
  /** Renter name in English */
  renterNameEnglish: string;
  /** Type of use */
  typeOfUse: string;
  /** Property type */
  type: string;
  /** Part type */
  partType: string;
  /** Floor */
  floor: string;
  /** Sub floor */
  subFloor: string;
  /** Construction year */
  constructionYear: string;
  /** Assessment year */
  assessmentYear: string;
  /** Construction type */
  constructionType: string;
  /** Old construction area */
  oldConstArea: number;
  /** Old rateable value */
  oldRV: number;
  /** Old total tax */
  oldTotalTax: number;
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
}

/**
 * Complete apartment QC details response
 */
export interface ApartmentQCResponse {
  /** Success status */
  success: boolean;
  /** Response message */
  message: string;
  /** List of apartment QC detail items */
  items: ApartmentQCDetail[];
  /** List of errors if any */
  errors: string[];
}

/**
 * Tab type for apartment QC view
 */
export type ApartmentQCTab = 'rateable' | 'capital' | 'dual';

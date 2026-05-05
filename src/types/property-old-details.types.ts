import { OldTaxDetail } from "./ptis.types";

/**
 * Interface representing the basic old property details returned from the API.
 */
export interface PropertyOldDetailsApiItem {
  /** The historical general tax amount */
  oldGeneralTax: string | null;
  /** Unique identifier for the property */
  propertyId: number;
  /** Historical ward number */
  oldWardNo: string | null;
  /** Historical property number */
  oldPropertyNo: string | null;
  /** Historical partition number */
  oldPartitionNo: string | null;
  /** Historical e-governance ID */
  oldEgovNo: string | null;
  /** Historical plot area in square feet */
  oldPlotArea: number | null;
  /** Historical plot number */
  oldPlotNo: string | null;
  /** Historical Rateable Value (RV) */
  oldRV: number | null;
  /** Historical Annual Letting Value (ALV) */
  oldALV: number | null;
  /** Total historical tax amount */
  oldTotalTax: number | null;
  /** Historical zone number or name */
  oldZoneNo: string | null;
  /** Year of construction */
  oldConstructionYear: number | null;
  /** Carpet area in square feet */
  oldCarpetAreaSqFeet: number | null;
  /** Carpet area in square meters */
  oldCarpetAreaSqMeter: number | null;
  /** Registration status or number */
  oldRegistration: string | null;
  /** ID for construction type master */
  oldConstructionTypeId: number | null;
  /** ID for type of use master */
  oldTypeOfUseId: number | null;
}

/**
 * Standard API response wrapper for property old details.
 */
export interface PropertyOldDetailsResponse {
  /** Indicates if the request was successful */
  success: boolean;
  /** User-friendly message from the server */
  message: string;
  /** The actual property data */
  items: PropertyOldDetailsApiItem;
  /** Any validation or server errors */
  errors: unknown | null;
}

/* ---------------- TYPES ---------------- */
export interface TypeOfUse {
  id: number;
  typeOfUseCode: string;
  description: string;
  type: string;
  typeOfUseGroupId: number;
  isActive: boolean;
}

export interface SubTypeOfUse {
  id: number;
  description: string;
  typeOfUseId: number;
  isActive: boolean;
}

export interface ConstructionType {
  [key: string]: unknown;
  constructionTypeId: number;
  constructionCode: string;
  description: string;
  searchSequence: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

/* =====================================================
   SUBFLOOR - ENTITY MODEL
===================================================== */
export interface SubFloor {
  [key: string]: unknown;

  id: number;
  subFloorCode: string;
  description: string;

  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

/* =====================================================
   FLOOR - ENTITY MODEL (DB RESPONSE)
===================================================== */
export interface Floor {
  [key: string]: unknown;

  id: number;
  floorCode: string;
  description: string;
  sequenceNo: number;

  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

/* =====================================================
   OLD FLOOR DETAILS - API RESPONSE MODELS
===================================================== */
/**
 * Detailed information about a historical floor record.
 */
export interface OldFloorDetail {
  /** Record unique identifier */
  id: number;
  /** Property identifier */
  propertyId: number;
  /** Identifier for the floor master */
  oldFloorId: number;
  /** Display name of the floor */
  floorDescription: string;
  /** Identifier for the sub-floor master (optional) */
  oldSubFloorId: number | null;
  /** Display name of the sub-floor */
  subFloorDescription: string | null;
  /** Construction year as a string (YYYY) */
  oldConstructionYear: string;
  /** Numeric construction year */
  constructionYearValue: number;
  /** Assessment year as a string (optional) */
  oldAssessmentYear: string | null;
  /** Numeric assessment year */
  assessmentYearValue: number | null;
  /** Identifier for construction type master */
  oldConstructionTypeId: number;
  /** Display name of construction type */
  constructionTypeDescription: string;
  /** Identifier for type of use master */
  oldTypeOfUseId: number;
  /** Display name of type of use */
  typeOfUseDescription: string;
  /** Identifier for sub-type of use master (optional) */
  oldSubTypeOfUseId: number | null;
  /** Display name of sub-type of use */
  subTypeOfUseDescription: string | null;
  /** Carpet area in square meters */
  oldCarpetAreaSqMeter: number;
  /** Carpet area in square feet */
  oldCarpetAreaSqFeet: number;
  /** Built-up area in square meters */
  oldBuiltupAreaSqMeter: number;
  /** Built-up area in square feet */
  oldBuiltupAreaSqFeet: number;
  /** Whether the record is flagged for removal */
  markedForDeletion: boolean;
  /** Date when record was marked for deletion */
  markedForDeletionDate: string | null;
}

export interface OldFloorDetails {
  propertyId: number;
  floorDetails: OldFloorDetail[];
}

export interface OldFloorDetailsResponse {
  success: boolean;
  message: string;
  items: OldFloorDetails;
  errors: unknown | null;
}

export interface FloorInformationFormProps {
  floorOptions?: Floor[];
  subFloorOptions?: SubFloor[];
  constructionTypeOptions?: ConstructionType[];
  useOptions?: TypeOfUse[];
  initialSubUseTypeOptions?: SubTypeOfUse[];
  existingFloorDetails?: OldFloorDetail[];
}

export interface FloorInformationFormData {
  id?: number;
  oldFloorId: string | number;
  oldSubFloorId: string | number;
  oldConstructionYear: string;
  oldConstructionTypeId: string | number;
  oldTypeOfUseId: string | number;
  oldSubTypeOfUseId: string | number;
  oldCarpetAreaSqFeet: string;
  markedForDeletion: boolean;
}

export interface FloorTableRow {
  [key: string]: unknown;
  id: number;
  originalRow: OldFloorDetail;
  floor: string;
  subFloor: string | null;
  conYr: string;
  conTyp: string;
  use: string;
  subUse: string | null;
  areaSqFt: number;
}
/* =====================================================
   OLD TAXES DETAILS - API RESPONSE MODELS
===================================================== */
export interface OldTaxItem {
  taxId: number;
  taxName: string;
  taxAmount: number;
}

export interface OldTaxYear {
  financeYearId: number;
  year: number;
  yearCode: string | null;
  rVorCV: string;
  rVorCVValue: number;
  taxes: OldTaxItem[];
  taxTotal: number;
  interest: number;
  netTotal: number;
  remark?: string;
}

export interface OldTaxesDetails {
  propertyId: number;
  taxYears: OldTaxYear[];
}

export interface OldTaxesDetailsResponse {
  success: boolean;
  message: string;
  items: OldTaxesDetails;
  errors: unknown | null;
}

export interface OldTaxYear {
  financeYearId: number;
  year: number;
  yearCode: string | null;
  rVorCV: string;
  rVorCVValue: number;
  taxes: OldTaxDetail[];
  taxTotal: number;
  interest: number;
  netTotal: number;
  remark?: string;
}

export interface TaxationBreakdownFormProps {
  initialData?: OldTaxesDetails | null;
}

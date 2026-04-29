export interface PropertyOldDetailsApiItem {
  oldGeneralTax: string | null;
  propertyId: number;
  oldWardNo: string | null;
  oldPropertyNo: string | null;
  oldPartitionNo: string | null;
  oldEgovNo: string | null;
  oldPlotArea: number | null;
  oldPlotNo: string | null;
  oldRV: number | null;
  oldALV: number | null;
  oldTotalTax: number | null;
  oldZoneNo: string | null;
  oldConstructionYear: number | null;
  oldCarpetAreaSqFeet: number | null;
  oldCarpetAreaSqMeter: number | null;
  oldRegistration: string | null;
  oldConstructionTypeId: number | null;
  oldTypeOfUseId: number | null;
}

export interface PropertyOldDetailsResponse {
  success: boolean;
  message: string;
  items: PropertyOldDetailsApiItem;
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
export interface OldFloorDetail {
  id: number;
  propertyId: number;
  oldFloorId: number;
  floorDescription: string;
  oldSubFloorId: number | null;
  subFloorDescription: string | null;
  oldConstructionYear: string;
  constructionYearValue: number;
  oldAssessmentYear: string | null;
  assessmentYearValue: number | null;
  oldConstructionTypeId: number;
  constructionTypeDescription: string;
  oldTypeOfUseId: number;
  typeOfUseDescription: string;
  oldSubTypeOfUseId: number | null;
  subTypeOfUseDescription: string | null;
  oldCarpetAreaSqMeter: number;
  oldCarpetAreaSqFeet: number;
  oldBuiltupAreaSqMeter: number;
  oldBuiltupAreaSqFeet: number;
  markedForDeletion: boolean;
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
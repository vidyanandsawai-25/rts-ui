import type { SearchSelectOption } from '@/components/common/SearchSelect';
export const PTIS_TABS = ['propertydetails', 'kycdetails', 'societydetails', 'olddetails'] as const;
export type PtisTabId = (typeof PTIS_TABS)[number];

/** Maximum number of properties to fetch for a single ward to prevent OOM / backend overload. */
export const MAX_PROPERTY_FETCH = 500;

export interface PropertyDetailsData {
  division: string;
  wardNo: string;
  blockNo: string;
  propertyNo: string;
  partitionNo: string;
  flatOrShopNo: string;
  upicId: string;
  taxZoneNo: string;
  subZoneNo: string;
  surveyNo: string;
  plotNo: string;
  propertyDescription: string;
  plotArea: string;
  totalCarpetArea: string;
  builtupArea: string;
  category?: string;
  wingNo?: string;
  wingName?: string;
  moujaNo?: string;
  moujaDescription?: string;
  noOfResidentialToilets?: string;
  noOfCommercialToilets?: string;
  ownerName?: string;
}

export interface KYCDetailsData {
  ownerType: string;
  title: string;
  propertyHolderName: string;
  propertyHolderNameMarathi: string;
  occupierName: string;
  occupierNameMarathi: string;
  aadharCardNo: string;
  mobileNumber: string;
  email: string;
  shopName: string;
  address: string;
  wingNo: string;
  flatNo: string;
  shopNo: string;
  buildingName?: string;
}

export interface SocietyDetailsData {
  buildingSocietyName: string;
  buildingSocietyNameMarathi: string;
  builderName: string;
  builderNameMarathi: string;
  landOwner: string;
  secretaryName: string;
  secretaryNameMarathi: string;
  secretaryMobileNo: string;
  secretaryEmail: string;
  societyEmail: string;
  societyEmailMain: string;
  ocDate: string;
  ocNumber: string;
  societyAddress: string;
  societyAddressMarathi: string;
  managerName: string;
  managerEmail: string;
  managerMobileNo: string;
}

export interface OldDetailsData {
  oldZoneName: string;
  oldWardNo: string;
  oldPropertyNo: string;
  oldPartitionNo: string;
  oldEGovernanceNo: string;
  oldPlotArea: string;
  oldPlotNo: string;
  oldRV: string;
  oldCV: string;
  oldALV: string;
  oldPropertyTax: string;
  oldTotalTax: string;
  oldConstructionYear?: string;
  oldCarpetAreaSqMeter?: string;
  oldCarpetAreaSqFeet?: string;
  oldBuiltupAreaSqMeter?: string;
  oldBuiltupAreaSqFeet?: string;
  oldConstructionTypeId?: string;
  oldTypeOfUseId?: string;
  extra?: Record<string, unknown>;
}

export interface OldFloorDetailsData {
  floor: string;
  subFloor: string;
  assessmentYear: string;
  year: string;
  constructionType: string;
  typeOfUse: string;
  subType: string;
  carpetArea: string; // "Sq.ft / Sq.Mtr"
  builtupArea: string; // "Sq.ft / Sq.Mtr"
}

export interface WardIdentifiable {
  wardNo?: string;
  wardId?: number | string;
}

export interface PropertyIdentifiable extends WardIdentifiable {
  propertyNo: string;
  partitionNo?: string | null;
  propertyId?: number | string;
}

export interface PropertySearchParams extends Partial<PropertyIdentifiable> {
  upicId?: string;
}

export interface PropertySearchResult extends PropertyIdentifiable {
  id?: string | number;

  ownerName?: string;
  ownerNameEnglish?: string;
  ownerTitle?: string;
  ownerTitleEnglish?: string;
  occupierName?: string;
  occupierNameEnglish?: string;
  occupierTitle?: string;
  occupierTitleEnglish?: string;

  address?: string;
  addressEnglish?: string;
  location?: string;
  locationEnglish?: string;

  upicId?: string;

  taxZoneId?: number | string;
  subZoneNo?: string;
  plotNo?: string;
  plotArea?: number;
  csn?: string;

  categoryId?: number;
  categoryName?: string;
  category?: string;
  subCategoryName?: string;
  subCategory?: string;

  flatOrShopNo?: string;
  flatOrShopName?: string;
  flatOrShopNoEnglish?: string;
  flatOrShopNameEnglish?: string;

  mobileNo?: string;
  emailId?: string;
  wingNo?: string;

  openPlot?: boolean;
  propertyTypeId?: number;
  ownerType?: string;
  societyDetailId?: number | null;
  markedForDeletion?: boolean;
  displayProperty?: string;
  isActive?: boolean;
  createdDate?: string;
  updatedDate?: string;
}

export interface PropertyListItem extends PropertyIdentifiable {
  propertyId: number;
  propertyNo: string;
  partitionNo: string;
  upicId: string;
  ownerName: string;
  address: string;
  displayProperty: string;
}

export interface Ward extends WardIdentifiable {
  description?: string | null;
  zoneId?: number | string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  wardID?: string | number;
}

export type PropertySuggestionResponse = Pick<PropertyIdentifiable, 'propertyNo' | 'partitionNo'>;

export type WardSuggestionResponse = WardIdentifiable;

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface OldTaxDetail {
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
  taxes: OldTaxDetail[];
  taxTotal: number;
  interest: number;
  netTotal: number;
}

export interface OldTaxesData {
  propertyId: number;
  taxYears: OldTaxYear[];
}

// =============================================================================
// PTIS API RESPONSE TYPES (DTOs)
// =============================================================================

export interface KycDetailsApiResponse {
  propertyId: number | null;
  ownerTypeId: number | null;
  adharCardNo: string | null;
  ownerType: string | null;
  ownerTitle: string | null;
  ownerName: string | null;
  ownerTitleEnglish: string | null;
  ownerNameEnglish: string | null;
  occupierTitle: string | null;
  occupierName: string | null;
  occupierTitleEnglish: string | null;
  occupierNameEnglish: string | null;
  address: string | null;
  location: string | null;
  addressEnglish: string | null;
  locationEnglish: string | null;
  flatOrShopName: string | null;
  flatOrShopNameEnglish: string | null;
  flatOrShopNo: string | null;
  flatOrShopNoEnglish: string | null;
  mobileNo: string | null;
  emailId: string | null;
  wingNo?: string | null;
}

export interface PropertyBasicDetailsApiResponse {
  propertyId: number;
  propertyNo: string;
  partitionNo: string;
  wardId: number;
  wardNo: string;
  zoneId: number;
  division: string;
  flatOrShopNo: string;
  plotNo: string;
  surveyNo: string;
  taxZoneId: number;
  taxZoneNo: string;
  categoryId: number;
  categoryName: string;
  subCategoryId?: number;
  subCategoryName?: string;
  propertyTypeId: number;
  propertyDescription: string;
  upicId: string;
  subZoneNo: string;
  wingNo: string;
  noOfResidentialToilets: number;
  noOfCommercialToilets: number;
  totalCarpetAreaSqMeter: number;
  totalBuiltupAreaSqMeter: number;
  totalCarpetAreaSqFeet: number;
  totalBuiltupAreaSqFeet: number;
  plotArea: number;
  plotAreaFtLength: number;
  plotAreaFtWidth: number;
  plotAreaMtrLength: number;
  plotAreaMtrWidth: number;
  wingId: number;
  wingName: string;
  ownerName?: string;
  ownerNameEnglish?: string;
}

export interface SocietyDetailsApiResponse {
  buildingSocietyName?: string;
  buildingSocietyNameMarathi?: string;
  builderName?: string;
  builderNameMarathi?: string;
  landOwner?: string;
  secretaryName?: string;
  secretaryNameMarathi?: string;
  secretaryMobileNo?: string;
  secretaryEmail?: string;
  societyEmail?: string;
  societyEmailMain?: string;
  ocDate?: string;
  ocNumber?: string;
  societyAddress?: string;
  societyAddressMarathi?: string;
  managerName?: string;
  managerEmail?: string;
  managerMobileNo?: string;
}

export interface OldDetailsApiResponse {
  oldZoneNo?: number | string;
  oldWardNo?: string;
  oldPropertyNo?: string;
  oldPartitionNo?: string;
  oldEgovNo?: string;
  oldPlotArea?: number | string;
  oldPlotNo?: string;
  oldRV?: number | string;
  oldALV?: number | string;
  oldPropertyTax?: number | string;
  oldTotalTax?: number | string;
  oldConstructionYear?: number | string;
  oldCarpetAreaSqMeter?: number | string;
  oldCarpetAreaSqFeet?: number | string;
  oldBuiltupAreaSqMeter?: number | string;
  oldBuiltupAreaSqFeet?: number | string;
}

export interface OldFloorDetailApiResponse {
  floorDescription?: string;
  subFloorDescription?: string;
  oldAssessmentYear?: string;
  constructionYear?: number | string;
  oldConstructionYear?: number | string;
  constructionTypeDescription?: string;
  typeOfUseDescription?: string;
  subTypeOfUseDescription?: string;
  carpetAreaSqFeet?: number;
  carpetAreaSqMeter?: number;
  builtupAreaSqFeet?: number;
  builtupAreaSqMeter?: number;
}

export interface OldTaxDetailApiResponse {
  taxId: number;
  taxName: string;
  taxAmount: number;
}

export interface OldTaxYearApiResponse {
  financeYearId: number;
  year: number;
  yearCode: string | null;
  rVorCV: string;
  rVorCVValue: number;
  taxes: OldTaxDetailApiResponse[];
  taxTotal: number;
  interest: number;
  netTotal: number;
}

export interface OldTaxesApiResponse {
  propertyId: number;
  taxYears: OldTaxYearApiResponse[];
}

export interface PtisInitialData {
  propertyDetails?: PropertyDetailsData;
  kycDetails?: KYCDetailsData;
  societyDetails?: SocietyDetailsData;
  wardOptions?: SearchSelectOption[];
  propertyOptions?: SearchSelectOption[];
  rawPropertyData?: PropertyListItem[];
  oldDetails?: OldDetailsData;
  oldFloorTableData?: OldFloorDetailsData[];
  showOldFloorInfo?: boolean;
  oldTaxesData?: OldTaxesData | null;
  showOldTaxInfo?: boolean;
}
export * from './ptis-core.types';
export * from './ptis-defaults.types';
export * from './ptis-search.types';
export * from './ptis-reference.types';
export * from './ptis-page.types';
export * from './dualMethod.types';
export * from './rateableValue.types';
export * from './capitalValue.types';

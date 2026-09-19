/**
 * PTIS Individual Property Domain Types
 * Independent domain models for individual property assessment screens.
 */

export interface IndividualPerformanceData {
  thisAssessmentRevenue?: string;
  revenueGrowthPct?: string;
  isGrowthNegative?: boolean;
  currentTax?: string;
  retroTax?: string;
  totalTax?: string;
  totalDemand?: string;
  currentDemand?: string;
  pendingDemand?: string;
  collectionPercent?: string | number;
  collectionAmount?: string;
  totalBalance?: string;
  differenceAmount?: string;
  rawDifferenceAmount?: number | null;
  oldCurrentTax?: string;
  changePercent?: number | null;
}

export interface IndividualPropertyMasterData {
  propertyId?: number;
  wardId?: number;
  wardNo?: string;
  propertyNo?: string;
  upic?: string;
  societyName?: string;
  ownerName?: string;
  ownerNameEnglish?: string;
  landOwnerName?: string;
  owner?: string;
  propertyHolder?: string;
  holderRegional?: string;
  occupierName?: string;
  occupierNameEnglish?: string;
  occupierRegional?: string;
  ownerCategory?: string;
  division?: string;
  moujaName?: string;
  surveyNo?: string;
  taxZone?: string;
  taxZoneAndName?: string;
  subZoneCsnNo?: string;
  plotNo?: string;
  aadharNo?: string;
  title?: string;
  ownerTitle?: string;
  aadharWithTitle?: string;
  mobileNo?: string;
  altMobileNo?: string;
  alternateMobileNo?: string;
  emailId?: string;
  societyEmail?: string;
  societyAddress?: string;
  address?: string;
  plotArea?: string;
  plotAreaFtMtr?: string;
  carpetAreaFtMtr?: string;
  builtUpAreaFtMtr?: string;
  carpetBuiltUpArea?: string;
  status?: string;
  category?: string;
  categoryId?: number | null;
  propertyTypeId?: number | null;
  propertyDescription?: string;
  propertyDescriptionRegional?: string;
  societyBuildingPhotoGuid?: string;
  imageUrl?: string;
  performance?: IndividualPerformanceData;
  [key: string]: unknown;
}

export interface IndividualPatchPayload {
  ownerName?: string | null;
  ownerNameEnglish?: string | null;
  ownerTitle?: string | null;
  ownerTitleEnglish?: string | null;
  occupierName?: string | null;
  occupierNameEnglish?: string | null;
  occupierTitle?: string | null;
  occupierTitleEnglish?: string | null;
  ownerTypeId?: number | null;
  aadharNo?: string | null;
  mobileNo?: string | null;
  alternateMobileNo?: string | null;
  emailId?: string | null;
  address?: string | null;
  addressEnglish?: string | null;
  pinCode?: string | null;
  moujaId?: number | null;
  taxZoneId?: number | null;
  surveyNo?: string | null;
  plotNo?: string | null;
  categoryId?: number | null;
  propertyTypeId?: number | null;
}

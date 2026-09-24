/**
 * PTIS Individual Property Types
 * Consolidated type definitions for Individual Property assessment screens.
 * Contains both backend API response DTO contracts and normalized UI domain models.
 */

// ============================================================================
// 1. Backend API Response Contracts (GET /api/Property/{propertyId}/individual)
// ============================================================================

export interface IndividualAdditionalRevenueDto {
  currentTax?: number | null;
  retroTax?: number | null;
  totalTax?: number | null;
  currentDemand?: number | null;
  totalDemand?: number | null;
  collection?: number | null;
  collectionPercentage?: number | null;
  totalBalance?: number | null;
  oldCurrentTax?: number | null;
  differenceAmount?: number | null;
  changePercent?: number | null;
  pendingCurrent?: number | null;
  pendingDemand?: number | null;
}

export interface IndividualPropertyDto {
  propertyId?: number | null;
  propertyNo?: string | null;
  upicId?: string | null;
  ownerName?: string | null;
  owner?: string | null;
  propertyHolder?: string | null;
  holderRegional?: string | null;
  occupierName?: string | null;
  occupierRegional?: string | null;
  ownerCategory?: string | null;
  aadharNo?: string | null;
  ownerTitle?: string | null;
  aadharWithTitle?: string | null;
  mobileNo?: string | null;
  alternateMobileNo?: string | null;
  emailId?: string | null;
  address?: string | null;
  addressEnglish?: string | null;
  pinCode?: string | null;
  fullAddress?: string | null;
  division?: string | null;
  moujaName?: string | null;
  surveyNo?: string | null;
  taxZone?: string | null;
  plotNo?: string | null;
  plotAreaFt?: number | string | null;
  plotAreaMtr?: number | string | null;
  carpetAreaFt?: number | string | null;
  carpetAreaMtr?: number | string | null;
  builtUpAreaFt?: number | string | null;
  builtUpAreaMtr?: number | string | null;
  propertyDescription?: string | null;
  individualPropertyGuid?: string | null;
  individualPropertyPhotoGuid?: string | null;
  societyBuildingPhotoGuid?: string | null;
  additionalRevenue?: IndividualAdditionalRevenueDto | IndividualAdditionalRevenueDto[] | null;
}

export interface IndividualPropertyApiResponse {
  success: boolean;
  message?: string;
  items?: IndividualPropertyDto | null;
  totalCount?: number | null;
  errors?: unknown;
  correlationId?: string | null;
}

// ============================================================================
// 2. Normalized UI Domain Models
// ============================================================================

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

// ============================================================================
// 3. Mutation Payloads
// ============================================================================

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

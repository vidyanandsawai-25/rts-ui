/**
 * DTO contracts for PTIS Individual API: GET /api/Property/{propertyId}/individual
 */

export interface IndividualAdditionalRevenueDto {
  currentTax?: number | null;
  retroTax?: number | null;
  totalTax?: number | null;
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
  additionalRevenue?: IndividualAdditionalRevenueDto | null;
}

export interface IndividualPropertyApiResponse {
  success: boolean;
  message?: string;
  items?: IndividualPropertyDto | null;
  totalCount?: number | null;
  errors?: unknown;
  correlationId?: string | null;
}

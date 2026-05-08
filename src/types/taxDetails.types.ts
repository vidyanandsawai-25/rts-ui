/* ============================================================
   TAX DETAILS — TYPES
   Endpoint: GET /api/Property/{propertyId}/tax-details-cv
============================================================ */

/**
 * Tax amounts returned by the tax-details-cv endpoint.
 * Contains all individual tax components.
 */
export interface TaxAmounts {
  "General Tax": number;
  "State Education Tax": number;
  "State Employment Tax": number;
  "Tree Cess": number;
  "Special Water Cess": number;
  "Road Cess": number;
  "Fire Cess": number;
  "Light Cess": number;
  "Water Benefit Cess": number;
  "Sewage Disposal Cess": number;
  "Special Education Tax": number;
  "Sanitation Cess": number;
  "Drain Cess": number;
  "Water Bill": number;
  "Big Building": number;
  "Illegal Construction Penalty": number;
  "User Charges": number;
  "Service Tax": number;
  "Old Penalty of ULB": number;
  "Run Time Penalty": number;
}

/**
 * Items structure containing propertyId and tax amounts
 */
export interface TaxDetailsItems {
  propertyId: number;
  taxAmounts: TaxAmounts;
}

/**
 * Full API response structure for tax-details-cv endpoint
 */
export interface TaxDetailsResponse {
  success: boolean;
  message: string;
  items: TaxDetailsItems;
}

/**
 * Row structure for displaying tax details in the table
 */
export interface TaxRow extends Record<string, unknown> {
  taxType: string;
  generalTax: number;
  stateEducationTax: number;
  stateEmploymentTax: number;
  treeCess: number;
  specialWaterCess: number;
  roadCess: number;
  fireCess: number;
  lightCess: number;
  waterBenefitCess: number;
  sewageDisposalCess: number;
  specialEducationTax: number;
  sanitationCess: number;
  drainCess: number;
  waterBill: number;
  bigBuilding: number;
  illegalConstructionPenalty: number;
  userCharges: number;
  serviceTax: number;
  oldPenaltyULB: number;
  runTimePenalty: number;
  totalTax: number;
}

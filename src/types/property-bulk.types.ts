/**
 * Types for Bulk Property Creation API
 * Used in Zone Master for generating building structure properties
 * API endpoint: POST /api/Property/Bulk
 */

/**
 * Single property item for bulk creation
 */
export interface BulkPropertyItem {
  taxZoneId: number;
  wardId: number;
  propertyNo: string;
  propertyTypeId: number;
  categoryId: number;
  partitionNo: string;
  flatOrShopNo: string;
  flatOrShopNoEnglish: string;
  address: string;
  addressEnglish: string;
  location: string;
  locationEnglish: string;
  societyDetailId: number;
  createdBy: number;
  createdDate: string;
}

/**
 * Result for each property in the bulk creation response
 */
export interface BulkPropertyResult {
  propertyId: number;
  upicid: string | null;
  message: string;
  success: boolean;
}

/**
 * Response from the bulk property creation API
 * POST /api/Property/Bulk
 */
export interface BulkPropertyCreateResponse {
  successCount: number;
  failedCount: number;
  results: BulkPropertyResult[];
  errors: string[] | null;
  hasFailures: boolean;
  allSucceeded: boolean;
}

/**
 * Configuration for generating bulk property payload
 * Used in BuildingPreviewModal to collect user inputs
 */
export interface BulkPropertyGenerateConfig {
  taxZoneId: number;
  wardId: number;
  basePropertyNo: string;
  propertyTypeId: number;
  categoryId: number;
  societyDetailId: number;
  address: string;
  addressEnglish: string;
  location: string;
  locationEnglish: string;
  createdBy: number;
}

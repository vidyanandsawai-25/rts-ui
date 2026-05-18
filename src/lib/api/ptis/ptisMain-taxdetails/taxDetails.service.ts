/**
 * Tax Details Service
 * Provides API methods for fetching property tax details (Rateable Value & Capital Value)
 */

import { apiClient } from '@/services/api.service';
import { PtisMainTaxDetailsApiResponse, TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import { ApiResponse } from '@/types/common.types';

/**
 * Extracts TaxDetailsData from the API response with comprehensive error handling.
 * Validates both transport-level success and backend payload success flags.
 *
 * @param apiResponse - The wrapped API response from apiClient
 * @param endpoint - The endpoint name for error messages
 * @returns Extracted TaxDetailsData
 * @throws Error if response structure is invalid, API call failed, or backend returns error
 */
function extractTaxDetailsFromResponse(
  apiResponse: ApiResponse<PtisMainTaxDetailsApiResponse>,
  endpoint: string
): TaxDetailsData {
  // Check transport-level success (HTTP status)
  if (!apiResponse.success || !apiResponse.data) {
    throw new Error(apiResponse.error || `Failed to fetch data from ${endpoint} API`);
  }

  // Check backend payload success flag
  const response = apiResponse.data;
  if (response.success === false) {
    const errorMsg =
      response.errors?.[0] || response.message || `Backend error from ${endpoint} API`;
    throw new Error(errorMsg);
  }

  // Check nested structure success flag if present
  if (response.data?.success === false) {
    const nestedErrorMsg =
      response.data.errors?.[0] ||
      response.data.message ||
      `Backend error from ${endpoint} API (nested)`;
    throw new Error(nestedErrorMsg);
  }

  // Extract items from the response data (handles nested structure)
  const items = response?.items || response?.data?.items;

  if (items) {
    return items;
  }

  throw new Error(`Invalid response structure from ${endpoint} API`);
}

/**
 * Fetches general tax details for a property using Rateable Value method.
 * Uses SSR with no-store cache to ensure fresh data on each request.
 *
 * Endpoint: GET /api/Property/{propertyId}/tax-details
 *
 * @param propertyId - The unique identifier of the property
 * @returns Promise containing propertyId and policies array with taxAmounts
 * @throws Error if API call fails or response is invalid
 */
export async function getPtisMainTaxDetailsByPropertyId(propertyId: number): Promise<TaxDetailsData> {
  const response = await apiClient.get<PtisMainTaxDetailsApiResponse>(
    `/Property/${propertyId}/tax-details`,
    { cache: 'no-store' }
  );

  return extractTaxDetailsFromResponse(response, 'tax-details');
}

/**
 * Fetches Capital Value (CV) tax details for a property.
 * Uses SSR with no-store cache to ensure fresh data on each request.
 *
 * Endpoint: GET /api/Property/{propertyId}/tax-details-cv
 *
 * @param propertyId - The unique identifier of the property
 * @returns Promise containing propertyId and policies array with taxAmounts
 * @throws Error if API call fails or response is invalid
 */
export async function getPtisMainTaxDetailsCvByPropertyId(propertyId: number): Promise<TaxDetailsData> {
  const response = await apiClient.get<PtisMainTaxDetailsApiResponse>(
    `/Property/${propertyId}/tax-details-cv`,
    { cache: 'no-store' }
  );

  return extractTaxDetailsFromResponse(response, 'tax-details-cv');
}
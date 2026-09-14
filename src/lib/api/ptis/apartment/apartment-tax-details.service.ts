import 'server-only';
import { apiClient } from '@/services/api.service';
import { ApartmentTaxDetailsResponse } from '@/types/property-tax/apartment';

export interface GetApartmentTaxDetailsParams {
  wardId: number | string;
  propertyNo: string;
  taxType?: string;
}

function createErrorResponse(
  message: string,
  errors: string[] = [message]
): ApartmentTaxDetailsResponse {
  return {
    success: false,
    message,
    items: null,
    totalCount: null,
    errors,
    correlationId: null,
  };
}

/**
 * Fetches tax details (current taxes and arrears) for an apartment property.
 * Endpoint: /ApartmentQC/Taxdetails?wardId={wardId}&propertyNo={propertyNo}&taxType={taxType}
 */
export async function getApartmentTaxDetails({
  wardId,
  propertyNo,
  taxType = 'RV',
}: GetApartmentTaxDetailsParams): Promise<ApartmentTaxDetailsResponse> {
  try {
    const cleanWardId = String(wardId ?? '').trim();
    const cleanPropertyNo = String(propertyNo ?? '').trim();
    const cleanTaxType = (taxType ?? 'RV').trim().toUpperCase() || 'RV';

    if (!cleanWardId || !cleanPropertyNo) {
      return createErrorResponse('Ward ID and Property Number are required', [
        'Missing or invalid required parameters: wardId or propertyNo',
      ]);
    }

    const params = new URLSearchParams({
      wardId: cleanWardId,
      propertyNo: cleanPropertyNo,
      taxType: cleanTaxType,
    });

    const endpoint = `/ApartmentQC/Taxdetails?${params.toString()}`;
    const response = await apiClient.get<ApartmentTaxDetailsResponse>(endpoint, {
      cache: 'no-store',
    });

    if (response.success && response.data) {
      return response.data;
    }

    return createErrorResponse(
      response.error || 'Failed to fetch apartment tax details',
      response.error ? [response.error] : ['Unknown server error']
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Network error while fetching apartment tax details';
    return createErrorResponse(errorMessage, [errorMessage]);
  }
}

/**
 * Fetches Rateable Value (RV) based tax breakdown for an apartment property
 */
export async function getApartmentPropertyTaxDetailsRv(
  propertyId: number
): Promise<{ success: boolean; data?: Record<string, unknown> | null; message?: string; error?: string }> {
  try {
    if (!propertyId || !Number.isFinite(propertyId) || propertyId <= 0) {
      return { success: false, error: 'Valid Property ID is required' };
    }
    const endpoint = `/Property/apartment-property-tax-details-rv?Id=${encodeURIComponent(propertyId.toString())}`;
    const response = await apiClient.get<Record<string, unknown>>(endpoint, { cache: 'no-store' });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      error: response.error || 'Failed to fetch apartment RV tax details',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error fetching RV tax details',
    };
  }
}

/**
 * Fetches Capital Value (CV) based tax breakdown for an apartment property
 */
export async function getApartmentPropertyTaxDetailsCv(
  propertyId: number
): Promise<{ success: boolean; data?: Record<string, unknown> | null; message?: string; error?: string }> {
  try {
    if (!propertyId || !Number.isFinite(propertyId) || propertyId <= 0) {
      return { success: false, error: 'Valid Property ID is required' };
    }
    const endpoint = `/Property/apartment-property-tax-details-cv?Id=${encodeURIComponent(propertyId.toString())}`;
    const response = await apiClient.get<Record<string, unknown>>(endpoint, { cache: 'no-store' });

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }
    return {
      success: false,
      error: response.error || 'Failed to fetch apartment CV tax details',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error fetching CV tax details',
    };
  }
}

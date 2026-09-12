import { apiClient } from '@/services/api.service';
import {
  ApartmentQCTopSectionBelowFlexResponseDto,
  ApartmentQCTopSectionBelowFlexItemsDto,
} from '@/types/property-tax/apartment';

/**
 * Fetches workflow stages and certificate types for apartment QC top section below flex.
 * Endpoint: GET /ApartmentQC/below-flex?propertyId={propertyId}
 * 
 * @param propertyId Unique numerical ID of the property
 */
export async function getApartmentQCTopSectionBelowFlex(
  propertyId: number | string
): Promise<ApartmentQCTopSectionBelowFlexResponseDto> {
  try {
    const numericId = Number(propertyId);
    if (!numericId || !Number.isFinite(numericId) || numericId <= 0) {
      return {
        success: false,
        message: 'Valid Property ID is required',
        items: null,
      };
    }

    const endpoint = `/ApartmentQC/below-flex?propertyId=${encodeURIComponent(numericId.toString())}`;
    const response = await apiClient.get<ApartmentQCTopSectionBelowFlexResponseDto>(endpoint, {
      cache: 'no-store',
    });

    if (response.success && response.data) {
      const responsePayload = response.data;
      const itemsPayload = (responsePayload.items || responsePayload.data || responsePayload) as ApartmentQCTopSectionBelowFlexItemsDto;
      return {
        success: true,
        message: responsePayload.message || 'Record found successfully',
        items: itemsPayload,
        data: itemsPayload,
        errors: responsePayload.errors || null,
        correlationId: responsePayload.correlationId || null,
      };
    }

    return {
      success: false,
      message: response.error || 'Failed to fetch workflow stages',
      items: null,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error while fetching workflow stages',
      items: null,
    };
  }
}

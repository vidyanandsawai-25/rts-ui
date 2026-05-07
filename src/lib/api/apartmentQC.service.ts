import { apiClient } from '@/services/api.service';
import { ApartmentQCResponse, ApartmentQCDetail } from '@/types/apartmentQC.types';
import type { ActionResult } from '@/types/common.types';
import { handleServerError } from '@/lib/utils/server-action-error-handler';

/**
 * Normalize apartment QC detail to ensure all numeric fields are properly typed
 */
function normalizeApartmentQCDetail(item: ApartmentQCDetail): ApartmentQCDetail {
  return {
    ...item,
    id: Number(item.id ?? 0),
    taxZoneId: Number(item.taxZoneId ?? 0),
    wardId: Number(item.wardId ?? 0),
    rentYearly: Number(item.rentYearly ?? 0),
    rentMonthly: Number(item.rentMonthly ?? 0),
    oldConstArea: Number(item.oldConstArea ?? 0),
    oldRV: Number(item.oldRV ?? 0),
    oldTotalTax: Number(item.oldTotalTax ?? 0),
    rVorCVValue: Number(item.rVorCVValue ?? 0),
    capitalValue: Number(item.capitalValue ?? 0),
    rateableValue: Number(item.rateableValue ?? 0),
    newTaxTotal: Number(item.newTaxTotal ?? 0),
    newTaxTotalCV: Number(item.newTaxTotalCV ?? 0),
    newTaxTotalRV: Number(item.newTaxTotalRV ?? 0),
    carpetASqMtr: Number(item.carpetASqMtr ?? 0),
    carpetASqFt: Number(item.carpetASqFt ?? 0),
    builtupASqMtr: Number(item.builtupASqMtr ?? 0),
    builtupASqFt: Number(item.builtupASqFt ?? 0),
  };
}

/**
 * Normalize apartment QC response
 */
function normalizeApartmentQCResponse(data: ApartmentQCResponse): ApartmentQCResponse {
  return {
    ...data,
    items: Array.isArray(data.items)
      ? data.items.map(normalizeApartmentQCDetail)
      : [],
    errors: Array.isArray(data.errors) ? data.errors : [],
  };
}

/**
 * Service to fetch Apartment QC details
 * @param propertyId - Required property ID to filter results
 */
export async function getApartmentQCDetails(
  propertyId: number
): Promise<ActionResult<ApartmentQCResponse>> {
  try {
    const endpoint = `/Property/apartmentQC-details?propertyId=${propertyId}`;
    const response = await apiClient.get<ApartmentQCResponse>(endpoint, {
      cache: 'no-store',
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Failed to fetch apartment QC details',
        statusCode: response.statusCode,
      };
    }

    return {
      success: true,
      data: normalizeApartmentQCResponse(response.data),
      statusCode: response.statusCode,
    };
  } catch (error: unknown) {
    return handleServerError(error, 'fetching apartment QC details');
  }
}

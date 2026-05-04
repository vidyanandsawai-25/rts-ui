import { CapitalValueItem, CapitalValueResponse } from '@/types/capitalValue.types';
import { apiClient } from '@/services/api.service';
import type { ActionResult } from '@/types/common.types';
import { normalizePtisTaxes, validatePropertyId } from '@/lib/utils/ptis-normalization';
import { handleServerError } from '@/lib/utils/server-action-error-handler';

function normalizeCapitalValueResponse(data: CapitalValueResponse): CapitalValueResponse {
    const normalizeItem = (item: CapitalValueItem): CapitalValueItem => ({
        ...item,
        propertyDetailsId: Number(item.propertyDetailsId ?? 0),
        propertyId: Number(item.propertyId ?? 0),
        noOfRooms: Number(item.noOfRooms ?? 0),
        carpetAreaSqFeet: item.carpetAreaSqFeet ?? null,
        carpetAreaSqMeter: item.carpetAreaSqMeter ?? null,
        builtupAreaSqFeet: item.builtupAreaSqFeet ?? null,
        builtupAreaSqMeter: item.builtupAreaSqMeter ?? null,
        sdrr: Number(item.sdrr ?? 0),
        baseValue: Number(item.baseValue ?? 0),
        floorFactor: Number(item.floorFactor ?? 0),
        ageFactor: Number(item.ageFactor ?? 0),
        useFactor: Number(item.useFactor ?? 0),
        capitalValue: Number(item.capitalValue ?? 0),
        taxes: normalizePtisTaxes(item.taxes as unknown),
    });

    if (Array.isArray(data)) {
        return data.map(normalizeItem);
    }

    return {
        ...data,
        items: Array.isArray(data.items) ? data.items.map(normalizeItem) : data.items,
        details: Array.isArray(data.details) ? data.details.map(normalizeItem) : data.details,
    };
}

/**
 * Fetches Capital Value details for a property
 */
export async function getCapitalValue(
    propertyId: string | number
): Promise<ActionResult<CapitalValueResponse>> {
    try {
        const propertyIdNum = validatePropertyId(propertyId);

        if (!propertyIdNum) {
            return { success: false, error: 'Invalid property ID' };
        }

        const endpoint = `/CapitalValue/${propertyIdNum}`;
        const response = await apiClient.get<CapitalValueResponse>(endpoint, {
            cache: 'no-store',
        });

        if (!response.success || !response.data) {
            return {
                success: false,
                error: response.error || 'Failed to fetch capital value',
                statusCode: response.statusCode
            };
        }

        return {
            success: true,
            data: normalizeCapitalValueResponse(response.data),
            statusCode: response.statusCode
        };
    } catch (error: unknown) {
        return handleServerError(error, 'fetching capital value');
    }
}

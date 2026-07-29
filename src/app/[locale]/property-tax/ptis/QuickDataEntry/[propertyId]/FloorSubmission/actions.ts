'use server';
import { revalidatePath } from 'next/cache';
import {
    createFloorSubmission,
    updateFloorSubmission,
    deleteFloorSubmission,
    getFloorById,
    getQuickDataEntry,
    getPropertyByDetails,
    getFloorSubmissionsByOwner,
    getFloorData,
    getTypeOfUseData,
    getOpenPlotCategoryData,
    getConstructionTypeData,
    getSubTypeOfUseData,
    getSubFloorData,
    getRoomTypeData,
    deleteRoomSubmission,
    deleteOffsetSubmission,
    saveRenterDetails,
    updateRenterDetails,
    deleteRenterDetails,
    applyDataEntrySameAs,
    type ApplyDataEntrySameAsPayload,
    type ApplyDataEntrySameAsResponse,
} from '@/lib/api/ptis/floorSubmission';

import { getPropertyBasicDetails } from '@/lib/api/ptis/propertybasicdetails/property-basic-details.service';
import { PropertyBasicDetailsApiItem } from '@/types/property-basic-details.types';

import { validateFloorSubmissionPayload, validateRenterFormData } from '@/lib/validations/validateFloorSubmission';
import { type ActionResult } from '@/types/common.types';
import {
    FloorSubmissionPayload,
    type SelectableProperty,
    type DataEntrySameAsResponse,
    type DataEntrySameAsItem
} from '@/types/floor-details.types';
import { apiClient } from '@/services/api.service';

export type { SelectableProperty } from '@/types/floor-details.types';

export type QuickDataEntryPayload = Record<string, unknown>;

const sameAsCache = new Map<string, { data: SelectableProperty[]; timestamp: number }>();
const SAME_AS_CACHE_TTL = 30000; // 30 seconds

export async function clearDataEntrySameAsCache(): Promise<void> {
    sameAsCache.clear();
}

export async function fetchDataEntrySameAsAction(wardId: number, propertyNo: string, _categoryName?: string): Promise<SelectableProperty[]> {
    const cacheKey = `${wardId}-${propertyNo}`;
    const cached = sameAsCache.get(cacheKey);
    if (cached && cached.data && cached.data.length > 0 && (Date.now() - cached.timestamp < SAME_AS_CACHE_TTL)) {
        return cached.data;
    }

    try {
        const params = new URLSearchParams();
        params.set('WardId', String(wardId));
        params.set('PropertyNo', propertyNo);
        const response = await apiClient.get<DataEntrySameAsResponse>(`/DataEntrySameAs/units?${params.toString()}`, { cache: 'no-store' });
        
        const raw = (response?.data ?? response) as unknown;
        const rawObj = raw as Record<string, unknown>;
        const items: DataEntrySameAsItem[] = Array.isArray(raw)
            ? (raw as DataEntrySameAsItem[])
            : Array.isArray(rawObj?.items)
            ? (rawObj.items as DataEntrySameAsItem[])
            : Array.isArray((response as unknown as Record<string, unknown>)?.items)
            ? ((response as unknown as Record<string, unknown>).items as DataEntrySameAsItem[])
            : [];

        if (!items || !items.length) {
            return [];
        }
        const results = items.map((item) => {
            const extended = item as typeof item & {
                propertyCategoryName?: string | null;
                categoryName?: string | null;
                totalCarpetAreaSqFeet?: number | null;
                totalCarpetAreaSqMeter?: number | null;
                carpetAreaSqFeet?: number | null;
                carpetAreaSqMeter?: number | null;
                totalBuiltupAreaSqFeet?: number | null;
                totalBuiltupAreaSqMeter?: number | null;
                builtupAreaSqFeet?: number | null;
                builtupAreaSqMeter?: number | null;
                parkingCarpetAreaSqFeet?: number | null;
                parkingCarpetAreaSqMeter?: number | null;
                parkingBuiltupAreaSqFeet?: number | null;
                parkingBuiltupAreaSqMeter?: number | null;
            };
            const typeLabel = (item.typeLabel || item.typeName || undefined) as string | undefined;
            const catName = item.propertyCategoryName || item.categoryName || extended.propertyCategoryName || extended.categoryName || undefined;

            return {
                id: `${item.propertyId}-${item.propertyFloorId ?? ''}-${item.propertyDetailsId ?? ''}-${item.wingName || ''}-${item.flatOrShopNo || ''}`,
                propertyId: item.propertyId,
                propertyFloorId: item.propertyFloorId ?? null,
                propertyDetailsId: item.propertyDetailsId ?? null,
                wardId: item.wardId,
                wardNo: item.wardNo || '-',
                propertyNo: item.propertyNo || '-',
                partitionNo: item.partitionNo || '-',
                categoryName: catName ? String(catName) : '-',
                type: item.type ?? '-',
                typeLabel,
                wing: item.wingName || '-',
                flatNo: item.flatOrShopNo || '-',
                carpetAreaSqFeet: extended.totalCarpetAreaSqFeet ?? extended.carpetAreaSqFeet ?? null,
                carpetAreaSqMeter: extended.totalCarpetAreaSqMeter ?? extended.carpetAreaSqMeter ?? null,
                builtupAreaSqFeet: extended.totalBuiltupAreaSqFeet ?? extended.builtupAreaSqFeet ?? null,
                builtupAreaSqMeter: extended.totalBuiltupAreaSqMeter ?? extended.builtupAreaSqMeter ?? null,
                parkingCarpetAreaSqFeet: extended.parkingCarpetAreaSqFeet ?? null,
                parkingCarpetAreaSqMeter: extended.parkingCarpetAreaSqMeter ?? null,
                parkingBuiltupAreaSqFeet: extended.parkingBuiltupAreaSqFeet ?? null,
                parkingBuiltupAreaSqMeter: extended.parkingBuiltupAreaSqMeter ?? null,
            };
        });
        if (results.length > 0) {
            sameAsCache.set(cacheKey, { data: results, timestamp: Date.now() });
        }
        return results;
    } catch (_error) {
        return [];
    }
}

/**
 * Fetch property basic details including category information
 */
export async function getPropertyBasicDetailsAction(propertyId: number | string): Promise<PropertyBasicDetailsApiItem | null> {
    try {
        const pid = Number(propertyId);
        if (isNaN(pid) || pid <= 0) {
            return null;
        }
        return await getPropertyBasicDetails(pid);
    } catch (_error) {
        return null;
    }
}

/*
 * Individual fetchers for SSR lookups
 */
export async function getFloorDataAction() {
    try {
        return await getFloorData();
    } catch (_error) {
        return { success: false, error: "quickDataEntry.floorSubmission.errors.fetchFloorData" };
    }
}

export async function getConstructionTypeDataAction() {
    try {
        return await getConstructionTypeData();
    } catch (_error) {
        return { success: false, error: "quickDataEntry.floorSubmission.errors.fetchConstructionTypes" };
    }
}

export async function getTypeOfUseDataAction(propertyTypeId?: string | number) {
    try {
        return await getTypeOfUseData(propertyTypeId);
    } catch (_error) {
        return { success: false, error: "quickDataEntry.floorSubmission.errors.fetchUsageTypes" };
    }
}

export async function getOpenPlotCategoryDataAction() {
    try {
        return await getOpenPlotCategoryData();
    } catch (_error) {
        return { success: false, error: "quickDataEntry.floorSubmission.errors.fetchUsageTypes" };
    }
}

export async function getSubTypeOfUseDataAction(typeOfUseId?: string) {
    try {
        return await getSubTypeOfUseData(typeOfUseId);
    } catch (_error) {
        return { success: false, error: "quickDataEntry.floorSubmission.errors.fetchSubUsageTypes" };
    }
}

export async function getSubFloorDataAction() {
    try {
        return await getSubFloorData();
    } catch (_error) {
        return { success: false, error: "quickDataEntry.floorSubmission.errors.fetchSubFloorData" };
    }
}

export async function getRoomTypeDataAction() {
    try {
        return await getRoomTypeData();
    } catch (_error) {
        return { success: false, error: "quickDataEntry.floorSubmission.errors.fetchRoomTypes" };
    }
}

/**
 * Helper to resolve the actual path for revalidation
 */
function getRevalidatePath(locale: string, propertyId?: string | number) {
    const basePath = `/${locale}/property-tax/ptis/QuickDataEntry`;

    if (propertyId !== undefined && propertyId !== null && propertyId !== '') {
        return `${basePath}/${encodeURIComponent(String(propertyId))}/FloorSubmission`;
    }

    return basePath;
}

/**
 * Validates and submits a floor submission payload without redirect.
 */
export const submitFloorSubmissionNoRedirectAction = async (payload: FloorSubmissionPayload, locale: string = "en", propertyId?: string | number): Promise<ActionResult<unknown>> => {
    const validation = validateFloorSubmissionPayload(payload);
    if (!validation.success) return validation;
    try {
        const data = await createFloorSubmission(payload);
        revalidatePath(getRevalidatePath(locale, propertyId || (payload.propertyId as string | number)), "page");
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "quickDataEntry.floorSubmission.errors.submitFailed" };
    }
};

/**
 * Validates and updates a floor submission payload without redirect.
 */
export const updateFloorSubmissionNoRedirectAction = async (submissionId: number | string, payload: FloorSubmissionPayload, locale: string = "en", propertyId?: string | number): Promise<ActionResult<unknown>> => {
    const validation = validateFloorSubmissionPayload(payload);
    if (!validation.success) return validation;
    try {
        const data = await updateFloorSubmission(submissionId, payload);
        revalidatePath(getRevalidatePath(locale, propertyId || (payload.propertyId as string | number)), "page");
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "quickDataEntry.floorSubmission.errors.updateFailed" };
    }
};

/**
 * Deletes a floor submission without redirecting.
 */
export const deleteFloorSubmissionNoRedirectAction = async (submissionId: number | string, locale: string = "en", propertyId?: string | number): Promise<ActionResult<void>> => {
    try {
        await deleteFloorSubmission(submissionId);
        revalidatePath(getRevalidatePath(locale, propertyId), "page");
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "quickDataEntry.floorSubmission.errors.deleteFailed" };
    }
};

export const getFloorByIdAction = async (floorId: number | string) => {
    try {
        const data = await getFloorById(floorId);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'quickDataEntry.floorSubmission.errors.fetchFloorById' };
    }
};

export const getQuickDataEntryAction = async (wardNo: string, propNo: string, partNo: string) => {
    try {
        const data = await getQuickDataEntry(wardNo, propNo, partNo);
        return data
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'quickDataEntry.floorSubmission.errors.fetchQuickDataEntry' };
    }
};

export const getPropertyByDetailsAction = async (wardNo: string, propNo: string, partNo: string) => {
    try {
        const data = await getPropertyByDetails(wardNo, propNo, partNo);
        return data
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'quickDataEntry.floorSubmission.errors.fetchPropertyDetails' };
    }
};

export const getFloorSubmissionsByOwnerAction = async (ownerId: number | string) => {
    try {
        const data = await getFloorSubmissionsByOwner(ownerId);
        return data
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'quickDataEntry.floorSubmission.errors.fetchFloorSubmissions' };
    }
};

/**
 * Deletes a room submission without redirecting.
 */
export const deleteRoomSubmissionNoRedirectAction = async (roomId: number | string): Promise<ActionResult<void>> => {
    try {
        await deleteRoomSubmission(roomId);
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete room" };
    }
};

/**
 * Deletes an offset submission without redirecting.
 */
export const deleteOffsetSubmissionNoRedirectAction = async (offsetId: number | string): Promise<ActionResult<void>> => {
    try {
        await deleteOffsetSubmission(offsetId);
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete offset" };
    }
};

// ----------------------------------------------------------------------
// RENTER ACTIONS
// ----------------------------------------------------------------------

export const saveFloorRenterDetailsAction = async (floorId: string | number, payload: unknown, locale: string = "en", propertyId?: string | number): Promise<ActionResult<unknown>> => {
    const validation = validateRenterFormData(payload);
    if (!validation.success) return validation;
    try {
        const data = await saveRenterDetails(floorId, payload);
        const basePath = getRevalidatePath(locale, propertyId);
        revalidatePath(basePath, "page");
        revalidatePath(`${basePath}/Renter`, "page");
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to save renter details" };
    }
};

export const updateFloorRenterDetailsAction = async (renterId: string | number, payload: unknown, locale: string = "en", propertyId?: string | number): Promise<ActionResult<unknown>> => {
    try {
        const data = await updateRenterDetails(renterId, payload);
        const basePath = getRevalidatePath(locale, propertyId);
        revalidatePath(basePath, "page");
        revalidatePath(`${basePath}/Renter`, "page");
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update renter details" };
    }
};

export const deleteFloorRenterDetailsAction = async (renterId: string | number, locale: string = "en", propertyId?: string | number): Promise<ActionResult<void>> => {
    try {
        await deleteRenterDetails(renterId);
        const basePath = getRevalidatePath(locale, propertyId);
        revalidatePath(basePath, "page");
        revalidatePath(`${basePath}/Renter`, "page");
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete renter details" };
    }
};

export async function applyDataEntrySameAsAction(payload: ApplyDataEntrySameAsPayload, locale: string = "en"): Promise<ActionResult<ApplyDataEntrySameAsResponse['items']>> {
    try {
        const floorSubmissions = await getFloorSubmissionsByOwner(payload.sourcePropertyId);
        const hasFloorSubmission = Array.isArray(floorSubmissions) && floorSubmissions.length > 0;
        if (!hasFloorSubmission) {
            return {
                success: false,
                error: locale === 'mr'
                    ? "टाइप वाईज, प्रॉपर्टी वाईज किंवा पार्किंग डेटा लागू करण्यापूर्वी फ्लोअर सबमिशन आवश्यक आहे."
                    : locale === 'hi'
                    ? "टाइप वाइज, प्रॉपर्टी वाइज या पार्किंग डेटा लागू करने से पहले फ्लोर सबमिशन आवश्यक है।"
                    : "Floor submission is required before applying Type Wise, Property Wise, or Parking data."
            };
        }
        const data = await applyDataEntrySameAs(payload);
        await clearDataEntrySameAsCache();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
}
// ----------------------------------------------------------------------
// PLOT AREA ACTIONS
// ----------------------------------------------------------------------


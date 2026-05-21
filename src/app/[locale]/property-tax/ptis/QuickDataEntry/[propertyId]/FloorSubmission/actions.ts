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
    getConstructionTypeData,
    getSubTypeOfUseData,
    getSubFloorData,
    deleteRoomSubmission,
    deleteOffsetSubmission,
    saveRenterDetails,
    updateRenterDetails,
    deleteRenterDetails,
} from '@/lib/api/ptis/floorSubmission';

import { validateFloorSubmissionPayload, validateRenterFormData } from '@/lib/validations/validateFloorSubmission';
import { type ActionResult } from '@/types/common.types';
import { FloorSubmissionPayload } from '@/types/floor-details.types';

export type QuickDataEntryPayload = Record<string, unknown>;

/**
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

export async function getTypeOfUseDataAction() {
    try {
        return await getTypeOfUseData();
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
        revalidatePath(getRevalidatePath(locale, propertyId), "page");
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to save renter details" };
    }
};

export const updateFloorRenterDetailsAction = async (renterId: string | number, payload: unknown, locale: string = "en", propertyId?: string | number): Promise<ActionResult<unknown>> => {
    try {
        const data = await updateRenterDetails(renterId, payload);
        revalidatePath(getRevalidatePath(locale, propertyId), "page");
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update renter details" };
    }
};

export const deleteFloorRenterDetailsAction = async (renterId: string | number, locale: string = "en", propertyId?: string | number): Promise<ActionResult<void>> => {
    try {
        await deleteRenterDetails(renterId);
        revalidatePath(getRevalidatePath(locale, propertyId), "page");
        return { success: true, data: undefined };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete renter details" };
    }
};

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
} from '@/lib/api/ptis/floorSubmission';

import { validateFloorSubmissionPayload } from '@/lib/validations/validateFloorSubmission';
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
        return { success: false, error: "floor.errors.fetchFloorData" };
    }
}

export async function getConstructionTypeDataAction() {
    try {
        return await getConstructionTypeData();
    } catch (_error) {
        return { success: false, error: "floor.errors.fetchConstructionTypes" };
    }
}

export async function getTypeOfUseDataAction() {
    try {
        return await getTypeOfUseData();
    } catch (_error) {
        return { success: false, error: "floor.errors.fetchUsageTypes" };
    }
}

export async function getSubTypeOfUseDataAction(typeOfUseId?: string) {
    try {
        return await getSubTypeOfUseData(typeOfUseId);
    } catch (_error) {
        return { success: false, error: "floor.errors.fetchSubUsageTypes" };
    }
}

export async function getSubFloorDataAction() {
    try {
        return await getSubFloorData();
    } catch (_error) {
        return { success: false, error: "floor.errors.fetchSubFloorData" };
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

// ----------------------------------------------------------------------
// FLOOR DETAILS ACTIONS (Mutation)
// ----------------------------------------------------------------------

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
        return { success: false, error: error instanceof Error ? error.message : "Failed to submit data" };
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
        return { success: false, error: error instanceof Error ? error.message : "Failed to update data" };
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
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete floor" };
    }
};

// ----------------------------------------------------------------------
// FETCH ACTIONS (Shared)
// ----------------------------------------------------------------------

export const getFloorByIdAction = async (floorId: number | string) => {
    try {
        const data = await getFloorById(floorId);
        return { success: true, data };
    } catch (_error) {
        return { success: false, error: "floor.errors.fetchFloorById" };
    }
};

export const getQuickDataEntryAction = async (wardNo: string, propNo: string, partNo: string) => {
    try {
        const data = await getQuickDataEntry(wardNo, propNo, partNo);
        return data
    } catch (_error) {
        return { success: false, error: "floor.errors.fetchFloorData" };
    }
};

export const getPropertyByDetailsAction = async (wardNo: string, propNo: string, partNo: string) => {
    try {
        const data = await getPropertyByDetails(wardNo, propNo, partNo);
        return data
    } catch (_error) {
        return { success: false, error: "property.updateError" };
    }
};

export const getFloorSubmissionsByOwnerAction = async (ownerId: number | string) => {
    try {
        const data = await getFloorSubmissionsByOwner(ownerId);
        return data
    } catch (_error) {
        return { success: false, error: "floor.errors.fetchFloorData" };
    }
};

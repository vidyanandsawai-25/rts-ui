/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { normalizeApiFloorData } from "./floor-types-guard";
import { sanitizeRenterPayload } from "./payload-sanitization";
import { validateRenterFormData } from "./payload-validation";
import { createApiError } from "./error-helpers";
import { type SubmissionResponse } from '@/types/floor-details.types';

const API_ENDPOINTS = {
    DATA_ENTRY: '/DataEntry',
    DATA_ENTRY_BY_ID: (id: string | number) => `/DataEntry/${encodeURIComponent(String(id))}`,
};

/**
 * Submits/upserts renter details for a specific floor.
 * Follows the floor-submission pattern with validation, sanitization, and normalization.
 */
export async function saveRenterDetails(floorId: string | number, payload: unknown): Promise<Record<string, unknown> | unknown> {
    try {
        validateRenterFormData(payload);
        const sanitizedPayload = sanitizeRenterPayload(payload);
        
        // Determine if this is an update (PUT) or create (POST)
        const propertyDetailsId = Number(floorId || (payload as any).propertyDetailsId || (payload as any).id);
        const TEMP_ID_THRESHOLD = 1_000_000_000_000;
        const isUpdate = propertyDetailsId > 0 && propertyDetailsId < TEMP_ID_THRESHOLD;

        if (isUpdate) {
            return updateRenterDetails(propertyDetailsId, sanitizedPayload);
        }

        const response = await apiClient.post<SubmissionResponse>(API_ENDPOINTS.DATA_ENTRY, sanitizedPayload);
        
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Save renter details failed");
        }
        
        return response.data ? normalizeApiFloorData(response.data as unknown as Record<string, unknown>) : response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Updates an existing renter record.
 */
export async function updateRenterDetails(renterId: string | number, payload: unknown): Promise<Record<string, unknown> | unknown> {
    try {
        const sanitizedPayload = sanitizeRenterPayload(payload);
        const response = await apiClient.put<SubmissionResponse>(API_ENDPOINTS.DATA_ENTRY_BY_ID(renterId), sanitizedPayload);
        
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Update renter details failed");
        }
        
        return response.data ? normalizeApiFloorData(response.data as unknown as Record<string, unknown>) : response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Deletes a renter record (clears renter data from floor while preserving floor data).
 */
export async function deleteRenterDetails(renterId: string | number): Promise<void> {
    try {
        if (!renterId) {
            throw new ApiError(400, "floor.errors.submissionIdRequired", "Renter ID validation failed");
        }
        
        // Following the pattern of sending a PUT with renterYesNo: false to clear renter data
        const response = await apiClient.put<SubmissionResponse>(API_ENDPOINTS.DATA_ENTRY_BY_ID(renterId), { 
            renterYesNo: false,
            updatedBy: 0 
        });
        
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Delete renter details failed");
        }
    } catch (error) {
        throw error;
    }
}


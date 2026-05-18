import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { normalizeApiFloorData } from "./floor-types-guard";
import { sanitizeFloorPayload, sanitizeFloorUpdatePayload } from "./payload-sanitization";
import { validateSubmissionId, validateCreateFormData, validateUpdateFormData } from "./payload-validation";
import { createApiError, getDeleteErrorStatusCode } from "./error-helpers";
import {
    type FloorSubmissionPayload,
    type SubmissionResponse
} from '@/types/floor-details.types';

/**
 * Submits a new floor to the backend. Returns the raw/mapped created data.
 */
export async function createFloorSubmission(payload: FloorSubmissionPayload): Promise<Record<string, unknown> | unknown> {
    try {
        validateCreateFormData(payload);
        const sanitizedPayload = sanitizeFloorPayload(payload);
        const response = await apiClient.post<SubmissionResponse>("/DataEntry", sanitizedPayload);
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Create floor submission failed");
        }
        return response.data ? normalizeApiFloorData(response.data as unknown as Record<string, unknown>) : response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Updates an existing floor submission.
 */
export async function updateFloorSubmission(submissionId: number | string, payload: FloorSubmissionPayload): Promise<Record<string, unknown> | unknown> {
    try {
        validateUpdateFormData(submissionId, payload);
        const sanitizedPayload = sanitizeFloorUpdatePayload(payload);
        const response = await apiClient.put<SubmissionResponse>(`/DataEntry/${encodeURIComponent(String(submissionId))}`, sanitizedPayload);
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Update floor submission failed");
        }
        return response.data ? normalizeApiFloorData(response.data as unknown as Record<string, unknown>) : response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Deletes an existing floor submission.
 */
export async function deleteFloorSubmission(submissionId: number | string): Promise<void> {
    try {
        if (!validateSubmissionId(submissionId)) {
            throw new ApiError(400, "floor.errors.submissionIdRequired", "Floor submission ID validation failed");
        }
        const response = await apiClient.delete<unknown>(`/DataEntry/${encodeURIComponent(String(submissionId))}`);
        if (!response.success) {
            let statusCode = response.statusCode;
            if (!statusCode) {
                statusCode = getDeleteErrorStatusCode(response.error || "");
            }
            throw new ApiError(statusCode, response.error || "Failed to delete floor data", `Delete floor ${submissionId} failed`);
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Deletes a room-wise submission.
 */
export async function deleteRoomSubmission(roomId: number | string): Promise<void> {
    try {
        const response = await apiClient.delete<unknown>(`/RoomWiseSubmission/${encodeURIComponent(String(roomId))}`);
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Delete room data failed");
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Deletes an offset-wise submission.
 */
export async function deleteOffsetSubmission(offsetId: number | string): Promise<void> {
    try {
        const response = await apiClient.delete<unknown>(`/RoomWiseMinus/${encodeURIComponent(String(offsetId))}`);
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Delete offset data failed");
        }
    } catch (error) {
        throw error;
    }
}

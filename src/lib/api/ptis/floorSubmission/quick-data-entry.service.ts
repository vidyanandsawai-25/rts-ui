import { apiClient } from "@/services/api.service";
import { ApiError } from "@/lib/utils/api";
import { createApiError } from "./error-helpers";
import { type QuickDataEntryPayload } from '@/types/floor-details.types';

/**
 * Fetch Property submission for quick data entry
 */
export async function getQuickDataEntry(wardNo: string, propertyNo: string, partitionNo: string): Promise<unknown | null> {
    try {
        const params = new URLSearchParams({
            WardNo: wardNo,
            PropertyNo: propertyNo,
            PartitionNo: partitionNo
        });
        const response = await apiClient.get<unknown>(
            `/DataEntry?${params.toString()}`,
            { cache: 'no-store' }
        );
        if (!response.success) {
            throw new ApiError(response.statusCode ?? 500, response.error || "Failed to fetch quick data entry", "Fetch quick data failed");
        }
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 * Create a new quick data entry submission
 */
export async function createSubmission(payload: QuickDataEntryPayload): Promise<void> {
    try {
        const response = await apiClient.post<unknown>("/DataEntry", payload);
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Save property details failed");
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Update an existing quick data entry submission
 */
export async function updateSubmission(payload: QuickDataEntryPayload): Promise<void> {
    try {
        const response = await apiClient.put<unknown>(
            `/DataEntry`,
            payload
        );
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Update property details failed");
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Delete an existing quick data entry submission
 */
export async function deleteSubmission(id: string | number): Promise<void> {
    try {
        const response = await apiClient.delete<unknown>(
            `/PropertyFloor/${encodeURIComponent(String(id))}`
        );
        if (!response.success) {
            throw createApiError(response.statusCode, response.error, "Delete property details failed");
        }
    } catch (error) {
        throw error;
    }
}

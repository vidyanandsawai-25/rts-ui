'use server';

import { automationGetGeoSequencingGrid, automationGetGeoSequencingWardWiseSummary } from "@/lib/api/automation-dashboard/geo-sequencing/geo-sequencing.service";
import { GeoSequencingItems } from "@/types/automation-dashboard/geo-sequencing/geo-sequencing.type";

/**
 * Server action to fetch the geo-sequencing grid data.
 * 
 * @param workflowStageId Optional ID to filter the grid data by workflow stage.
 * @returns An object containing success status, data, and optional error message.
 */
export async function getGeoSequencingGridAction(
    workflowStageId?: string | number
): Promise<{ success: boolean; data?: GeoSequencingItems | null; error?: string }> {
    try {
        const data = await automationGetGeoSequencingGrid(workflowStageId);        
        return { success: true, data };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to fetch geo-sequencing grid data";
        return { success: false, error: errorMsg };
    }
}

export async function getWardWiseSummaryAction(
    zoneId: string | number,
    workflowStageId?: string | number,
    pageNumber: number = 1,
    pageSize: number = 10
) {
    try {
        const data = await automationGetGeoSequencingWardWiseSummary(zoneId, workflowStageId, pageNumber, pageSize);
        return { success: true, data };
    } catch (_error) {
        return { success: false, data: null, error: 'Failed to fetch ward-wise summary' };
    }   
}

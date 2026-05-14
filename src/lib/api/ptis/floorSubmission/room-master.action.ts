"use server";

import { getRoomTypeOptions } from "@/lib/api/ptis/floorSubmission/floor-lookup.service";
import { ActionResult } from "@/types/common.types";

function getActionErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return 'Something went wrong while fetching room types.';
}

/**
 * Server action to fetch room type options for dropdowns
 */
export async function getRoomTypeOptionsAction(): Promise<ActionResult<string[]>> {
    try {
        const options = await getRoomTypeOptions();
        return { success: true, data: options };
    } catch (error) {
        return { success: false, error: getActionErrorMessage(error) };
    }
}

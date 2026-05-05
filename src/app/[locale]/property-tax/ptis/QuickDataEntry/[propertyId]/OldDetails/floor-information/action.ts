"use server";

import {
    getFloors,
    getSubFloors,
    getConstructionTypes,
    getTypeOfUses,
    getSubTypeOfUses,
    getOldFloordetails,
    saveOldFloorDetails,
    updateOldFloorDetails,
    deleteOldFloorDetails
} from "@/lib/api/old-details-floor-information.service";
import { ActionResult } from "@/types/common.types";
import {
    ConstructionType,
    Floor,
    SubFloor,
    SubTypeOfUse,
    TypeOfUse,
    OldFloorDetail,
    OldFloorDetailsResponse
} from "@/types/property-old-details.types";
import { revalidatePath } from "next/cache";

//  Common error message helper for actions
function getActionErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return 'Something went wrong. Please try again.';
}

export async function GetFloorsAction(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
): Promise<ActionResult<Floor[]>> {
    try {
        const response = await getFloors(pageNumber, pageSize, searchTerm);
        return {
            success: true,
            data: response.items || []
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

export async function GetSubFloorsAction(
     pageNumber: number,
    pageSize: number,
    searchTerm?: string
): Promise<ActionResult<SubFloor[]>> {
    try {
        const response = await getSubFloors(pageNumber, pageSize, searchTerm);
        return {
            success: true,
            data: response.items || []
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

//  Fetches all Construction Types.
export async function GetConstructionTypesAction(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
): Promise<ActionResult<ConstructionType[]>> {
    try {
        const response = await getConstructionTypes(pageNumber, pageSize, searchTerm);
        return {
            success: true,
            data: response.items || []
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

// Fetches all Type of Uses.
export async function GetTypeOfUsesAction(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
): Promise<ActionResult<TypeOfUse[]>> {
    try {
        const response = await getTypeOfUses(pageNumber, pageSize, searchTerm);
        return {
            success: true,
            data: response.items || []
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

/**
 * Fetches Sub Type of Use list based on the selected Type of Use ID.
 * @param typeOfUseId The ID of the selected Type of Use
 */
export async function GetSubTypeOfUsesAction(
    typeOfUseId: number,
    pageNumber: number,
    pageSize: number,
    searchTerm?: string): Promise<ActionResult<SubTypeOfUse[]>> {
    try {
        const response = await getSubTypeOfUses(typeOfUseId,pageNumber, pageSize, searchTerm);
        return {
            success: true,
            data: response.items || []
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

/**
 * Fetches existing Old Floor Details for a property.
 * @param propertyId The ID of the property
 */
export async function GetOldFloorDetailsAction(propertyId: number): Promise<ActionResult<OldFloorDetail[]>> {
    try {
        const response = await getOldFloordetails(propertyId);
        return {
            success: true,
            data: response.items?.floorDetails || []
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

/**
 * Saves (Create or Update) Old Floor Details.
 * @param propertyId The ID of the property
 * @param data The floor detail data
 * @param locale The current locale for revalidation
 */
export async function SaveOldFloorDetailsAction(propertyId: number, data: unknown, locale: string): Promise<ActionResult<OldFloorDetailsResponse>> {
    try {
        const response = await saveOldFloorDetails(propertyId, data);
        
        // ✅ Revalidate the floor information path to refresh server-side data (Existing Floors list)
        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/OldDetails/floor-information`);
        return {
            success: true,
            data: response
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

/**
 * Updates existing Old Floor Details.
 * @param propertyId The ID of the property
 * @param floorDetailId The ID of the floor detail to update
 * @param data The updated floor detail data
 * @param locale The current locale for revalidation
 */
export async function UpdateOldFloorDetailsAction(
    propertyId: number,
    floorDetailId: number,
    data: unknown,
    locale: string
): Promise<ActionResult<OldFloorDetailsResponse>> {
    try {
        const response = await updateOldFloorDetails(propertyId, floorDetailId, data);
        
        // ✅ Revalidate the floor information path to update the UI list with latest changes
        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/OldDetails/floor-information`);
        return {
            success: true,
            data: response
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

/**
 * Deletes existing Old Floor Details.
 * @param propertyId The ID of the property
 * @param floorDetailId The ID of the floor detail to delete
 * @param locale The current locale for revalidation
 */
export async function DeleteOldFloorDetailsAction(
    propertyId: number,
    floorDetailId: number,
    locale: string
): Promise<ActionResult<void>> {
    try {
        await deleteOldFloorDetails(propertyId, floorDetailId);
        
        // ✅ Revalidate the floor information path to remove the deleted record from UI
        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/OldDetails/floor-information`);
        return {
            success: true,
            data: undefined
        };
    } catch (error) {
        return {
            success: false,
            error: getActionErrorMessage(error)
        };
    }
}

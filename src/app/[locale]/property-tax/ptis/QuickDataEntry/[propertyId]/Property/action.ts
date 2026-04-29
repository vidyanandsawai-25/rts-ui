"use server";

import {
    getPropertyBasicDetails,
    getPropertyCategories,
    getPropertyTypes,
    getWingMaster,
    updatePropertyBasicDetails
} from "@/lib/api/property-basic-details.service";

import {
    PropertyBasicDetailsApiItem,
    PropertyCategoryApiItem,
    PropertyTypeApiItem,
    UpdatePropertyBasicDetailsDto,
    WingItem
} from "@/types/property-basic-details.types";

import { ActionResult } from "@/types/common.types";
import { revalidatePath } from "next/cache";


function getActionErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    return 'Something went wrong. Please try again.';
}

// Property Basic Details
export async function getPropertyBasicDetailsAction(propertyId: number): Promise<ActionResult<PropertyBasicDetailsApiItem | null>> {
    try {
        const data = await getPropertyBasicDetails(propertyId);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: getActionErrorMessage(error) };
    }
}

// Property Categories
export async function getPropertyCategoriesAction(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
): Promise<ActionResult<PropertyCategoryApiItem[]>> {
    try {
        const data = await getPropertyCategories(pageNumber, pageSize, searchTerm);
        return { success: true, data: data ?? [] };
    } catch (error) {
        return { success: false, error: getActionErrorMessage(error) };
    }
}

// Property Types
export async function getPropertyTypesAction(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
): Promise<ActionResult<PropertyTypeApiItem[]>> {
    try {
        const data = await getPropertyTypes(pageNumber, pageSize, searchTerm);
        return { success: true, data: data ?? [] };
    } catch (error) {
        return { success: false, error: getActionErrorMessage(error) };

    }
}

// wing master
export async function getWingMasterAction(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
): Promise<ActionResult<WingItem[]>> {
    try {
        const data = await getWingMaster(pageNumber, pageSize, searchTerm);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: getActionErrorMessage(error) };
    }
}

//update property basic details
export const updatePropertyBasicDetailsAction = async (locale: string, propertyId: number, payload: UpdatePropertyBasicDetailsDto): Promise<ActionResult> => {
    try {
        const result = await updatePropertyBasicDetails(propertyId, payload);
        if (!result.success) {
            return result;
        }

        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Property`, "page");
        return result;
    } catch (error) {
        return { success: false, error: getActionErrorMessage(error) };
    }
}; 
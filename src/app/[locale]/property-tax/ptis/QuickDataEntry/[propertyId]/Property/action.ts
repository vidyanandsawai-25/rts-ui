"use server";

import {
    getPropertyBasicDetails, getPropertyCategories, getPropertyTypes, getWingMaster, updatePropertyBasicDetails
} from "@/lib/api/property-basic-details.service";

import {
    ActionResult,
    PropertyBasicDetailsApiItem,
    PropertyCategoryApiItem,
    PropertyTypeApiItem,
    UpdatePropertyBasicDetailsDto,
    WingItem
} from "@/types/property-basic-details.types";

import { revalidatePath } from "next/cache";

// Property Basic Details
export async function getPropertyBasicDetailsAction(propertyId: number): Promise<{ success: boolean; data: PropertyBasicDetailsApiItem | null }> {
    try {
        const data = await getPropertyBasicDetails(propertyId);
        return { success: true, data };
    } catch (error) {
        console.error("Get property basic details error:", error);
        return { success: false, data: null };
    }
}

// Property Categories
export async function getPropertyCategoriesAction(): Promise<{ success: boolean; data: PropertyCategoryApiItem[] }> {
    try {
        const data = await getPropertyCategories(50);
        return { success: true, data: data ?? [] };
    } catch (error) {
        console.error("Get property categories error:", error);
        return { success: false, data: [] };
    }
}

// Property Types
export async function getPropertyTypesAction(search?: string): Promise<{ success: boolean; data: PropertyTypeApiItem[] }> {
    try {
        const data = await getPropertyTypes(200, search);
        return { success: true, data: data ?? [] };
    } catch (error) {
        console.error("Get property types error:", error);
        return { success: false, data: [] };
    }
}

// wing master
export async function getWingMasterAction(): Promise<{ success: boolean; data: WingItem[]; }> {
    try {
        const data = await getWingMaster();
        return { success: true, data };
    } catch (error) {
        console.error("Get wing master error:", error);
        return { success: false, data: [] };
    }
}

export const updatePropertyBasicDetailsAction = async (locale: string, propertyId: number, payload: UpdatePropertyBasicDetailsDto): Promise<ActionResult> => {
    try {
        const data = await updatePropertyBasicDetails(propertyId, payload);
        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Property`, "page");
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update data" };
    }
};
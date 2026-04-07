"use server";

import { getCategories, getPropertyAssessment, getPropertyBasicDetails, getPropertyById, getPropertyCategories, getPropertyDescriptions, getPropertyDetails, getPropertyTypes, getSubCategories, getWingMaster, updatePropertyBasicDetails } from "@/lib/api/property-basic-details.service";

import {
    ActionResult,
    CategoryApiItem,
    PropertyApiItem,
    PropertyAssessmentApiItem,
    PropertyBasicDetailsApiItem,
    PropertyCategoryApiItem,
    PropertyDescriptionApiItem,
    PropertyDetailsApiItem,
    PropertyTypeApiItem,
    SubCategoryApiItem,
    UpdatePropertyBasicDetailsDto,
    WingItem
} from "@/types/property-basic-details.types";

import { revalidatePath } from "next/cache";

// Property Assessment
export async function getPropertyAssessmentAction(propertyId: number): Promise<{ success: boolean; data: PropertyAssessmentApiItem | null }> {
    try {
        const data = await getPropertyAssessment(propertyId);
        return { success: true, data };
    } catch (error) {
        console.error("Get property assessment error:", error);
        return { success: false, data: null };
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

// Property Description
export async function getPropertyDescriptionsAction(search?: string): Promise<{ success: boolean; data: PropertyDescriptionApiItem[] }> {
    try {
        const data = await getPropertyDescriptions(search);
        return { success: true, data: data ?? [] };
    } catch (error) {
        console.error("Get property descriptions error:", error);
        return { success: false, data: [] };
    }
}

// Category
export async function getCategoriesAction(search?: string): Promise<{ success: boolean; data: CategoryApiItem[] }> {
    try {
        const data = await getCategories(search);
        return { success: true, data: data ?? [] };
    } catch (error) {
        console.error("Get categories error:", error);
        return { success: false, data: [] };
    }
}

// SubCategory
export async function getSubCategoriesAction(categoryId?: string): Promise<{ success: boolean; data: SubCategoryApiItem[] }> {
    try {
        const data = await getSubCategories(categoryId);
        return { success: true, data: data ?? [] };
    } catch (error) {
        console.error("Get sub categories error:", error);
        return { success: false, data: [] };
    }
}

// Property by ID
export async function getPropertyByIdAction(propertyId: number): Promise<{ success: boolean; data: PropertyApiItem | null }> {
    try {
        const data = await getPropertyById(propertyId);
        return { success: true, data: data ?? null };
    } catch (error) {
        console.error("Get property by ID error:", error);
        return { success: false, data: null };
    }
}

// Property Details (Floors)
export async function getPropertyDetailsAction(propertyId: number): Promise<{ success: boolean; data: PropertyDetailsApiItem[] }> {
    try {
        const data = await getPropertyDetails(propertyId);
        return { success: true, data: data ?? [] };
    } catch (error) {
        console.error("Get property details error:", error);
        return { success: false, data: [] };
    }
}

// Get Type Of Use Actions
// export const getPropertyTypeOfUseDataAction = async () => {
//     try {
//         const data = await getPropertyTypeOfUseData();
//         return { success: true, data: data ?? [] };
//     } catch (error) {
//         return { success: false, error: error instanceof Error ? error.message : "Failed to fetch use data" };
//     }
// };

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

// Update Property Basic Details
export const updatePropertyBasicDetailsAction = async (propertyId: number, payload: UpdatePropertyBasicDetailsDto): Promise<ActionResult> => {
    try {
        const data = await updatePropertyBasicDetails(propertyId, payload);
        revalidatePath("/[locale]/ptis/QuickDataEntry/Property", "page");
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update data" };
    }
};

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
"use server";

import {
    getPropertyBasicDetails,
    getPropertyCategories,
    getPropertyTypes,
    getWingMaster,
    getMoujaMaster,
    updatePropertyBasicDetails,
    getTaxZones
} from "@/lib/api/property-basic-details.service";

import {
    PropertyBasicDetailsApiItem,
    PropertyCategoryApiItem,
    PropertyTypeApiItem,
    UpdatePropertyBasicDetailsDto,
    WingItem,
    MoujaItem,
    TaxZoneItem
} from "@/types/property-basic-details.types";

import { ActionResult } from "@/types/common.types";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

async function getActionErrorMessage(error: unknown): Promise<string> {
    const t = await getTranslations("quickDataEntry");
    if (error instanceof Error && error.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes('fetch failed') || msg.includes('failed to fetch') || msg.includes('network error') || msg.includes('econnrefused')) {
            return t('property.errors.failedToConnect.description');
        }
        return error.message;
    }
    return t('property.errors.failedToConnect.description');
}

// Property Basic Details
export async function getPropertyBasicDetailsAction(propertyId: number): Promise<ActionResult<PropertyBasicDetailsApiItem | null>> {
    try {
        const data = await getPropertyBasicDetails(propertyId);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: await getActionErrorMessage(error) };
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
        return { success: false, error: await getActionErrorMessage(error) };
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
        return { success: false, error: await getActionErrorMessage(error) };
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
        return { success: false, error: await getActionErrorMessage(error) };
    }
}

// mouja master
export async function getMoujaMasterAction(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
): Promise<ActionResult<MoujaItem[]>> {
    try {
        const data = await getMoujaMaster(pageNumber, pageSize, searchTerm);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: await getActionErrorMessage(error) };
    }
}

//update property basic details
export const updatePropertyBasicDetailsAction = async (locale: string, propertyId: number, payload: UpdatePropertyBasicDetailsDto): Promise<ActionResult<null>> => {
    try {
        const result = await updatePropertyBasicDetails(propertyId, payload);
        if (!result.success) {
            return result;
        }

        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Property`, "page");
        return result;
    } catch (error) {
        return { success: false, error: await getActionErrorMessage(error) };
    }
};

// tax zone master
export async function getTaxZonesAction(
    pageNumber: number = 1,
    pageSize: number = 100,
    searchTerm?: string
): Promise<ActionResult<TaxZoneItem[]>> {
    try {
        const data = await getTaxZones(pageNumber, pageSize, searchTerm);
        return { success: true, data };
    } catch (error) {
        return { success: false, error: await getActionErrorMessage(error) };
    }
}
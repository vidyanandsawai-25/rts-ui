"use server"

import { getDiscountDetails, updateDiscountDetails } from "@/lib/api/discount.service";
import { revalidatePath } from "next/cache";
import { DiscountDetailsItem, DiscountApiResponse } from "@/types/discount.types";
import { ApiResponse } from "@/types/common.types";

export async function getDiscountDetailsAction(propertyId: string): Promise<ApiResponse<DiscountApiResponse>> {
    try {
        const response = await getDiscountDetails(propertyId);
        return response;
    } catch (_error) {
        // Error logged for debugging (removed in production)
        return { success: false, data: undefined, error: "An unexpected error occurred" };
    }
}

export async function updateDiscountDetailsAction(locale: string, propertyId: string, data: Partial<DiscountDetailsItem>): Promise<ApiResponse<DiscountApiResponse>> {
    try {
        const response = await updateDiscountDetails(propertyId, data);
        if (response.success) {
            revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
        }
        return response;
    } catch (_error) {
        // Error logged for debugging (removed in production)
        return { success: false, data: undefined, error: "An unexpected error occurred" };
    }
}

"use server"

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getDiscountDetails, updateDiscountDetails } from "@/lib/api/discount.service";
import { getPropertySocialInfo, upsertPropertySocialInfo } from "@/lib/api/property-social-details.service";
import { getUserIdFromCookies } from "@/lib/utils/auth-session";
import { logger } from "@/lib/utils/logger";
import { DiscountDetailsItem, DiscountApiResponse } from "@/types/discount.types";
import { ApiResponse } from "@/types/common.types";
import {
    PropertySocialInfoApiResponse,
    UpsertPropertySocialInfoApiResponse,
    PropertySocialInfoItemDto
} from "@/types/property-social-details.types";

export async function getDiscountDetailsAction(propertyId: string): Promise<ApiResponse<DiscountApiResponse>> {
    try {
        const response = await getDiscountDetails(propertyId);
        return response;
    } catch (error) {
        logger.error("getDiscountDetailsAction failed", { propertyId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, data: undefined, error: "An unexpected error occurred" };
    }
}

export async function updateDiscountDetailsAction(
    locale: string,
    propertyId: string,
    data: Partial<DiscountDetailsItem>
): Promise<ApiResponse<DiscountApiResponse>> {
    try {
        const response = await updateDiscountDetails(propertyId, data);
        if (response.success && response.data?.success) {
            revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
        }
        return response;
    } catch (error) {
        logger.error("updateDiscountDetailsAction failed", { propertyId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, data: undefined, error: "An unexpected error occurred" };
    }
}

export async function getPropertySocialInfoAction(propertyId: string): Promise<ApiResponse<PropertySocialInfoApiResponse>> {
    try {
        const response = await getPropertySocialInfo(propertyId);
        return response;
    } catch (error) {
        logger.error("getPropertySocialInfoAction failed", { propertyId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, data: undefined, error: "An unexpected error occurred" };
    }
}

export async function upsertPropertySocialInfoAction(
    locale: string,
    propertyId: string,
    data: {
        socialAttributes: PropertySocialInfoItemDto[];
        socialAttributeIdsToRemove: number[];
    }
): Promise<ApiResponse<UpsertPropertySocialInfoApiResponse>> {
    try {
        const cookieStore = await cookies();
        const userId = getUserIdFromCookies(cookieStore);
        if (!userId) {
            return { success: false, error: "Unauthorized: Please log in." };
        }

        const payload = {
            propertyId: Number(propertyId),
            updatedBy: userId,
            socialAttributes: data.socialAttributes,
            socialAttributeIdsToRemove: data.socialAttributeIdsToRemove,
        };

        const response = await upsertPropertySocialInfo(payload);
        if (response.success && response.data?.success) {
            revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
        }
        return response;
    } catch (error) {
        logger.error("upsertPropertySocialInfoAction failed", { propertyId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, data: undefined, error: "An unexpected error occurred" };
    }
}

"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { 
    getDiscountDetails, 
    updateDiscountDetails,
    uploadDiscountDocument,
    replaceDiscountDocument
} from "@/lib/api/discount.service";
import { getPropertySocialInfo, upsertPropertySocialInfo } from "@/lib/api/property-social-details.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { logger } from "@/lib/utils/logger";
import { 
    PropertyDiscountInfoResponseDto, 
    DiscountDocumentUploadResponseDto,
    DiscountAttributeItemDto
} from "@/types/discount.types";
import { ApiResponse } from "@/types/common.types";
import { 
    PropertySocialInfoApiResponse,
    PropertySocialInfoItemDto
} from "@/types/property-social-details.types";

export async function getDiscountDetailsAction(propertyId: string): Promise<ApiResponse<PropertyDiscountInfoResponseDto>> {
    try {
        const response = await getDiscountDetails(propertyId);
        return response;
    } catch (error) {
        logger.error("getDiscountDetailsAction failed", { propertyId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function updateDiscountDetailsAction(
    locale: string,
    propertyId: string,
    data: DiscountAttributeItemDto[]
): Promise<ApiResponse<void>> {
    try {
        const cookieStore = await cookies();
        const userId = getUserIdFromCookies(cookieStore);
        if (!userId) {
            return { success: false, error: "Unauthorized: Please log in." };
        }

        const payload = {
            propertyId: Number(propertyId),
            updatedBy: userId,
            discountAttributes: data
        };

        const response = await updateDiscountDetails(propertyId, payload);
        if (response.success) {
            revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
            return { success: true, message: response.message };
        }
        return { success: false, error: response.error, statusCode: response.statusCode };
    } catch (error) {
        logger.error("updateDiscountDetailsAction failed", { propertyId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, error: "An unexpected error occurred" };
    }
}

export async function uploadDiscountDocumentAction(formData: FormData): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const file = formData.get("File") as File | null;
        const propertyId = Number(formData.get("PropertyId"));
        const socialAttributeId = Number(formData.get("SocialAttributeId"));
        const remark = formData.get("Remark") as string | null;

        if (!file) return { success: false, error: "No file provided" };
        if (!propertyId) return { success: false, error: "Property ID is required" };
        if (!socialAttributeId) return { success: false, error: "Social Attribute ID is required" };

        const result = await uploadDiscountDocument(file, propertyId, socialAttributeId, remark || undefined);
        return { success: true, data: result };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to upload document";
        logger.error("uploadDiscountDocumentAction failed", { error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, error: message };
    }
}

export async function replaceDiscountDocumentAction(propertySocialDetailId: number, formData: FormData): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const file = formData.get("File") as File | null;
        const remark = formData.get("Remark") as string | null;

        if (!file) return { success: false, error: "No file provided" };

        const result = await replaceDiscountDocument(propertySocialDetailId, file, remark || undefined);
        return { success: true, data: result };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to replace document";
        logger.error("replaceDiscountDocumentAction failed", { propertySocialDetailId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, error: message };
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
): Promise<ApiResponse<void>> {
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
            return { success: true, message: response.data?.message || response.message };
        }
        return { success: false, error: response.data?.message || response.message || response.error, statusCode: response.statusCode };
    } catch (error) {
        logger.error("upsertPropertySocialInfoAction failed", { propertyId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, error: "An unexpected error occurred" };
    }
}

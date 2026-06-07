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
import { ApiResponse, PagedResponse } from "@/types/common.types";
import { 
    PropertySocialInfoApiResponse,
    PropertySocialInfoItemDto,
    PropertySocialDetailsDto
} from "@/types/property-social-details.types";
import { apiClient } from "@/services/api.service";

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

        // 1. Fetch all social details for this property (both active and inactive) on demand
        // Use a large pageSize (200) to ensure we fetch all of them, and fail fast if the lookup fails.
        const allSocialDetailsResponse = await apiClient.get<PagedResponse<PropertySocialDetailsDto>>(
            `/PropertySocialDetails?propertyId=${propertyId}&pageSize=200`
        );

        if (!allSocialDetailsResponse.success) {
            return {
                success: false,
                error: allSocialDetailsResponse.error || "Failed to load existing social details.",
                statusCode: allSocialDetailsResponse.statusCode
            };
        }

        const allDetails = allSocialDetailsResponse.data?.items || [];

        // Build a map of socialAttributeId -> { id, isActive }
        const dbRecordsMap = new Map<number, { id: number; isActive: boolean }>();
        allDetails.forEach((rec) => {
            // Default missing isActive to true if undefined
            dbRecordsMap.set(rec.socialAttributeId, { id: rec.id, isActive: rec.isActive ?? true });
        });

        const reactivateAttributes: PropertySocialInfoItemDto[] = [];
        const normalAttributes: PropertySocialInfoItemDto[] = [];

        data.socialAttributes.forEach((item) => {
            const dbRecord = dbRecordsMap.get(item.socialAttributeId);
            if (dbRecord && !dbRecord.isActive) {
                reactivateAttributes.push(item);
            } else {
                normalAttributes.push(item);
            }
        });

        // 2. Perform reactivations using PUT /PropertySocialDetails/{id}
        if (reactivateAttributes.length > 0) {
            const reactivatePromises = reactivateAttributes.map((item) => {
                const dbRecord = dbRecordsMap.get(item.socialAttributeId)!;
                const updatePayload = {
                    id: dbRecord.id,
                    propertyId: Number(propertyId),
                    socialAttributeId: item.socialAttributeId,
                    bitValue: item.bitValue,
                    intValue: item.intValue,
                    decimalValue: item.decimalValue,
                    textValue: item.textValue,
                    dateValue: item.dateValue,
                    documentBindingId: item.documentBindingId,
                    remark: item.remark,
                    isActive: true, // Reactivate!
                    updatedBy: userId
                };
                return apiClient.put<unknown>(`/PropertySocialDetails/${dbRecord.id}`, updatePayload);
            });

            const reactivateResults = await Promise.all(reactivatePromises);
            const failedReactivation = reactivateResults.find(res => !res.success);
            if (failedReactivation) {
                return { 
                    success: false, 
                    error: failedReactivation.error || "Failed to reactivate some social attributes",
                    statusCode: failedReactivation.statusCode
                };
            }
        }

        // 3. Perform normal upsert for other attributes
        if (normalAttributes.length > 0 || data.socialAttributeIdsToRemove.length > 0) {
            const payload = {
                propertyId: Number(propertyId),
                updatedBy: userId,
                socialAttributes: normalAttributes,
                socialAttributeIdsToRemove: data.socialAttributeIdsToRemove,
            };

            const response = await upsertPropertySocialInfo(payload);
            if (!response.success || !response.data?.success) {
                return { 
                    success: false, 
                    error: response.data?.message || response.message || response.error, 
                    statusCode: response.statusCode 
                };
            }
        }

        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
        return { success: true, message: "Property social information updated successfully" };
    } catch (error) {
        logger.error("upsertPropertySocialInfoAction failed", { propertyId, error: error instanceof Error ? error : new Error(String(error)) });
        return { success: false, error: "An unexpected error occurred" };
    }
}

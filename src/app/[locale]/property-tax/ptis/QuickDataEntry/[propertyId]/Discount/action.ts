"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
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

async function getLocaleFromHeaders(): Promise<string> {
    try {
        const headersList = await headers();
        const referer = headersList.get("referer");
        if (referer) {
            const url = new URL(referer);
            const pathParts = url.pathname.split("/").filter(Boolean);
            if (pathParts.length > 0 && ["en", "hi", "mr"].includes(pathParts[0])) {
                return pathParts[0];
            }
        }
    } catch {}
    return "en";
}

async function handleActionError<T>(error: unknown, fallbackKey: string, locale?: string): Promise<ApiResponse<T>> {
    const loc = locale || await getLocaleFromHeaders();
    const t = await getTranslations({ locale: loc, namespace: "quickDataEntry" });
    const msg = error instanceof Error ? error.message : (t(fallbackKey) || "An error occurred");
    return { success: false, error: await cleanApiError(msg, loc) };
}

export async function getDiscountDetailsAction(propertyId: string): Promise<ApiResponse<PropertyDiscountInfoResponseDto>> {
    try {
        return await getDiscountDetails(propertyId);
    } catch (error) {
        logger.error("getDiscountDetailsAction failed", { propertyId, error: error as Error });
        return handleActionError(error, "discount.socialConfirm.unexpectedError");
    }
}

export async function updateDiscountDetailsAction(
    locale: string,
    propertyId: string,
    data: DiscountAttributeItemDto[]
): Promise<ApiResponse<void>> {
    try {
        const userId = getUserIdFromCookies(await cookies());
        if (!userId) return { success: false, error: "Unauthorized: Please log in." };

        const response = await updateDiscountDetails(propertyId, {
            propertyId: Number(propertyId),
            updatedBy: userId,
            discountAttributes: data
        });
        if (response.success) {
            revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
            return { success: true, message: response.message };
        }
        return { success: false, error: await cleanApiError(response.error, locale), statusCode: response.statusCode };
    } catch (error) {
        logger.error("updateDiscountDetailsAction failed", { propertyId, error: error as Error });
        return handleActionError(error, "discount.socialConfirm.unexpectedError", locale);
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
        logger.error("uploadDiscountDocumentAction failed", { error: error as Error });
        return handleActionError(error, "discount.uploadError");
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
        logger.error("replaceDiscountDocumentAction failed", { propertySocialDetailId, error: error as Error });
        return handleActionError(error, "discount.uploadError");
    }
}

export async function getPropertySocialInfoAction(propertyId: string): Promise<ApiResponse<PropertySocialInfoApiResponse>> {
    try {
        return await getPropertySocialInfo(propertyId);
    } catch (error) {
        logger.error("getPropertySocialInfoAction failed", { propertyId, error: error as Error });
        return handleActionError(error, "discount.socialConfirm.unexpectedError");
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
        const userId = getUserIdFromCookies(await cookies());
        if (!userId) return { success: false, error: "Unauthorized: Please log in." };

        const allSocialDetailsResponse = await apiClient.get<PagedResponse<PropertySocialDetailsDto>>(
            `/PropertySocialDetails?propertyId=${propertyId}&pageSize=200`
        );

        if (!allSocialDetailsResponse.success) {
            return {
                success: false,
                error: (await cleanApiError(allSocialDetailsResponse.error, locale)) || "Failed to load existing social details.",
                statusCode: allSocialDetailsResponse.statusCode
            };
        }

        const allDetails = allSocialDetailsResponse.data?.items || [];
        const dbRecordsMap = new Map(allDetails.map(rec => [rec.socialAttributeId, { id: rec.id, isActive: rec.isActive ?? true }]));

        const reactivateAttributes = data.socialAttributes.filter(item => dbRecordsMap.get(item.socialAttributeId)?.isActive === false);
        const normalAttributes = data.socialAttributes.filter(item => dbRecordsMap.get(item.socialAttributeId)?.isActive !== false);

        if (reactivateAttributes.length > 0) {
            const reactivateResults = await Promise.all(
                reactivateAttributes.map(item => {
                    const dbRecord = dbRecordsMap.get(item.socialAttributeId)!;
                    return apiClient.put<unknown>(`/PropertySocialDetails/${dbRecord.id}`, {
                        ...item,
                        id: dbRecord.id,
                        propertyId: Number(propertyId),
                        isActive: true,
                        updatedBy: userId
                    });
                })
            );
            const failedReactivation = reactivateResults.find(res => !res.success);
            if (failedReactivation) {
                return { 
                    success: false, 
                    error: (await cleanApiError(failedReactivation.error, locale)) || "Failed to reactivate some social attributes",
                    statusCode: failedReactivation.statusCode
                };
            }
        }

        if (normalAttributes.length > 0 || data.socialAttributeIdsToRemove.length > 0) {
            const response = await upsertPropertySocialInfo({
                propertyId: Number(propertyId),
                updatedBy: userId,
                socialAttributes: normalAttributes,
                socialAttributeIdsToRemove: data.socialAttributeIdsToRemove,
            });
            if (!response.success || !response.data?.success) {
                return { 
                    success: false, 
                    error: await cleanApiError(response.data?.message || response.message || response.error, locale), 
                    statusCode: response.statusCode 
                };
            }
        }

        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
        const t = await getTranslations({ locale, namespace: "quickDataEntry" });
        return { success: true, message: t("discount.socialConfirm.saveSuccess") || "Property social information updated successfully" };
    } catch (error) {
        logger.error("upsertPropertySocialInfoAction failed", { propertyId, error: error as Error });
        return handleActionError(error, "discount.socialConfirm.unexpectedError", locale);
    }
}

async function cleanApiError(err: string | undefined | null, locale: string): Promise<string> {
    const t = await getTranslations({ locale, namespace: "quickDataEntry" });
    if (!err) return t("discount.socialConfirm.unexpectedError") || "An unexpected error occurred";
    const str = String(err).trim();
    if (str.startsWith("{") && str.endsWith("}")) {
        try {
            const parsed = JSON.parse(str);
            const errors = parsed.errors;
            if (errors && typeof errors === "object" && !Array.isArray(errors)) {
                for (const key of Object.keys(errors).filter(k => k !== "General" && k !== "dto")) {
                    const val = errors[key];
                    const msg = Array.isArray(val) ? val[0] : val;
                    if (typeof msg === "string" && msg.trim()) return await cleanApiError(msg, locale);
                }
            }
            const msg = parsed.message || parsed.title;
            if (msg) return await cleanApiError(msg, locale);
        } catch {}
    }
    if (str.includes("could not be converted") || str.includes("System.Nullable")) {
        return str.includes("Int32") 
            ? (t("discount.socialValidation.invalidInteger") || "Value must be a valid integer.")
            : (t("discount.socialValidation.invalidDecimal") || "Value format is invalid.");
    }
    if (str.toLowerCase().includes("dto field is required")) {
        return t("discount.socialValidation.required", { fieldName: "Value" }) || "Required information is missing.";
    }
    return str;
}

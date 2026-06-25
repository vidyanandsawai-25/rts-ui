"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getPropertySocialInfo, upsertPropertySocialInfo, uploadSocialPhoto, replaceSocialPhoto, deleteSocialDocument } from "@/lib/api/property-social-details.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { logger } from "@/lib/utils/logger";
import { DiscountDocumentUploadResponseDto } from "@/types/discount.types";
import { ApiResponse } from "@/types/common.types";
import { 
    PropertySocialInfoApiResponse,
    PropertySocialInfoItemDto
} from "@/types/property-social-details.types";

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

        if (data.socialAttributes.length > 0 || data.socialAttributeIdsToRemove.length > 0) {
            const response = await upsertPropertySocialInfo({
                propertyId: Number(propertyId),
                updatedBy: userId,
                socialAttributes: data.socialAttributes,
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

export async function uploadSocialPhotoAction(formData: FormData): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const file = formData.get("File") as File | null;
        const propertyId = Number(formData.get("PropertyId"));
        const socialAttributeId = Number(formData.get("SocialAttributeId"));
        const remark = formData.get("Remark") as string | null;

        if (!file) return { success: false, error: "No file provided" };
        if (!propertyId) return { success: false, error: "Property ID is required" };
        if (!socialAttributeId) return { success: false, error: "Social Attribute ID is required" };

        const result = await uploadSocialPhoto(file, propertyId, socialAttributeId, remark || undefined);
        return { success: true, data: result };
    } catch (error: unknown) {
        logger.error("uploadSocialPhotoAction failed", { error: error as Error });
        return handleActionError(error, "discount.uploadError");
    }
}

export async function replaceSocialPhotoAction(propertySocialDetailId: number, formData: FormData): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const file = formData.get("File") as File | null;
        const remark = formData.get("Remark") as string | null;
        if (!file) return { success: false, error: "No file provided" };

        const result = await replaceSocialPhoto(propertySocialDetailId, file, remark || undefined);
        return { success: true, data: result };
    } catch (error: unknown) {
        logger.error("replaceSocialPhotoAction failed", { propertySocialDetailId, error: error as Error });
        return handleActionError(error, "discount.uploadError");
    }
}

export async function deleteSocialDocumentAction(propertySocialDetailId: number): Promise<ApiResponse<void>> {
    try {
        const result = await deleteSocialDocument(propertySocialDetailId);
        return result;
    } catch (error: unknown) {
        logger.error("deleteSocialDocumentAction failed", { propertySocialDetailId, error: error as Error });
        return handleActionError(error, "discount.deleteError");
    }
}


"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { 
    getDiscountDetails, 
    updateDiscountDetails,
    uploadDiscountDocViaGlobalApi,
    replaceDiscountDocViaGlobalApi,
    deleteDiscountDoc
} from "@/lib/api/discount.service";
import { deletePropertySocialDetail } from "@/lib/api/property-social-details.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { logger } from "@/lib/utils/logger";
import { updateBindingReference } from "@/lib/api/document.service";
import { 
    PropertyDiscountInfoResponseDto, 
    DiscountDocumentUploadResponseDto,
    DiscountAttributeItemDto
} from "@/types/discount.types";
import { ApiResponse } from "@/types/common.types";
import {
    cleanCommonApiError,
    handleActionError,
} from "@/lib/utils/action-error-helpers";

export async function getDiscountDetailsAction(
    propertyId: string
): Promise<ApiResponse<PropertyDiscountInfoResponseDto>> {
    try {
        return await getDiscountDetails(propertyId);
    } catch (error: unknown) {
        logger.error("getDiscountDetailsAction failed", { propertyId, error: error as Error });
        return handleActionError(error, "discount.socialConfirm.unexpectedError");
    }
}

export async function updateDiscountDetailsAction(
    locale: string,
    propertyId: string,
    formData: FormData
): Promise<ApiResponse<void>> {
    try {
        const userId = getUserIdFromCookies(await cookies());
        if (!userId) return { success: false, error: "Unauthorized: Please log in." };

        const attributesStr = formData.get("discountAttributes") as string;
        const discountAttributes = JSON.parse(attributesStr) as DiscountAttributeItemDto[];

        const initialResponse = await getDiscountDetails(propertyId);
        const initialAttributes = initialResponse.success && initialResponse.data?.discountAttributes
            ? initialResponse.data.discountAttributes
            : [];

        for (const attr of discountAttributes) {
            const file = formData.get(`file_${attr.socialAttributeId}`) as File | null;
            const initialAttr = initialAttributes.find(a => a.id === attr.socialAttributeId);
            const oldGuid = initialAttr?.documentGuid;

            if (file) {
                const propIdNum = Number(propertyId);
                const detailId = attr.propertySocialDetailId || 0;
                const attrId = attr.socialAttributeId;
                const guidReference = detailId === 0 ? crypto.randomUUID() : undefined;

                const uploadResult = oldGuid
                    ? await replaceDiscountDocViaGlobalApi(file, oldGuid, propIdNum, attrId, detailId, guidReference)
                    : await uploadDiscountDocViaGlobalApi(file, propIdNum, attrId, detailId, guidReference);

                if (uploadResult.success && uploadResult.data?.documentBindingId) {
                    attr.documentBindingId = uploadResult.data.documentBindingId;
                } else {
                    throw new Error(uploadResult.error || "Failed to upload document");
                }
            } else if (oldGuid && (!attr.bitValue || !attr.documentBindingId)) {
                await deleteDiscountDoc(oldGuid);
            }
        }

        const response = await updateDiscountDetails(propertyId, {
            propertyId: Number(propertyId),
            updatedBy: userId,
            discountAttributes
        });
        if (response.success) {
            // Update document bindings for any newly created records
            const savedItems = response.data?.discountAttributes || [];
            for (const attr of discountAttributes) {
                const isNew = !attr.propertySocialDetailId || attr.propertySocialDetailId === 0;
                if (isNew && attr.documentBindingId) {
                    const matchedItem = savedItems.find(item => item.id === attr.socialAttributeId);
                    if (matchedItem && matchedItem.propertySocialDetailId) {
                        await updateBindingReference(attr.documentBindingId, matchedItem.propertySocialDetailId);
                    }
                }
            }

            revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
            return { success: true, message: response.message };
        }
        return {
            success: false,
            error: await cleanCommonApiError(response.error, locale),
            statusCode: response.statusCode
        };
    } catch (error: unknown) {
        logger.error("updateDiscountDetailsAction failed", { propertyId, error: error as Error });
        return handleActionError(error, "discount.socialConfirm.unexpectedError", locale);
    }
}

export async function uploadDiscountDocumentAction(
    formData: FormData
): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const file = formData.get("File") as File | null;
        const propertyId = Number(formData.get("PropertyId"));
        const socialAttributeId = Number(formData.get("SocialAttributeId"));
        const propertySocialDetailId = Number(formData.get("PropertySocialDetailId") || 0);
        const referenceTableIdGuid = formData.get("ReferenceTableIdGuid") as string | null;
        const remark = formData.get("Remark") as string | null;

        if (!file) return { success: false, error: "No file provided" };
        if (!propertyId) return { success: false, error: "Property ID is required" };
        if (!socialAttributeId) return { success: false, error: "Social Attribute ID is required" };

        const result = await uploadDiscountDocViaGlobalApi(
            file, propertyId, socialAttributeId, propertySocialDetailId,
            referenceTableIdGuid || undefined, remark || undefined
        );
        if (result.success && result.data) {
            return { success: true, data: result.data };
        }
        return { success: false, error: result.error || "Upload failed" };
    } catch (error: unknown) {
        logger.error("uploadDiscountDocumentAction failed", { error: error as Error });
        return handleActionError(error, "discount.uploadError");
    }
}

export async function replaceDiscountDocumentAction(
    propertySocialDetailId: number, 
    oldDocumentGuid: string,
    formData: FormData
): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const file = formData.get("File") as File | null;
        const propertyId = Number(formData.get("PropertyId"));
        const socialAttributeId = Number(formData.get("SocialAttributeId"));
        const referenceTableIdGuid = formData.get("ReferenceTableIdGuid") as string | null;
        const remark = formData.get("Remark") as string | null;

        if (!file) return { success: false, error: "No file provided" };

        const result = await replaceDiscountDocViaGlobalApi(
            file, oldDocumentGuid, propertyId, socialAttributeId,
            propertySocialDetailId, referenceTableIdGuid || undefined, remark || undefined
        );
        if (result.success && result.data) {
            return { success: true, data: result.data };
        }
        return { success: false, error: result.error || "Replace failed" };
    } catch (error: unknown) {
        logger.error("replaceDiscountDocumentAction failed", { propertySocialDetailId, error: error as Error });
        return handleActionError(error, "discount.uploadError");
    }
}

export async function deleteDiscountDocumentAction(
    documentGuid: string
): Promise<ApiResponse<void>> {
    try {
        return await deleteDiscountDoc(documentGuid);
    } catch (error: unknown) {
        logger.error("deleteDiscountDocumentAction failed", { documentGuid, error: error as Error });
        return handleActionError(error, "discount.deleteError");
    }
}

export async function deletePropertySocialDetailAction(
    propertyId: string,
    socialAttributeId: number,
    locale: string
): Promise<ApiResponse<void>> {
    try {
        const response = await deletePropertySocialDetail(propertyId, socialAttributeId);
        if (response.success) {
            revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
        }
        return response;
    } catch (error: unknown) {
        logger.error("deletePropertySocialDetailAction failed", { propertyId, socialAttributeId, error: error as Error });
        return handleActionError(error, "discount.deleteError", locale);
    }
}

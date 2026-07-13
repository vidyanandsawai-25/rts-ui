"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { 
    getPropertySocialInfo, 
    upsertPropertySocialInfo, 
    uploadSocialPhotoViaGlobalApi, 
    replaceSocialPhotoViaGlobalApi, 
    deleteSocialPhotoViaGlobalApi 
} from "@/lib/api/property-social-details.service";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import { logger } from "@/lib/utils/logger";
import { DiscountDocumentUploadResponseDto } from "@/types/discount.types";
import { updateBindingReference } from "@/lib/api/document.service";
import { ApiResponse } from "@/types/common.types";
import { 
    PropertySocialInfoApiResponse,
    PropertySocialInfoItemDto,
    SocialAttributeHierarchyDto
} from "@/types/property-social-details.types";
import {
    cleanCommonApiError,
    handleActionError,
} from "@/lib/utils/action-error-helpers";

export async function getPropertySocialInfoAction(
    propertyId: string
): Promise<ApiResponse<PropertySocialInfoApiResponse>> {
    try {
        return await getPropertySocialInfo(propertyId);
    } catch (error: unknown) {
        logger.error("getPropertySocialInfoAction failed", { propertyId, error: error as Error });
        return handleActionError(error, "discount.socialConfirm.unexpectedError");
    }
}

export async function upsertPropertySocialInfoAction(
    locale: string,
    propertyId: string,
    formData: FormData
): Promise<ApiResponse<void>> {
    try {
        const userId = getUserIdFromCookies(await cookies());
        if (!userId) return { success: false, error: "Unauthorized: Please log in." };

        const socialAttributesStr = formData.get("socialAttributes") as string;
        const socialAttributeIdsToRemoveStr = formData.get("socialAttributeIdsToRemove") as string;

        const socialAttributes = JSON.parse(socialAttributesStr) as PropertySocialInfoItemDto[];
        const socialAttributeIdsToRemove = JSON.parse(socialAttributeIdsToRemoveStr) as number[];

        const initialResponse = await getPropertySocialInfo(propertyId);
        const initialFlatData: Record<number, { id?: number | null; documentGuid?: string | null }> = {};
        const traverse = (attrs: SocialAttributeHierarchyDto[]) => {
            for (const a of attrs) {
                initialFlatData[a.id] = { id: a.propertySocialDetailId, documentGuid: a.documentGuid || a.photoGuid || null };
                if (a.children) traverse(a.children);
            }
        };
        if (initialResponse.success && initialResponse.data?.items?.socialAttributes) {
            traverse(initialResponse.data.items.socialAttributes);
        }

        // Process any deleted documents from removed attributes
        for (const removeId of socialAttributeIdsToRemove) {
            const initialEntry = Object.values(initialFlatData).find(e => e.id === removeId);
            if (initialEntry?.documentGuid) {
                await deleteSocialPhotoViaGlobalApi(initialEntry.documentGuid);
            }
        }

        for (const attr of socialAttributes) {
            const file = formData.get(`file_${attr.socialAttributeId}`) as File | null;
            const initialAttr = initialFlatData[attr.socialAttributeId];
            const oldGuid = initialAttr?.documentGuid;

            if (file) {
                const propIdNum = Number(propertyId);
                const detailId = attr.id || 0;
                const attrId = attr.socialAttributeId;
                const guidReference = detailId === 0 ? crypto.randomUUID() : undefined;

                const uploadResult = oldGuid
                    ? await replaceSocialPhotoViaGlobalApi(file, oldGuid, propIdNum, attrId, detailId, guidReference)
                    : await uploadSocialPhotoViaGlobalApi(file, propIdNum, attrId, detailId, guidReference);

                if (uploadResult.success && uploadResult.data?.documentBindingId) {
                    attr.documentBindingId = uploadResult.data.documentBindingId;
                } else {
                    throw new Error(uploadResult.error || "Failed to upload document");
                }
            } else if (oldGuid && (!attr.bitValue || !attr.documentBindingId)) {
                await deleteSocialPhotoViaGlobalApi(oldGuid);
            }
        }

        if (socialAttributes.length > 0 || socialAttributeIdsToRemove.length > 0) {
            const response = await upsertPropertySocialInfo({
                propertyId: Number(propertyId),
                updatedBy: userId,
                socialAttributes,
                socialAttributeIdsToRemove,
            });
            if (!response.success || !response.data?.success) {
                return { 
                    success: false, 
                    error: await cleanCommonApiError(
                        response.data?.message || response.message || response.error, locale
                    ), 
                    statusCode: response.statusCode 
                };
            }

            // Update document bindings for any newly created records
            const savedItems = response.data.items || [];
            for (const attr of socialAttributes) {
                const isNew = !attr.id || attr.id === 0;
                if (isNew && attr.documentBindingId) {
                    const matchedItem = savedItems.find(item => item.socialAttributeId === attr.socialAttributeId);
                    if (matchedItem && matchedItem.id) {
                        await updateBindingReference(attr.documentBindingId, matchedItem.id);
                    }
                }
            }
        }

        revalidatePath(`/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/Discount`, 'page');
        const t = await getTranslations({ locale, namespace: "quickDataEntry" });
        return {
            success: true,
            message: t("discount.socialConfirm.saveSuccess") || "Property social information updated successfully"
        };
    } catch (error: unknown) {
        logger.error("upsertPropertySocialInfoAction failed", { propertyId, error: error as Error });
        return handleActionError(error, "discount.socialConfirm.unexpectedError", locale);
    }
}

export async function uploadSocialPhotoAction(
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

        const result = await uploadSocialPhotoViaGlobalApi(
            file, propertyId, socialAttributeId, propertySocialDetailId,
            referenceTableIdGuid || undefined, remark || undefined
        );
        if (result.success && result.data) {
            return { success: true, data: result.data };
        }
        return { success: false, error: result.error || "Upload failed" };
    } catch (error: unknown) {
        logger.error("uploadSocialPhotoAction failed", { error: error as Error });
        return handleActionError(error, "discount.uploadError");
    }
}

export async function replaceSocialPhotoAction(
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

        const result = await replaceSocialPhotoViaGlobalApi(
            file, oldDocumentGuid, propertyId, socialAttributeId,
            propertySocialDetailId, referenceTableIdGuid || undefined, remark || undefined
        );
        if (result.success && result.data) {
            return { success: true, data: result.data };
        }
        return { success: false, error: result.error || "Replace failed" };
    } catch (error: unknown) {
        logger.error("replaceSocialPhotoAction failed", { propertySocialDetailId, error: error as Error });
        return handleActionError(error, "discount.uploadError");
    }
}

export async function deleteSocialDocumentAction(
    documentGuid: string
): Promise<ApiResponse<void>> {
    try {
        return await deleteSocialPhotoViaGlobalApi(documentGuid);
    } catch (error: unknown) {
        logger.error("deleteSocialDocumentAction failed", { documentGuid, error: error as Error });
        return handleActionError(error, "discount.deleteError");
    }
}

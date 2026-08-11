import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import {
    PropertySocialInfoApiResponse,
    UpsertPropertySocialInfoDto,
    UpsertPropertySocialInfoApiResponse
} from "@/types/property-social-details.types";
import { DiscountDocumentUploadResponseDto } from "@/types/discount.types";
import { uploadDocument, deleteDocument } from "./document.service";
import { DocumentUploadParams } from "@/types/document.types";
import { DEPARTMENT_ID, MODULE_ID, REFERENCE_TABLE, BINDING_PURPOSE, DOCUMENT_TYPE } from "../constants/document.constants";

/**
 * Get social information for a given property
 */
export async function getPropertySocialInfo(propertyId: string): Promise<ApiResponse<PropertySocialInfoApiResponse>> {
    const response = await apiClient.get<PropertySocialInfoApiResponse>(`/PropertySocialDetails/property/${propertyId}/social-info`);
    return response;
}

/**
 * Upsert social details
 */
export async function upsertPropertySocialInfo(payload: UpsertPropertySocialInfoDto): Promise<ApiResponse<UpsertPropertySocialInfoApiResponse>> {
    const response = await apiClient.put<UpsertPropertySocialInfoApiResponse>("/PropertySocialDetails/upsert", payload);
    return response;
}

/**
 * Upload a photo for a social detail attribute using the global document API
 */
export async function uploadSocialPhotoViaGlobalApi(
    file: File,
    propertyId: number,
    socialAttributeId: number,
    propertySocialDetailId: number,
    referenceTableIdGuid?: string,
    remark?: string
): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const uploadParams: DocumentUploadParams = {
            departmentId: DEPARTMENT_ID.PTIS,
            moduleId: MODULE_ID.PropertySocialDetails,
            referenceTableName: REFERENCE_TABLE.PropertyDiscount,
            bindingPurpose: BINDING_PURPOSE.Photo,
            documentType: DOCUMENT_TYPE.Photo,
            isPrimaryDocument: true
        };

        if (propertySocialDetailId > 0) {
            uploadParams.referenceTableId = propertySocialDetailId;
        } else if (referenceTableIdGuid) {
            uploadParams.referenceTableIdGuid = referenceTableIdGuid;
        }

        const uploadResponse = await uploadDocument(file, uploadParams);
        const documentBindingId = typeof uploadResponse.documentBindingId === "number" && uploadResponse.documentBindingId > 0
            ? uploadResponse.documentBindingId
            : null;

        return {
            success: true,
            data: {
                propertySocialDetailId: propertySocialDetailId > 0 ? propertySocialDetailId : null,
                propertyId: propertyId,
                socialAttributeId: socialAttributeId,
                documentBindingId,
                documentGuid: uploadResponse.documentGuid,
                documentUrl: `/api/documents/${uploadResponse.documentGuid}/view`,
                fileName: file.name,
                remark: remark || null
            }
        };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Replace an existing social detail photo using the global document API
 */
export async function replaceSocialPhotoViaGlobalApi(
    file: File,
    oldDocumentGuid: string,
    propertyId: number,
    socialAttributeId: number,
    propertySocialDetailId: number,
    referenceTableIdGuid?: string,
    remark?: string
): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const uploadResult = await uploadSocialPhotoViaGlobalApi(
            file,
            propertyId,
            socialAttributeId,
            propertySocialDetailId,
            referenceTableIdGuid,
            remark
        );

        if (!uploadResult.success || !uploadResult.data) {
            return uploadResult;
        }

        if (oldDocumentGuid) {
            await deleteDocument(oldDocumentGuid);
        }

        return uploadResult;
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Delete a social detail document using the global document API
 */
export async function deleteSocialPhotoViaGlobalApi(documentGuid: string): Promise<ApiResponse<void>> {
    try {
        const result = await deleteDocument(documentGuid);
        return result;
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

/**
 * Delete property social detail record by PropertyId and SocialAttributeId (marks record for deletion)
 */
export async function deletePropertySocialDetail(propertyId: string, socialAttributeId: number): Promise<ApiResponse<void>> {
    try {
        const params = new URLSearchParams({
            propertyId: String(propertyId),
            socialAttributeId: String(socialAttributeId)
        });
        const response = await apiClient.delete<void>(`/PropertySocialDetails?${params.toString()}`);
        return response;
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

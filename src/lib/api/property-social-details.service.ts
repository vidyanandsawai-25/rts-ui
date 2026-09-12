import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";
import {
    PropertySocialInfoApiResponse,
    UpsertPropertySocialInfoDto,
    UpsertPropertySocialInfoApiResponse,
    CreatePropertySocialDetailDto,
    CreateBulkPropertySocialDetailDto,
    PropertySocialDetailsDto
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
 * Create a single social detail directly via POST for document upload across all levels
 */
export async function createPropertySocialDetail(payload: CreatePropertySocialDetailDto): Promise<ApiResponse<PropertySocialDetailsDto>> {       
    const response = await apiClient.post<PropertySocialDetailsDto>("/PropertySocialDetails", payload);           
    return response;
}

/**
 * Create bulk social details via POST
 */
export async function createBulkPropertySocialDetail(payload: CreateBulkPropertySocialDetailDto): Promise<ApiResponse<PropertySocialDetailsDto[]>> {       
    const response = await apiClient.post<PropertySocialDetailsDto[]>("/PropertySocialDetails/Bulk/by-property-ids", payload);     
    return response;
}

/**
 * Get property social details by filters
 */
export async function getPropertySocialDetailsByFilters(
  socialAttributeId?: number,
  societyDetailId?: number,
  wingDetailId?: number
): Promise<PropertySocialDetailsDto[] | null> {
    const params = new URLSearchParams();
    if (socialAttributeId) params.append('socialAttributeId', socialAttributeId.toString());
    if (societyDetailId) params.append('societyDetailId', societyDetailId.toString());
    if (wingDetailId) params.append('wingDetailId', wingDetailId.toString());
    
    const url = `/PropertySocialDetails/by-filters?${params.toString()}`;
    const response = await apiClient.get<{ items?: PropertySocialDetailsDto[] }>(url);
    
    const t = await getTranslations("quickDataEntry");
    const errorMessage = t.has("discount.socialConfirm.fetchError")
        ? t("discount.socialConfirm.fetchError")
        : "Failed to fetch property social details";
    const responseData = handleApiResponse(response, errorMessage);
    
    return responseData.items ?? null;
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

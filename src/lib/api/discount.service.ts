import { apiClient } from "@/services/api.service";
import { handleApiResponse } from "@/lib/utils/api";
import { getTranslations } from "next-intl/server";
import { ApiResponse } from "@/types/common.types";
import { 
    PropertyDiscountInfoResponseDto, 
    DiscountDocumentUploadResponseDto,
    UpsertPropertyDiscountInfoDto
} from "@/types/discount.types";
import { uploadDocument, deleteDocument } from "./document.service";
import { DocumentUploadParams } from "@/types/document.types";
import { DEPARTMENT_ID, MODULE_ID, REFERENCE_TABLE, BINDING_PURPOSE, DOCUMENT_TYPE } from "../constants/document.constants";
import { WingOption, UnitSelectionItem } from "@/types/building-permission.types";

interface BackendApiResponseWrapper<T> {
    success: boolean;
    message?: string;
    items: T;
    errors?: string[];
}

/**
 * Get discount details for a given property
 */
export async function getDiscountDetails(propertyId: string): Promise<ApiResponse<PropertyDiscountInfoResponseDto>> {
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyDiscountInfoResponseDto>>(`/Property/${propertyId}/discount-details`);
    if (response.success && response.data) {
        return {
            success: response.data.success,
            statusCode: response.statusCode,
            data: response.data.items,
            message: response.data.message
        };
    }
    return {
        success: false,
        statusCode: response.statusCode,
        error: response.error
    };
}

/**
 * Update discount details for a given property
 */
export async function updateDiscountDetails(propertyId: string, data: UpsertPropertyDiscountInfoDto): Promise<ApiResponse<PropertyDiscountInfoResponseDto>> {
    const response = await apiClient.put<BackendApiResponseWrapper<PropertyDiscountInfoResponseDto>>(`/Property/${propertyId}/discount-details`, data);

    if (response.success && response.data) {
        return {
            success: response.data.success,
            statusCode: response.statusCode,
            data: response.data.items,
            message: response.data.message,
            error: response.data.success ? undefined : response.data.message
        };
    }
    return {
        success: false,
        statusCode: response.statusCode,
        error: response.error
    };
}

/**
 * Upload a discount-related document using the global documents API
 */
export async function uploadDiscountDocViaGlobalApi(
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
            moduleId: MODULE_ID.PropertyDiscount,
            referenceTableName: REFERENCE_TABLE.PropertyDiscount,
            bindingPurpose: BINDING_PURPOSE.ProofDocument,
            documentType: DOCUMENT_TYPE.Proof,
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
 * Replace a discount-related document using the global documents API
 */
export async function replaceDiscountDocViaGlobalApi(
    file: File, 
    oldDocumentGuid: string,
    propertyId: number, 
    socialAttributeId: number, 
    propertySocialDetailId: number,
    referenceTableIdGuid?: string,
    remark?: string
): Promise<ApiResponse<DiscountDocumentUploadResponseDto>> {
    try {
        const uploadResult = await uploadDiscountDocViaGlobalApi(
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
 * Delete a discount detail document using the global documents API
 */
export async function deleteDiscountDoc(documentGuid: string): Promise<ApiResponse<void>> {
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
 * Get wings for a given property
 */
export async function getDiscountWings(propertyId: string): Promise<WingOption[]> {
    const response = await apiClient.get<BackendApiResponseWrapper<WingOption[]>>(`/property-certificates/wings/${propertyId}`);
    const t = await getTranslations("quickDataEntry");
    const responseData = handleApiResponse(response, t("building.errors.notFound") || "Failed to fetch wings");
    return Array.isArray(responseData.items) ? responseData.items : (Array.isArray(responseData) ? responseData as WingOption[] : []);
}

/**
 * Get units for a given property and wing
 */
export async function getDiscountUnits(
    propertyId: string,
    wingDetailId?: number | null,
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<{ items: UnitSelectionItem[]; totalCount?: number }> {
    const params = new URLSearchParams();
    params.append("pageNumber", pageNumber.toString());
    params.append("pageSize", pageSize.toString());
    if (wingDetailId) {
        params.append("wingDetailId", wingDetailId.toString());
    }

    const url = `/property-certificates/units/${propertyId}?${params.toString()}`;
    const response = await apiClient.get<BackendApiResponseWrapper<UnitSelectionItem[]> & { totalCount?: number }>(url);
    const t = await getTranslations("quickDataEntry");

    const responseData = handleApiResponse(response, t("building.errors.notFound") || "Failed to fetch units");
    
    const rawResponseData = response.data as unknown as Record<string, unknown>;
    const items = Array.isArray(responseData.items) ? responseData.items : (Array.isArray(responseData) ? responseData as UnitSelectionItem[] : []);
    const totalCount = typeof rawResponseData?.totalCount === 'number' ? rawResponseData.totalCount : undefined;

    return { items, totalCount };
}

import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import { 
    PropertyCertificateWithStatusDto, 
    PropertyCertificateUploadResponseDto, 
    PropertyCertificateBulkSaveDto, 
    PropertyCertificateBulkSaveResponseDto,
    FloorCertificatesResponseDto,
    SaveCertificateResponseDto,
    SaveCertificateRequestDto
} from "@/types/building-permission.types";

interface BackendApiResponseWrapper<T> {
    success: boolean;
    message?: string;
    items: T;
    errors?: string[];
}

/* ---------------- BUILDING PERMISSIONS / PROPERTY CERTIFICATES ---------------- */

// 1. GET - Load all certificate types with their current status for a property
export async function getCertificateTypesWithStatus(
    propertyId: string,
    propertyDetailsId?: number | null
): Promise<ApiResponse<PropertyCertificateWithStatusDto[]>> {
    const url = propertyDetailsId !== undefined && propertyDetailsId !== null
        ? `/property-certificates/types-with-status/${propertyId}?propertyDetailsId=${propertyDetailsId}`
        : `/property-certificates/types-with-status/${propertyId}`;
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyCertificateWithStatusDto[]>>(url);
    
    if (response.success && response.data) {
        return {
            success: response.data.success,
            statusCode: response.statusCode,
            data: response.data.items,
            message: response.data.message || response.message
        };
    }
    
    return {
        success: false,
        statusCode: response.statusCode,
        error: response.error,
        message: response.message
    };
}

import { uploadDocument, deleteDocument } from "./document.service";
import { DEPARTMENT_ID, MODULE_ID, REFERENCE_TABLE, BINDING_PURPOSE, DOCUMENT_TYPE } from "../constants/document.constants";

// 3. POST - Upload/Replace document for an existing certificate using global API
export async function replaceCertificateDocument(
    propertyCertificateId: number,
    file: File,
    propertyId: number,
    certificateTypeId: number
): Promise<ApiResponse<PropertyCertificateUploadResponseDto>> {
    try {
        const uploadResponse = await uploadDocument(file, {
            departmentId: DEPARTMENT_ID.PTIS,
            moduleId: MODULE_ID.PropertyCertificate,
            referenceTableName: REFERENCE_TABLE.PropertyCertificate, // "PropertyCertificates"
            referenceTableId: propertyCertificateId,
            bindingPurpose: BINDING_PURPOSE.MainDocument,
            documentType: DOCUMENT_TYPE.Certificate,
            isPrimaryDocument: true
        });

        return {
            success: true,
            data: {
                propertyCertificateId: propertyCertificateId,
                documentGuid: uploadResponse.documentGuid,
                documentId: uploadResponse.documentId,
                documentBindingId: uploadResponse.documentBindingId ?? 0,
                propertyId: propertyId,
                certificateTypeId: certificateTypeId,
                certificateNo: null,
                issueDate: null,
                fileName: file.name,
                fileSizeBytes: file.size,
                storagePath: uploadResponse.storagePath ?? ""
            }
        };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

// 4. DELETE - Delete a certificate document using global API
export async function deleteCertificateDocument(
    documentGuid: string
): Promise<ApiResponse<void>> {
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

// 4. POST - Save all certificate changes
export async function bulkSaveCertificates(
    data: PropertyCertificateBulkSaveDto
): Promise<ApiResponse<PropertyCertificateBulkSaveResponseDto>> {
    const response = await apiClient.post<BackendApiResponseWrapper<PropertyCertificateBulkSaveResponseDto>>(
        `/property-certificates/bulk-save`,
        data
    );
    
    if (response.success && response.data) {
        let errorVal: string | undefined = undefined;
        if (!response.data.success) {
            errorVal = response.data.errors && response.data.errors.length > 0
                ? response.data.errors.join("; ")
                : (response.data.message || "Failed to save certificates");
        }

        return {
            success: response.data.success,
            statusCode: response.statusCode,
            data: response.data.items,
            message: response.data.message || response.message,
            error: errorVal
        };
    }
    
    return {
        success: false,
        statusCode: response.statusCode,
        error: response.error,
        message: response.message
    };
}

// 5. GET - Floor-wise certificate display for the Building Permission tab
export async function getFloorCertificates(
    propertyId: string,
    selectedPropertyDetailsId?: number | null
): Promise<ApiResponse<FloorCertificatesResponseDto>> {
    const url = selectedPropertyDetailsId !== undefined && selectedPropertyDetailsId !== null
        ? `/property-certificates/floor-certificates?propertyId=${propertyId}&selectedPropertyDetailsId=${selectedPropertyDetailsId}`
        : `/property-certificates/floor-certificates?propertyId=${propertyId}`;
    
    const response = await apiClient.get<BackendApiResponseWrapper<FloorCertificatesResponseDto>>(url);
    
    if (response.success && response.data) {
        return {
            success: response.data.success,
            statusCode: response.statusCode,
            data: response.data.items,
            message: response.data.message || response.message
        };
    }
    
    return {
        success: false,
        statusCode: response.statusCode,
        error: response.error,
        message: response.message
    };
}

// 6. POST - Save a single certificate (JSON payload)
export async function saveCertificate(
    data: SaveCertificateRequestDto
): Promise<ApiResponse<SaveCertificateResponseDto>> {
    try {
        const response = await apiClient.post<BackendApiResponseWrapper<SaveCertificateResponseDto>>(
            `/property-certificates/save-certificate`,
            data
        );
        
        if (response.success && response.data) {
            return {
                success: response.data.success,
                statusCode: response.statusCode,
                data: response.data.items,
                message: response.data.message || response.message
            };
        }
        
        return {
            success: false,
            statusCode: response.statusCode,
            error: response.error,
            message: response.message
        };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

// 7. DELETE - Delete a property certificate by propertyId, certificateTypeId, and optional propertyDetailsId
export async function deletePropertyCertificate(
    propertyId: number,
    certificateTypeId: number,
    propertyDetailsId?: number | null
): Promise<ApiResponse<void>> {
    try {
        let url = `/property-certificates?propertyId=${propertyId}&certificateTypeId=${certificateTypeId}`;
        if (propertyDetailsId !== undefined && propertyDetailsId !== null) {
            url += `&propertyDetailsId=${propertyDetailsId}`;
        }
        const response = await apiClient.delete<BackendApiResponseWrapper<void>>(url);
        
        // DELETE endpoints often return 204 No Content (response.data is undefined)
        if (response.success) {
            return {
                success: response.data ? response.data.success : true,
                statusCode: response.statusCode,
                message: response.data?.message || response.message
            };
        }
        
        return {
            success: false,
            statusCode: response.statusCode,
            error: response.error,
            message: response.message
        };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
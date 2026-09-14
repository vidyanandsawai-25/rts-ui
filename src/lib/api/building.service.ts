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

// 1b. GET - Load certificate types with their current status for society/wing
export async function getSocietyWingTypesWithStatus(
    societyDetailId?: number | null,
    wingDetailId?: number | null
): Promise<ApiResponse<PropertyCertificateWithStatusDto[]>> {
    let url = `/property-certificates/society-wing-types-with-status`;
    const params = new URLSearchParams();
    if (societyDetailId) params.append("societyDetailId", societyDetailId.toString());
    if (wingDetailId) params.append("wingDetailId", wingDetailId.toString());
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }
    
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

// 2. GET - Load Certificate Type Master list dynamically
export async function getCertificateTypeMaster(): Promise<ApiResponse<unknown[]>> {
    try {
        const response = await apiClient.get<BackendApiResponseWrapper<unknown[]>>('/property-certificates/type-master');
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

// 2b. GET - Load Wings dynamically by propertyId
export async function getWingsByProperty(propertyId: string): Promise<ApiResponse<unknown[]>> {
    try {
        const response = await apiClient.get<BackendApiResponseWrapper<unknown[]>>(`/property-certificates/wings/${propertyId}`);
        if (response.success && response.data) {
            const rawData = response.data as unknown as Record<string, unknown>;
            const items = Array.isArray(rawData.items)
                ? rawData.items
                : Array.isArray(rawData.data)
                ? rawData.data
                : Array.isArray(response.data)
                ? (response.data as unknown[])
                : [];
            return {
                success: true,
                statusCode: response.statusCode,
                data: items,
                message: rawData.message ? String(rawData.message) : response.message
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

// 2c. GET - Load Units dynamically by propertyId
export async function getUnitsByProperty(
    propertyId: string,
    wingDetailId?: number | null,
    pageNumber: number = 1,
    pageSize: number = 10
): Promise<ApiResponse<unknown[]> & { totalCount?: number }> {
    try {
        let url = `/property-certificates/units/${propertyId}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        if (wingDetailId) {
            url += `&wingDetailId=${wingDetailId}`;
        }
        const response = await apiClient.get<BackendApiResponseWrapper<unknown[]> & { totalCount?: number }>(url);
        if (response.success && response.data) {
            const rawData = response.data as unknown as Record<string, unknown>;
            return {
                success: true,
                statusCode: response.statusCode,
                data: response.data.items,
                totalCount: typeof rawData.totalCount === 'number' ? rawData.totalCount : undefined,
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
                : (response.data.message || response.message || "Failed to save certificates");
        }

        const msg = response.data.message || response.message || errorVal;
        return {
            success: response.data.success,
            statusCode: response.statusCode || (response.data.success ? 200 : 500),
            data: response.data.items,
            message: msg,
            error: errorVal
        };
    }
    
    const errText = response.error || response.message || "An error occurred while saving the certificate";
    return {
        success: false,
        statusCode: response.statusCode || 500,
        error: errText,
        message: errText
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

// 8. POST - Add Certificate Record (/api/ApartmentQC/certificate-record)
export interface ApartmentQcCertificateRecordPayload {
    entityScope?: 'Society' | 'Wing' | 'Property';
    level: number;
    societyDetailId?: number | null;
    societyId?: number | null;
    wingDetailId?: number | null;
    propertyDetailsId?: number | null;
    propertyDetailsIds?: number[];
    unitPropertyIds?: number[];
    certificateTypeId: number;
    certificateNo: string;
    issueDate?: string;
    certificateIssueDate?: string;
    status?: string;
    documentGuid?: string | null;
}

export async function postApartmentQcCertificateRecord(
    payload: ApartmentQcCertificateRecordPayload
): Promise<ApiResponse<unknown>> {
    try {
        const response = await apiClient.post<BackendApiResponseWrapper<unknown>>(
            '/ApartmentQC/certificate-record',
            payload
        );
        if (response.success && response.data) {
            return {
                success: response.data.success ?? true,
                statusCode: response.statusCode,
                data: response.data.items,
                message: response.data.message || response.message
            };
        }
        return {
            success: false,
            statusCode: response.statusCode,
            error: response.error || response.message || 'Failed to post certificate record',
            message: response.message
        };
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
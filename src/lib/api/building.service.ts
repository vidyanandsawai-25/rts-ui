import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import { 
    PropertyCertificateWithStatusDto, 
    PropertyCertificateUploadResponseDto, 
    PropertyCertificateBulkSaveDto, 
    PropertyCertificateBulkSaveResponseDto 
} from "@/types/building-permission.types";
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { serverFetch } from '@/lib/utils/server-fetch';

interface BackendApiResponseWrapper<T> {
    success: boolean;
    message?: string;
    items: T;
    errors?: string[];
}

/* ---------------- BUILDING PERMISSIONS / PROPERTY CERTIFICATES ---------------- */

// 1. GET - Load all certificate types with their current status for a property
export async function getCertificateTypesWithStatus(
    propertyId: string
): Promise<ApiResponse<PropertyCertificateWithStatusDto[]>> {
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyCertificateWithStatusDto[]>>(
        `/property-certificates/types-with-status/${propertyId}`
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
}

// Helper to build auth headers from cookies for server-side multipart uploads
async function getAuthHeaders(): Promise<Record<string, string>> {
    const cookieStore = await cookies();
    const headers: Record<string, string> = {
        'Accept': 'application/json, text/plain, */*',
    };
    
    const token = cookieStore.get('auth_token')?.value;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const csrf = cookieStore.get('csrf_token')?.value;
    if (csrf) headers['X-CSRF-Token'] = csrf;
    
    const cookieStr = cookieStore.getAll()
        .filter(c => /auth_token|refresh_token|session_id|csrf_token|\.AspNetCore\.Antiforgery/.test(c.name))
        .map(c => `${c.name.replace(/[^\x00-\x7F]/g, '')}=${c.value.replace(/[^\x00-\x7F]/g, '')}`)
        .join('; ');
    if (cookieStr) headers['Cookie'] = cookieStr;
    
    return headers;
}

// 2. POST - Upload a new certificate document
export async function uploadCertificateDocument(
    file: File,
    propertyId: number,
    certificateTypeId: number,
    certificateNo?: string,
    issueDate?: string
): Promise<ApiResponse<PropertyCertificateUploadResponseDto>> {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim();
    if (!baseUrl) {
        return { success: false, statusCode: 500, error: "API base URL is not configured" };
    }
    const url = `${baseUrl.replace(/\/$/, '')}/property-certificates/upload`;

    const formData = new FormData();
    formData.append("File", file, file.name);
    formData.append("PropertyId", propertyId.toString());
    formData.append("CertificateTypeId", certificateTypeId.toString());
    if (certificateNo) formData.append("CertificateNo", certificateNo);
    if (issueDate) formData.append("IssueDate", issueDate);

    const headers = await getAuthHeaders();

    const response = await serverFetch(url, {
        method: 'POST',
        headers,
        body: formData,
        cache: 'no-store'
    });

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        return { 
            success: false, 
            statusCode: response.status, 
            error: data.message || data.error || `Upload failed with status ${response.status}` 
        };
    }

    return { 
        success: true, 
        statusCode: response.status, 
        data: data.items 
    };
}

// 3. POST - Replace an existing certificate document
export async function replaceCertificateDocument(
    propertyCertificateId: number,
    file: File
): Promise<ApiResponse<PropertyCertificateUploadResponseDto>> {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim();
    if (!baseUrl) {
        return { success: false, statusCode: 500, error: "API base URL is not configured" };
    }
    const url = `${baseUrl.replace(/\/$/, '')}/property-certificates/${propertyCertificateId}/replace-document`;

    const formData = new FormData();
    formData.append("File", file, file.name);

    const headers = await getAuthHeaders();

    const response = await serverFetch(url, {
        method: 'POST',
        headers,
        body: formData,
        cache: 'no-store'
    });

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        return { 
            success: false, 
            statusCode: response.status, 
            error: data.message || data.error || `Replace document failed with status ${response.status}` 
        };
    }

    return { 
        success: true, 
        statusCode: response.status, 
        data: data.items 
    };
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
import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import { 
    PropertyDiscountInfoResponseDto, 
    DiscountDocumentUploadResponseDto,
    UpsertPropertyDiscountInfoDto
} from "@/types/discount.types";
import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { serverFetch } from '@/lib/utils/server-fetch';

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
 * Helper to build auth headers from cookies for server-side multipart uploads
 */
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
        .filter((c: { name: string; value: string }) => /auth_token|refresh_token|session_id|csrf_token|\.AspNetCore\.Antiforgery/.test(c.name))
        .map((c: { name: string; value: string }) => `${c.name.replace(/[^\x00-\x7F]/g, '')}=${c.value.replace(/[^\x00-\x7F]/g, '')}`)
        .join('; ');
    if (cookieStr) headers['Cookie'] = cookieStr;
    return headers;
}

/**
 * Helper to parse Response text to JSON and handle non-ok HTTP statuses
 */
async function parseResponse<T>(response: Response, errorPrefix: string): Promise<T> {
    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { message: text };
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || `${errorPrefix} failed with status ${response.status}`);
    }

    return data.items;
}

/**
 * Upload a discount-related document
 */
export async function uploadDiscountDocument(
    file: File, 
    propertyId: number, 
    socialAttributeId: number, 
    remark?: string
): Promise<DiscountDocumentUploadResponseDto> {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim();
    if (!baseUrl) {
        throw new Error("API base URL is not configured");
    }
    const url = `${baseUrl.replace(/\/$/, '')}/Property/discount-details/upload`;

    const formData = new FormData();
    formData.append("File", file, file.name);
    formData.append("PropertyId", String(propertyId));
    formData.append("SocialAttributeId", String(socialAttributeId));
    if (remark) {
        formData.append("Remark", remark);
    }

    const headers = await getAuthHeaders();
    const response = await serverFetch(url, {
        method: 'POST',
        headers,
        body: formData,
        cache: 'no-store'
    });

    return parseResponse<DiscountDocumentUploadResponseDto>(response, "Upload");
}

/**
 * Replace a discount-related document
 */
export async function replaceDiscountDocument(
    propertySocialDetailId: number, 
    file: File, 
    remark?: string
): Promise<DiscountDocumentUploadResponseDto> {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim();
    if (!baseUrl) {
        throw new Error("API base URL is not configured");
    }
    const url = `${baseUrl.replace(/\/$/, '')}/Property/discount-details/${propertySocialDetailId}/replace-document`;

    const formData = new FormData();
    formData.append("File", file, file.name);
    if (remark) {
        formData.append("Remark", remark);
    }

    const headers = await getAuthHeaders();
    const response = await serverFetch(url, {
        method: 'POST',
        headers,
        body: formData,
        cache: 'no-store'
    });

    return parseResponse<DiscountDocumentUploadResponseDto>(response, "Replace");
}

/**
 * Delete a discount detail document
 */
export async function deleteDiscountDocument(propertySocialDetailId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/Property/discount-details/${propertySocialDetailId}/document`);
    return response;
}


import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import {
    PropertySocialInfoApiResponse,
    UpsertPropertySocialInfoDto,
    UpsertPropertySocialInfoApiResponse
} from "@/types/property-social-details.types";
import { cookies } from "next/headers";
import { getAppConfig } from "@/config/app.config";
import { serverFetch } from "@/lib/utils/server-fetch";
import { DiscountDocumentUploadResponseDto } from "@/types/discount.types";

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
 * Upload a photo for a social detail attribute
 */
export async function uploadSocialPhoto(
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
    const url = `${baseUrl.replace(/\/$/, '')}/PropertySocialDetails/upload`;

    const formData = new FormData();
    formData.append("File", file, file.name);
    formData.append("PropertyId", String(propertyId));
    formData.append("SocialAttributeId", String(socialAttributeId));
    formData.append("IsPhoto", "true");
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
 * Replace an existing social detail photo
 */
export async function replaceSocialPhoto(
    propertySocialDetailId: number,
    file: File,
    remark?: string
): Promise<DiscountDocumentUploadResponseDto> {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim();
    if (!baseUrl) {
        throw new Error("API base URL is not configured");
    }
    const url = `${baseUrl.replace(/\/$/, '')}/PropertySocialDetails/${propertySocialDetailId}/replace-document`;

    const formData = new FormData();
    formData.append("File", file, file.name);
    formData.append("IsPhoto", "true");
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
 * Delete a social detail document
 */
export async function deleteSocialDocument(propertySocialDetailId: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<void>(`/PropertySocialDetails/${propertySocialDetailId}/document?isPhoto=true`);
    return response;
}



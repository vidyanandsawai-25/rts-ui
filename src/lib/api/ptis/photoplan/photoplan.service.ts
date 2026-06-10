import { apiClient } from "@/services/api.service";
import { ApiResponse } from "@/types/common.types";
import { cookies } from "next/headers";
import { getAppConfig } from "@/config/app.config";
import { serverFetch } from "@/lib/utils/server-fetch";
import type { 
  PropertyPhotoDto, 
  PropertyPhotoTypeWithStatusDto, 
  PropertyPhotoUploadResponseDto,
  PropertyPhotoGalleryDto
} from "@/types/photoplan.types";

interface BackendApiResponseWrapper<T> {
  success: boolean;
  message?: string;
  items: T;
  errors?: string[];
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const headers: Record<string, string> = { 'Accept': 'application/json, text/plain, */*' };
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

export const photoPlanService = {
  // 1. GET - All current photos for a property
  async getPhotosByProperty(propertyId: number): Promise<ApiResponse<PropertyPhotoDto[]>> {
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyPhotoDto[]>>(`/property-photos/property/${propertyId}`);
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 1b. GET - All grouped photos for a property (nested by category)
  async getGroupedPhotosByProperty(propertyId: number): Promise<ApiResponse<PropertyPhotoGalleryDto>> {
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyPhotoGalleryDto>>(`/property-photos/property/${propertyId}/grouped`);
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 2. GET - All active photo types with status for a property
  async getPhotoTypesWithStatus(propertyId: number): Promise<ApiResponse<PropertyPhotoTypeWithStatusDto[]>> {
    const response = await apiClient.get<BackendApiResponseWrapper<PropertyPhotoTypeWithStatusDto[]>>(`/property-photos/types-with-status/${propertyId}`);
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 3. POST - Upload a new photo
  async uploadPropertyPhoto(
    file: File,
    propertyId: number,
    photoTypeId: number,
    displayOrder: number,
    remarks: string
  ): Promise<ApiResponse<PropertyPhotoUploadResponseDto>> {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim();
    if (!baseUrl) return { success: false, statusCode: 500, error: "API base URL is not configured" };
    
    const url = `${baseUrl.replace(/\/$/, '')}/property-photos/upload`;
    const formData = new FormData();
    formData.append("File", file, file.name);
    formData.append("PropertyId", propertyId.toString());
    formData.append("PhotoTypeId", photoTypeId.toString());
    formData.append("DisplayOrder", displayOrder.toString());
    formData.append("Remarks", remarks || "");

    const headers = await getAuthHeaders();
    const response = await serverFetch(url, { method: 'POST', headers, body: formData, cache: 'no-store' });
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

    if (!response.ok) {
      return { success: false, statusCode: response.status, error: data.message || data.error || `Upload failed with status ${response.status}` };
    }
    return { success: true, statusCode: response.status, data: data.items };
  },

  // 4. POST - Replace an existing photo
  async replacePropertyPhoto(
    propertyPhotoId: number,
    file: File,
    remarks: string
  ): Promise<ApiResponse<PropertyPhotoUploadResponseDto>> {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim();
    if (!baseUrl) return { success: false, statusCode: 500, error: "API base URL is not configured" };

    const url = `${baseUrl.replace(/\/$/, '')}/property-photos/${propertyPhotoId}/replace`;
    const formData = new FormData();
    formData.append("File", file, file.name);
    formData.append("Remarks", remarks || "");

    const headers = await getAuthHeaders();
    const response = await serverFetch(url, { method: 'POST', headers, body: formData, cache: 'no-store' });
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

    if (!response.ok) {
      return { success: false, statusCode: response.status, error: data.message || data.error || `Replace photo failed with status ${response.status}` };
    }
    return { success: true, statusCode: response.status, data: data.items };
  },

  // 5. DELETE - Delete a photo
  async deletePropertyPhoto(propertyPhotoId: number): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<BackendApiResponseWrapper<object>>(`/property-photos/${propertyPhotoId}`);
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 6. PUT - Update a photo type name (rename slot)
  async updatePropertyPhotoType(
    id: number,
    photoTypeCode: string,
    photoTypeName: string
  ): Promise<ApiResponse<object>> {
    const response = await apiClient.put<BackendApiResponseWrapper<object>>(
      `/PropertyPhotoType/${id}`,
      { photoTypeCode, photoTypeName, isActive: true }
    );
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 7. POST - Create a new photo type (category slot)
  async createPropertyPhotoType(
    photoTypeCode: string,
    photoTypeName: string,
    displayOrder?: number,
    description?: string
  ): Promise<ApiResponse<{ id: number }>> {
    const response = await apiClient.post<BackendApiResponseWrapper<{ id: number }>>(
      '/PropertyPhotoType',
      { photoTypeCode, photoTypeName, displayOrder, description, isActive: true }
    );
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 8. DELETE - Delete a photo type
  async deletePropertyPhotoType(id: number): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<BackendApiResponseWrapper<object>>(`/PropertyPhotoType/${id}`);
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  },

  // 9. DELETE - Purge a photo type and all its associated photos
  async purgePropertyPhotoType(id: number): Promise<ApiResponse<object>> {
    const response = await apiClient.delete<BackendApiResponseWrapper<object>>(`/PropertyPhotoType/${id}/purge`);
    return response.success && response.data
      ? { success: response.data.success, statusCode: response.statusCode, data: response.data.items, message: response.data.message || response.message }
      : { success: false, statusCode: response.statusCode, error: response.error, message: response.message };
  }
};

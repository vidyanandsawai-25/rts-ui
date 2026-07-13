import { getAppConfig } from '@/config/app.config';
import { serverFetch } from '@/lib/utils/server-fetch';
import { getAuthHeaders } from '@/lib/utils/server-auth-headers';
import { buildDocumentUploadFormData } from '@/lib/utils/document-utils';
import { 
  DocumentUploadParams, 
  DocumentUploadResponse, 
  DocumentDto, 
  DocumentMetadataDto, 
  DocumentReferenceQuery 
} from '@/types/document.types';
import { ApiResponse } from '@/types/common.types';
import { cookies } from 'next/headers';

function getBaseUrl(): string {
  const config = getAppConfig();
  const baseUrl = config.api.baseUrl?.trim();
  if (!baseUrl) throw new Error("Backend API base URL is not configured");
  return baseUrl.replace(/\/+$/, "");
}

export async function uploadDocument(file: File, params?: DocumentUploadParams): Promise<DocumentUploadResponse> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/documents/upload`;
  const headers = await getAuthHeaders();
  const formData = buildDocumentUploadFormData(file, params || {});
  const response = await serverFetch(url, { method: 'POST', headers, body: formData, cache: 'no-store' });
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!response.ok) throw new Error(data.message || data.error || `Upload failed with status ${response.status}`);
  return data.items;
}

export async function deleteDocument(documentGuid: string): Promise<ApiResponse<void>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/documents/${encodeURIComponent(documentGuid)}`;
  const headers = await getAuthHeaders();
  const response = await serverFetch(url, { method: 'DELETE', headers, cache: 'no-store' });
  if (!response.ok) {
    const text = await response.text();
    return { success: false, error: text || `Delete failed with status ${response.status}`, statusCode: response.status };
  }
  return { success: true };
}

export async function getDocumentDetails(documentGuid: string): Promise<ApiResponse<DocumentDto>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/documents/${encodeURIComponent(documentGuid)}`;
  const headers = await getAuthHeaders();
  const response = await serverFetch(url, { method: 'GET', headers, cache: 'no-store' });
  if (!response.ok) return { success: false, error: `Failed with status ${response.status}`, statusCode: response.status };
  const data = await response.json();
  return { success: true, data };
}

export async function getDocumentByBinding(bindingId: number): Promise<ApiResponse<DocumentDto>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/documents/by-binding/${bindingId}`;
  const headers = await getAuthHeaders();
  const response = await serverFetch(url, { method: 'GET', headers, cache: 'no-store' });
  if (!response.ok) return { success: false, error: `Failed with status ${response.status}`, statusCode: response.status };
  const data = await response.json();
  return { success: true, data };
}

export async function getDocumentByReference(params: DocumentReferenceQuery): Promise<ApiResponse<DocumentDto>> {
  const baseUrl = getBaseUrl();
  const query = new URLSearchParams({
    departmentId: String(params.departmentId),
    moduleId: String(params.moduleId),
    referenceTableName: params.referenceTableName,
    referenceTableId: String(params.referenceTableId),
  }).toString();
  const url = `${baseUrl}/documents/by-reference?${query}`;
  const headers = await getAuthHeaders();
  const response = await serverFetch(url, { method: 'GET', headers, cache: 'no-store' });
  if (!response.ok) return { success: false, error: `Failed with status ${response.status}`, statusCode: response.status };
  const data = await response.json();
  return { success: true, data };
}

export async function getDocumentMetadata(documentGuid: string): Promise<ApiResponse<DocumentMetadataDto>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/documents/${encodeURIComponent(documentGuid)}/metadata`;
  const headers = await getAuthHeaders();
  const response = await serverFetch(url, { method: 'GET', headers, cache: 'no-store' });
  if (!response.ok) return { success: false, error: `Failed with status ${response.status}`, statusCode: response.status };
  const data = await response.json();
  return { success: true, data };
}

export async function updateBindingReference(bindingId: number, refTableId: number): Promise<ApiResponse<void>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/documents/binding/${bindingId}/reference/${refTableId}`;
  const headers = await getAuthHeaders();
  const response = await serverFetch(url, { method: 'PUT', headers, cache: 'no-store' });
  if (!response.ok) {
    const text = await response.text();
    return { success: false, error: text || `Failed with status ${response.status}`, statusCode: response.status };
  }
  return { success: true };
}

export async function getDocument(documentGuid: string, action: 'view' | 'download') {
  const baseUrl = getBaseUrl();
  let cleanBase = baseUrl.replace(/\/+$/, "");
  if (cleanBase.endsWith("/api")) {
    cleanBase = cleanBase.substring(0, cleanBase.length - 4);
  }
  const finalRoot = cleanBase.endsWith("/") ? cleanBase : `${cleanBase}/`;
  const backendUrl = `${finalRoot}api/documents/${encodeURIComponent(documentGuid)}/${action}`;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) throw new Error("Unauthorized");

  const response = await serverFetch(backendUrl, {
    method: "GET",
    headers: { "Accept": "*/*", "Authorization": `Bearer ${token}` }
  });
  if (!response.ok) throw new Error(`Failed to fetch document: ${response.status}`);
  const contentType = response.headers.get("content-type") || "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition") || "";
  const buffer = await response.arrayBuffer();
  return { buffer, contentType, contentDisposition };
}

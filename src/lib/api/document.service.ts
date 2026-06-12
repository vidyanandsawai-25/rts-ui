import { cookies } from 'next/headers';
import { getAppConfig } from '@/config/app.config';
import { serverFetch } from '@/lib/utils/server-fetch';

/**
 * Upload a document to the server
 */
export async function uploadDocument(file: File, groupKey: string, fileTypeName: string) {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl;
    const url = `${baseUrl.replace(/\/$/, '')}/Document/upload`;

    const formData = new FormData();
    formData.append("File", file, file.name);
    formData.append("GroupKey", groupKey);
    formData.append("FileTypeName", fileTypeName);
    formData.append("IsActive", "true");
    // Derive CreatedBy from cookies if available
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (userId) {
        formData.append("CreatedBy", userId);
    }



    // Forward auth/csrf/cookie headers as in api.service.ts
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

    // Note: We do NOT set Content-Type header for FormData, 
    // the browser/node-fetch will set it automatically with the boundary.

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
        throw new Error(data.message || data.error || `Upload failed with status ${response.status}`);
    }

    return data.items;
}

/**
 * Fetches a document from the backend API and returns its body as an ArrayBuffer,
 * along with its content type and content disposition.
 */
export async function getDocument(documentGuid: string, action: 'view' | 'download') {
    const config = getAppConfig();
    const baseUrl = config.api.baseUrl?.trim();
    if (!baseUrl) {
        throw new Error("Backend API base URL is not configured");
    }
    
    let cleanBase = baseUrl.replace(/\/+$/, "");
    if (cleanBase.endsWith("/api")) {
        cleanBase = cleanBase.substring(0, cleanBase.length - 4);
    }
    const finalRoot = cleanBase.endsWith("/") ? cleanBase : `${cleanBase}/`;
    const backendUrl = `${finalRoot}api/documents/${encodeURIComponent(documentGuid)}/${action}`;

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) {
        throw new Error("Unauthorized");
    }

    const response = await serverFetch(backendUrl, {
        method: "GET",
        headers: {
            "Accept": "*/*",
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "";
    const buffer = await response.arrayBuffer();

    return {
        buffer,
        contentType,
        contentDisposition
    };
}


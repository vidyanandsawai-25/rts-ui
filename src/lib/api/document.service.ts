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

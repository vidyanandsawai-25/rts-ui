import { getAppConfig } from '@/config/app.config';
/**
 * Utility functions for documents
 */

/**
 * Get the view URL for a document
 */
export function getViewDocumentUrl(documentGuid: string) {
    let baseUrl = getAppConfig().api.baseUrl;
    if (!baseUrl && typeof window !== 'undefined') {
        baseUrl = window.location.origin;
    }
    baseUrl = baseUrl || "";
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${cleanBaseUrl}Document/${documentGuid}/view`;
}

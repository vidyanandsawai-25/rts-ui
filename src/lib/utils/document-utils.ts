/**
 * Get the view URL for a document
 */
export function getViewDocumentUrl(documentGuid: string) {
    return `/api/documents/${encodeURIComponent(documentGuid)}/view`;
}

/**
 * Get the download URL for a document
 */
export function getDownloadDocumentUrl(documentGuid: string) {
    return `/api/documents/${encodeURIComponent(documentGuid)}/download`;
}

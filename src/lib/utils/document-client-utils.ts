import { getDocumentAction } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/document.actions';

/**
 * Client-side helper to open a document in a new tab by fetching its base64 content
 * via a Server Action and converting it into a local Object URL.
 */
export async function viewDocumentClient(documentGuid: string, locale?: string): Promise<void> {
    if (!documentGuid) return;
    const res = await getDocumentAction(documentGuid, 'view', locale);
    if (res.success && res.data?.base64) {
        const byteCharacters = atob(res.data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: res.data.contentType });
        const blobUrl = URL.createObjectURL(blob);
        const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
            URL.revokeObjectURL(blobUrl);
        } else {
            // Best-effort cleanup after the new tab has had time to load.
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
        }
    } else {
        throw new Error(res.error || "Failed to view document");
    }
}

/**
 * Client-side helper to download a document by fetching its base64 content
 * via a Server Action, converting it to a local Blob, and triggering a download.
 */
export async function downloadDocumentClient(documentGuid: string, defaultFileName?: string, locale?: string): Promise<void> {
    if (!documentGuid) return;
    const res = await getDocumentAction(documentGuid, 'download', locale);
    if (res.success && res.data?.base64) {
        const byteCharacters = atob(res.data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: res.data.contentType });
        const blobUrl = URL.createObjectURL(blob);
        
        let filename = defaultFileName || "document";
        const disposition = res.data.contentDisposition;
        if (disposition) {
            const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        }
        filename = filename.replace(/[\/\\:*"?<>|]/g, "_").replace(/[\u0000-\u001F]/g, "_").trim() || "document";

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } else {
        throw new Error(res.error || "Failed to download document");
    }
}

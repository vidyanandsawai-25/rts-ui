"use server"

import { uploadDocument } from "@/lib/api/document.service";

/**
 * Server Action to upload a document.
 * This wraps the server-only document service so it can be called from client components.
 */
export async function uploadDocumentAction(formData: FormData) {
    try {

        const fileRaw = formData.get("File");
        const file = fileRaw instanceof File ? fileRaw : null;
        const groupKey = formData.get("GroupKey") as string | null;
        const fileTypeName = formData.get("FileTypeName") as string | null;

        if (!file) {
            return { success: false, error: "No file provided" };
        }
        if (!groupKey) {
            return { success: false, error: "No group key provided" };
        }
        if (!fileTypeName) {
            return { success: false, error: "No file type name provided" };
        }

        const result = await uploadDocument(file, groupKey, fileTypeName);
        return { success: true, data: result };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to upload document";
        console.error("Upload document action error:", error);
        return { success: false, error: message };
    }
}

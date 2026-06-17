"use server";

import { uploadDocument, getDocument } from "@/lib/api/document.service";
import { logger } from "@/lib/utils/logger";
import { getTranslations } from "next-intl/server";

/**
 * Server Action to upload a document.
 * This wraps the server-only document service so it can be called from client components.
 */
export async function uploadDocumentAction(formData: FormData, locale?: string) {
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
        logger.error("Upload document action error", { error: error instanceof Error ? error : new Error(String(error)) });
        const t = await getTranslations({ locale: locale || "en", namespace: "quickDataEntry" });
        let errorKey = "document.errors.uploadGeneral";
        const errorMsg = error instanceof Error ? error.message : "";
        if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
            errorKey = "document.errors.unauthorized";
        } else if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
            errorKey = "document.errors.forbidden";
        }
        const message = t(errorKey) || "Failed to upload document";
        return { success: false, error: message };
    }
}

/**
 * Server Action to retrieve a document as a base64 encoded string.
 */
export async function getDocumentAction(documentGuid: string, action: 'view' | 'download', locale?: string) {
    try {
        const result = await getDocument(documentGuid, action);
        const base64 = Buffer.from(result.buffer).toString("base64");
        return {
            success: true,
            data: {
                base64,
                contentType: result.contentType,
                contentDisposition: result.contentDisposition
            }
        };
    } catch (error: unknown) {
        logger.error("Get document action error", { error: error instanceof Error ? error : new Error(String(error)) });
        const t = await getTranslations({ locale: locale || "en", namespace: "quickDataEntry" });
        let errorKey = "document.errors.general";
        const errorMsg = error instanceof Error ? error.message : "";
        if (errorMsg.includes("404") || errorMsg.includes("Not Found")) {
            errorKey = "document.errors.notFound";
        } else if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
            errorKey = "document.errors.unauthorized";
        } else if (errorMsg.includes("403") || errorMsg.includes("Forbidden")) {
            errorKey = "document.errors.forbidden";
        }
        const message = t(errorKey) || "Failed to retrieve document";
        return { success: false, error: message };
    }
}


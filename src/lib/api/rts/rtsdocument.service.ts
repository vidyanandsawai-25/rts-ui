import "server-only";

import { getAppConfig } from "@/config/app.config";
import { apiClient } from "@/services/api.service";
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/utils/server-fetch";
import type {
  UploadRtsDocumentItem,
  UploadRtsDocumentPayload,
  UploadRtsDocumentResponse,
} from "@/types/rts/rts-application.types";

export type { UploadRtsDocumentItem, UploadRtsDocumentPayload } from "@/types/rts/rts-application.types";

const RTS_DOCUMENT_UPLOAD_DEPARTMENT_ID = 5;
const RTS_DOCUMENT_UPLOAD_MODULE_ID = 1005;

/**
 * Stable, safe-to-display document upload outcomes. The document API can return
 * infrastructure and validation details which must remain in server logs rather
 * than being shown in the citizen form.
 */
export type RtsDocumentUploadErrorCode =
  | "unsupported-file-type"
  | "file-too-large"
  | "upload-rate-limited"
  | "upload-timeout"
  | "upload-not-authorized"
  | "document-service-unavailable"
  | "document-upload-failed";

export class RtsDocumentUploadError extends Error {
  constructor(
    public readonly code: RtsDocumentUploadErrorCode,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "RtsDocumentUploadError";
  }
}

const DOCUMENT_UPLOAD_MESSAGES: Record<RtsDocumentUploadErrorCode, string> = {
  "unsupported-file-type":
    "This file type is not supported. Upload a PDF, image, Word, Excel, PowerPoint, or text file.",
  "file-too-large": "This file is too large to upload. Please choose a smaller file and try again.",
  "upload-rate-limited": "Too many upload attempts were made. Please wait a few minutes and try again.",
  "upload-timeout": "The document upload took too long. Please check your connection and try again.",
  "upload-not-authorized": "Your session cannot upload this document. Please sign in again and retry.",
  "document-service-unavailable":
    "Document upload is temporarily unavailable. Please try again shortly.",
  "document-upload-failed": "The document could not be uploaded. Please try again.",
};

function getDocumentUploadError(status?: number, backendMessage?: string): RtsDocumentUploadError {
  const message = backendMessage?.toLowerCase() ?? "";
  let code: RtsDocumentUploadErrorCode = "document-upload-failed";

  if (
    message.includes("invalid file type") ||
    message.includes("file type not allowed") ||
    message.includes("allowed extensions") ||
    message.includes("content type")
  ) {
    code = "unsupported-file-type";
  } else if (
    status === 413 ||
    message.includes("file size") ||
    message.includes("too large") ||
    message.includes("exceeds maximum")
  ) {
    code = "file-too-large";
  } else if (status === 429) {
    code = "upload-rate-limited";
  } else if (status === 408 || message.includes("timeout") || message.includes("timed out")) {
    code = "upload-timeout";
  } else if (status === 401 || status === 403) {
    code = "upload-not-authorized";
  } else if (!status || status >= 500) {
    code = "document-service-unavailable";
  }

  return new RtsDocumentUploadError(code, DOCUMENT_UPLOAD_MESSAGES[code], status);
}

async function getMultipartAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const headers: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
  };

  const token = cookieStore.get("auth_token")?.value;
  if (token) headers.Authorization = `Bearer ${token}`;

  const csrf = cookieStore.get("csrf_token")?.value;
  if (csrf) headers["X-CSRF-Token"] = csrf;

  const cookieStr = cookieStore
    .getAll()
    .filter((cookie) =>
      /auth_token|refresh_token|session_id|csrf_token|\.AspNetCore\.Antiforgery/.test(cookie.name)
    )
    .map(
      (cookie) =>
        `${cookie.name.replace(/[^\x00-\x7F]/g, "")}=${cookie.value.replace(/[^\x00-\x7F]/g, "")}`
    )
    .join("; ");

  if (cookieStr) headers.Cookie = cookieStr;

  return headers;
}

export async function uploadRtsDocument(
  payload: UploadRtsDocumentPayload
): Promise<UploadRtsDocumentItem> {
  const baseUrl = getAppConfig().api.baseUrl?.trim();
  if (!baseUrl) throw getDocumentUploadError();

  const formData = new FormData();
  formData.append("File", payload.file, payload.file.name);
  formData.append("DocumentType", payload.documentType ?? "");
  formData.append("DepartmentId", String(RTS_DOCUMENT_UPLOAD_DEPARTMENT_ID));
  formData.append("ModuleId", String(RTS_DOCUMENT_UPLOAD_MODULE_ID));
  formData.append("IsPrimaryDocument", String(payload.isPrimaryDocument ?? false));

  let response: Response;
  try {
    response = await serverFetch(`${baseUrl.replace(/\/$/, "")}/documents/upload`, {
      method: "POST",
      headers: await getMultipartAuthHeaders(),
      body: formData,
      cache: "no-store",
    });
  } catch {
    throw getDocumentUploadError();
  }
  const text = await response.text();
  let data: UploadRtsDocumentResponse | { message?: string; error?: string };

  try {
    data = text ? (JSON.parse(text) as UploadRtsDocumentResponse) : { message: "" };
  } catch {
    data = { message: text };
  }

  if (!response.ok || !("items" in data) || !data.items) {
    const backendMessage =
      ("message" in data && typeof data.message === "string" && data.message) ||
      ("error" in data && typeof data.error === "string" && data.error) ||
      undefined;
    throw getDocumentUploadError(response.status, backendMessage);
  }

  return data.items;
}

function getRtsDocumentUrl(documentGuid: string, action: "view" | "download"): string {
  const guid = documentGuid.trim();
  if (!guid) throw new Error("Document GUID is required");

  const baseUrl = getAppConfig().api.baseUrl?.trim();
  if (!baseUrl) throw new Error("API base URL is not configured");

  return `${baseUrl.replace(/\/$/, "")}/documents/${encodeURIComponent(guid)}/${action}`;
}

export async function viewAdminRtsDocument(documentGuid: string): Promise<Response> {
  try {
    const response = await apiClient.fetch(`/documents/${encodeURIComponent(documentGuid)}/view`, {
      cache: "no-store",
    });
    if (response.ok) return response;
  } catch {}

  // Fallback to anonymous serverFetch for [AllowAnonymous] document endpoints
  return serverFetch(getRtsDocumentUrl(documentGuid, "view"), {
    method: "GET",
    headers: { Accept: "*/*" },
    cache: "no-store",
  });
}

export async function downloadAdminRtsDocument(documentGuid: string): Promise<Response> {
  try {
    const response = await apiClient.fetch(`/documents/${encodeURIComponent(documentGuid)}/download`, {
      cache: "no-store",
    });
    if (response.ok) return response;
  } catch {}

  // Fallback to anonymous serverFetch for [AllowAnonymous] document endpoints
  return serverFetch(getRtsDocumentUrl(documentGuid, "download"), {
    method: "GET",
    headers: { Accept: "*/*" },
    cache: "no-store",
  });
}

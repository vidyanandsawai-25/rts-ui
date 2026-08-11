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
  if (!baseUrl) throw new Error("API base URL is not configured");

  const formData = new FormData();
  formData.append("File", payload.file, payload.file.name);
  formData.append("OwnerUserId", String(payload.ownerUserId ?? 0));
  formData.append("DocumentType", payload.documentType ?? "");
  formData.append("DepartmentId", String(payload.departmentId ?? 0));
  formData.append("ModuleId", String(payload.moduleId ?? 0));
  formData.append("IsPrimaryDocument", String(payload.isPrimaryDocument ?? false));

  const response = await serverFetch(`${baseUrl.replace(/\/$/, "")}/documents/upload`, {
    method: "POST",
    headers: await getMultipartAuthHeaders(),
    body: formData,
    cache: "no-store",
  });
  const text = await response.text();
  let data: UploadRtsDocumentResponse | { message?: string; error?: string };

  try {
    data = text ? (JSON.parse(text) as UploadRtsDocumentResponse) : { message: "" };
  } catch {
    data = { message: text };
  }

  if (!response.ok || !("items" in data) || !data.items) {
    const message =
      ("message" in data && typeof data.message === "string" && data.message) ||
      ("error" in data && typeof data.error === "string" && data.error) ||
      `RTS document upload failed with status ${response.status}`;
    throw new Error(message);
  }

  return data.items;
}

export async function viewRtsDocument(documentGuid: string): Promise<Response> {
  return apiClient.fetch(`/documents/${encodeURIComponent(documentGuid)}/view`, {
    cache: "no-store",
  });
}

export async function downloadRtsDocument(documentGuid: string): Promise<Response> {
  return apiClient.fetch(`/documents/${encodeURIComponent(documentGuid)}/download`, {
    cache: "no-store",
  });
}

import "server-only";

import { apiClient } from "@/services/api.service";
import { getAppConfig } from "@/config/app.config";
import { serverFetch } from "@/lib/utils/server-fetch";
import { cookies } from "next/headers";

export interface RtsApplicationFieldValuePayload {
  isActive?: boolean;
  createdBy?: number;
  fieldDefinitionId: number;
  fieldName: string;
  textValue?: string | null;
  numberValue?: number | null;
  dateValue?: string | null;
  booleanValue?: boolean | null;
  documentGuid?: string | null;
}

export interface CreateRtsApplicationPayload {
  isActive?: boolean;
  createdBy?: number;
  departmentId?: number;
  serviceId?: number;
  ownerId: number;
  applicationStatus?: string;
  fieldValues: RtsApplicationFieldValuePayload[];
}

export interface CreateRtsApplicationFieldValueResponse {
  applicationId: number;
  fieldDefinitionId: number;
  fieldName: string;
  textValue: string | null;
  numberValue: number | null;
  dateValue: string | null;
  booleanValue: boolean | null;
  documentGuid: string | null;
  id: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateRtsApplicationResponseItem {
  departmentId: number;
  serviceId: number;
  ownerId: number;
  applicationNo: string;
  applicationStatus: string;
  fieldValues: CreateRtsApplicationFieldValueResponse[];
}

export interface CreateRtsApplicationResponse {
  success: boolean;
  message: string;
  items: CreateRtsApplicationResponseItem;
  errors: unknown;
  correlationId: string | null;
}

export interface UploadRtsDocumentPayload {
  file: File;
  ownerUserId?: number;
  documentType?: string;
  departmentId?: number;
  moduleId?: number;
  isPrimaryDocument?: boolean;
}

export interface UploadRtsDocumentItem {
  documentGuid: string;
  documentId: number;
  documentBindingId: number | null;
  fileName: string;
  fileSizeBytes: number;
  storagePath: string;
}

export interface UploadRtsDocumentResponse {
  success: boolean;
  message: string;
  items: UploadRtsDocumentItem;
  errors: unknown;
  correlationId: string | null;
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

export async function createRtsApplication(
  payload: CreateRtsApplicationPayload
): Promise<CreateRtsApplicationResponse> {
  const response = await apiClient.post<CreateRtsApplicationResponse>("/RTSApplication", payload, {
    cache: "no-store",
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create RTS application");
  }

  return response.data;
}

export async function uploadRtsDocument(
  payload: UploadRtsDocumentPayload
): Promise<UploadRtsDocumentItem> {
  const baseUrl = getAppConfig().api.baseUrl?.trim();
  if (!baseUrl) {
    throw new Error("API base URL is not configured");
  }

  const url = `${baseUrl.replace(/\/$/, "")}/documents/upload`;
  const formData = new FormData();

  formData.append("File", payload.file, payload.file.name);
  formData.append("OwnerUserId", String(payload.ownerUserId ?? 0));
  formData.append("DocumentType", payload.documentType ?? "");
  formData.append("DepartmentId", String(payload.departmentId ?? 0));
  formData.append("ModuleId", String(payload.moduleId ?? 0));
  formData.append("IsPrimaryDocument", String(payload.isPrimaryDocument ?? false));

  const response = await serverFetch(url, {
    method: "POST",
    headers: await getMultipartAuthHeaders(),
    body: formData,
    cache: "no-store",
  });

  const text = await response.text();
  let data: UploadRtsDocumentResponse | { message?: string; error?: string };

  try {
    data = text ? (JSON.parse(text) as UploadRtsDocumentResponse) : ({ message: "" } as const);
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `RTS document upload failed with status ${response.status}`
    );
  }

  if (!("items" in data) || !data.items) {
    throw new Error(data.message || "RTS document upload response did not include document data");
  }

  return data.items;
}

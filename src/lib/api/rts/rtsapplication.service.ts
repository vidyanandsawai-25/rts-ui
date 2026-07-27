import "server-only";

import { apiClient } from "@/services/api.service";
import { getAppConfig } from "@/config/app.config";
import { serverFetch } from "@/lib/utils/server-fetch";
import { cookies } from "next/headers";
import {
  getMockApplicationHeader,
  isRtsMockModeEnabled,
  seedMockApplication,
} from "./rts-workflow-mock-store";

export interface RtsApplicationFieldValuePayload {
  isActive?: boolean;
  createdBy?: number;
  fieldDefinitionId: number;
  // fieldName removed — API identifies fields via fieldDefinitionId only
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
  sessionId: string;
  ownerId?: number;
  applicationStatus?: string;
  fieldValues: RtsApplicationFieldValuePayload[];
}

export interface CreateRtsApplicationFieldValueResponse {
  applicationId: number;
  fieldDefinitionId: number;
  // fieldName removed — get field metadata via fieldDefinitionId JOIN
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
  sessionId?: string;
  ownerId?: number;
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

export interface RtsApplicationApplicantDetail {
  fieldLabel: string;
  fieldValue: string | null;
}

export interface RtsApplicationListItem {
  id: number;
  departmentId: number;
  serviceId: number;
  applicationNo: string;
  applicationStatus: string;
  createdDate: string;
  updatedDate: string | null;
  assignedTo: number | string;
  action?: number;
  sessionId?: string;
  ownerId?: number;
  departmentName: string;
  citizenName: string | null;
  serviceName: string;
  sla: string;
  remainingDays: number | null;
  dueDays: number | null;
  overdueDays: number | null;
  applicantDetails: RtsApplicationApplicantDetail[];
}

export interface RtsApplicationDashboardSummary {
  totalApplications: number;
  pending: number;
  approved: number;
  rejected: number;
  reverted: number;
  todayApplications: number;
  overdueApplications: number;
  dueToday: number;
  inProgress: number;
}

export interface RtsApplicationsListPayload {
  dashboard: RtsApplicationDashboardSummary;
  applications: RtsApplicationListItem[];
}

export interface RtsApplicationsListResponse {
  items: RtsApplicationsListPayload[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetRtsApplicationsParams {
  pageNumber?: number;
  pageSize?: number;
  departmentId?: number;
  serviceId?: number;
  applicationNo?: string;
  status?: string;
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

  // POST /RTSApplication is real and works; seed the (dev-only) mock workflow
  // store with what was actually submitted so it can be viewed/processed
  // immediately — see rts-workflow-mock-store.ts for why this exists.
  seedMockApplication(response.data.items);

  return response.data;
}

/**
 * GET /RTSApplication/{no} does not exist on the backend yet (only POST is
 * implemented — confirmed against the live swagger spec). Falls back to the
 * dev-only mock store so the application-details page is testable in the
 * meantime; see rts-workflow-mock-store.ts.
 */
export async function getRtsApplicationByNo(
  applicationNo: string
): Promise<CreateRtsApplicationResponseItem> {
  const response = await apiClient.get<CreateRtsApplicationResponseItem>(
    `/RTSApplication/${encodeURIComponent(applicationNo)}`,
    { cache: "no-store" }
  );

  if (response.success && response.data) {
    return response.data;
  }

  if (isRtsMockModeEnabled()) {
    return getMockApplicationHeader(applicationNo);
  }

  throw new Error(response.error || `Failed to fetch RTS application ${applicationNo}`);
}

/**
 * GET /api/RTSApplication (list + dashboard metrics aggregate)
 */
export async function getRtsApplications(
  params: GetRtsApplicationsParams = {}
): Promise<{
  dashboard: RtsApplicationDashboardSummary;
  applications: RtsApplicationListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}> {
  const queryParams = new URLSearchParams();
  if (params.pageNumber != null) queryParams.set("PageNumber", String(params.pageNumber));
  if (params.pageSize != null) queryParams.set("PageSize", String(params.pageSize));
  if (params.departmentId != null) queryParams.set("DepartmentId", String(params.departmentId));
  if (params.serviceId != null) queryParams.set("ServiceId", String(params.serviceId));
  if (params.applicationNo) queryParams.set("ApplicationNo", params.applicationNo);
  if (params.status) queryParams.set("Status", params.status);

  const queryString = queryParams.toString();
  const endpoint = `/RTSApplication${queryString ? `?${queryString}` : ""}`;

  const response = await apiClient.get<RtsApplicationsListResponse>(endpoint, {
    cache: "no-store",
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch RTS applications");
  }

  const data = response.data;
  const firstItem = Array.isArray(data.items)
    ? data.items[0]
    : (data.items as unknown as RtsApplicationsListPayload);

  return {
    dashboard: firstItem?.dashboard ?? {
      totalApplications: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      reverted: 0,
      todayApplications: 0,
      overdueApplications: 0,
      dueToday: 0,
      inProgress: 0,
    },
    applications: firstItem?.applications ?? [],
    totalCount: data.totalCount ?? 0,
    pageNumber: data.pageNumber ?? 1,
    pageSize: data.pageSize ?? 10,
    totalPages: data.totalPages ?? 1,
  };
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
    const errorMsg =
      ("message" in data && typeof data.message === "string" && data.message) ||
      ("error" in data && typeof data.error === "string" && data.error) ||
      `RTS document upload failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  if (!("items" in data) || !data.items) {
    const errorMsg =
      ("message" in data && typeof data.message === "string" && data.message) ||
      "RTS document upload response did not include document data";
    throw new Error(errorMsg);
  }

  return data.items;
}

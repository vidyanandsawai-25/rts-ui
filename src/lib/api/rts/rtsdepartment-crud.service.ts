import "server-only";

import { apiClient } from "@/services/api.service";
import type { PagedResponse } from "@/types/common.types";
import type {
  RtsDepartmentApiItem,
  RtsDepartmentQueryParams,
} from "@/types/rts/departments.types";

function buildUrl(params: RtsDepartmentQueryParams = {}): string {
  const sp = new URLSearchParams();
  if (params.DepartmentName) sp.set("DepartmentName", params.DepartmentName);
  if (params.PageNumber !== undefined) sp.set("PageNumber", String(params.PageNumber));
  if (params.PageSize !== undefined) sp.set("PageSize", String(params.PageSize));
  if (params.SearchTerm) sp.set("SearchTerm", params.SearchTerm);
  const q = sp.toString();
  return `/RTSDepartment${q ? `?${q}` : ""}`;
}

export async function getRtsDepartmentsPaged(
  params: RtsDepartmentQueryParams = {}
): Promise<PagedResponse<RtsDepartmentApiItem>> {
  const response = await apiClient.get<PagedResponse<RtsDepartmentApiItem>>(
    buildUrl(params),
    { cache: "no-store" },
    false
  );
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch RTS departments");
  }
  return response.data;
}

export async function createRtsDepartment(payload: {
  departmentName: string;
  departmentNameLocal?: string;
  departmentIcon?: string;
  displayOrder?: number;
  isActive: boolean;
  createdBy?: number;
}): Promise<RtsDepartmentApiItem> {
  const response = await apiClient.post<RtsDepartmentApiItem>("/RTSDepartment", payload);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create RTS department");
  }
  return response.data;
}

export async function updateRtsDepartment(
  id: number,
  payload: {
    id: number;
    departmentName: string;
    departmentNameLocal?: string;
    departmentIcon?: string;
    displayOrder?: number;
    isActive: boolean;
    updatedBy?: number;
  }
): Promise<RtsDepartmentApiItem> {
  const response = await apiClient.put<RtsDepartmentApiItem>(`/RTSDepartment/${id}`, payload);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to update RTS department");
  }
  return response.data;
}

export async function deleteRtsDepartment(id: number): Promise<void> {
  const response = await apiClient.delete<unknown>(`/RTSDepartment/${id}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to delete RTS department");
  }
}

export async function getRtsDepartmentById(id: number): Promise<RtsDepartmentApiItem> {
  const response = await apiClient.get<RtsDepartmentApiItem>(`/RTSDepartment/${id}`, {
    cache: "no-store",
  }, false);
  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch RTS department ${id}`);
  }
  return response.data;
}

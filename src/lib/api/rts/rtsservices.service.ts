import "server-only";

import { apiClient } from "@/services/api.service";
import type { PagedResponse } from "@/types/common.types";
import type { RtsServiceApiItem, RtsServiceQueryParams } from "@/types/rts/service.types";

function buildUrl(params: RtsServiceQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.id !== undefined) searchParams.set("id", String(params.id));
  if (params.ServiceName) searchParams.set("ServiceName", params.ServiceName);
  if (params.DepartmentId !== undefined) searchParams.set("DepartmentId", String(params.DepartmentId));
  if (params.PageNumber !== undefined) searchParams.set("PageNumber", String(params.PageNumber));
  if (params.PageSize !== undefined) searchParams.set("PageSize", String(params.PageSize));
  if (params.SearchTerm) searchParams.set("SearchTerm", params.SearchTerm);

  const query = searchParams.toString();
  return `/RTSService${query ? `?${query}` : ""}`;
}

export async function getRtsServices(
  params: RtsServiceQueryParams = {}
): Promise<PagedResponse<RtsServiceApiItem>> {
  const response = await apiClient.get<PagedResponse<RtsServiceApiItem>>(buildUrl(params), {
    cache: "no-store",
  }, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch RTS services");
  }

  return response.data;
}

export async function getRtsServicesPaged(
  params: RtsServiceQueryParams = {}
): Promise<PagedResponse<RtsServiceApiItem>> {
  return getRtsServices(params);
}

export async function getAllRtsServices(): Promise<RtsServiceApiItem[]> {
  const response = await getRtsServices({
    PageNumber: 1,
    PageSize: -1,
  });

  return response.items;
}

export async function getServicesByDepartment(departmentId: number): Promise<RtsServiceApiItem[]> {
  const response = await getRtsServices({
    DepartmentId: departmentId,
    PageNumber: 1,
    PageSize: -1,
  });

  return response.items;
}

function unwrapServiceItem<T>(data: unknown): T {
  if (data && typeof data === "object" && "items" in data && (data as { items?: unknown }).items) {
    return (data as { items: T }).items;
  }
  return data as T;
}

export async function createRtsService(payload: {
  departmentId: number;
  serviceName: string;
  serviceNameLocal?: string;
  description?: string;
  serviceUrl?: string;
  serviceIcon?: string;
  displayOrder?: number;
  isActive: boolean;
  createdBy?: number;
  sla?: string | number;
  fees?: number;
  feesRequired?: boolean;
  isFeesRequired?: boolean;
  certificateType?: number;
  isCertificateRequired?: boolean;
  isSmsEnabled?: boolean;
  serviceCode?: string;
  govtServiceCode?: number;
}): Promise<RtsServiceApiItem> {
  const feesReq = payload.feesRequired ?? payload.isFeesRequired ?? false;
  const formattedPayload = {
    ...payload,
    feesRequired: feesReq,
    isFeesRequired: feesReq,
    sla: payload.sla != null ? String(payload.sla) : undefined,
  };
  const response = await apiClient.post<unknown>("/RTSService", formattedPayload);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create RTS service");
  }
  return unwrapServiceItem<RtsServiceApiItem>(response.data);
}

export async function updateRtsService(
  id: number,
  payload: {
    id: number;
    departmentId: number;
    serviceName: string;
    serviceNameLocal?: string;
    description?: string;
    serviceUrl?: string;
    serviceIcon?: string;
    displayOrder?: number;
    isActive: boolean;
    updatedBy?: number;
    sla?: string | number;
    fees?: number;
    feesRequired?: boolean;
    isFeesRequired?: boolean;
    certificateType?: number;
    isCertificateRequired?: boolean;
    isSmsEnabled?: boolean;
    serviceCode?: string;
    govtServiceCode?: number;
  }
): Promise<RtsServiceApiItem> {
  const feesReq = payload.feesRequired ?? payload.isFeesRequired ?? false;
  const formattedPayload = {
    ...payload,
    feesRequired: feesReq,
    isFeesRequired: feesReq,
    sla: payload.sla != null ? String(payload.sla) : undefined,
  };
  const response = await apiClient.put<unknown>(`/RTSService/${id}`, formattedPayload);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to update RTS service");
  }
  return unwrapServiceItem<RtsServiceApiItem>(response.data);
}

export async function deleteRtsService(id: number): Promise<void> {
  const response = await apiClient.delete<unknown>(`/RTSService/${id}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to delete RTS service");
  }
}

export async function getRtsServiceById(id: number): Promise<RtsServiceApiItem> {
  const response = await apiClient.get<RtsServiceApiItem>(`/RTSService/${id}`, {
    cache: "no-store",
  }, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch RTS service ${id}`);
  }

  return response.data;
}

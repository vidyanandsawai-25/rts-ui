import "server-only";

import { apiClient } from "@/services/api.service";

export interface RtsServiceOfficerAllocationItem {
  id: number;
  serviceId: number;
  serviceName?: string;
  serviceNameLocal?: string | null;
  zoneId?: number | null;
  zoneName: string;
  zoneNameLocal?: string | null;
  officerName: string;
  officerNameLocal?: string | null;
  designation: string;
  designationLocal?: string | null;
  mobileNo: string;
  email?: string | null;
  officeAddress?: string | null;
  officeAddressLocal?: string | null;
  officerRole: string;
  displayOrder: number;
  isActive: boolean;
}

export interface CreateServiceOfficerPayload {
  serviceId: number;
  zoneId?: number;
  zoneName: string;
  zoneNameLocal?: string;
  officerName: string;
  officerNameLocal?: string;
  designation: string;
  designationLocal?: string;
  mobileNo: string;
  email?: string;
  officeAddress?: string;
  officeAddressLocal?: string;
  officerRole?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateServiceOfficerPayload {
  zoneId?: number;
  zoneName: string;
  zoneNameLocal?: string;
  officerName: string;
  officerNameLocal?: string;
  designation: string;
  designationLocal?: string;
  mobileNo: string;
  email?: string;
  officeAddress?: string;
  officeAddressLocal?: string;
  officerRole?: string;
  displayOrder?: number;
  isActive: boolean;
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  items?: T;
  data?: T;
}

function unwrapResponse<T>(data: unknown): T | null {
  if (data === null || data === undefined) return null;
  if (typeof data === "object" && data !== null && "items" in data) {
    return (data as ApiEnvelope<T>).items ?? null;
  }
  return data as T;
}

export async function getAllServiceOfficers(params?: {
  serviceId?: number;
  zoneId?: number;
}): Promise<RtsServiceOfficerAllocationItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.serviceId) searchParams.set("serviceId", String(params.serviceId));
  if (params?.zoneId) searchParams.set("zoneId", String(params.zoneId));

  const query = searchParams.toString();
  const url = `/rts-service-officers${query ? `?${query}` : ""}`;

  const response = await apiClient.get<unknown>(url, {
    cache: "no-store",
  });

  if (!response.success || !response.data) {
    return [];
  }

  const result = unwrapResponse<RtsServiceOfficerAllocationItem[]>(response.data);
  return Array.isArray(result) ? result : [];
}

export async function getServiceOfficersByService(
  serviceId: number
): Promise<RtsServiceOfficerAllocationItem[]> {
  const response = await apiClient.get<unknown>(
    `/rts-service-officers/by-service/${serviceId}`,
    { cache: "no-store" }
  );

  if (!response.success || !response.data) {
    return [];
  }

  const result = unwrapResponse<RtsServiceOfficerAllocationItem[]>(response.data);
  return Array.isArray(result) ? result : [];
}

export async function getServiceOfficerById(
  id: number
): Promise<RtsServiceOfficerAllocationItem | null> {
  const response = await apiClient.get<unknown>(
    `/rts-service-officers/${id}`,
    { cache: "no-store" }
  );

  if (!response.success || !response.data) {
    return null;
  }

  return unwrapResponse<RtsServiceOfficerAllocationItem>(response.data);
}

export async function createServiceOfficer(
  payload: CreateServiceOfficerPayload
): Promise<RtsServiceOfficerAllocationItem> {
  const response = await apiClient.post<unknown>(
    "/rts-service-officers",
    payload
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create service officer allocation");
  }

  const unwrapped = unwrapResponse<RtsServiceOfficerAllocationItem>(response.data);
  if (!unwrapped) {
    throw new Error("Invalid response from server when creating service officer");
  }
  return unwrapped;
}

export async function updateServiceOfficer(
  id: number,
  payload: UpdateServiceOfficerPayload
): Promise<RtsServiceOfficerAllocationItem> {
  const response = await apiClient.put<unknown>(
    `/rts-service-officers/${id}`,
    payload
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to update service officer allocation");
  }

  const unwrapped = unwrapResponse<RtsServiceOfficerAllocationItem>(response.data);
  if (!unwrapped) {
    throw new Error("Invalid response from server when updating service officer");
  }
  return unwrapped;
}

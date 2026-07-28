import "server-only";

import { apiClient } from "@/services/api.service";
import type { PagedResponse } from "@/types/common.types";
import type {
  RtsFieldDefinitionApiItem,
  RtsFieldDefinitionQueryParams,
} from "@/types/rts/field-definition.types";

function buildUrl(params: RtsFieldDefinitionQueryParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.DepartmentId !== undefined) searchParams.set("DepartmentId", String(params.DepartmentId));
  if (params.ServiceId !== undefined) searchParams.set("ServiceId", String(params.ServiceId));
  if (params.FieldCode) searchParams.set("FieldCode", params.FieldCode);
  // FieldName removed — use FieldCode for filtering
  if (params.PageNumber !== undefined) searchParams.set("PageNumber", String(params.PageNumber));
  if (params.PageSize !== undefined) searchParams.set("PageSize", String(params.PageSize));

  const query = searchParams.toString();
  return `/RTSFieldDefinition${query ? `?${query}` : ""}`;
}

export async function getRtsFieldDefinitions(
  params: RtsFieldDefinitionQueryParams = {}
): Promise<PagedResponse<RtsFieldDefinitionApiItem>> {
  const response = await apiClient.get<PagedResponse<RtsFieldDefinitionApiItem>>(buildUrl(params), {
    cache: "no-store",
  }, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch RTS field definitions");
  }

  return response.data;
}

export async function getRtsFieldDefinitionsPaged(
  params: RtsFieldDefinitionQueryParams = {}
): Promise<PagedResponse<RtsFieldDefinitionApiItem>> {
  return getRtsFieldDefinitions(params);
}

export async function getAllRtsFieldDefinitions(
  params: Omit<RtsFieldDefinitionQueryParams, "PageNumber" | "PageSize"> = {}
): Promise<RtsFieldDefinitionApiItem[]> {
  const response = await getRtsFieldDefinitions({
    ...params,
    PageNumber: 1,
    PageSize: -1,
  });

  return response.items;
}

export async function createRtsFieldDefinition(payload: {
  departmentId: number;
  serviceId: number;
  fieldCode: string;
  fieldLabel: string;
  fieldLabelLocal?: string;
  fieldType: string;
  fieldGroup?: string;
  isRequired: boolean;
  displayOrder?: number;
  validationRules?: string;
  defaultValue?: string;
  minValue?: number;
  maxValue?: number;
  maxLength?: number;
  optionsJson?: string;
  isActive: boolean;
  createdBy?: number;
}): Promise<RtsFieldDefinitionApiItem> {
  const response = await apiClient.post<RtsFieldDefinitionApiItem>("/RTSFieldDefinition", payload);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create RTS field definition");
  }
  return response.data;
}

export async function updateRtsFieldDefinition(
  id: number,
  payload: {
    id: number;
    departmentId: number;
    serviceId: number;
    fieldCode: string;
    fieldLabel: string;
    fieldLabelLocal?: string;
    fieldType: string;
    fieldGroup?: string;
    isRequired: boolean;
    displayOrder?: number;
    validationRules?: string;
    defaultValue?: string;
    minValue?: number;
    maxValue?: number;
    maxLength?: number;
    optionsJson?: string;
    isActive: boolean;
    updatedBy?: number;
  }
): Promise<RtsFieldDefinitionApiItem> {
  const response = await apiClient.put<RtsFieldDefinitionApiItem>(`/RTSFieldDefinition/${id}`, payload);
  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to update RTS field definition");
  }
  return response.data;
}

export async function deleteRtsFieldDefinition(id: number): Promise<void> {
  const response = await apiClient.delete<unknown>(`/RTSFieldDefinition/${id}`);
  if (!response.success) {
    throw new Error(response.error || "Failed to delete RTS field definition");
  }
}

export async function getRtsFieldDefinitionById(id: number): Promise<RtsFieldDefinitionApiItem> {
  const response = await apiClient.get<RtsFieldDefinitionApiItem>(`/RTSFieldDefinition/${id}`, {
    cache: "no-store",
  }, false);

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch RTS field definition ${id}`);
  }

  return response.data;
}

export async function getRtsFieldDefinitionsByServiceId(
  serviceId: number,
  departmentId?: number
): Promise<RtsFieldDefinitionApiItem[]> {
  try {
    return await getAllRtsFieldDefinitions({
      ServiceId: serviceId,
      ...(departmentId !== undefined ? { DepartmentId: departmentId } : {}),
    });
  } catch {
    throw new Error("Some Problem While Rendering the Form");
  }
}

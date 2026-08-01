import "server-only";

import { apiClient } from "@/services/api.service";
import type {
  RtsApplicationApiDetail,
} from "@/types/rts/rts-application.types";

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
export async function getRtsApplicationById(applicationId: number): Promise<RtsApplicationApiDetail> {
  const response = await apiClient.get<RtsApplicationApiDetail>(
    `/RTSApplication/${applicationId}`,
    { cache: "no-store" }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || `Failed to fetch RTS application ${applicationId}`);
  }

  return response.data;
}

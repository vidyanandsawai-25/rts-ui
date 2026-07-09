import "server-only";

import { apiClient } from "@/services/api.service";

export interface CreateRtsCitizenSessionPayload {
  isActive?: boolean;
  createdBy?: number;
  sessionId: string;
  citizenName: string;
  mobileNo: string;
  upic: string;
  propertyNo: string;
}

export interface RtsCitizenSessionApiItem {
  sessionId: string;
  citizenName: string;
  mobileNo: string;
  upic: string;
  propertyNo: string;
  loginTime: string;
  lastActivityTime: string | null;
  logoutTime: string | null;
  id: number;
  isActive: boolean;
  createdDate: string;
  updatedDate: string | null;
}

export interface CreateRtsCitizenSessionResponse {
  success: boolean;
  message: string;
  items: RtsCitizenSessionApiItem;
  errors: unknown;
  correlationId: string | null;
}

export async function createRtsCitizenSession(
  payload: CreateRtsCitizenSessionPayload
): Promise<CreateRtsCitizenSessionResponse> {
  const response = await apiClient.post<CreateRtsCitizenSessionResponse>(
    "/RTSCitizenSession",
    payload,
    { cache: "no-store" }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create RTS citizen session");
  }

  return response.data;
}

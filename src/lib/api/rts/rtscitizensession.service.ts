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
  ownerId?: number;
}

export interface RtsCitizenSessionApiItem {
  sessionId: string;
  citizenName: string;
  mobileNo: string;
  upic: string;
  propertyNo: string;
  ownerId?: number;
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

export async function validateRtsCitizenSession(
  sessionId: string
): Promise<{ success: boolean; message: string; session?: RtsCitizenSessionApiItem }> {
  try {
    const response = await apiClient.get<{ success: boolean; message: string; session?: RtsCitizenSessionApiItem }>(
      `/RTSCitizenSession/validate/${sessionId}`,
      { cache: "no-store" }
    );
    if (!response.success || !response.data) {
      return { success: false, message: response.error || "Failed to validate session" };
    }
    return response.data;
  } catch (err: any) {
    return { success: false, message: err.message || "Network error" };
  }
}

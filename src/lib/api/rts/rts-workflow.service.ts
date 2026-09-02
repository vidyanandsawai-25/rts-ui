import "server-only";

import { apiClient } from "@/services/api.service";
import type { PagedResponse } from "@/types/common.types";
import type {
  ApplicationWorkflowState,
  RtsApprovalFlowApiItem,
  RtsApprovalFlowStageApiItem,
  RtsApprovalFlowStagesByServiceApiResponse,
  RtsApprovalFlowStagesByServiceItem,
  SubmitWorkflowActionPayload,
} from "@/types/rts/workflow.types";

/**
 * Approval-flow configuration (one flow per RTS service, per ApprovalFlowMaster).
 * These endpoints are real and confirmed live against the backend swagger spec
 * (https://localhost:7293/swagger/v1/swagger.json) — note the controllers are
 * named `ApprovalFlowMaster`/`ApprovalFlowStageMaster`/`EmployeeType`, with no
 * "RTS" prefix, even though they back RTS.ApprovalFlowMaster etc.
 */

export async function getApprovalFlowByServiceId(
  serviceId: number
): Promise<RtsApprovalFlowApiItem | null> {
  const response = await apiClient.get<PagedResponse<RtsApprovalFlowApiItem>>(
    `/ApprovalFlowMaster?ServiceId=${serviceId}&PageNumber=1&PageSize=-1`,
    { cache: "no-store" },
    false
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch approval flow");
  }

  return response.data.items[0] ?? null;
}

export async function getApprovalFlowStages(
  approvalFlowId: number
): Promise<RtsApprovalFlowStageApiItem[]> {
  const response = await apiClient.get<PagedResponse<RtsApprovalFlowStageApiItem>>(
    `/ApprovalFlowStageMaster?ApprovalFlowId=${approvalFlowId}&PageNumber=1&PageSize=-1`,
    { cache: "no-store" },
    false
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch approval flow stages");
  }

  return [...response.data.items].sort((a, b) => a.stageOrder - b.stageOrder);
}

export interface SaveApprovalFlowStagePayload {
  approvalFlowId: number;
  stageOrder: number;
  stageName: string;
  employeeTypeId: number;
  slaDays: number;
  canVerifyDocument: boolean;
  canApprove: boolean;
  canReject: boolean;
  canReturn: boolean;
  canPay: boolean;
  isFinalStage: boolean;
}

export async function saveApprovalFlow(
  serviceId: number,
  approvalFlowName: string
): Promise<RtsApprovalFlowApiItem> {
  const response = await apiClient.post<RtsApprovalFlowApiItem>("/ApprovalFlowMaster", {
    isActive: true,
    serviceId,
    approvalFlowName,
  });

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create approval flow");
  }

  return response.data;
}

export async function saveApprovalFlowStage(
  payload: SaveApprovalFlowStagePayload
): Promise<RtsApprovalFlowStageApiItem> {
  const response = await apiClient.post<RtsApprovalFlowStageApiItem>(
    "/ApprovalFlowStageMaster",
    { isActive: true, ...payload }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to create approval flow stage");
  }

  return response.data;
}

export async function updateApprovalFlowStage(
  id: number,
  payload: SaveApprovalFlowStagePayload
): Promise<RtsApprovalFlowStageApiItem> {
  const response = await apiClient.put<RtsApprovalFlowStageApiItem>(
    `/ApprovalFlowStageMaster/${id}`,
    { id, isActive: true, ...payload }
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to update approval flow stage");
  }

  return response.data;
}

export async function deleteApprovalFlowStage(id: number): Promise<void> {
  const response = await apiClient.delete<unknown>(`/ApprovalFlowStageMaster/${id}`);

  if (!response.success) {
    throw new Error(response.error || "Failed to delete approval flow stage");
  }
}

/**
 * Per-application workflow state (current stage + permitted actions + history).
 * `applicationNo` (e.g. "RTS00000001") is used as the lookup key since it's the
 * only identifier surfaced consistently across the citizen and admin UIs.
 *
 * Neither this endpoint nor `/actions` below exist on the backend yet
 * (confirmed against the live swagger spec — only `POST /RTSApplication` is
 * implemented). No local mock data is used.
 */
export async function getApplicationWorkflow(
  applicationNo: string
): Promise<ApplicationWorkflowState> {
  const response = await apiClient.get<ApplicationWorkflowState>(
    `/RTSApplication/${encodeURIComponent(applicationNo)}/workflow`,
    { cache: "no-store" }
  );

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || "Failed to fetch application workflow state");
}

export async function submitApplicationWorkflowAction(
  applicationNo: string,
  payload: SubmitWorkflowActionPayload
): Promise<ApplicationWorkflowState> {
  const response = await apiClient.post<ApplicationWorkflowState>(
    `/RTSApplication/${encodeURIComponent(applicationNo)}/actions`,
    payload,
    { cache: "no-store" }
  );

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || "Failed to submit workflow action");
}

/** Retrieves a service workflow with its assigned officer details for each stage. */
export async function getApprovalFlowStagesByServiceId(
  serviceId: number
): Promise<RtsApprovalFlowStagesByServiceItem | null> {
  const response = await apiClient.get<RtsApprovalFlowStagesByServiceApiResponse>(
    `/ApprovalFlowMaster/stages/${encodeURIComponent(String(serviceId))}`,
    { cache: "no-store" },
    false
  );

  const payload = response.data?.data;
  if (!response.success || !payload) {
    throw new Error(response.error || "Failed to fetch approval flow stages for service");
  }

  return {
    ...payload,
    stages: [...(payload.stages ?? [])].sort((a, b) => a.stageOrder - b.stageOrder),
  };
}

import 'server-only';

import { apiClient } from '@/services/api.service';
import type { PagedResponse } from '@/types/common.types';
import type {
  ApplicationWorkflowState,
  RtsApprovalFlowApiItem,
  RtsApprovalFlowStageMasterApiItem,
  RtsStageUserAllocationApiItem,
  SubmitWorkflowActionPayload,
} from '@/types/rts/workflow.types';

type CrudResponse<T> = { success: boolean; message?: string; items?: T };

function requireCrudItem<T>(value: CrudResponse<T> | undefined, fallback: string): T {
  if (!value?.success || !value.items) throw new Error(value?.message || fallback);
  return value.items;
}

/**
 * Approval-flow configuration (one flow per RTS service, per RTSApprovalFlowMaster).
 * These endpoints are real and confirmed live against the backend swagger spec
 * (https://localhost:7293/swagger/v1/swagger.json) — note the controllers are
 * named `RTSApprovalFlowMaster`/`RTSApprovalFlowStageMaster`/`EmployeeType`.
 */

export async function getAllApprovalFlows(): Promise<RtsApprovalFlowApiItem[]> {
  const response = await apiClient.get<PagedResponse<RtsApprovalFlowApiItem>>(
    `/RTSApprovalFlowMaster?PageNumber=1&PageSize=-1`,
    { cache: 'no-store' },
    false
  );

  if (!response.success || !response.data) {
    return [];
  }

  return response.data.items ?? [];
}

export async function getApprovalFlowByServiceId(
  serviceId: number
): Promise<RtsApprovalFlowApiItem | null> {
  const response = await apiClient.get<PagedResponse<RtsApprovalFlowApiItem>>(
    `/RTSApprovalFlowMaster?ServiceId=${serviceId}&IsActive=true&PageNumber=1&PageSize=-1`,
    { cache: 'no-store' },
    false
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch approval flow');
  }

  return response.data.items[0] ?? null;
}

export async function getApprovalFlowById(id: number): Promise<RtsApprovalFlowApiItem | null> {
  const response = await apiClient.get<RtsApprovalFlowApiItem>(`/RTSApprovalFlowMaster/${id}`, {
    cache: 'no-store',
  });
  if (response.statusCode === 404) return null;
  if (!response.success || !response.data)
    throw new Error(response.error || 'Failed to fetch approval flow');
  return response.data;
}

export async function getApprovalFlowStages(
  approvalFlowId: number
): Promise<RtsApprovalFlowStageMasterApiItem[]> {
  const response = await apiClient.get<PagedResponse<RtsApprovalFlowStageMasterApiItem>>(
    `/RTSApprovalFlowStageMaster?ApprovalFlowId=${approvalFlowId}&PageNumber=1&PageSize=-1&SortBy=StageOrder&SortOrder=asc`,
    { cache: 'no-store' },
    false
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch approval flow stages');
  }

  return [...response.data.items].sort((a, b) => a.stageOrder - b.stageOrder);
}

export interface SaveApprovalFlowStagePayload {
  approvalFlowId: number;
  stageOrder: number;
  stageName: string;
  slaDays: number;
  canVerifyDocument: boolean;
  canEdit: boolean;
  canViewNoteSheet: boolean;
  canIssueCertificate: boolean;
  canViewCertificate: boolean;
  canApprove: boolean;
  canReject: boolean;
  canReturn: boolean;
  canPay: boolean;
  isFinalStage: boolean;
}

export async function saveApprovalFlow(
  serviceId: number,
  approvalFlowName: string,
  isActive = true
): Promise<RtsApprovalFlowApiItem> {
  const response = await apiClient.post<CrudResponse<RtsApprovalFlowApiItem>>(
    '/RTSApprovalFlowMaster',
    {
      isActive,
      serviceId,
      approvalFlowName,
    }
  );
  if (!response.success) throw new Error(response.error || 'Failed to create approval flow');
  return requireCrudItem(response.data, 'Failed to create approval flow');
}

export async function updateApprovalFlow(
  id: number,
  serviceId: number,
  approvalFlowName: string,
  isActive: boolean
): Promise<RtsApprovalFlowApiItem> {
  const response = await apiClient.put<CrudResponse<RtsApprovalFlowApiItem>>(
    `/RTSApprovalFlowMaster/${id}`,
    { serviceId, approvalFlowName, isActive }
  );
  if (!response.success) throw new Error(response.error || 'Failed to update approval flow');
  return requireCrudItem(response.data, 'Failed to update approval flow');
}

export async function saveApprovalFlowStage(
  payload: SaveApprovalFlowStagePayload
): Promise<RtsApprovalFlowStageMasterApiItem> {
  const response = await apiClient.post<CrudResponse<RtsApprovalFlowStageMasterApiItem>>(
    '/RTSApprovalFlowStageMaster',
    { isActive: true, ...payload }
  );

  if (!response.success) throw new Error(response.error || 'Failed to create approval flow stage');
  return requireCrudItem(response.data, 'Failed to create approval flow stage');
}

export async function updateApprovalFlowStage(
  id: number,
  payload: SaveApprovalFlowStagePayload
): Promise<RtsApprovalFlowStageMasterApiItem> {
  const response = await apiClient.put<CrudResponse<RtsApprovalFlowStageMasterApiItem>>(
    `/RTSApprovalFlowStageMaster/${id}`,
    { id, isActive: true, ...payload }
  );

  if (!response.success) throw new Error(response.error || 'Failed to update approval flow stage');
  return requireCrudItem(response.data, 'Failed to update approval flow stage');
}

export async function deleteApprovalFlowStage(id: number): Promise<void> {
  const response = await apiClient.delete<CrudResponse<unknown>>(
    `/RTSApprovalFlowStageMaster/${id}`
  );
  if (!response.success || response.data?.success === false)
    throw new Error(
      response.error || response.data?.message || 'Failed to delete approval flow stage'
    );
}

export async function getStageUserAllocations(
  approvalFlowStageId: number
): Promise<RtsStageUserAllocationApiItem[]> {
  const response = await apiClient.get<PagedResponse<RtsStageUserAllocationApiItem>>(
    `/RTSApprovalFlowStageUserAllocationMaster?ApprovalFlowStageId=${approvalFlowStageId}&PageNumber=1&PageSize=-1&SortBy=Priority&SortOrder=asc`,
    { cache: 'no-store' }
  );
  if (!response.success || !response.data)
    throw new Error(response.error || 'Failed to load stage officers');
  return response.data.items ?? [];
}

export interface SaveStageUserAllocationPayload {
  approvalFlowStageId: number;
  userId: number;
  priority: number;
  isActive: boolean;
}

export async function createStageUserAllocation(
  payload: SaveStageUserAllocationPayload
): Promise<RtsStageUserAllocationApiItem> {
  const response = await apiClient.post<CrudResponse<RtsStageUserAllocationApiItem>>(
    '/RTSApprovalFlowStageUserAllocationMaster',
    payload
  );
  if (!response.success) throw new Error(response.error || 'Failed to add stage officer');
  return requireCrudItem(response.data, 'Failed to add stage officer');
}

export async function updateStageUserAllocation(
  id: number,
  payload: SaveStageUserAllocationPayload
): Promise<RtsStageUserAllocationApiItem> {
  const response = await apiClient.put<CrudResponse<RtsStageUserAllocationApiItem>>(
    `/RTSApprovalFlowStageUserAllocationMaster/${id}`,
    payload
  );
  if (!response.success) throw new Error(response.error || 'Failed to update stage officer');
  return requireCrudItem(response.data, 'Failed to update stage officer');
}

export async function deleteStageUserAllocation(id: number): Promise<void> {
  const response = await apiClient.delete<CrudResponse<unknown>>(
    `/RTSApprovalFlowStageUserAllocationMaster/${id}`
  );
  if (!response.success || response.data?.success === false)
    throw new Error(response.error || response.data?.message || 'Failed to remove stage officer');
}

export async function deleteApprovalFlow(id: number): Promise<void> {
  const response = await apiClient.delete<CrudResponse<unknown>>(`/RTSApprovalFlowMaster/${id}`);
  if (!response.success || response.data?.success === false)
    throw new Error(response.error || response.data?.message || 'Failed to delete approval flow');
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
    { cache: 'no-store' }
  );

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || 'Failed to fetch application workflow state');
}

export async function submitApplicationWorkflowAction(
  applicationNo: string,
  payload: SubmitWorkflowActionPayload
): Promise<ApplicationWorkflowState> {
  const response = await apiClient.post<ApplicationWorkflowState>(
    `/RTSApplication/${encodeURIComponent(applicationNo)}/actions`,
    payload,
    { cache: 'no-store' }
  );

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || 'Failed to submit workflow action');
}

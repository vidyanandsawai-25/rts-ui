"use server";

import { getAllRtsServices } from "@/lib/api/rts/rtsservices.service";
import { getAllEmployeeTypes } from "@/lib/api/employee-type.service";
import {
  getApprovalFlowByServiceId,
  getApprovalFlowStages,
  saveApprovalFlow,
  saveApprovalFlowStage,
  updateApprovalFlowStage,
  deleteApprovalFlowStage,
  type SaveApprovalFlowStagePayload,
} from "@/lib/api/rts/rts-workflow.service";
import type { RtsServiceApiItem } from "@/types/rts/service.types";
import type { EmployeeTypeApiItem } from "@/types/employee-type.types";
import type {
  RtsApprovalFlowApiItem,
  RtsApprovalFlowStageApiItem,
} from "@/types/rts/workflow.types";

export interface RtsWorkflowMastersData {
  services: RtsServiceApiItem[];
  employeeTypes: EmployeeTypeApiItem[];
}

export async function getRtsWorkflowMastersAction(): Promise<RtsWorkflowMastersData> {
  const [services, employeeTypes] = await Promise.all([
    getAllRtsServices().catch((error) => {
      console.error("Failed to fetch RTS services:", error);
      return [];
    }),
    getAllEmployeeTypes().catch((error) => {
      console.error("Failed to fetch employee types:", error);
      return [];
    }),
  ]);

  return { services, employeeTypes };
}

export interface ServiceWorkflowData {
  flow: RtsApprovalFlowApiItem | null;
  stages: RtsApprovalFlowStageApiItem[];
}

export async function getServiceWorkflowAction(serviceId: number): Promise<ServiceWorkflowData> {
  try {
    const flow = await getApprovalFlowByServiceId(serviceId);
    if (!flow) return { flow: null, stages: [] };

    const stages = await getApprovalFlowStages(flow.id);
    return { flow, stages };
  } catch (error) {
    console.error(`Failed to fetch workflow for service ${serviceId}:`, error);
    return { flow: null, stages: [] };
  }
}

export async function createApprovalFlowAction(
  serviceId: number,
  approvalFlowName: string
): Promise<{ success: boolean; flow?: RtsApprovalFlowApiItem; message?: string }> {
  try {
    const flow = await saveApprovalFlow(serviceId, approvalFlowName);
    return { success: true, flow };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create approval flow",
    };
  }
}

export async function saveWorkflowStageAction(
  payload: SaveApprovalFlowStagePayload
): Promise<{ success: boolean; stage?: RtsApprovalFlowStageApiItem; message?: string }> {
  try {
    const stage = await saveApprovalFlowStage(payload);
    return { success: true, stage };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save workflow stage",
    };
  }
}

export async function updateWorkflowStageAction(
  id: number,
  payload: SaveApprovalFlowStagePayload
): Promise<{ success: boolean; stage?: RtsApprovalFlowStageApiItem; message?: string }> {
  try {
    const stage = await updateApprovalFlowStage(id, payload);
    return { success: true, stage };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update workflow stage",
    };
  }
}

export async function deleteWorkflowStageAction(
  id: number
): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteApprovalFlowStage(id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete workflow stage",
    };
  }
}

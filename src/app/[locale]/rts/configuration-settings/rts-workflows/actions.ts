"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { getAllRtsDepartments } from "@/lib/api/rts/rtsdepartment.service";
import { getAllRtsServices } from "@/lib/api/rts/rtsservices.service";
import {
  getAllApprovalFlows,
  getApprovalFlowStagesByServiceId,
  saveApprovalFlow,
  saveApprovalFlowStage,
  deleteApprovalFlow,
} from "@/lib/api/rts/rts-workflow.service";

export type WorkflowConfigItem = {
  id: number;
  serviceId: number;
  flowName: string;
  isActive: boolean;
  stagesCount?: number;
};

export type WorkflowDepartmentOption = {
  id: string;
  name: string;
  nameLocal: string | null;
};

export type WorkflowServiceOption = {
  id: string;
  name: string;
  nameLocal: string | null;
  departmentId: string;
};

export type WorkflowStageItem = {
  id?: number;
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
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

function revalidateWorkflowPages() {
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts/configuration-settings/rts-workflows`, "page");
  }
}

export async function getRtsWorkflowsDataAction() {
  const [departmentsRes, servicesRes, flowsRes] = await Promise.all([
    getAllRtsDepartments().catch(() => []),
    getAllRtsServices().catch(() => []),
    getAllApprovalFlows().catch(() => []),
  ]);

  const departments: WorkflowDepartmentOption[] = departmentsRes.map((d) => ({
    id: String(d.id),
    name: d.departmentName,
    nameLocal: d.departmentNameLocal ?? null,
  }));

  const services: WorkflowServiceOption[] = servicesRes.map((s) => ({
    id: String(s.id),
    name: s.serviceName,
    nameLocal: s.serviceNameLocal ?? null,
    departmentId: String(s.departmentId),
  }));

  const workflows: WorkflowConfigItem[] = flowsRes.map((f) => ({
    id: f.id,
    serviceId: f.serviceId,
    flowName: f.approvalFlowName,
    isActive: f.isActive,
    stagesCount: undefined,
  }));

  return {
    departments,
    services,
    workflows,
  };
}

export async function getWorkflowStagesByServiceIdAction(serviceId: number): Promise<WorkflowStageItem[]> {
  try {
    const flowData = await getApprovalFlowStagesByServiceId(serviceId);
    if (!flowData || !flowData.stages) return [];

    return flowData.stages.map((s) => ({
      id: s.id,
      stageOrder: s.stageOrder,
      stageName: s.stageName,
      employeeTypeId: s.employeeTypeId ?? 0,
      slaDays: s.slaDays ?? 2,
      canVerifyDocument: Boolean(s.canVerifyDocument),
      canApprove: Boolean(s.canApprove),
      canReject: Boolean(s.canReject),
      canReturn: Boolean(s.canReturn),
      canPay: Boolean(s.canPay),
      isFinalStage: Boolean(s.isFinalStage),
      userName: s.userName,
      firstName: s.firstName,
      lastName: s.lastName,
    }));
  } catch {
    return [];
  }
}

export async function saveWorkflowWithStagesAction(data: {
  serviceId: number;
  flowName: string;
  stages: WorkflowStageItem[];
}) {
  try {
    const createdFlow = await saveApprovalFlow(data.serviceId, data.flowName);

    for (const stage of data.stages) {
      await saveApprovalFlowStage({
        approvalFlowId: createdFlow.id,
        stageOrder: stage.stageOrder,
        stageName: stage.stageName,
        employeeTypeId: stage.employeeTypeId || 1,
        slaDays: stage.slaDays || 2,
        canVerifyDocument: stage.canVerifyDocument,
        canApprove: stage.canApprove,
        canReject: stage.canReject,
        canReturn: stage.canReturn,
        canPay: stage.canPay,
        isFinalStage: stage.isFinalStage,
      });
    }

    revalidateWorkflowPages();
    return {
      success: true,
      workflow: {
        id: createdFlow.id,
        serviceId: createdFlow.serviceId,
        flowName: createdFlow.approvalFlowName,
        isActive: createdFlow.isActive,
        stagesCount: data.stages.length,
      } as WorkflowConfigItem,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save workflow",
    };
  }
}

export async function deleteWorkflowAction(id: number) {
  try {
    await deleteApprovalFlow(id);
    revalidateWorkflowPages();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete workflow",
    };
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { locales } from '@/i18n/config';
import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import {
  getWorkflowRtsUsers,
  RTS_WORKFLOW_USERS_DEPARTMENT_ID,
} from '@/lib/api/rts/rtsusers.service';
import {
  createStageUserAllocation,
  deleteStageUserAllocation,
  deleteApprovalFlowStage,
  getAllApprovalFlows,
  getApprovalFlowById,
  getApprovalFlowStages,
  getStageUserAllocations,
  saveApprovalFlow,
  saveApprovalFlowStage,
  updateApprovalFlow,
  updateApprovalFlowStage,
  updateStageUserAllocation,
} from '@/lib/api/rts/rts-workflow.service';
import type { RtsUserLookupItem, RtsUserLookupQueryParams } from '@/types/rts/rts-users.types';

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
  canUploadDocument?: boolean;
  isFinalStage: boolean;
  userAllocationCount?: number;
};

export type WorkflowStageUserAllocationItem = {
  id?: number;
  userId: number;
  priority: number;
  isActive: boolean;
  fullName?: string;
  userName?: string;
};

export type WorkflowStageAllocationEditorData = {
  workflowId: number;
  workflowIsActive: boolean;
  serviceId: number;
  stageId: number;
  stageOrder: number;
  stageName: string;
  allocations: WorkflowStageUserAllocationItem[];
};

export type WorkflowUserOption = { id: number; name: string; userName: string };

export type WorkflowUserSearchField =
  | 'UserId'
  | 'UserName'
  | 'FirstName'
  | 'MiddleName'
  | 'LastName'
  | 'MobileNo';

function toWorkflowUser(item: RtsUserLookupItem): WorkflowUserOption {
  return {
    id: item.id,
    name:
      [item.firstName, item.middleName, item.lastName].filter(Boolean).join(' ') || item.userName,
    userName: item.userName,
  };
}

function revalidateWorkflowPages() {
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts/configuration-settings/rts-workflows`, 'page');
  }
}

async function requireWorkflowStage(workflowId: number, stageId: number) {
  if (!Number.isSafeInteger(workflowId) || workflowId <= 0) {
    throw new Error('Approval workflow was not found.');
  }
  if (!Number.isSafeInteger(stageId) || stageId <= 0) {
    throw new Error('Approval stage was not found.');
  }

  const [flow, stages] = await Promise.all([
    getApprovalFlowById(workflowId),
    getApprovalFlowStages(workflowId),
  ]);
  if (!flow) throw new Error('Approval workflow was not found.');
  const stage = stages.find((item) => item.id === stageId);
  if (!stage) throw new Error('The selected stage does not belong to this workflow.');
  return { flow, stage, stages };
}

async function getStagesWithoutActiveAllocation(workflowId: number) {
  const stages = await getApprovalFlowStages(workflowId);
  const allocations = await Promise.all(stages.map((stage) => getStageUserAllocations(stage.id)));
  return stages.filter(
    (_, index) =>
      !allocations[index].some(
        (allocation) =>
          allocation.isActive && typeof allocation.userId === 'number' && allocation.userId > 0
      )
  );
}

export async function getRtsWorkflowsDataAction() {
  const [departmentsRes, servicesRes, flowsRes] = await Promise.all([
    getAllRtsDepartments().catch(() => []),
    getAllRtsServices().catch(() => []),
    getAllApprovalFlows().catch(() => []),
  ]);

  const departments: WorkflowDepartmentOption[] = departmentsRes.map((department) => ({
    id: String(department.id),
    name: department.departmentName,
    nameLocal: department.departmentNameLocal ?? null,
  }));

  const services: WorkflowServiceOption[] = servicesRes.map((service) => ({
    id: String(service.id),
    name: service.serviceName,
    nameLocal: service.serviceNameLocal ?? null,
    departmentId: String(service.departmentId),
  }));

  const workflows: WorkflowConfigItem[] = flowsRes.map((flow) => ({
    id: flow.id,
    serviceId: flow.serviceId,
    flowName: flow.approvalFlowName,
    isActive: flow.isActive,
    stagesCount: undefined,
  }));

  return { departments, services, workflows };
}

export async function getWorkflowStagesByApprovalFlowIdAction(
  approvalFlowId: number
): Promise<WorkflowStageItem[]> {
  const [flow, stages] = await Promise.all([
    getApprovalFlowById(approvalFlowId),
    getApprovalFlowStages(approvalFlowId),
  ]);
  if (!flow) throw new Error('Approval workflow was not found.');

  return stages.map((stage) => ({
    id: stage.id,
    stageOrder: stage.stageOrder,
    stageName: stage.stageName,
    slaDays: stage.slaDays ?? 2,
    canVerifyDocument: Boolean(stage.canVerifyDocument),
    canEdit: Boolean(stage.canEdit),
    canViewNoteSheet: Boolean(stage.canViewNoteSheet),
    canIssueCertificate: Boolean(stage.canIssueCertificate),
    canViewCertificate: Boolean(stage.canViewCertificate),
    canApprove: Boolean(stage.canApprove),
    canReject: Boolean(stage.canReject),
    canReturn: Boolean(stage.canReturn),
    canPay: Boolean(stage.canPay),
    isFinalStage: Boolean(stage.isFinalStage),
    userAllocationCount: stage.userAllocationCount ?? 0,
  }));
}

export async function getWorkflowStageAllocationsAction(
  workflowId: number,
  stageId: number
): Promise<WorkflowStageAllocationEditorData> {
  const { flow, stage } = await requireWorkflowStage(workflowId, stageId);
  const storedAllocations = await getStageUserAllocations(stageId);

  const invalidAllocation = storedAllocations.find(
    (allocation) =>
      typeof allocation.userId !== 'number' ||
      allocation.userId <= 0 ||
      typeof allocation.priority !== 'number' ||
      allocation.priority <= 0
  );
  if (invalidAllocation) {
    throw new Error(`Stage allocation #${invalidAllocation.id} contains incomplete data.`);
  }

  return {
    workflowId: flow.id,
    workflowIsActive: flow.isActive,
    serviceId: flow.serviceId,
    stageId: stage.id,
    stageOrder: stage.stageOrder,
    stageName: stage.stageName,
    allocations: storedAllocations
      .map((allocation) => ({
        id: allocation.id,
        userId: allocation.userId!,
        priority: allocation.priority!,
        isActive: allocation.isActive,
        fullName:
          [allocation.firstName, allocation.middleName, allocation.lastName]
            .filter(Boolean)
            .join(' ') ||
          allocation.userName ||
          undefined,
        userName: allocation.userName ?? undefined,
      }))
      .sort((left, right) => left.priority - right.priority),
  };
}

export async function searchWorkflowUsersAction(
  searchTerm: string,
  searchField: WorkflowUserSearchField = 'UserName'
): Promise<WorkflowUserOption[]> {
  const term = searchTerm.trim();
  if (term.length < 2 && !/^\d+$/.test(term)) return [];
  const query: Omit<RtsUserLookupQueryParams, 'DepartmentId'> = {
    IsActive: true,
    PageNumber: 1,
    PageSize: 20,
  };
  if (searchField === 'UserId') {
    const userId = Number(term);
    if (!Number.isSafeInteger(userId) || userId <= 0) return [];
    query.UserId = userId;
  } else {
    query[searchField] = term;
  }
  const result = await getWorkflowRtsUsers(query);
  return result.items.map(toWorkflowUser);
}

export async function saveWorkflowStageAllocationsAction(data: {
  workflowId: number;
  stageId: number;
  allocations: WorkflowStageUserAllocationItem[];
}) {
  let startedWriting = false;
  try {
    const { flow } = await requireWorkflowStage(data.workflowId, data.stageId);
    const ordered = [...data.allocations]
      .sort((left, right) => left.priority - right.priority)
      .map((allocation, index) => ({ ...allocation, priority: index + 1 }));
    const userIds = new Set<number>();

    for (const allocation of ordered) {
      if (!Number.isSafeInteger(allocation.userId) || allocation.userId <= 0) {
        throw new Error('Choose a valid user for every stage allocation.');
      }
      if (userIds.has(allocation.userId)) {
        throw new Error('The same user cannot be assigned to a stage more than once.');
      }
      userIds.add(allocation.userId);
    }
    if (flow.isActive && !ordered.some((allocation) => allocation.isActive)) {
      throw new Error('An active workflow stage must have at least one active user.');
    }

    await Promise.all(
      Array.from(userIds).map(async (userId) => {
        const result = await getWorkflowRtsUsers({
          UserId: userId,
          IsActive: true,
          PageNumber: 1,
          PageSize: 1,
        });
        if (!result.items.some((item) => item.id === userId)) {
          throw new Error(
            `User #${userId} is inactive or not assigned to department ${RTS_WORKFLOW_USERS_DEPARTMENT_ID}.`
          );
        }
      })
    );

    const existing = await getStageUserAllocations(data.stageId);
    const existingIds = new Set(existing.map((allocation) => allocation.id));
    for (const allocation of ordered) {
      if (allocation.id && !existingIds.has(allocation.id)) {
        throw new Error('A stage allocation changed. Reload and try again.');
      }
    }

    startedWriting = true;
    for (const allocation of ordered) {
      const payload = {
        approvalFlowStageId: data.stageId,
        userId: allocation.userId,
        priority: allocation.priority,
        isActive: allocation.isActive,
      };
      if (allocation.id) await updateStageUserAllocation(allocation.id, payload);
      else await createStageUserAllocation(payload);
    }

    const retainedIds = new Set(ordered.map((allocation) => allocation.id));
    for (const allocation of existing) {
      if (!retainedIds.has(allocation.id)) await deleteStageUserAllocation(allocation.id);
    }

    revalidateWorkflowPages();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: `${error instanceof Error ? error.message : 'Failed to save stage users.'}${
        startedWriting ? ' Some changes may have saved. Reopen the stage before retrying.' : ''
      }`,
    };
  }
}

export async function saveWorkflowWithStagesAction(data: {
  workflowId?: number;
  serviceId: number;
  flowName: string;
  isActive: boolean;
  stages: WorkflowStageItem[];
}) {
  let startedWriting = false;
  try {
    if (!Number.isSafeInteger(data.serviceId) || data.serviceId <= 0 || !data.flowName.trim()) {
      throw new Error('Choose a service and enter a workflow name.');
    }
    if (!data.stages.length) throw new Error('Add at least one approval stage.');

    for (const [index, stage] of data.stages.entries()) {
      if (!stage.stageName.trim()) throw new Error(`Enter a name for stage ${index + 1}.`);
      if (!Number.isSafeInteger(stage.slaDays) || stage.slaDays < 1) {
        throw new Error(`Enter a valid SLA for stage ${index + 1}.`);
      }
    }

    const existingFlow = data.workflowId ? await getApprovalFlowById(data.workflowId) : null;
    if (data.workflowId && !existingFlow) throw new Error('Approval workflow was not found.');
    if (existingFlow && existingFlow.serviceId !== data.serviceId) {
      throw new Error('An existing workflow cannot be moved to another service.');
    }
    const existingStages = existingFlow ? await getApprovalFlowStages(existingFlow.id) : [];
    const existingById = new Map(existingStages.map((stage) => [stage.id, stage]));
    for (const stage of data.stages) {
      if (stage.id && !existingById.has(stage.id)) {
        throw new Error('A stage no longer belongs to this workflow. Reload and try again.');
      }
    }
    const retainedStageIds = new Set(data.stages.map((stage) => stage.id));
    const removedStages = existingStages.filter((stage) => !retainedStageIds.has(stage.id));

    if (data.isActive) {
      if (!existingFlow || data.stages.some((stage) => !stage.id)) {
        throw new Error('Save new workflow stages as inactive before assigning their users.');
      }
      for (const stage of data.stages) {
        const allocations = await getStageUserAllocations(stage.id!);
        if (!allocations.some((allocation) => allocation.isActive)) {
          throw new Error(
            `Add an active user to stage ${stage.stageOrder} before activating this workflow.`
          );
        }
      }
    }

    startedWriting = true;
    for (const stage of removedStages) {
      const allocations = await getStageUserAllocations(stage.id);
      for (const allocation of allocations) {
        if (allocation.id) await deleteStageUserAllocation(allocation.id);
      }
      await deleteApprovalFlowStage(stage.id);
    }

    const flow = existingFlow
      ? await updateApprovalFlow(
          existingFlow.id,
          data.serviceId,
          data.flowName.trim(),
          data.isActive
        )
      : await saveApprovalFlow(data.serviceId, data.flowName.trim(), data.isActive);

    for (const stage of data.stages) {
      const payload = {
        approvalFlowId: flow.id,
        stageOrder: stage.stageOrder,
        stageName: stage.stageName.trim(),
        slaDays: stage.slaDays,
        canVerifyDocument: stage.canVerifyDocument,
        canEdit: stage.canEdit,
        canViewNoteSheet: stage.canViewNoteSheet,
        canIssueCertificate: stage.canIssueCertificate,
        canViewCertificate: stage.canViewCertificate,
        canApprove: stage.canApprove,
        canReject: stage.canReject,
        canReturn: stage.canReturn,
        canPay: stage.canPay,
        canUploadDocument: Boolean(stage.canUploadDocument),
        isFinalStage: stage.isFinalStage,
      };
      if (stage.id) await updateApprovalFlowStage(stage.id, payload);
      else await saveApprovalFlowStage(payload);
    }

    revalidateWorkflowPages();
    return {
      success: true,
      workflow: {
        id: flow.id,
        serviceId: flow.serviceId,
        flowName: flow.approvalFlowName,
        isActive: flow.isActive,
        stagesCount: data.stages.length,
      } as WorkflowConfigItem,
    };
  } catch (error) {
    return {
      success: false,
      error: `${error instanceof Error ? error.message : 'Failed to save workflow'}${
        startedWriting ? ' Some changes may have saved. Reopen the workflow before retrying.' : ''
      }`,
    };
  }
}

export async function setWorkflowActiveAction(id: number, isActive: boolean) {
  try {
    const flow = await getApprovalFlowById(id);
    if (!flow) throw new Error('Approval workflow was not found.');
    if (isActive) {
      const stages = await getApprovalFlowStages(id);
      if (!stages.length)
        throw new Error('Add at least one approval stage before activating this workflow.');
      const missing = await getStagesWithoutActiveAllocation(id);
      if (missing.length) {
        throw new Error(
          `Add an active user to stage ${missing[0].stageOrder} before activating this workflow.`
        );
      }
    }
    const updated = await updateApprovalFlow(id, flow.serviceId, flow.approvalFlowName, isActive);
    revalidateWorkflowPages();
    return { success: true, isActive: updated.isActive };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change workflow status',
    };
  }
}

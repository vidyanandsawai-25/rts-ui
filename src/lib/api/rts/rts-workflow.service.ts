import "server-only";
import { apiClient } from "@/services/api.service";

export type WorkflowStage = {
  id: number;
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
};

export type WorkflowDetails = {
  flowName: string;
  stages: WorkflowStage[];
};

export async function getRtsWorkflowStages(serviceId: number): Promise<WorkflowDetails | null> {
  const response = await apiClient.get<{ flowName: string; stages: WorkflowStage[] }>(
    `/ApprovalFlowMaster/stages/${serviceId}`,
    { cache: "no-store" },
    false
  );

  if (!response.success || !response.data) {
    return null;
  }

  return response.data;
}

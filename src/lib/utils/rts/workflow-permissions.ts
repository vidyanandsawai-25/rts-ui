import type {
  RtsApplicationPaymentStatus,
  RtsApprovalFlowStageApiItem,
  WorkflowActionType,
} from "@/types/rts/workflow.types";

/**
 * Which workflow actions the given user may take on the application's current stage.
 *
 * Eligibility is purely by EmployeeType — RTS.Users has no DepartmentId, so any
 * active user whose EmployeeType matches the stage's EmployeeTypeId may act on it
 * (queue model, not per-department assignment).
 */
export function resolveAvailableActions(
  stage: RtsApprovalFlowStageApiItem | null,
  paymentStatus: RtsApplicationPaymentStatus,
  userEmployeeTypeId: number | null | undefined
): WorkflowActionType[] {
  if (!stage) return [];
  if (userEmployeeTypeId == null || userEmployeeTypeId !== stage.employeeTypeId) return [];

  const actions: WorkflowActionType[] = [];

  if (stage.canVerifyDocument) actions.push("verifyDocument");

  const paymentOutstanding = stage.canPay && paymentStatus !== "Paid";
  if (paymentOutstanding) actions.push("pay");

  // Approve is withheld until any required payment for this stage is recorded.
  if (stage.canApprove && !paymentOutstanding) actions.push("approve");
  if (stage.canReject) actions.push("reject");
  if (stage.canReturn) actions.push("return");

  return actions;
}

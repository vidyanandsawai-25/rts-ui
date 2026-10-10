import type {
  RtsApplicationPaymentStatus,
  RtsApprovalFlowStageApiItem,
  WorkflowActionType,
} from '@/types/rts/workflow.types';

/**
 * Which workflow actions the given user may take on the application's current stage.
 *
 * Eligibility is by the user explicitly assigned to the approval stage.
 */
export function resolveAvailableActions(
  stage: RtsApprovalFlowStageApiItem | null,
  paymentStatus: RtsApplicationPaymentStatus,
  userId: number | null | undefined
): WorkflowActionType[] {
  if (!stage) return [];
  if (userId == null || userId !== stage.userId) return [];

  const actions: WorkflowActionType[] = [];

  if (stage.canVerifyDocument) actions.push('verifyDocument');

  const paymentOutstanding = stage.canPay && paymentStatus !== 'Paid';
  if (paymentOutstanding) actions.push('pay');

  // Approve is withheld until any required payment for this stage is recorded.
  if (stage.canApprove && !paymentOutstanding) actions.push('approve');
  if (stage.canReject) actions.push('reject');
  if (stage.canReturn) actions.push('return');

  return actions;
}

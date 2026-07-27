// RTS approval-workflow types.
// Backed by RTS.ApprovalFlowMaster / RTS.ApprovalFlowStageMaster / RTS.TrackApplicationHistory.

export interface RtsApprovalFlowApiItem {
  id: number;
  serviceId: number;
  approvalFlowName: string;
  isActive: boolean;
  createdBy?: number;
  createdDate: string;
  updatedBy?: number | null;
  updatedDate: string | null;
}

export interface RtsApprovalFlowStageApiItem {
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
  isActive?: boolean;
}

export type WorkflowActionType =
  | "verifyDocument"
  | "approve"
  | "reject"
  | "return"
  | "pay";

export type TrackHistoryActionType =
  | "Submitted"
  | "VerifyDocument"
  | "Approve"
  | "Reject"
  | "Return"
  | "PaymentRecorded";

export interface TrackHistoryEntry {
  id: number;
  applicationId: number;
  fromStageId: number | null;
  fromStageName: string | null;
  toStageId: number | null;
  toStageName: string | null;
  actionType: TrackHistoryActionType;
  performedByUserId: number | null;
  performedByUserName: string | null;
  remark: string | null;
  actionDate: string;
}

export type RtsApplicationPaymentStatus = "NotRequired" | "Pending" | "Paid";

export type RtsApplicationOverallStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "returned";

/**
 * Resolved workflow state for a single application, as returned by
 * GET /RTSApplication/{applicationNo}/workflow (backend endpoint — spec only).
 */
export interface ApplicationWorkflowState {
  applicationId: number;
  applicationNo: string;
  departmentId: number;
  serviceId: number;
  applicationStatus: RtsApplicationOverallStatus;
  paymentStatus: RtsApplicationPaymentStatus;

  currentStage: RtsApprovalFlowStageApiItem | null;
  /** Null once the application reaches a terminal state (approved/rejected). */
  stageEnteredAt: string | null;

  /** Actions the *calling* user is allowed to take right now (server-computed). */
  availableActions: WorkflowActionType[];

  history: TrackHistoryEntry[];
}

export interface SubmitWorkflowActionPayload {
  actionType: WorkflowActionType;
  remark: string;
  /** Required only when actionType === 'pay'. */
  paymentRef?: string;
}

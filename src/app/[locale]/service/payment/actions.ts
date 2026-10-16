'use server';

import {
  createPaymentOrder,
  verifyPayment,
  recordOfflinePayment,
  getPaymentReceipt,
  getPaymentReceiptByNo,
  getPaymentStatus,
  createPaymentDemand,
  initializePendingPayment,
  getPendingClearancePayments,
  getClearanceStats,
  approveClearance,
  disapproveClearance,
  cancelReceipt,
  uploadBulkClearance,
  getBanks,
  getCancellationLogs,
  type CreatePaymentOrderPayload,
  type PaymentOrderResult,
  type VerifyPaymentPayload,
  type VerifyPaymentResult,
  type RecordOfflinePaymentPayload,
  type PaymentReceiptResult,
  type PaymentStatusResult,
  type CreatePaymentDemandPayload,
  type PaymentDemandResult,
  type PendingClearanceQuery,
  type PendingClearanceItem,
  type PendingClearanceStats,
  type ApprovePaymentPayload,
  type DisapprovePaymentPayload,
  type CancelReceiptPayload,
  type BulkClearanceResponse,
  type PagedItemsResult,
  type RTSBankLookup,
  type ReceiptCancellationLog,
} from "@/lib/api/rts/rtspayment.service";

export async function createPaymentOrderAction(
  payload: CreatePaymentOrderPayload
): Promise<{ success: boolean; data?: PaymentOrderResult; error?: string }> {
  try {
    const data = await createPaymentOrder(payload);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to initiate payment."
    };
  }
}

export async function verifyPaymentAction(
  payload: VerifyPaymentPayload
): Promise<{ success: boolean; data?: VerifyPaymentResult; error?: string }> {
  try {
    const data = await verifyPayment(payload);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Payment verification failed."
    };
  }
}

export async function recordOfflinePaymentAction(
  payload: RecordOfflinePaymentPayload
): Promise<{ success: boolean; data?: PaymentReceiptResult; error?: string }> {
  try {
    const data = await recordOfflinePayment(payload);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record offline payment."
    };
  }
}

export async function getPaymentReceiptAction(
  applicationId: number
): Promise<{ success: boolean; data?: PaymentReceiptResult | null; error?: string }> {
  try {
    const data = await getPaymentReceipt(applicationId);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to retrieve receipt."
    };
  }
}

export async function getPaymentReceiptByNoAction(
  receiptNo: string
): Promise<{ success: boolean; data?: PaymentReceiptResult | null; error?: string }> {
  try {
    const data = await getPaymentReceiptByNo(receiptNo);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to retrieve receipt."
    };
  }
}

export async function getPaymentStatusAction(
  applicationId: number
): Promise<{ success: boolean; data?: PaymentStatusResult | null; error?: string }> {
  try {
    const data = await getPaymentStatus(applicationId);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch payment status."
    };
  }
}

export async function createPaymentDemandAction(
  payload: CreatePaymentDemandPayload
): Promise<{ success: boolean; data?: PaymentDemandResult; error?: string }> {
  try {
    const data = await createPaymentDemand(payload);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create payment demand.'
    };
  }
}

export async function initializePendingPaymentAction(
  applicationId: number
): Promise<{ success: boolean; data?: PaymentStatusResult; error?: string }> {
  try {
    const data = await initializePendingPayment(applicationId);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to initialize payment details."
    };
  }
}

export async function getPendingClearancePaymentsAction(
  query: PendingClearanceQuery
): Promise<{ success: boolean; data?: PagedItemsResult<PendingClearanceItem>; error?: string }> {
  try {
    const data = await getPendingClearancePayments(query);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch pending clearance payments."
    };
  }
}

export async function getClearanceStatsAction(): Promise<{
  success: boolean;
  data?: PendingClearanceStats;
  error?: string;
}> {
  try {
    const data = await getClearanceStats();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch clearance statistics."
    };
  }
}

export async function approveClearanceAction(
  payload: ApprovePaymentPayload
): Promise<{ success: boolean; data?: VerifyPaymentResult; error?: string }> {
  try {
    const data = await approveClearance(payload);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to approve clearance."
    };
  }
}

export async function disapproveClearanceAction(
  payload: DisapprovePaymentPayload
): Promise<{ success: boolean; data?: VerifyPaymentResult; error?: string }> {
  try {
    const data = await disapproveClearance(payload);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to disapprove clearance."
    };
  }
}

export async function cancelReceiptAction(
  payload: CancelReceiptPayload
): Promise<{ success: boolean; data?: VerifyPaymentResult; error?: string }> {
  try {
    const data = await cancelReceipt(payload);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to cancel receipt."
    };
  }
}

export async function uploadBulkClearanceAction(
  formData: FormData
): Promise<{ success: boolean; data?: BulkClearanceResponse; error?: string }> {
  try {
    const data = await uploadBulkClearance(formData);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to process bulk clearance upload."
    };
  }
}

export async function getBanksAction(): Promise<{
  success: boolean;
  data?: RTSBankLookup[];
  error?: string;
}> {
  try {
    const data = await getBanks();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch bank list."
    };
  }
}

export async function getCancellationLogsAction(
  applicationId?: number,
  transactionId?: number
): Promise<{
  success: boolean;
  data?: ReceiptCancellationLog[];
  error?: string;
}> {
  try {
    const data = await getCancellationLogs(applicationId, transactionId);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to fetch cancellation audit logs."
    };
  }
}


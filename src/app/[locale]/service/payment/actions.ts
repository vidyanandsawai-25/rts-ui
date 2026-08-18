'use server';

import {
  createPaymentOrder,
  verifyPayment,
  recordOfflinePayment,
  getPaymentReceipt,
  getPaymentReceiptByNo,
  getPaymentStatus,
  type CreatePaymentOrderPayload,
  type PaymentOrderResult,
  type VerifyPaymentPayload,
  type VerifyPaymentResult,
  type RecordOfflinePaymentPayload,
  type PaymentReceiptResult
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
): Promise<{ success: boolean; data?: any; error?: string }> {
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

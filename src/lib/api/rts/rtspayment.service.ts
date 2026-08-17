import "server-only";
import { apiClient } from "@/services/api.service";

export interface CreatePaymentOrderPayload {
  applicationId: number;
  paymentGateway?: string;
  customerName?: string;
  email?: string;
  mobileNo?: string;
}

export interface PaymentOrderResult {
  success: boolean;
  message?: string;
  transactionId: number;
  applicationId: number;
  applicationNo: string;
  serviceName: string;
  departmentName: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  gateway: string;
  gatewayOrderId: string;
  keyId: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
}

export interface VerifyPaymentPayload {
  applicationId: number;
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
  paymentMode?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  message: string;
  receiptNo?: string;
  transactionId?: string;
  applicationNo?: string;
  amount: number;
  paymentDate?: string;
  paymentStatus?: string;
}

export interface PaymentReceiptResult {
  transactionId: number;
  applicationId: number;
  applicationNo: string;
  serviceName: string;
  serviceNameLocal: string;
  departmentName: string;
  departmentNameLocal: string;
  amount: number;
  currency: string;
  paymentGateway: string;
  gatewayPaymentId: string;
  receiptNo: string;
  paymentDate: string;
  paymentStatus: string;
  paymentMode?: string;
  customerName?: string;
  customerMobile?: string;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  message: string;
  items?: T;
}

export async function createPaymentOrder(payload: CreatePaymentOrderPayload): Promise<PaymentOrderResult> {
  const res = await apiClient.post<ApiResponseWrapper<PaymentOrderResult>>("/RTSPayment/create-order", payload);
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to create payment order");
  }
  return res.data.items;
}

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult> {
  const res = await apiClient.post<ApiResponseWrapper<VerifyPaymentResult>>("/RTSPayment/verify-payment", payload);
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Payment verification failed");
  }
  return res.data.items;
}

export async function getPaymentReceipt(applicationId: number): Promise<PaymentReceiptResult | null> {
  try {
    const res = await apiClient.get<ApiResponseWrapper<PaymentReceiptResult>>(`/RTSPayment/receipt/${applicationId}`);
    return res.data?.items || null;
  } catch {
    return null;
  }
}

export async function getPaymentStatus(applicationId: number): Promise<{
  applicationId: number;
  applicationNo: string;
  serviceName: string;
  requiredFee: number;
  isFeeRequired: boolean;
  paymentStatus: string;
  receiptNo?: string;
  paymentDate?: string;
  gatewayPaymentId?: string;
} | null> {
  try {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/RTSPayment/status/${applicationId}`);
    return res.data?.data || null;
  } catch {
    return null;
  }
}

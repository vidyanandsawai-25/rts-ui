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

export interface PaymentDemandResult {
  id: number;
  demandNo: string;
  applicationId: number;
  applicationNo: string;
  serviceId: number;
  departmentId: number;
  baseAmount: number;
  lateFeeAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  demandStatus: string;
  ruleDetailsJson?: string | null;
  remarks?: string | null;
  createdDate: string;
}

export interface CreatePaymentDemandPayload {
  applicationId: number;
  amountOverride?: number;
  remarks?: string;
}

export interface PaymentReceiptResult {
  transactionId: number;
  demandNo?: string;
  applicationId: number;
  applicationNo: string;
  serviceName: string;
  serviceNameLocal: string;
  departmentName: string;
  departmentNameLocal: string;
  amount: number;
  baseAmount?: number;
  lateFeeAmount?: number;
  discountAmount?: number;
  amountInWords?: string;
  amountInWordsLocal?: string;
  currency: string;
  paymentGateway: string;
  gatewayPaymentId: string;
  transactionNo?: string;
  bankRefNo?: string;
  bankName?: string;
  instrumentNo?: string;
  payerVpaOrAccount?: string;
  receiptNo: string;
  paymentDate: string;
  paymentStatus: string;
  paymentMode?: string;
  channel?: string;
  counterOfficerName?: string;
  remarks?: string;
  customerName?: string;
  customerMobile?: string;
  customerEmail?: string;
  ulbName?: string;
  ulbNameLocal?: string;
  ulbLogo?: string;
}

export interface PaymentStatusResult {
  transactionId?: number | null;
  demandNo?: string | null;
  applicationId: number;
  applicationNo: string;
  serviceName: string;
  requiredFee: number;
  isFeeRequired: boolean;
  hasPaymentTransaction?: boolean;
  isPaid?: boolean;
  paymentStatus: string;
  statusNameEn?: string | null;
  statusNameMr?: string | null;
  badgeColor?: string | null;
  receiptNo?: string | null;
  paymentDate?: string | null;
  gatewayPaymentId?: string | null;
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

export interface RecordOfflinePaymentPayload {
  applicationId: number;
  paymentMode: string;
  amount?: number;
  instrumentNo?: string;
  instrumentDate?: string;
  bankId?: number;
  bankName?: string;
  branchName?: string;
  remarks?: string;
}

export async function verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult> {
  const res = await apiClient.post<ApiResponseWrapper<VerifyPaymentResult>>("/RTSPayment/verify-payment", payload);
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Payment verification failed");
  }
  return res.data.items;
}

export async function recordOfflinePayment(payload: RecordOfflinePaymentPayload): Promise<PaymentReceiptResult> {
  const res = await apiClient.post<ApiResponseWrapper<PaymentReceiptResult>>("/RTSPayment/record-offline", payload);
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to record offline payment");
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

export async function getPaymentReceiptByNo(receiptNo: string): Promise<PaymentReceiptResult | null> {
  try {
    const cleanNo = receiptNo.trim();
    const res = await apiClient.get<ApiResponseWrapper<PaymentReceiptResult>>(`/RTSPayment/receipt-by-no?rNo=${encodeURIComponent(cleanNo)}`);
    return res.data?.items || null;
  } catch {
    return null;
  }
}

export async function getPaymentStatus(applicationId: number): Promise<PaymentStatusResult | null> {
  try {
    const res = await apiClient.get<{ success: boolean; data?: PaymentStatusResult }>(
      `/RTSPayment/status/${applicationId}`
    );
    return res.data?.success ? res.data.data ?? null : null;
  } catch {
    return null;
  }
}

/** Resolves payment snapshots for a dashboard page in one local API request. */
export async function getPaymentStatuses(applicationNos: string[]): Promise<PaymentStatusResult[]> {
  const normalizedApplicationNos = Array.from(
    new Set(applicationNos.map((applicationNo) => applicationNo.trim()).filter(Boolean))
  );
  if (normalizedApplicationNos.length === 0) return [];

  const res = await apiClient.post<ApiResponseWrapper<PaymentStatusResult[]>>(
    '/RTSPayment/statuses',
    { applicationNos: normalizedApplicationNos }
  );
  if (!res.data?.success || !Array.isArray(res.data.items)) {
    throw new Error(res.data?.message || res.error || 'Failed to load payment statuses');
  }
  return res.data.items;
}

export async function createPaymentDemand(
  payload: CreatePaymentDemandPayload
): Promise<PaymentDemandResult> {
  const res = await apiClient.post<ApiResponseWrapper<PaymentDemandResult>>(
    '/RTSPayment/demand',
    payload
  );
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || 'Failed to create payment demand');
  }
  return res.data.items;
}

export async function initializePendingPayment(applicationId: number): Promise<PaymentStatusResult> {
  const res = await apiClient.post<ApiResponseWrapper<PaymentStatusResult>>(
    `/RTSPayment/initialize-pending/${applicationId}`,
    {}
  );
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || 'Failed to initialize payment details');
  }
  return res.data.items;
}

export async function createOrUpdatePaymentDemand(payload: CreatePaymentDemandPayload): Promise<PaymentDemandResult> {
  const res = await apiClient.post<ApiResponseWrapper<PaymentDemandResult>>("/RTSPayment/demand", payload);
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to create payment demand");
  }
  return res.data.items;
}

export async function getPaymentDemand(applicationId: number): Promise<PaymentDemandResult | null> {
  try {
    const res = await apiClient.get<ApiResponseWrapper<PaymentDemandResult>>(`/RTSPayment/demand/${applicationId}`);
    return res.data?.items || null;
  } catch {
    return null;
  }
}

export interface PendingClearanceQuery {
  paymentMode?: string;
  statusCode?: string;
  fromDate?: string;
  toDate?: string;
  searchText?: string;
  departmentId?: number;
  serviceId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PendingClearanceItem {
  transactionId: number;
  transactionNo: string;
  demandNo?: string;
  applicationId: number;
  applicationNo: string;
  citizenName?: string;
  citizenMobile?: string;
  serviceName: string;
  serviceNameLocal?: string;
  departmentName: string;
  departmentNameLocal?: string;
  paymentMode: string;
  totalAmount: number;
  currency: string;
  bankId?: number;
  bankName?: string;
  branchName?: string;
  instrumentNo?: string;
  instrumentDate?: string;
  clearanceDate?: string;
  bankRefNo?: string;
  gatewayPaymentId?: string;
  receiptNo?: string;
  receiptDate?: string;
  paymentDate?: string;
  paymentStatus: string;
  statusBadgeColor?: string;
  approvalStatus?: string;
  isReceiptCancelled: boolean;
  cancellationReason?: string;
  failureReason?: string;
  remarks?: string;
  createdDate: string;
}

export interface PendingClearanceStats {
  totalPendingDdCheque: number;
  totalPendingOnline: number;
  totalClearedToday: number;
  totalBounced: number;
  totalCancelled: number;
  totalClearedAmountToday: number;
}

export interface ApprovePaymentPayload {
  transactionId: number;
  clearanceDate?: string;
  bankRefNo?: string;
  remarks?: string;
  paymentModeId?: number;
  bankId?: number;
}

export interface DisapprovePaymentPayload {
  transactionId: number;
  reason: string;
  remarks?: string;
}

export interface CancelReceiptPayload {
  transactionId: number;
  reason: string;
  remarks?: string;
}

export interface BulkClearanceRowResult {
  rowIndex: number;
  applicationNo: string;
  instrumentNo?: string;
  action: string;
  success: boolean;
  message: string;
}

export interface BulkClearanceResponse {
  totalRows: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  results: BulkClearanceRowResult[];
}

export interface PagedItemsResult<T> {
  items: T[];
  totalCount: number;
  totalAmount?: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export async function getPendingClearancePayments(
  query: PendingClearanceQuery
): Promise<PagedItemsResult<PendingClearanceItem>> {
  const params = new URLSearchParams();
  if (query.paymentMode) params.append("paymentMode", query.paymentMode);
  if (query.statusCode) params.append("statusCode", query.statusCode);
  if (query.fromDate) params.append("fromDate", query.fromDate);
  if (query.toDate) params.append("toDate", query.toDate);
  if (query.searchText) params.append("searchText", query.searchText);
  if (query.departmentId) params.append("departmentId", query.departmentId.toString());
  if (query.serviceId) params.append("serviceId", query.serviceId.toString());
  if (query.pageNumber) params.append("pageNumber", query.pageNumber.toString());
  if (query.pageSize) params.append("pageSize", query.pageSize.toString());

  const res = await apiClient.get<ApiResponseWrapper<PagedItemsResult<PendingClearanceItem>>>(
    `/RTSPayment/pending-clearance?${params.toString()}`
  );
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to fetch pending clearance items");
  }
  return res.data.items;
}

export async function getClearanceStats(): Promise<PendingClearanceStats> {
  const res = await apiClient.get<ApiResponseWrapper<PendingClearanceStats>>("/RTSPayment/clearance-stats");
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to fetch clearance statistics");
  }
  return res.data.items;
}

export async function approveClearance(payload: ApprovePaymentPayload): Promise<VerifyPaymentResult> {
  const res = await apiClient.post<ApiResponseWrapper<VerifyPaymentResult>>(
    "/RTSPayment/approve-clearance",
    payload
  );
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to approve clearance");
  }
  return res.data.items;
}

export async function disapproveClearance(payload: DisapprovePaymentPayload): Promise<VerifyPaymentResult> {
  const res = await apiClient.post<ApiResponseWrapper<VerifyPaymentResult>>(
    "/RTSPayment/disapprove-clearance",
    payload
  );
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to disapprove clearance");
  }
  return res.data.items;
}

export async function cancelReceipt(payload: CancelReceiptPayload): Promise<VerifyPaymentResult> {
  const res = await apiClient.post<ApiResponseWrapper<VerifyPaymentResult>>(
    "/RTSPayment/cancel-receipt",
    payload
  );
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to cancel receipt");
  }
  return res.data.items;
}

export async function uploadBulkClearance(formData: FormData): Promise<BulkClearanceResponse> {
  const res = await apiClient.post<ApiResponseWrapper<BulkClearanceResponse>>(
    "/RTSPayment/bulk-clearance-upload",
    formData
  );
  if (!res.data?.success || !res.data?.items) {
    throw new Error(res.data?.message || res.error || "Failed to process bulk clearance upload");
  }
  return res.data.items;
}

export interface RTSBankLookup {
  id: number;
  bankCode: string;
  bankName: string;
  branchName?: string;
  ifscCode?: string;
}

export interface ReceiptCancellationLog {
  id: number;
  demandId?: number;
  transactionId: number;
  applicationId: number;
  receiptNumber: string;
  originalAmount: number;
  paymentMode: string;
  instrumentNo?: string;
  bankId?: number;
  bankName?: string;
  cancelledBy?: number;
  cancelledByName?: string;
  cancelledDate: string;
  cancellationReason: string;
  approvedBy?: number;
  approvedByName?: string;
  approvedDate?: string;
  approvalRemarks?: string;
  createdDate: string;
}

export async function getBanks(): Promise<RTSBankLookup[]> {
  try {
    const res = await apiClient.get<ApiResponseWrapper<RTSBankLookup[]>>("/RTSPayment/banks");
    return res.data?.items || [];
  } catch {
    return [];
  }
}

export async function getCancellationLogs(applicationId?: number, transactionId?: number): Promise<ReceiptCancellationLog[]> {
  try {
    const params = new URLSearchParams();
    if (applicationId) params.append("applicationId", applicationId.toString());
    if (transactionId) params.append("transactionId", transactionId.toString());
    const res = await apiClient.get<ApiResponseWrapper<ReceiptCancellationLog[]>>(`/RTSPayment/cancellation-logs?${params.toString()}`);
    return res.data?.items || [];
  } catch {
    return [];
  }
}

export interface RTSPaymentModeLookup {
  id: number;
  modeCode: string;
  modeNameEn: string;
  modeNameMr: string;
  iconName?: string;
  isActive: boolean;
}

export async function getPaymentModes(): Promise<RTSPaymentModeLookup[]> {
  try {
    const res = await apiClient.get<ApiResponseWrapper<RTSPaymentModeLookup[]>>("/RTSPayment/payment-modes");
    return res.data?.items || [];
  } catch {
    return [];
  }
}



/** Types for the external citizen dashboard integration. */
export interface RtsCitizenDashboardApplicationItem {
  serviceName: string;
  serviceNameLocal?: string | null;
  applicationNo: string;
  propertyNo: string | null;
  upicId: string | null;
  sla: number;
  submittedDate: string;
  status: string;
  remark?: string | null;
  paymentTransactionId?: number | null;
  payableFee?: number | null;
  isPaymentAfterApproval?: boolean;
  hasPaymentTransaction?: boolean;
  paymentStatus?: string | null;
  receiptNo?: string | null;
}

/** Shared application row shape used by citizen dashboard consumers. */
export type RtsMisDashboardUserApplicationItem = RtsCitizenDashboardApplicationItem;

export interface RtsCitizenDashboardRequest {
  UpicId: string | null;
  ApplicationNo: string | null;
  ApplicationStatus: string | null;
  FromDate: string | null;
  ToDate: string | null;
  pageNumber: number | null;
  pageSize: number | null;
}

export type RtsCitizenDashboardRequestInput = Partial<RtsCitizenDashboardRequest>;

export interface RtsCitizenDashboardAsyncResult {
  result: RtsCitizenDashboardApplicationItem[] | null;
  id: number | null;
  exception: unknown | null;
  status: number | null;
  isCanceled: boolean;
  isCompleted: boolean;
  isCompletedSuccessfully: boolean;
  creationOptions: number | null;
  asyncState: unknown | null;
  isFaulted: boolean;
}

export interface RtsCitizenDashboardResponse {
  status: boolean;
  message: string;
  data: RtsCitizenDashboardAsyncResult;
}

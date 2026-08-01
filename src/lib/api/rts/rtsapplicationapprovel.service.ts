import "server-only";

import { apiClient } from "@/services/api.service";
import type {
  GetRtsApplicationApprovalsParams,
  RtsApplicationApprovalCardsResponse,
  RtsApplicationApprovalDashboardCards,
  RtsApplicationApprovalDetails,
  RtsApplicationApprovalDetailsResponse,
  RtsApplicationApprovalListItem,
  RtsApplicationApprovalListResponse,
} from "@/types/rts/rtsapplicationapprovel.types";

const RTS_APPLICATION_APPROVAL_PAGE_SIZE = 10;

function buildApprovalListUrl(params: GetRtsApplicationApprovalsParams = {}): string {
  const queryParams = new URLSearchParams();

  if (params.pageNumber != null) queryParams.set("PageNumber", String(params.pageNumber));
  queryParams.set("PageSize", String(RTS_APPLICATION_APPROVAL_PAGE_SIZE));
  if (params.departmentId != null) queryParams.set("DepartmentId", String(params.departmentId));
  if (params.serviceId != null) queryParams.set("ServiceId", String(params.serviceId));
  if (params.applicationNo) queryParams.set("ApplicationNo", params.applicationNo);
  if (params.applicationStatus) queryParams.set("ApplicationStatus", params.applicationStatus);

  const query = queryParams.toString();
  return `/RTSApplicationApproval${query ? `?${query}` : ""}`;
}

export async function getRtsApplicationApprovals(
  params: GetRtsApplicationApprovalsParams = {}
): Promise<{
  applications: RtsApplicationApprovalListItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}> {
  const response = await apiClient.get<RtsApplicationApprovalListResponse>(
    buildApprovalListUrl(params),
    { cache: "no-store" }
  );

  if (!response.success || !response.data?.status || !response.data.item) {
    throw new Error(response.error || response.data?.message || "Failed to fetch RTS application approvals");
  }

  const data = response.data.item;
  return {
    applications: data.items ?? [],
    totalCount: data.totalCount,
    pageNumber: data.pageNumber,
    pageSize: data.pageSize,
    totalPages: data.totalPages,
  };
}

export async function getRtsApplicationApprovalDashboardCards(): Promise<RtsApplicationApprovalDashboardCards> {
  const response = await apiClient.get<RtsApplicationApprovalCardsResponse>(
    "/RTSApplicationApproval/ApplicationDashboardCards",
    { cache: "no-store" }
  );

  if (!response.success || !response.data?.status || !response.data.item) {
    throw new Error(response.error || response.data?.message || "Failed to fetch RTS application approval dashboard cards");
  }

  return response.data.item;
}

export async function getRtsApplicationApprovalDetails(
  applicationId: number
): Promise<RtsApplicationApprovalDetails> {
  const response = await apiClient.get<RtsApplicationApprovalDetailsResponse>(
    `/RTSApplicationApproval/ViewApplicationDetails${applicationId}`,
    { cache: "no-store" }
  );

  if (!response.success || !response.data?.status || !response.data.item) {
    throw new Error(
      response.error || response.data?.message || `Failed to fetch approval details for application ${applicationId}`
    );
  }

  return response.data.item;
}

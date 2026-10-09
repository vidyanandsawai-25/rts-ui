"use server";

import { apiClient } from "@/services/api.service";

export interface AapleSarkarApplicationItem {
  applicationNo: string;
  aapleSarkarTrackId: string;
  rtsServiceId: number;
  mahaITServiceId: number;
  serviceName: string;
  serviceNameMr: string;
  applicationStatus: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  createdDate?: string | null;
  issuedCertificateGuid?: string | null;
  certificateUrl?: string | null;
  trackingUrl?: string | null;
}

export interface AapleSarkarDashboardData {
  status: boolean;
  message?: string;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  applications: AapleSarkarApplicationItem[];
  cuid: string;
}

export async function fetchAapleSarkarDashboardAction(
  cuid: string,
  searchText: string = "",
  statusFilter: string = "All",
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<AapleSarkarDashboardData> {
  if (!cuid || !cuid.trim()) {
    return {
      status: false,
      message: "CitizenUserId (CUID) is required.",
      totalCount: 0,
      pageNumber: 1,
      pageSize,
      applications: [],
      cuid: "",
    };
  }

  const cleanCuid = cuid.trim();

  try {
    const res = await apiClient.post<{
      status: boolean;
      message: string;
      totalCount: number;
      pageNumber: number;
      pageSize: number;
      data: AapleSarkarApplicationItem[];
    }>("/AapleSarkar/GetAapleSarkarApplications", {
      CitizenUserId: cleanCuid,
      SearchText: searchText?.trim() || "",
      StatusFilter: statusFilter || "All",
      PageNumber: pageNumber > 0 ? pageNumber : 1,
      PageSize: pageSize > 0 ? pageSize : 20,
    });

    if (res.success && res.data) {
      return {
        status: res.data.status,
        message: res.data.message,
        totalCount: res.data.totalCount ?? 0,
        pageNumber: res.data.pageNumber || pageNumber,
        pageSize: res.data.pageSize || pageSize,
        applications: res.data.data ?? [],
        cuid: cleanCuid,
      };
    }

    return {
      status: false,
      message: res.error || "Failed to load applications.",
      totalCount: 0,
      pageNumber,
      pageSize,
      applications: [],
      cuid: cleanCuid,
    };
  } catch (error: any) {
    return {
      status: false,
      message: error?.message || "An error occurred while fetching applications.",
      totalCount: 0,
      pageNumber,
      pageSize,
      applications: [],
      cuid: cleanCuid,
    };
  }
}

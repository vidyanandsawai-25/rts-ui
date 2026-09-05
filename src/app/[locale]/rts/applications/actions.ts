"use server";

import { apiClient } from "@/services/api.service";
import type {
  RtsApplication,
} from "@/types/rts/rts-application.types";

export async function getRtsApplicationsAction(
  _pageNumber: number,
  _pageSize: number,
  _searchTerm?: string,
  _status?: string,
  _departmentId?: string,
  _serviceId?: string,
  _priority?: string,
  _assignedOfficerId?: string
) {
  // Legacy stub: actual live applications are managed via /rts/dashboard/rts-applications/actions.ts
  return {
    items: [] as RtsApplication[],
    totalCount: 0,
    pageNumber: _pageNumber,
    pageSize: _pageSize,
    totalPages: 1,
  };
}

export async function getRtsApplicationByIdAction(_id: string): Promise<RtsApplication | null> {
  return null;
}

export async function getRtsMastersAction() {
  try {
    const [deptRes, srvRes] = await Promise.all([
      apiClient.get<any>("/RTSDepartment?PageNumber=1&PageSize=-1"),
      apiClient.get<any>("/RTSService?PageNumber=1&PageSize=-1"),
    ]);

    let departments = [];
    let services = [];

    if (deptRes.success && deptRes.data) {
      const rawDepts = Array.isArray(deptRes.data)
        ? deptRes.data
        : (deptRes.data.items || []);
      departments = rawDepts.map((d: any) => ({
        id: String(d.id ?? d.rtsDepartmentId ?? ""),
        name: String(d.departmentName || d.name || ""),
      }));
    }
    if (srvRes.success && srvRes.data) {
      const rawServices = Array.isArray(srvRes.data)
        ? srvRes.data
        : (srvRes.data.items || []);
      services = rawServices.map((s: any) => ({
        id: String(s.id ?? s.govtServiceCode ?? ""),
        name: String(s.serviceName || s.name || ""),
        departmentId: String(s.departmentId ?? ""),
      }));
    }

    return {
      departments,
      services,
      wards: [],
      zones: [],
      talukas: [],
      districts: [],
    };
  } catch {
    return {
      departments: [],
      services: [],
      wards: [],
      zones: [],
      talukas: [],
      districts: [],
    };
  }
}

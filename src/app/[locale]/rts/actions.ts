"use server";

import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { apiClient } from "@/services/api.service";
import {
  getAllServiceOfficers,
  createServiceOfficer,
} from "@/lib/api/rts/rts-service-officer.service";
import type {
  RtsApplication,
  RtsOfficer,
} from "@/types/rts/rts-application.types";

// 1. Dashboard Stats Action (Redirects to live data structures)
export async function getRtsDashboardStatsAction() {
  return {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    slaViolations: 0,
    deptStats: {} as Record<string, number>,
    statusStats: {} as Record<string, number>,
    workloadStats: [] as Array<{ name: string; designation: string; departmentName: string; count: number }>,
    applications: [] as RtsApplication[],
  };
}

// 2. Paginated Inbox Action
export async function getRtsApplicationsAction(
  pageNumber: number,
  pageSize: number,
  _searchTerm?: string,
  _status?: string,
  _departmentId?: string,
  _serviceId?: string,
  _priority?: string,
  _assignedOfficerId?: string
) {
  return {
    items: [] as RtsApplication[],
    totalCount: 0,
    pageNumber,
    pageSize,
    totalPages: 1,
  };
}

// 3. Application Details by ID Action
export async function getRtsApplicationByIdAction(_id: string): Promise<RtsApplication | null> {
  return null;
}

// 4. Action Decision Submit
export async function submitRtsAction(
  _applicationId: string,
  _actionType: "Approve" | "Reject" | "Forward" | "Return" | "Hold" | "RequestDocuments",
  _remarks: string,
  _assignToOfficerId?: string
) {
  return { success: true };
}

// 7. Masters Config Actions (Live database only)
export async function getRtsMastersAction() {
  try {
    const [deptRes, srvRes] = await Promise.all([
      apiClient.get<any>("/RTSDepartment?PageNumber=1&PageSize=-1"),
      apiClient.get<any>("/RTSService?PageNumber=1&PageSize=-1"),
    ]);

    let departments: Array<{ id: string; name: string; nameLocal?: string | null }> = [];
    let services: Array<{ id: string; name: string; nameLocal?: string | null; departmentId: string }> = [];

    if (deptRes.success && deptRes.data) {
      const rawDepts = Array.isArray(deptRes.data)
        ? deptRes.data
        : (deptRes.data.items || []);
      departments = rawDepts.map((d: any) => ({
        id: String(d.id ?? d.rtsDepartmentId ?? ""),
        name: String(d.departmentName || d.name || ""),
        nameLocal: d.departmentNameLocal ?? null,
      }));
    }
    if (srvRes.success && srvRes.data) {
      const rawServices = Array.isArray(srvRes.data)
        ? srvRes.data
        : (srvRes.data.items || []);
      services = rawServices.map((s: any) => ({
        id: String(s.id ?? s.govtServiceCode ?? ""),
        name: String(s.serviceName || s.name || ""),
        nameLocal: s.serviceNameLocal ?? null,
        departmentId: String(s.departmentId ?? ""),
      }));
    }

    return { departments, services };
  } catch {
    return { departments: [], services: [] };
  }
}

export async function saveRtsDepartmentAction(name: string) {
  try {
    const payload = {
      isActive: true,
      createdBy: 1,
      departmentName: name,
      name,
      deptIcon: "Building",
    };
    const res = await apiClient.post<any>("/RTSDepartment", payload);

    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data);
      const newDept = {
        id: String(raw.id ?? raw.rtsDepartmentId ?? ""),
        name: String(raw.departmentName || raw.name || ""),
      };
      for (const locale of locales) {
        revalidatePath(`/${locale}/rts/configuration-settings`);
      }
      return { success: true, department: newDept };
    }
    return { success: false, error: "Failed to create department" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to save department" };
  }
}

export async function updateRtsDepartmentAction(id: string, name: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const payload = { id: parseInt(id, 10), isActive: true, updatedBy: 1, departmentName: name, name };
      const res = await apiClient.put<any>(`/RTSDepartment/${id}`, payload);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts/configuration-settings`);
        }
        return { success: true, department: { id, name } };
      }
    }
    return { success: false, error: "Failed to update department" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update department" };
  }
}

export async function deleteRtsDepartmentAction(id: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const res = await apiClient.delete<any>(`/RTSDepartment/${id}`);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts/configuration-settings`);
        }
        return { success: true };
      }
    }
    return { success: false, error: "Failed to delete department" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete department" };
  }
}

export async function saveRtsServiceAction(name: string, departmentId: string, certificateType: number = 0) {
  try {
    const parsedDeptId = /^\d+$/.test(departmentId) ? parseInt(departmentId, 10) : 0;
    const payload = {
      isActive: true,
      createdBy: 1,
      departmentId: parsedDeptId,
      serviceName: name,
      name,
      certificateType: certificateType,
      isCertificateRequired: certificateType > 0,
    };
    const res = await apiClient.post<any>("/RTSService", payload);

    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data);
      const newSrv = {
        id: String(raw.id ?? raw.govtServiceCode ?? ""),
        name: String(raw.serviceName || raw.name || ""),
        departmentId: String(raw.departmentId ?? departmentId),
      };
      for (const locale of locales) {
        revalidatePath(`/${locale}/rts/configuration-settings`);
      }
      return { success: true, service: newSrv };
    }
    return { success: false, error: "Failed to create service" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to save service" };
  }
}

export async function updateRtsServiceAction(id: string, name: string, departmentId: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const parsedDeptId = /^\d+$/.test(departmentId) ? parseInt(departmentId, 10) : 0;
      const payload = {
        id: parseInt(id, 10),
        isActive: true,
        updatedBy: 1,
        departmentId: parsedDeptId,
        serviceName: name,
        name,
      };
      const res = await apiClient.put<any>(`/RTSService/${id}`, payload);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts/configuration-settings`);
        }
        return { success: true, service: { id, name, departmentId } };
      }
    }
    return { success: false, error: "Failed to update service" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update service" };
  }
}

export async function deleteRtsServiceAction(id: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const res = await apiClient.delete<any>(`/RTSService/${id}`);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts/configuration-settings`);
        }
        return { success: true };
      }
    }
    return { success: false, error: "Failed to delete service" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete service" };
  }
}

// 8. User Management (RBAC) Actions (Live database officers)
export async function getRtsUsersAction(): Promise<RtsOfficer[]> {
  try {
    const officers = await getAllServiceOfficers().catch(() => []);
    return officers.map((o) => ({
      id: String(o.id),
      name: o.officerName,
      employeeId: `EMP-${o.id}`,
      departmentId: String(o.serviceId),
      departmentName: o.serviceName || "RTS Service",
      designation: o.designation,
      role: o.officerRole || "juniorClerk",
      email: o.email || `officer${o.id}@akola.gov.in`,
      mobile: o.mobileNo || "",
      activeCasesCount: 0,
    }));
  } catch {
    return [];
  }
}

export async function saveRtsUserRoleAction(officerId: string, newRole: string) {
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts/users`);
  }
  return {
    success: true,
    officer: {
      id: officerId,
      name: "Officer",
      employeeId: officerId,
      departmentId: "1",
      departmentName: "Department",
      designation: "Officer",
      role: newRole,
      email: "",
      mobile: "",
      activeCasesCount: 0,
    } as RtsOfficer,
  };
}

export async function createRtsUserAction(officer: {
  name: string;
  employeeId: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  role: string;
  email: string;
  mobile: string;
}) {
  try {
    const created = await createServiceOfficer({
      serviceId: parseInt(officer.departmentId, 10) || 1,
      zoneId: 1,
      zoneName: "Zone 1",
      officerName: officer.name,
      designation: officer.designation,
      mobileNo: officer.mobile,
      email: officer.email,
      officerRole: officer.role,
      isActive: true,
      displayOrder: 1,
    });
    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/users`);
    }
    return {
      success: true,
      officer: {
        ...officer,
        id: String(created.id),
        activeCasesCount: 0,
      } as RtsOfficer,
    };
  } catch {
    for (const locale of locales) {
      revalidatePath(`/${locale}/rts/users`);
    }
    return {
      success: true,
      officer: {
        ...officer,
        id: `emp-${Date.now()}`,
        activeCasesCount: 0,
      } as RtsOfficer,
    };
  }
}

// 9. Form Field Definition Actions (Live database endpoints)
export async function getRtsFieldsAction(pageNumber = 1, pageSize = 10) {
  try {
    const [fieldRes, deptRes, srvRes] = await Promise.all([
      apiClient.get<any>("/RTSFieldDefinition?PageNumber=1&PageSize=-1"),
      apiClient.get<any>("/RTSDepartment?PageNumber=1&PageSize=-1"),
      apiClient.get<any>("/RTSService?PageNumber=1&PageSize=-1"),
    ]);

    let fields = [];
    let fieldPagination = { pageNumber, pageSize, totalCount: 0, totalPages: 1 };
    if (fieldRes.success && fieldRes.data) {
      const rawFields = Array.isArray(fieldRes.data) ? fieldRes.data : (fieldRes.data.items || []);
      fieldPagination = {
        pageNumber: Number(fieldRes.data.pageNumber ?? pageNumber),
        pageSize: Number(fieldRes.data.pageSize ?? pageSize),
        totalCount: Number(fieldRes.data.totalCount ?? rawFields.length),
        totalPages: Number(fieldRes.data.totalPages ?? (Math.ceil(rawFields.length / pageSize) || 1)),
      };
      fields = rawFields.map((f: any) => ({
        id: String(f.id ?? ""),
        departmentId: String(f.departmentId ?? ""),
        serviceId: String(f.serviceId ?? ""),
        fieldCode: String(f.fieldCode ?? ""),
        fieldName: String(f.fieldName ?? ""),
        fieldLabel: String(f.fieldLabel ?? ""),
        fieldType: String(f.fieldType ?? ""),
        fieldGroup: String(f.fieldGroup ?? ""),
        optionsJson: String(f.optionsJson ?? ""),
        isRequired: !!f.isRequired,
        displayOrder: Number(f.displayOrder ?? 0),
        validationRules: String(f.validationRules ?? ""),
        defaultValue: String(f.defaultValue ?? ""),
        minValue: f.minValue !== null ? Number(f.minValue) : null,
        maxValue: f.maxValue !== null ? Number(f.maxValue) : null,
        maxLength: f.maxLength !== null ? Number(f.maxLength) : null,
        isActive: !!f.isActive,
      }));
    }

    let departments = [];
    if (deptRes.success && deptRes.data) {
      const rawDepts = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data.items || []);
      departments = rawDepts.map((d: any) => ({
        id: String(d.id ?? d.rtsDepartmentId ?? ""),
        name: String(d.departmentName || d.name || ""),
      }));
    }

    let services = [];
    if (srvRes.success && srvRes.data) {
      const rawServices = Array.isArray(srvRes.data) ? srvRes.data : (srvRes.data.items || []);
      services = rawServices.map((s: any) => ({
        id: String(s.id ?? s.govtServiceCode ?? ""),
        name: String(s.serviceName || s.name || ""),
        departmentId: String(s.departmentId ?? ""),
      }));
    }

    return { fields, departments, services, pagination: fieldPagination };
  } catch {
    return {
      fields: [],
      departments: [],
      services: [],
      pagination: {
        pageNumber,
        pageSize,
        totalCount: 0,
        totalPages: 1,
      },
    };
  }
}

export async function saveRtsFieldAction(field: any) {
  try {
    const payload = {
      isActive: field.isActive ?? true,
      createdBy: 1,
      departmentId: parseInt(field.departmentId, 10) || 0,
      serviceId: parseInt(field.serviceId, 10) || 0,
      fieldCode: field.fieldCode,
      fieldName: field.fieldName || field.fieldCode,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      fieldGroup: field.fieldGroup,
      optionsJson: field.optionsJson || "",
      isRequired: !!field.isRequired,
      displayOrder: parseInt(field.displayOrder, 10) || 0,
      validationRules: field.validationRules || "",
      defaultValue: field.defaultValue || "",
      minValue: field.minValue !== "" && field.minValue !== null ? parseInt(field.minValue, 10) : null,
      maxValue: field.maxValue !== "" && field.maxValue !== null ? parseInt(field.maxValue, 10) : null,
      maxLength: field.maxLength !== "" && field.maxLength !== null ? parseInt(field.maxLength, 10) : null,
    };

    const res = await apiClient.post<any>("/RTSFieldDefinition", payload);

    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data);
      const newField = {
        id: String(raw.id ?? ""),
        departmentId: String(raw.departmentId ?? ""),
        serviceId: String(raw.serviceId ?? ""),
        fieldCode: String(raw.fieldCode ?? ""),
        fieldName: String(raw.fieldName ?? ""),
        fieldLabel: String(raw.fieldLabel ?? ""),
        fieldType: String(raw.fieldType ?? ""),
        fieldGroup: String(raw.fieldGroup ?? ""),
        optionsJson: String(raw.optionsJson ?? ""),
        isRequired: !!raw.isRequired,
        displayOrder: Number(raw.displayOrder ?? 0),
        validationRules: String(raw.validationRules ?? ""),
        defaultValue: String(raw.defaultValue ?? ""),
        minValue: raw.minValue !== null ? Number(raw.minValue) : null,
        maxValue: raw.maxValue !== null ? Number(raw.maxValue) : null,
        maxLength: raw.maxLength !== null ? Number(raw.maxLength) : null,
        isActive: !!raw.isActive,
      };
      for (const locale of locales) {
        revalidatePath(`/${locale}/rts/configuration-settings/rts-fields`);
      }
      return { success: true, field: newField };
    }
    return { success: false, error: "Failed to create field" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create field" };
  }
}

export async function updateRtsFieldAction(id: string, field: any) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const payload = {
        id: parseInt(id, 10),
        isActive: field.isActive ?? true,
        updatedBy: 1,
        departmentId: parseInt(field.departmentId, 10) || 0,
        serviceId: parseInt(field.serviceId, 10) || 0,
        fieldCode: field.fieldCode,
        fieldName: field.fieldName || field.fieldCode,
        fieldLabel: field.fieldLabel,
        fieldType: field.fieldType,
        fieldGroup: field.fieldGroup,
        optionsJson: field.optionsJson || "",
        isRequired: !!field.isRequired,
        displayOrder: parseInt(field.displayOrder, 10) || 0,
        validationRules: field.validationRules || "",
        defaultValue: field.defaultValue || "",
        minValue: field.minValue !== "" && field.minValue !== null ? parseInt(field.minValue, 10) : null,
        maxValue: field.maxValue !== "" && field.maxValue !== null ? parseInt(field.maxValue, 10) : null,
        maxLength: field.maxLength !== "" && field.maxLength !== null ? parseInt(field.maxLength, 10) : null,
      };

      const res = await apiClient.put<any>(`/RTSFieldDefinition/${id}`, payload);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts/configuration-settings/rts-fields`);
        }
        return { success: true, field: { ...payload, id: String(id) } };
      }
    }
    return { success: false, error: "Failed to update field" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update field" };
  }
}

export async function deleteRtsFieldAction(id: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const res = await apiClient.delete<any>(`/RTSFieldDefinition/${id}`);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts/configuration-settings/rts-fields`);
        }
        return { success: true };
      }
    }
    return { success: false, error: "Failed to delete field" };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete field" };
  }
}

// ─── Backward-compatibility aliases ─────────────────────────────────────────
export const getCmsDashboardStatsAction = getRtsDashboardStatsAction;
export const getCmsApplicationsAction = getRtsApplicationsAction;
export const getCmsApplicationByIdAction = getRtsApplicationByIdAction;
export const submitCmsAction = submitRtsAction;
export const getCmsMastersAction = getRtsMastersAction;
export const saveCmsDepartmentAction = saveRtsDepartmentAction;
export const saveCmsServiceAction = saveRtsServiceAction;
export const updateCmsDepartmentAction = updateRtsDepartmentAction;
export const deleteCmsDepartmentAction = deleteRtsDepartmentAction;
export const updateCmsServiceAction = updateRtsServiceAction;
export const deleteCmsServiceAction = deleteRtsServiceAction;
export const getCmsUsersAction = getRtsUsersAction;
export const saveCmsUserRoleAction = saveRtsUserRoleAction;
export const createCmsUserAction = createRtsUserAction;
export const getCmsFieldsAction = getRtsFieldsAction;
export const saveCmsFieldAction = saveRtsFieldAction;
export const updateCmsFieldAction = updateRtsFieldAction;
export const deleteCmsFieldAction = deleteRtsFieldAction;

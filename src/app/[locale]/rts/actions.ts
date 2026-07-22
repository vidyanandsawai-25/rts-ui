"use server";

import path from "node:path";
import { promises as fs } from "node:fs";
import { revalidatePath } from "next/cache";
import { locales } from "@/i18n/config";
import { apiClient } from "@/services/api.service";
import type {
  RtsApplication,
  RtsOfficer,
  RtsTimelineStep
} from "@/types/rts/rts-application.types";

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "lib",
  "mock",
  "rts",
  "cmsData.json"
);

interface RtsDataStructure {
  applications: RtsApplication[];
  workflows: any[];
  departments: Array<{ id: string; name: string }>;
  services: Array<{ id: string; name: string; departmentId: string }>;
  officers: RtsOfficer[];
  masters: {
    wards: string[];
    zones: string[];
    talukas: string[];
    districts: string[];
  };
  fieldDefinitions?: any[];
}

async function readRtsData(): Promise<RtsDataStructure> {
  try {
    const raw = await fs.readFile(DATA_FILE_PATH, "utf8");
    return JSON.parse(raw) as RtsDataStructure;
  } catch {
    return {
      applications: [],
      workflows: [],
      departments: [],
      services: [],
      officers: [],
      masters: { wards: [], zones: [], talukas: [], districts: [] }
    };
  }
}

async function writeRtsData(data: RtsDataStructure): Promise<void> {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
}

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const displayHr = date.getHours() % 12 || 12;

  return `${yyyy}-${mm}-${dd} ${displayHr}:${min} ${ampm}`;
}

// 1. Dashboard Stats Action
export async function getRtsDashboardStatsAction() {
  const data = await readRtsData();
  const apps = data.applications;

  const total = apps.length;
  const pending = apps.filter(a => !["Approved", "Rejected"].includes(a.status)).length;
  const approved = apps.filter(a => a.status === "Approved").length;
  const rejected = apps.filter(a => a.status === "Rejected").length;
  const slaViolations = apps.filter(a => a.remainingDays <= 0 && !["Approved", "Rejected"].includes(a.status)).length;

  const deptStats: Record<string, number> = {};
  data.departments.forEach(d => {
    deptStats[d.name] = apps.filter(a => a.departmentId === d.id).length;
  });

  const statusStats: Record<string, number> = {};
  apps.forEach(a => {
    statusStats[a.status] = (statusStats[a.status] || 0) + 1;
  });

  const workloadStats = data.officers.map(o => ({
    name: o.name,
    designation: o.designation,
    departmentName: o.departmentName,
    count: apps.filter(a => a.assignedOfficerId === o.id && !["Approved", "Rejected"].includes(a.status)).length
  }));

  return {
    total,
    pending,
    approved,
    rejected,
    slaViolations,
    deptStats,
    statusStats,
    workloadStats,
    applications: apps
  };
}

// 2. Paginated Inbox Action
export async function getRtsApplicationsAction(
  pageNumber: number,
  pageSize: number,
  searchTerm?: string,
  status?: string,
  departmentId?: string,
  serviceId?: string,
  priority?: string,
  assignedOfficerId?: string
) {
  const data = await readRtsData();
  let filtered = data.applications;

  if (searchTerm?.trim()) {
    const q = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      a =>
        a.applicationNo.toLowerCase().includes(q) ||
        a.citizenName.toLowerCase().includes(q) ||
        a.mobile.includes(q)
    );
  }

  if (status && status !== "All") {
    filtered = filtered.filter(a => a.status === status);
  }

  if (departmentId && departmentId !== "All") {
    filtered = filtered.filter(a => a.departmentId === departmentId);
  }

  if (serviceId && serviceId !== "All") {
    filtered = filtered.filter(a => a.serviceId === serviceId);
  }

  if (priority && priority !== "All") {
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority === "rts" || lowerPriority === "aaple sarkar") {
      filtered = filtered.filter(a => {
        const source = a.source?.toLowerCase() || (parseInt(a.id, 10) % 2 === 0 ? "rts" : "aaple sarkar");
        return source === lowerPriority;
      });
    } else {
      filtered = filtered.filter(a => a.priority === priority);
    }
  }

  if (assignedOfficerId && assignedOfficerId !== "All") {
    filtered = filtered.filter(a => a.assignedOfficerId === assignedOfficerId);
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startIdx = (pageNumber - 1) * pageSize;
  const items = filtered.slice(startIdx, startIdx + pageSize);

  return {
    items,
    totalCount,
    pageNumber,
    pageSize,
    totalPages
  };
}

// 3. Application Details by ID Action
export async function getRtsApplicationByIdAction(id: string): Promise<RtsApplication | null> {
  const data = await readRtsData();
  return data.applications.find(a => a.id === id) ?? null;
}

// 4. Action Decision Submit (Approve/Reject/Forward) Action
export async function submitRtsAction(
  applicationId: string,
  actionType: "Approve" | "Reject" | "Forward" | "Return" | "Hold" | "RequestDocuments",
  remarks: string,
  assignToOfficerId?: string
) {
  const data = await readRtsData();
  const index = data.applications.findIndex(a => a.id === applicationId);

  if (index === -1) {
    throw new Error("Application not found");
  }

  const app = { ...data.applications[index] };
  const currentOfficerName = "Current User Officer";

  let nextStatus = app.status;
  let timelineTitle: string = actionType;

  if (actionType === "Approve") {
    nextStatus = "Approved";
    timelineTitle = "Approved & NOC Issued";
  } else if (actionType === "Reject") {
    nextStatus = "Rejected";
    timelineTitle = "Rejected";
  } else if (actionType === "Return") {
    nextStatus = "Returned for Correction";
    timelineTitle = "Returned to Citizen";
  } else if (actionType === "Hold") {
    nextStatus = "On Hold";
    timelineTitle = "Put On Hold";
  } else if (actionType === "RequestDocuments") {
    nextStatus = "Document Correction Needed";
    timelineTitle = "Additional Documents Requested";
  } else if (actionType === "Forward" && assignToOfficerId) {
    const officer = data.officers.find(o => o.id === assignToOfficerId);
    if (officer) {
      app.assignedOfficerId = officer.id;
      app.assignedOfficerName = officer.name;
      nextStatus = `Pending at ${officer.designation}`;
      timelineTitle = `Forwarded to ${officer.name}`;
    }
  }

  app.status = nextStatus;

  const newTimelineStep: RtsTimelineStep = {
    title: timelineTitle,
    timestamp: formatDate(new Date()),
    officerName: currentOfficerName,
    role: "Official Decision",
    remarks: remarks || "Action completed by verifying authority",
    status: "completed"
  };

  app.timeline = [...app.timeline.map(t => (t.status === "current" ? { ...t, status: "completed" as const } : t)), newTimelineStep];

  data.applications[index] = app;
  await writeRtsData(data);

  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/inbox`);
    revalidatePath(`/${locale}/rts-cms/dashboard`);
    revalidatePath(`/${locale}/rts-cms/applications/${applicationId}`);
  }

  return { success: true, application: app };
}

// 7. Masters Config Actions
export async function getRtsMastersAction() {
  try {
    const [deptRes, srvRes] = await Promise.all([
      apiClient.get<any>("/RTSDepartment?PageNumber=1&PageSize=-1"),
      apiClient.get<any>("/RTSService?PageNumber=1&PageSize=-1")
    ]);

    let departments = [];
    let services = [];

    if (deptRes.success && deptRes.data) {
      const rawDepts = Array.isArray(deptRes.data) 
        ? deptRes.data 
        : (deptRes.data.items || []);
      departments = rawDepts.map((d: any) => ({
        id: String(d.id ?? d.rtsDepartmentId ?? ""),
        name: String(d.departmentName || d.name || "")
      }));
    }
    if (srvRes.success && srvRes.data) {
      const rawServices = Array.isArray(srvRes.data)
        ? srvRes.data
        : (srvRes.data.items || []);
      services = rawServices.map((s: any) => ({
        id: String(s.id ?? s.govtServiceCode ?? ""),
        name: String(s.serviceName || s.name || ""),
        departmentId: String(s.departmentId ?? "")
      }));
    }

    // ONLY fall back to mock data if the API request itself was unsuccessful (failed to reach or unauthorized)
    // If the API request succeeded, but simply returned an empty list, DO NOT overwrite it with mock data.
    if (!deptRes.success) {
      const data = await readRtsData();
      departments = data.departments;
    }
    if (!srvRes.success) {
      const data = await readRtsData();
      services = data.services;
    }

    return { departments, services };
  } catch {
    const data = await readRtsData();
    return {
      departments: data.departments,
      services: data.services
    };
  }
}

export async function saveRtsDepartmentAction(name: string) {
  try {
    const payload = {
      isActive: true,
      createdBy: 1,
      departmentName: name,
      name,
      deptIcon: "Building"
    };
    const res = await apiClient.post<any>("/RTSDepartment", payload);
    
    let newDept;
    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data);
      newDept = {
        id: String(raw.id ?? raw.rtsDepartmentId ?? ""),
        name: String(raw.departmentName || raw.name || "")
      };
    }

    if (!newDept || !newDept.id) {
      const data = await readRtsData();
      const nextId = `dept-${Date.now()}`;
      newDept = { id: nextId, name };
      data.departments.push(newDept);
      await writeRtsData(data);
    }

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts-cms/masters`);
    }

    return { success: true, department: newDept };
  } catch {
    const data = await readRtsData();
    const nextId = `dept-${Date.now()}`;
    const newDept = { id: nextId, name };
    data.departments.push(newDept);
    await writeRtsData(data);

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts-cms/masters`);
    }
    return { success: true, department: newDept };
  }
}

export async function saveRtsServiceAction(name: string, departmentId: string) {
  try {
    const parsedDeptId = /^\d+$/.test(departmentId) ? parseInt(departmentId, 10) : 0;
    const payload = {
      isActive: true,
      createdBy: 1,
      departmentId: parsedDeptId,
      serviceName: name,
      name
    };
    const res = await apiClient.post<any>("/RTSService", payload);
    
    let newSrv;
    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data);
      newSrv = {
        id: String(raw.id ?? raw.govtServiceCode ?? ""),
        name: String(raw.serviceName || raw.name || ""),
        departmentId: String(raw.departmentId ?? "")
      };
    }

    if (!newSrv || !newSrv.id) {
      const data = await readRtsData();
      const nextId = `service-${Date.now()}`;
      newSrv = { id: nextId, name, departmentId };
      data.services.push(newSrv);
      await writeRtsData(data);
    }

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts-cms/masters`);
    }

    return { success: true, service: newSrv };
  } catch {
    const data = await readRtsData();
    const nextId = `service-${Date.now()}`;
    const newSrv = { id: nextId, name, departmentId };
    data.services.push(newSrv);
    await writeRtsData(data);

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts-cms/masters`);
    }
    return { success: true, service: newSrv };
  }
}

export async function updateRtsDepartmentAction(id: string, name: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const payload = { id: parseInt(id, 10), isActive: true, updatedBy: 1, departmentName: name, name };
      const res = await apiClient.put<any>(`/RTSDepartment/${id}`, payload);
      if (res.success && res.data) {
        const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data.items || res.data);
        const updatedDept = {
          id: String(raw.id ?? raw.rtsDepartmentId ?? id),
          name: String(raw.departmentName || raw.name || name)
        };
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts-cms/masters`);
        }
        return { success: true, department: updatedDept };
      }
    }
  } catch {
  }

  // Fallback to Mock Data
  const data = await readRtsData();
  const index = data.departments.findIndex(d => d.id === id);
  if (index !== -1) {
    data.departments[index].name = name;
    await writeRtsData(data);
  }
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/masters`);
  }
  return { success: true, department: { id, name } };
}

export async function deleteRtsDepartmentAction(id: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const res = await apiClient.delete<any>(`/RTSDepartment/${id}`);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts-cms/masters`);
        }
        return { success: true };
      }
    }
  } catch {
  }

  // Fallback to Mock Data
  const data = await readRtsData();
  data.departments = data.departments.filter(d => d.id !== id);
  // Remove cascade services
  data.services = data.services.filter(s => s.departmentId !== id);
  await writeRtsData(data);
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/masters`);
  }
  return { success: true };
}

export async function updateRtsServiceAction(id: string, name: string, departmentId: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const payload = {
        id: parseInt(id, 10),
        isActive: true,
        updatedBy: 1,
        departmentId: /^\d+$/.test(departmentId) ? parseInt(departmentId, 10) : 0,
        serviceName: name,
        name
      };
      const res = await apiClient.put<any>(`/RTSService/${id}`, payload);
      if (res.success && res.data) {
        const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data.items || res.data);
        const updatedSrv = {
          id: String(raw.id ?? raw.govtServiceCode ?? id),
          name: String(raw.serviceName || raw.name || name),
          departmentId: String(raw.departmentId ?? departmentId)
        };
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts-cms/masters`);
        }
        return { success: true, service: updatedSrv };
      }
    }
  } catch {
  }

  // Fallback to Mock Data
  const data = await readRtsData();
  const index = data.services.findIndex(s => s.id === id);
  if (index !== -1) {
    data.services[index].name = name;
    data.services[index].departmentId = departmentId;
    await writeRtsData(data);
  }
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/masters`);
  }
  return { success: true, service: { id, name, departmentId } };
}

export async function deleteRtsServiceAction(id: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const res = await apiClient.delete<any>(`/RTSService/${id}`);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts-cms/masters`);
        }
        return { success: true };
      }
    }
  } catch {
  }

  // Fallback to Mock Data
  const data = await readRtsData();
  data.services = data.services.filter(s => s.id !== id);
  await writeRtsData(data);
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/masters`);
  }
  return { success: true };
}

// 8. User Management (RBAC) Actions
export async function getRtsUsersAction() {
  const data = await readRtsData();
  return data.officers;
}

export async function saveRtsUserRoleAction(officerId: string, newRole: string) {
  const data = await readRtsData();
  const index = data.officers.findIndex(o => o.id === officerId);

  if (index !== -1) {
    data.officers[index].role = newRole;
    await writeRtsData(data);
  }

  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/users`);
  }

  return { success: true, officer: data.officers[index] };
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
  const data = await readRtsData();
  const nextId = `emp-${101 + data.officers.length}`;
  const newOfficer: RtsOfficer = {
    ...officer,
    id: nextId,
    activeCasesCount: 0
  };
  data.officers.push(newOfficer);
  await writeRtsData(data);

  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/users`);
  }

  return { success: true, officer: newOfficer };
}

// 9. Form Field Definition Actions
export async function getRtsFieldsAction(pageNumber = 1, pageSize = 10) {
  try {
    const [fieldRes, deptRes, srvRes] = await Promise.all([
      apiClient.get<any>("/RTSFieldDefinition?PageNumber=1&PageSize=-1"),
      apiClient.get<any>("/RTSDepartment?PageNumber=1&PageSize=-1"),
      apiClient.get<any>("/RTSService?PageNumber=1&PageSize=-1")
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
        isActive: !!f.isActive
      }));
    }

    let departments = [];
    if (deptRes.success && deptRes.data) {
      const rawDepts = Array.isArray(deptRes.data) ? deptRes.data : (deptRes.data.items || []);
      departments = rawDepts.map((d: any) => ({
        id: String(d.id ?? d.rtsDepartmentId ?? ""),
        name: String(d.departmentName || d.name || "")
      }));
    } else {
      const data = await readRtsData();
      departments = data.departments;
    }

    let services = [];
    if (srvRes.success && srvRes.data) {
      const rawServices = Array.isArray(srvRes.data) ? srvRes.data : (srvRes.data.items || []);
      services = rawServices.map((s: any) => ({
        id: String(s.id ?? s.govtServiceCode ?? ""),
        name: String(s.serviceName || s.name || ""),
        departmentId: String(s.departmentId ?? "")
      }));
    } else {
      const data = await readRtsData();
      services = data.services;
    }

    if (!fieldRes.success || !fieldRes.data) {
      const data = await readRtsData();
      const allFields = data.fieldDefinitions || [];
      const startIndex = (pageNumber - 1) * pageSize;
      fields = allFields.slice(startIndex, startIndex + pageSize);
      fieldPagination = {
        pageNumber,
        pageSize,
        totalCount: allFields.length,
        totalPages: Math.max(1, Math.ceil(allFields.length / pageSize)),
      };
    }

    return { fields, departments, services, pagination: fieldPagination };
  } catch {
    const data = await readRtsData();
    const allFields = data.fieldDefinitions || [];
    const startIndex = (pageNumber - 1) * pageSize;
    return {
      fields: allFields.slice(startIndex, startIndex + pageSize),
      departments: data.departments,
      services: data.services,
      pagination: {
        pageNumber,
        pageSize,
        totalCount: allFields.length,
        totalPages: Math.max(1, Math.ceil(allFields.length / pageSize)),
      }
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
      maxLength: field.maxLength !== "" && field.maxLength !== null ? parseInt(field.maxLength, 10) : null
    };

    const res = await apiClient.post<any>("/RTSFieldDefinition", payload);

    let newField;
    if (res.success && res.data) {
      const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data);
      newField = {
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
        isActive: !!raw.isActive
      };
    }

    if (!newField || !newField.id) {
      const data = await readRtsData();
      const nextId = String(Date.now());
      newField = {
        ...payload,
        id: nextId,
        departmentId: String(payload.departmentId),
        serviceId: String(payload.serviceId)
      };
      if (!data.fieldDefinitions) data.fieldDefinitions = [];
      data.fieldDefinitions.push(newField);
      await writeRtsData(data);
    }

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts-cms/masters/fields`);
    }

    return { success: true, field: newField };
  } catch {
    const data = await readRtsData();
    const nextId = String(Date.now());
    const newField = {
      id: nextId,
      departmentId: String(field.departmentId),
      serviceId: String(field.serviceId),
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
      minValue: field.minValue ? parseInt(field.minValue, 10) : null,
      maxValue: field.maxValue ? parseInt(field.maxValue, 10) : null,
      maxLength: field.maxLength ? parseInt(field.maxLength, 10) : null,
      isActive: field.isActive ?? true
    };
    if (!data.fieldDefinitions) data.fieldDefinitions = [];
    data.fieldDefinitions.push(newField);
    await writeRtsData(data);

    for (const locale of locales) {
      revalidatePath(`/${locale}/rts-cms/masters/fields`);
    }
    return { success: true, field: newField };
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
        maxLength: field.maxLength !== "" && field.maxLength !== null ? parseInt(field.maxLength, 10) : null
      };

      const res = await apiClient.put<any>(`/RTSFieldDefinition/${id}`, payload);
      if (res.success && res.data) {
        const raw = Array.isArray(res.data) ? res.data[0] : (res.data.items?.[0] || res.data);
        const updatedField = {
          id: String(raw.id ?? id),
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
          isActive: !!raw.isActive
        };

        for (const locale of locales) {
          revalidatePath(`/${locale}/rts-cms/masters/fields`);
        }
        return { success: true, field: updatedField };
      }
    }
  } catch {
  }

  // Fallback to local
  const data = await readRtsData();
  if (!data.fieldDefinitions) data.fieldDefinitions = [];
  const index = data.fieldDefinitions.findIndex(f => f.id === id);
  const updatedField = {
    id,
    departmentId: String(field.departmentId),
    serviceId: String(field.serviceId),
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
    minValue: field.minValue ? parseInt(field.minValue, 10) : null,
    maxValue: field.maxValue ? parseInt(field.maxValue, 10) : null,
    maxLength: field.maxLength ? parseInt(field.maxLength, 10) : null,
    isActive: field.isActive ?? true
  };
  if (index !== -1) {
    data.fieldDefinitions[index] = updatedField;
    await writeRtsData(data);
  }
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/masters/fields`);
  }
  return { success: true, field: updatedField };
}

export async function deleteRtsFieldAction(id: string) {
  try {
    const isNumeric = /^\d+$/.test(id);
    if (isNumeric) {
      const res = await apiClient.delete<any>(`/RTSFieldDefinition/${id}`);
      if (res.success) {
        for (const locale of locales) {
          revalidatePath(`/${locale}/rts-cms/masters/fields`);
        }
        return { success: true };
      }
    }
  } catch {
  }

  // Fallback to local
  const data = await readRtsData();
  if (data.fieldDefinitions) {
    data.fieldDefinitions = data.fieldDefinitions.filter(f => f.id !== id);
    await writeRtsData(data);
  }
  for (const locale of locales) {
    revalidatePath(`/${locale}/rts-cms/masters/fields`);
  }
  return { success: true };
}

// ─── Backward-compatibility aliases (deprecated – use Rts* names) ────────────
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

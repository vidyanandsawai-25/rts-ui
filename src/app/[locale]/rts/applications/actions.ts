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
  "rtsApplicationsData.json"
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
        (a.applicationNo || a.id).toLowerCase().includes(q) ||
        (a.citizenName || "").toLowerCase().includes(q) ||
        (a.mobile || "").includes(q)
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

export async function getRtsApplicationByIdAction(id: string): Promise<RtsApplication | null> {
  const data = await readRtsData();
  return data.applications.find(a => a.id === id) ?? null;
}

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
    revalidatePath(`/${locale}/rts/applications`);
    revalidatePath(`/${locale}/rts/applications/${applicationId}`);
  }

  return { success: true, application: app };
}

export async function getRtsUsersAction() {
  const data = await readRtsData();
  return data.officers;
}

"use server";

import { getRtsMisDashboardData } from "@/lib/api/rts/rtsmisdashboard.service";
import type {
  RtsMisDashboardData,
  RtsMisDashboardModuleName,
} from "@/types/rts/rtsmisdashboard.types";

function normalizeDate(value?: string): string | null {
  const trimmed = value?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;

  const [year, month, day] = trimmed.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return parsedDate.getUTCFullYear() === year
    && parsedDate.getUTCMonth() === month - 1
    && parsedDate.getUTCDate() === day
    ? trimmed
    : null;
}

export async function getRtsMisDepartmentServicesAction(
  departmentId = 1,
  departmentName = "Property Tax",
  moduleName: RtsMisDashboardModuleName = "RTS",
  fromDate?: string,
  toDate?: string
): Promise<RtsMisDashboardData> {
  const normalizedDepartmentName = departmentName.trim();
  const isDepartmentRequest =
    Number.isFinite(departmentId) &&
    departmentId > 0 &&
    normalizedDepartmentName.length > 0;

  if (!isDepartmentRequest) {
    throw new Error("A valid department ID and department name are required");
  }

  if (!['RTS', 'AapleSarkar', 'Offline'].includes(moduleName)) {
    throw new Error("A valid application source is required");
  }

  const normalizedFromDate = normalizeDate(fromDate);
  const normalizedToDate = normalizeDate(toDate);
  const validToDate = normalizedFromDate && normalizedToDate && normalizedToDate < normalizedFromDate
    ? null
    : normalizedToDate;

  const response = await getRtsMisDashboardData({
    Flag: "admin",
    UpicId: "",
    DeparmentId: departmentId,
    DeparmentName: normalizedDepartmentName,
    ModuleName: moduleName,
    FromDate: normalizedFromDate,
    ToDate: validToDate,
  });

  return response.data;
}

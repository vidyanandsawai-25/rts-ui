"use server";

import { getRtsMisDashboardData } from "@/lib/api/rts/rtsmisdashboard.service";
import type {
  RtsMisDashboardData,
  RtsMisDashboardModuleName,
} from "@/types/rts/rtsmisdashboard.types";

export async function getRtsMisDepartmentServicesAction(
  departmentId = 1,
  departmentName = "Property Tax",
  moduleName: RtsMisDashboardModuleName = "RTS"
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

  const response = await getRtsMisDashboardData({
    Flag: "admin",
    UpicId: "",
    DeparmentId: departmentId,
    DeparmentName: normalizedDepartmentName,
    ModuleName: moduleName,
  });

  return response.data;
}

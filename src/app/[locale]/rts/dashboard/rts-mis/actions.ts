"use server";

import { getRtsMisDashboardData } from "@/lib/api/rts/rtsmisdashboard.service";
import type { RtsMisDashboardData } from "@/types/rts/rtsmisdashboard.types";

export async function getRtsMisDepartmentServicesAction(
  departmentId = 0,
  departmentName = ""
): Promise<RtsMisDashboardData> {
  const normalizedDepartmentName = departmentName.trim();
  const isAllServicesRequest = departmentId === 0 && normalizedDepartmentName === "";
  const isDepartmentRequest =
    Number.isFinite(departmentId) &&
    departmentId > 0 &&
    normalizedDepartmentName.length > 0;

  if (!isAllServicesRequest && !isDepartmentRequest) {
    throw new Error("Provide both department ID and name, or use 0 and an empty name for all services");
  }

  const response = await getRtsMisDashboardData({
    Flag: "Admin",
    UpicId: "",
    DeparmentId: departmentId,
    DeparmentName: normalizedDepartmentName,
  });

  return response.data;
}

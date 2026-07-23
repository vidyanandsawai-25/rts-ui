"use server";

import { getRtsMisDashboardData } from "@/lib/api/rts/rtsmisdashboard.service";
import type { RtsMisDashboardData } from "@/types/rts/rtsmisdashboard.types";

export async function getRtsMisDashboardAction(): Promise<RtsMisDashboardData> {
  const response = await getRtsMisDashboardData();
  return response.data;
}

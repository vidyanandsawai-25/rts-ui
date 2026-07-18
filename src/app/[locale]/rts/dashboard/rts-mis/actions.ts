"use server";

import { getCmsMisDashboardData } from "@/lib/api/rts/rtsmisdashboard.service";
import type { CmsMisDashboardData } from "@/types/rts/rtsmisdashboard.types";

export async function getCmsMisDashboardAction(): Promise<CmsMisDashboardData> {
  const response = await getCmsMisDashboardData();
  return response.data;
}

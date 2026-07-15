"use server";

import { getCmsMisDashboardData } from "@/lib/api/cms/cmsmisdashboard.service";
import type { CmsMisDashboardData } from "@/types/cms/cmsmisdashboard.types";

export async function getCmsMisDashboardAction(): Promise<CmsMisDashboardData> {
  const response = await getCmsMisDashboardData();
  return response.data;
}

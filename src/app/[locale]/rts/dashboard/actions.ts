"use server";

import { getRtsMisDashboardData } from "@/lib/api/rts/rts-dashboard.service";
import type { RtsMisDashboardData } from "@/types/rts-dashboard.types";

export async function getRtsMisDashboardAction(): Promise<RtsMisDashboardData> {
  const response = await getRtsMisDashboardData({ Flag: 'admin', UpicId: '' });
  return response.data;
}

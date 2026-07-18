"use server";

/**
 * dashboard/actions.ts
 * Fetches department + service data for the citizen dashboard.
 * Delegates to lib/api/dashboard.ts → lib/api/rts-citizen.api.ts
 *
 * Switch to real API: set NEXT_PUBLIC_USE_REAL_API=true in .env.local
 */

import { cookies } from "next/headers";
import { getDashboardDepartments } from "@/lib/api/dashboard";
import { getCmsMisDashboardData } from "@/lib/api/rts/rtsmisdashboard.service";
import type { CmsMisDashboardUserApplicationItem } from "@/types/rts/rtsmisdashboard.types";
import type { DepartmentDTO } from "@/types/rts-citizen.types";

export type DashboardData = {
  departments: DepartmentDTO[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const departments = await getDashboardDepartments();
  return { departments };
}

type CitizenProfileCookie = {
  upicId?: string;
};

/** Loads the logged-in citizen's MIS applications from the server-only profile cookie. */
export async function getCitizenMisApplications(): Promise<CmsMisDashboardUserApplicationItem[]> {
  try {
    const profileCookie = (await cookies()).get("rts_citizen_profile")?.value;
    if (!profileCookie) return [];

    const profile = JSON.parse(profileCookie) as CitizenProfileCookie;
    const upicId = profile.upicId?.trim();
    if (!upicId) return [];

    const response = await getCmsMisDashboardData({ Flag: "user", UpicId: upicId });
    return response.status ? response.data.userApplicationDashboardData ?? [] : [];
  } catch (error) {
    console.error("Failed to load citizen MIS applications:", error);
    return [];
  }
}

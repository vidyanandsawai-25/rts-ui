"use server";

/**
 * dashboard/actions.ts
 * Fetches department + service data for the citizen dashboard.
 * Delegates to lib/api/dashboard.ts → lib/api/rts-citizen.api.ts
 *
 * Switch to real API: set NEXT_PUBLIC_USE_REAL_API=true in .env.local
 */

import { getDashboardDepartments } from "@/lib/api/dashboard";
import type { DepartmentDTO } from "@/types/rts-citizen.types";

export type DashboardData = {
  departments: DepartmentDTO[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const departments = await getDashboardDepartments();
  return { departments };
}

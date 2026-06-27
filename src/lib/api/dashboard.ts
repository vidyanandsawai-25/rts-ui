/**
 * dashboard.ts — Data access layer for citizen dashboard.
 *
 * ─── DB Integration (TODO for dev team) ────────────────────────────────────
 * This file delegates to rts-citizen.api.ts which has a single flag:
 *   NEXT_PUBLIC_USE_REAL_API=true  → hits real API
 *   (default)                      → returns mock data
 *
 * So team only needs to:
 *   1. Set env vars in .env.local
 *   2. Ensure API endpoints match rts-citizen.api.ts contracts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { fetchDepartments } from '@/lib/api/rts-citizen.api';
import type { DepartmentDTO } from '@/types/rts-citizen.types';

/**
 * Fetches all departments with their services for the dashboard.
 * Backed by rts-citizen.api.ts — switches mock ↔ real via env flag.
 */
export async function getDashboardDepartments(): Promise<DepartmentDTO[]> {
  return fetchDepartments();
}

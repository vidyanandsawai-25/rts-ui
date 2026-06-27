/**
 * rts-citizen.api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Central API client for the RTS Citizen Portal.
 *
 * HOW TO SWITCH FROM MOCK → REAL API (for dev team):
 *   1. Set `USE_REAL_API = true` below (or use env: NEXT_PUBLIC_USE_REAL_API=true)
 *   2. Set API_BASE_URL in your .env.local:
 *        NEXT_PUBLIC_API_BASE_URL=https://your-api.domain.com
 *   3. Ensure the API endpoints match the contracts defined below.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  DepartmentDTO,
  ServiceDTO,
  ServiceFieldGroupDTO,
  ServiceMetaDTO,
} from '@/types/rts-citizen.types';

import {
  getMockDepartments,
  getMockServiceFields,
  getMockServiceMeta,
} from '@/lib/mock/rts-citizen.mock';

// ── Toggle: set to true when real API is available ───────────────────────────
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// ── Generic fetch helper ─────────────────────────────────────────────────────
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

// ── Public API functions (called from actions.ts / page.tsx) ─────────────────

/**
 * Fetch all departments with their service list.
 * API contract: GET /api/rts/departments
 * Returns: DepartmentDTO[]
 */
export async function fetchDepartments(): Promise<DepartmentDTO[]> {
  if (USE_REAL_API) return apiFetch<DepartmentDTO[]>('/api/rts/departments');
  return getMockDepartments();
}

/**
 * Fetch services for a specific department.
 * API contract: GET /api/rts/departments/{deptId}/services
 * Returns: ServiceDTO[]
 */
export async function fetchServicesByDept(deptId: string): Promise<ServiceDTO[]> {
  if (USE_REAL_API) return apiFetch<ServiceDTO[]>(`/api/rts/departments/${deptId}/services`);
  const depts = await getMockDepartments();
  return depts.find((d) => d.id === deptId)?.services ?? [];
}

/**
 * Fetch service metadata (name, department, labels) for a given serviceId.
 * API contract: GET /api/rts/services/{serviceId}
 * Returns: ServiceMetaDTO
 */
export async function fetchServiceMeta(serviceId: string): Promise<ServiceMetaDTO> {
  if (USE_REAL_API) return apiFetch<ServiceMetaDTO>(`/api/rts/services/${serviceId}`);
  return getMockServiceMeta(serviceId);
}

/**
 * Fetch dynamic form field groups for a service.
 * API contract: GET /api/rts/services/{serviceId}/fields
 * Returns: ServiceFieldGroupDTO[]
 *
 * Each group contains fields with:
 *   - fieldId, label (i18n), fieldType, required, options (for dropdowns)
 */
export async function fetchServiceFormFields(serviceId: string): Promise<ServiceFieldGroupDTO[]> {
  if (USE_REAL_API) return apiFetch<ServiceFieldGroupDTO[]>(`/api/rts/services/${serviceId}/fields`);
  return getMockServiceFields(Number(serviceId));
}

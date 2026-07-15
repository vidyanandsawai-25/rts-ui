// /**
//  * dashboard.ts — Data access layer for citizen dashboard.
//  *
//  * ─── DB Integration (TODO for dev team) ────────────────────────────────────
//  * This file delegates to rts-citizen.api.ts which has a single flag:
//  *   NEXT_PUBLIC_USE_REAL_API=true  → hits real API
//  *   (default)                      → returns mock data
//  *
//  * So team only needs to:
//  *   1. Set env vars in .env.local
//  *   2. Ensure API endpoints match rts-citizen.api.ts contracts
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// import { fetchDepartments } from '@/lib/api/rts-citizen.api';
// import type { DepartmentDTO } from '@/types/rts-citizen.types';

// /**
//  * Fetches all departments with their services for the dashboard.
//  * Backed by rts-citizen.api.ts — switches mock ↔ real via env flag.
//  */
// export async function getDashboardDepartments(): Promise<DepartmentDTO[]> {
//   return fetchDepartments();
// }


import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import type { DepartmentDTO } from '@/types/rts-citizen.types';

function toI18nLabelWithLocal(value: string, localValue?: string | null) {
  const localVal = localValue?.trim() || value;
  return { en: value, hi: localVal, mr: localVal };
}

function resolveDepartmentIcon(apiIcon: string | null) {
  return apiIcon && apiIcon.trim() ? apiIcon.trim() : 'Building2';
}

function resolveServiceIcon(apiIcon: string | null | undefined) {
  return apiIcon && apiIcon.trim() ? apiIcon.trim() : 'FileText';
}

export async function getDashboardDepartments(): Promise<DepartmentDTO[]> {

  const [departments, services] = await Promise.all([getAllRtsDepartments(), getAllRtsServices()]);

  return departments
    .filter((department) => department.isActive)
    .map((department) => {
      const departmentServices = services
        .filter((service) => service.isActive && service.departmentId === department.id)
        .map((service) => ({
          id: String(service.id),
          name: toI18nLabelWithLocal(service.serviceName, service.serviceNameLocal),
          icon: resolveServiceIcon(service.serviceIcon),
          displayOrder: service.displayOrder ?? 0,
          sla: service.sla,
          fees: service.fees,
          feesRequired: service.feesRequired ?? service.isFeesRequired,
        }))
        .sort((a, b) => a.displayOrder - b.displayOrder);

      return {
        id: String(department.id),
        name: toI18nLabelWithLocal(department.departmentName, department.departmentNameLocal),
        icon: resolveDepartmentIcon(department.departmentIcon),
        displayOrder: department.displayOrder ?? 0,
        image: "",
        services: departmentServices,
      };
    })
    .filter((department) => department.services.length > 0);
}


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

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveDepartmentImage(name: string) {
  const slug = slugify(name);
  const known: Record<string, string> = {
    'birth-death': '/images/departments/birth-death.svg',
    'birth-death-marriage': '/images/departments/birth-death.svg',
    'education': '/images/departments/education.svg',
    'marriage-certificate': '/images/departments/marriage.svg',
    'noc': '/images/departments/building.svg',
    'ofc': '/images/departments/ofc.svg',
    'property-tax': '/images/departments/property-tax.svg',
    'trade-license': '/images/departments/bajar-parwana.svg',
    'tree': '/images/departments/tree.svg',
    'water-connection': '/images/departments/water-supply.svg',
    'water-supply': '/images/departments/water-supply.svg',
    'civic-amenities': '/images/departments/civic-amenities.svg',
  };

  return known[slug] || '/images/departments/building.svg';
}

function resolveDepartmentIcon(name: string, apiIcon: string | null) {
  if (apiIcon && apiIcon.trim()) return apiIcon.trim();

  const lower = name.toLowerCase();
  if (lower.includes('fire')) return 'Flame';
  if (lower.includes('water')) return 'Droplets';
  if (lower.includes('trade')) return 'Briefcase';
  if (lower.includes('property')) return 'Home';
  if (lower.includes('birth') || lower.includes('death') || lower.includes('marriage')) return 'HeartPulse';
  if (lower.includes('education')) return 'GraduationCap';
  if (lower.includes('tree')) return 'TreePine';
  if (lower.includes('noc')) return 'ShieldCheck';
  return 'Building2';
}

function resolveServiceIcon(serviceName: string) {
  const lower = serviceName.toLowerCase();
  if (lower.includes('fire')) return 'Flame';
  if (lower.includes('birth')) return 'Baby';
  if (lower.includes('death')) return 'HeartOff';
  if (lower.includes('marriage')) return 'Heart';
  if (lower.includes('property')) return 'Home';
  if (lower.includes('water')) return 'Droplets';
  if (lower.includes('trade')) return 'Briefcase';
  if (lower.includes('noc')) return 'ShieldCheck';
  if (lower.includes('certificate')) return 'FileCheck';
  return 'FileText';
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
          icon: resolveServiceIcon(service.serviceName),
        }));

      return {
        id: String(department.id),
        name: toI18nLabelWithLocal(department.departmentName, department.departmentNameLocal),
        icon: resolveDepartmentIcon(department.departmentName, department.deptIcon),
        image: resolveDepartmentImage(department.departmentName),
        services: departmentServices,
      };
    })
    .filter((department) => department.services.length > 0);
}


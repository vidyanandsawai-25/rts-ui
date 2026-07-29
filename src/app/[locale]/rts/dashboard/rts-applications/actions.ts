'use server';

import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import { getRtsApplications } from '@/lib/api/rts/rtsapplication.service';
import type { RtsApplicationApiDashboard } from '@/types/rts/rts-application.types';
import type { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

export type ApplicationsDashboardKpis = RtsApplicationApiDashboard;

export interface AdminApplicationGridRow {
  applicationId: number;
  applicationNo: string;
  departmentId: number;
  serviceId: number;
  applicationDate: string | null;
  applicantName: string;
  serviceName: string | null;
  departmentName: string | null;
  currentStatus: string;
  remainingDays: number | null;
  dueDays: number | null;
  overdueDays: number | null;
  lastUpdatedDate: string | null;
  sla: string | number | null;
  assignedTo: number | string | null;
  remark: string | null;
}

export interface RtsApplicationsDashboardResult {
  kpis: ApplicationsDashboardKpis | null;
  rows: AdminApplicationGridRow[];
  error: string | null;
}

export async function getRtsApplicationServicesAction(): Promise<RtsServiceApiItem[]> {
  return getAllRtsServices();
}

export async function getRtsApplicationFilterOptionsAction(): Promise<{
  departments: RtsDepartmentApiItem[];
  services: RtsServiceApiItem[];
}> {
  const [departments, services] = await Promise.all([
    getAllRtsDepartments(),
    getAllRtsServices(),
  ]);

  return { departments, services };
}

function getApplicantName(
  applicantDetails: Array<{ fieldLabel: string; fieldValue: string | null }> | null
): string {
  const valuesByLabel = new Map<string, string>();

  for (const detail of applicantDetails ?? []) {
    const label = detail.fieldLabel?.trim().toLocaleLowerCase();
    const value = detail.fieldValue?.trim();
    if (label && value) valuesByLabel.set(label, value);
  }

  const joinName = (labels: string[]) =>
    labels
      .map((label) => valuesByLabel.get(label))
      .filter((value): value is string => Boolean(value))
      .join(' ');

  const childName = joinName(['child first name', 'child middle name', 'child last name']);
  if (childName) return childName;

  const fullName = valuesByLabel.get('full name');
  if (fullName) return fullName;

  return joinName(['first name', 'middle name', 'last name']) || '-';
}

export async function getRtsApplicationsDashboardAction(): Promise<RtsApplicationsDashboardResult> {
  try {
    const response = await getRtsApplications({ pageNumber: 1, pageSize: 1000 });

    const rows = response.applications
      .map((application) => ({
        applicationId: application.id,
        applicationNo: application.applicationNo,
        departmentId: application.departmentId,
        serviceId: application.serviceId,
        applicationDate: application.createdDate ?? null,
        applicantName: getApplicantName(application.applicantDetails),
        serviceName: application.serviceName,
        departmentName: application.departmentName,
        currentStatus: application.applicationStatus,
        remainingDays: application.remainingDays,
        dueDays: application.dueDays,
        overdueDays: application.overdueDays,
        lastUpdatedDate: application.updatedDate,
        sla: application.sla,
        assignedTo: application.assignedTo,
        remark: application.remark,
      }))
      .sort((left, right) => {
        const leftDate = left.applicationDate ? new Date(left.applicationDate).getTime() : Number.NEGATIVE_INFINITY;
        const rightDate = right.applicationDate ? new Date(right.applicationDate).getTime() : Number.NEGATIVE_INFINITY;
        return rightDate - leftDate;
      });

    return { kpis: response.dashboard, rows, error: null };
  } catch (error) {
    console.error('Failed to fetch RTS applications dashboard:', error);
    return {
      kpis: null,
      rows: [],
      error: error instanceof Error ? error.message : 'Failed to fetch RTS applications dashboard',
    };
  }
}

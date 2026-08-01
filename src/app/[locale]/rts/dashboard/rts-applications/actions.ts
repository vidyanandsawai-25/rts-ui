'use server';

import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import {
  getRtsApplicationApprovalDashboardCards,
  getRtsApplicationApprovalDetails,
  getRtsApplicationApprovals,
} from '@/lib/api/rts/rtsapplicationapprovel.service';
import type {
  RtsApplicationApprovalDashboardCards,
  RtsApplicationApprovalDetails,
  RtsApplicationApprovalListItem,
} from '@/types/rts/rtsapplicationapprovel.types';
import type { RtsDepartmentApiItem } from '@/types/rts/departments.types';
import type { RtsServiceApiItem } from '@/types/rts/service.types';

export type ApplicationsDashboardKpis = RtsApplicationApprovalDashboardCards;

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
  pagination: {
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  } | null;
}

export interface RtsApplicationsDashboardQuery {
  pageNumber: number;
  departmentId?: number;
  serviceId?: number;
  applicationStatus?: string;
  search?: string;
}

export async function getRtsApplicationApprovalDetailsAction(
  applicationId: number
): Promise<RtsApplicationApprovalDetails | null> {
  try {
    return await getRtsApplicationApprovalDetails(applicationId);
  } catch (error) {
    console.error(`Failed to fetch approval details for RTS application ${applicationId}:`, error);
    return null;
  }
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

function toGridRow(application: RtsApplicationApprovalListItem): AdminApplicationGridRow {
  return {
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
  };
}

function sortRows(rows: AdminApplicationGridRow[]): AdminApplicationGridRow[] {
  return rows.sort((left, right) => {
    const leftDate = left.applicationDate ? new Date(left.applicationDate).getTime() : Number.NEGATIVE_INFINITY;
    const rightDate = right.applicationDate ? new Date(right.applicationDate).getTime() : Number.NEGATIVE_INFINITY;
    return rightDate - leftDate;
  });
}

export async function getRtsApplicationsDashboardAction(
  query: RtsApplicationsDashboardQuery
): Promise<RtsApplicationsDashboardResult> {
  try {
    const requestFilters = {
      departmentId: query.departmentId,
      serviceId: query.serviceId,
      applicationStatus: query.applicationStatus,
      applicationNo: query.search,
    };
    const [response, kpis] = await Promise.all([
      getRtsApplicationApprovals({
        ...requestFilters,
        pageNumber: query.pageNumber,
      }),
      getRtsApplicationApprovalDashboardCards(),
    ]);

    const rows = sortRows(response.applications.map(toGridRow));

    return {
      kpis,
      rows,
      error: null,
      pagination: {
        pageNumber: response.pageNumber,
        pageSize: response.pageSize,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      },
    };
  } catch (error) {
    console.error('Failed to fetch RTS applications dashboard:', error);
    return {
      kpis: null,
      rows: [],
      error: error instanceof Error ? error.message : 'Failed to fetch RTS applications dashboard',
      pagination: null,
    };
  }
}

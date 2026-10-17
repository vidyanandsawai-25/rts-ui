'use server';

import { getAllRtsDepartments } from '@/lib/api/rts/rtsdepartment.service';
import { getAllRtsServices } from '@/lib/api/rts/rtsservices.service';
import {
  getBanks,
  getPaymentModes,
  getPendingClearancePayments,
  type PendingClearanceItem,
  type PendingClearanceQuery,
} from '@/lib/api/rts/rtspayment.service';
import { getApprovalApplicationsPaged } from '@/lib/api/rts/rts-application-approval.service';
import type { RtsApprovalApplicationListItem } from '@/types/rts/application-approval.types';
import {
  getRtsApplicationsDashboardAction,
  type AdminApplicationGridRow,
  type RtsApplicationsDashboardFilters,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import { computeOverdueDays, computeRemainingDays } from '@/lib/utils/rts/application-grid';
import type { DepartmentSummaryReportItem } from '@/lib/utils/rts/report-engine/rtsDomainReports';
import { getAppealDashboardGrid } from '@/lib/api/rts/rtsappeal.service';
import type { RTSAppealDashboardDetailsDto, RTSAppealQueryParameters } from '@/types/rts/appeal.types';

function parseSlaDays(sla: string | number | undefined | null): number {
  if (typeof sla === 'number') return Number.isFinite(sla) ? Math.max(0, sla) : 0;
  if (!sla) return 0;
  const parsed = parseInt(String(sla), 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

export interface RtsReportsFilterOptions {
  departments: Array<{ id: number; departmentName: string; departmentNameLocal?: string | null }>;
  services: Array<{ id: number; serviceName: string; serviceNameLocal?: string | null; departmentId?: number }>;
  banks: Array<{ id: number; bankName: string; ifscCode?: string }>;
  paymentModes: Array<{ id: number; modeCode: string; modeNameEn: string; modeNameMr: string }>;
}

/**
 * 1. Load initial lookups for filter bars
 */
export async function getRtsReportsLookupsAction(): Promise<RtsReportsFilterOptions> {
  const [departments, services, banks, modes] = await Promise.all([
    getAllRtsDepartments().catch((err) => {
      console.error('Error fetching departments for reports:', err);
      return [];
    }),
    getAllRtsServices().catch((err) => {
      console.error('Error fetching services for reports:', err);
      return [];
    }),
    getBanks().catch((err) => {
      console.error('Error fetching banks for reports:', err);
      return [];
    }),
    getPaymentModes().catch((err) => {
      console.error('Error fetching payment modes for reports:', err);
      return [];
    }),
  ]);

  return {
    departments: (departments || []).map((d) => ({
      id: d.id,
      departmentName: d.departmentName,
      departmentNameLocal: d.departmentNameLocal,
    })),
    services: (services || []).map((s) => ({
      id: s.id,
      serviceName: s.serviceName,
      serviceNameLocal: s.serviceNameLocal,
      departmentId: s.departmentId,
    })),
    banks: (banks || []).map((b) => ({
      id: b.id,
      bankName: b.bankName,
      ifscCode: b.ifscCode,
    })),
    paymentModes: (modes || []).map((m) => ({
      id: m.id,
      modeCode: m.modeCode,
      modeNameEn: m.modeNameEn,
      modeNameMr: m.modeNameMr,
    })),
  };
}

function mapApprovalAppToGridRow(app: RtsApprovalApplicationListItem): AdminApplicationGridRow {
  const slaDays = parseSlaDays(app.sla);
  const isActionable =
    (app.applicationStatus || '').toLowerCase() === 'pending' ||
    (app.applicationStatus || '').toLowerCase() === 'submitted';

  const remainingDays =
    app.remainingDays != null
      ? app.remainingDays
      : isActionable
        ? computeRemainingDays(app.createdDate, slaDays)
        : null;

  const dueDays = app.dueDays ?? null;

  const overdueDays =
    app.overdueDays != null
      ? app.overdueDays
      : isActionable
        ? computeOverdueDays(app.createdDate, slaDays)
        : null;

  const remarks = app.remark || '—';
  const currentStageName = app.applicationStatus
    ? app.applicationStatus.charAt(0).toUpperCase() + app.applicationStatus.slice(1)
    : 'Pending';
  const officerFullName = [app.officerFirstName, app.officerLastName]
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name))
    .join(' ');
  const assignedToStr = app.userName?.trim() || '—';
  const assignedToName = officerFullName || assignedToStr;

  return {
    source: 'approval',
    applicationId: app.id,
    applicationNo: app.applicationNo,
    propertyNo: app.propertyNo?.trim() || null,
    upicId: app.upicId?.trim() || null,
    applicationDate: app.createdDate,
    applicantName: app.applicantName?.trim() || '—',
    serviceName: app.serviceName || 'Unknown Service',
    serviceNameLocal: app.serviceNameLocal?.trim() || null,
    departmentName: app.departmentName || 'Unknown Department',
    departmentNameLocal: app.departmentNameLocal?.trim() || null,
    currentStatus: app.applicationStatus,
    currentStageName,
    remarks,
    expectedSlaDays: slaDays,
    remainingDays,
    dueDays,
    overdueDays,
    lastUpdatedDate: app.updatedDate || app.createdDate,
    assignedTo: assignedToStr,
    assignedToName,
    assignedToRole: '',
    assignedUserId: app.userId ?? null,
  };
}

/**
 * 2. Fetch Applications Report Data (Flexible Page Size)
 */
export async function getRtsApplicationsReportDataAction(
  filters: Partial<RtsApplicationsDashboardFilters> = {},
  pageNumber = 1,
  pageSize = 25
): Promise<{
  rows: AdminApplicationGridRow[];
  totalCount: number;
  totalPages: number;
}> {
  try {
    const pagedResult = await getApprovalApplicationsPaged({
      pageNumber,
      pageSize,
      departmentId: filters.departmentId,
      serviceId: filters.serviceId,
      search: filters.search,
      applicationNo: filters.applicationNo,
      status: filters.status,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    if (pagedResult && Array.isArray(pagedResult.applications) && pagedResult.applications.length > 0) {
      const rows = pagedResult.applications.map(mapApprovalAppToGridRow);
      const totalCount = pagedResult.totalCount ?? rows.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

      return {
        rows,
        totalCount,
        totalPages,
      };
    }
  } catch (err) {
    console.warn('getApprovalApplicationsPaged failed, falling back to dashboard action:', err);
  }

  // Fallback to getRtsApplicationsDashboardAction
  const result = await getRtsApplicationsDashboardAction({
    ...filters,
    pageNumber,
  });

  const totalCount = result.pagination?.totalCount ?? result.rows.length;
  const totalPages = result.pagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    rows: result.rows,
    totalCount,
    totalPages,
  };
}

/**
 * 3. Fetch Full Applications Data for Export (up to 10,000)
 */
export async function getAllApplicationsForExportAction(
  filters: Partial<RtsApplicationsDashboardFilters> = {}
): Promise<AdminApplicationGridRow[]> {
  try {
    const pagedResult = await getApprovalApplicationsPaged({
      pageNumber: 1,
      pageSize: 5000,
      departmentId: filters.departmentId,
      serviceId: filters.serviceId,
      search: filters.search,
      applicationNo: filters.applicationNo,
      status: filters.status,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    if (pagedResult && Array.isArray(pagedResult.applications) && pagedResult.applications.length > 0) {
      return pagedResult.applications.map(mapApprovalAppToGridRow);
    }
  } catch (err) {
    console.warn('getAllApplicationsForExportAction approval paged error:', err);
  }

  const result = await getRtsApplicationsDashboardAction({
    ...filters,
    pageNumber: 1,
  });
  return result.rows;
}

/**
 * 4. Fetch Collections & Settlement Report Data
 */
export async function getRtsCollectionsReportDataAction(
  query: PendingClearanceQuery
): Promise<{
  items: PendingClearanceItem[];
  totalCount: number;
  totalPages: number;
  totalAmount: number;
}> {
  try {
    const res = await getPendingClearancePayments(query);
    const items = res.items || [];
    const totalAmount = res.totalAmount ?? items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);

    return {
      items,
      totalCount: res.totalCount || items.length,
      totalPages: res.totalPages || Math.max(1, Math.ceil((res.totalCount || items.length) / (query.pageSize || 25))),
      totalAmount,
    };
  } catch (err) {
    console.error('Error fetching clearance payments:', err);
    return {
      items: [],
      totalCount: 0,
      totalPages: 1,
      totalAmount: 0,
    };
  }
}

/**
 * 5. Fetch Full Collections / Settlement Data for Export (up to 10,000)
 */
export async function getAllCollectionsForExportAction(
  query: Omit<PendingClearanceQuery, 'pageNumber' | 'pageSize'>
): Promise<PendingClearanceItem[]> {
  try {
    const res = await getPendingClearancePayments({
      ...query,
      pageNumber: 1,
      pageSize: 10000,
    });
    return res.items || [];
  } catch (err) {
    console.error('Error fetching all collections for export:', err);
    return [];
  }
}

/**
 * 6. Generate Department & Service MIS Summary Report Data
 */
export async function getRtsDepartmentSummaryReportDataAction(
  departmentId?: number,
  fromDate?: string,
  toDate?: string
): Promise<DepartmentSummaryReportItem[]> {
  try {
    const [appsResult, clearanceResult] = await Promise.all([
      getApprovalApplicationsPaged({
        pageNumber: 1,
        pageSize: 5000,
        departmentId,
        fromDate,
        toDate,
      }).catch(() => null),
      getPendingClearancePayments({
        fromDate,
        toDate,
        pageNumber: 1,
        pageSize: 10000,
      }).catch(() => null),
    ]);

    const apps: AdminApplicationGridRow[] =
      appsResult?.applications && appsResult.applications.length > 0
        ? appsResult.applications.map(mapApprovalAppToGridRow)
        : (await getRtsApplicationsDashboardAction({ departmentId, fromDate, toDate, pageNumber: 1 })).rows || [];

    const payments = clearanceResult?.items || [];

    const groupMap = new Map<string, DepartmentSummaryReportItem>();

    apps.forEach((app) => {
      const deptName = app.departmentName || 'General Administration';
      const svcName = app.serviceName || 'Standard Service';
      const key = `${deptName}___${svcName}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          departmentName: deptName,
          departmentNameLocal: app.departmentNameLocal || undefined,
          serviceName: svcName,
          serviceNameLocal: app.serviceNameLocal || undefined,
          totalApplications: 0,
          approvedCount: 0,
          approvedPercentage: 0,
          pendingCount: 0,
          rejectedCount: 0,
          overdueCount: 0,
          slaAdherencePercentage: 100,
          totalCollectionAmount: 0,
        });
      }

      const item = groupMap.get(key)!;
      item.totalApplications += 1;

      const status = (app.currentStatus || '').toLowerCase();
      if (status.includes('approved') || status.includes('completed')) {
        item.approvedCount += 1;
      } else if (status.includes('reject')) {
        item.rejectedCount += 1;
      } else {
        item.pendingCount += 1;
      }

      if (app.overdueDays && app.overdueDays > 0) {
        item.overdueCount += 1;
      }
    });

    payments.forEach((pay) => {
      const deptName = pay.departmentName || 'General Administration';
      const svcName = pay.serviceName || 'Standard Service';
      const key = `${deptName}___${svcName}`;

      if (groupMap.has(key)) {
        const item = groupMap.get(key)!;
        item.totalCollectionAmount = (item.totalCollectionAmount || 0) + (Number(pay.totalAmount) || 0);
      }
    });

    const summaryItems: DepartmentSummaryReportItem[] = [];
    let idx = 1;
    groupMap.forEach((item) => {
      item.srNo = idx++;
      if (item.totalApplications > 0) {
        item.approvedPercentage = Math.round((item.approvedCount / item.totalApplications) * 100);
        const adherentCount = Math.max(0, item.totalApplications - item.overdueCount);
        item.slaAdherencePercentage = Math.round((adherentCount / item.totalApplications) * 100);
      }
      summaryItems.push(item);
    });

    return summaryItems.sort((a, b) => b.totalApplications - a.totalApplications);
  } catch (err) {
    console.error('Error generating RTS Department Summary Report data:', err);
    return [];
  }
}

/**
 * 7. Fetch Appeals Report Data for Grid
 */
export async function getRtsAppealsReportDataAction(
  params: RTSAppealQueryParameters = {}
): Promise<{
  items: RTSAppealDashboardDetailsDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}> {
  try {
    const res = await getAppealDashboardGrid(params);
    const totalCount = res.totalCount || 0;
    const pageSize = params.pageSize || 25;
    return {
      items: res.items || [],
      totalCount,
      pageNumber: params.pageNumber || 1,
      pageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    };
  } catch (err) {
    console.error('Error fetching appeals report data:', err);
    return {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 25,
      totalPages: 1,
    };
  }
}

/**
 * 8. Fetch Full Appeals Data for Export (up to 10,000)
 */
export async function getAllAppealsForExportAction(
  params: RTSAppealQueryParameters = {}
): Promise<RTSAppealDashboardDetailsDto[]> {
  try {
    const res = await getAppealDashboardGrid({
      ...params,
      pageNumber: 1,
      pageSize: 10000,
    });
    return res.items || [];
  } catch (err) {
    console.error('Error fetching all appeals for export:', err);
    return [];
  }
}

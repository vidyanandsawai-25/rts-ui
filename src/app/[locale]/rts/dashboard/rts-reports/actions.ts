'use server';

import {
  getRtsApplicationsDashboardAction,
  getRtsApplicationFilterOptionsAction,
  type AdminApplicationGridRow,
  type RtsApplicationsDashboardFilterInput,
} from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import {
  getPendingClearancePaymentsAction,
  getBanksAction,
  getClearanceStatsAction,
} from '@/app/[locale]/service/payment/actions';
import type { PendingClearanceItem, PendingClearanceQuery } from '@/types/rts/payment.types';
import type { DepartmentSummaryReportItem } from '@/lib/utils/rts/report-engine/rtsDomainReports';

export interface RtsReportsFilterOptions {
  departments: Array<{ id: number; departmentName: string; departmentNameLocal?: string | null }>;
  services: Array<{ id: number; serviceName: string; serviceNameLocal?: string | null; departmentId?: number }>;
  banks: Array<{ id: number; bankName: string; ifscCode?: string }>;
}

/**
 * 1. Load initial lookups for filter bars
 */
export async function getRtsReportsLookupsAction(): Promise<RtsReportsFilterOptions> {
  const [filterOpts, banksRes] = await Promise.all([
    getRtsApplicationFilterOptionsAction().catch(() => ({ departments: [], services: [] })),
    getBanksAction().catch(() => ({ success: false, data: [] })),
  ]);

  return {
    departments: filterOpts.departments || [],
    services: filterOpts.services || [],
    banks: banksRes.success && banksRes.data ? banksRes.data : [],
  };
}

/**
 * 2. Fetch Applications Report Data
 */
export async function getRtsApplicationsReportDataAction(
  filters: Partial<RtsApplicationsDashboardFilterInput> = {},
  pageNumber = 1,
  pageSize = 25
): Promise<{
  rows: AdminApplicationGridRow[];
  totalCount: number;
  totalPages: number;
}> {
  const result = await getRtsApplicationsDashboardAction({
    ...filters,
    pageNumber,
    pageSize,
  });

  return {
    rows: result.rows,
    totalCount: result.totalCount,
    totalPages: Math.max(1, Math.ceil(result.totalCount / pageSize)),
  };
}

/**
 * 3. Fetch Full Applications Data for Export (up to 10,000)
 */
export async function getAllApplicationsForExportAction(
  filters: Partial<RtsApplicationsDashboardFilterInput> = {}
): Promise<AdminApplicationGridRow[]> {
  const result = await getRtsApplicationsDashboardAction({
    ...filters,
    pageNumber: 1,
    pageSize: 10000,
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
  const res = await getPendingClearancePaymentsAction(query);
  if (!res.success || !res.data) {
    return {
      items: [],
      totalCount: 0,
      totalPages: 1,
      totalAmount: 0,
    };
  }

  const items = res.data.items || [];
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);

  return {
    items,
    totalCount: res.data.totalCount || items.length,
    totalPages: res.data.totalPages || 1,
    totalAmount,
  };
}

/**
 * 5. Fetch Full Collections / Settlement Data for Export (up to 10,000)
 */
export async function getAllCollectionsForExportAction(
  query: Omit<PendingClearanceQuery, 'pageNumber' | 'pageSize'>
): Promise<PendingClearanceItem[]> {
  const res = await getPendingClearancePaymentsAction({
    ...query,
    pageNumber: 1,
    pageSize: 10000,
  });
  return res.success && res.data?.items ? res.data.items : [];
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
    // Fetch applications and clearance payments to aggregate live departmental summaries
    const [appsResult, clearanceResult] = await Promise.all([
      getRtsApplicationsDashboardAction({
        departmentId,
        fromDate,
        toDate,
        pageNumber: 1,
        pageSize: 10000,
      }),
      getPendingClearancePaymentsAction({
        fromDate,
        toDate,
        pageNumber: 1,
        pageSize: 10000,
      }),
    ]);

    const apps = appsResult.rows || [];
    const payments = clearanceResult.success && clearanceResult.data?.items ? clearanceResult.data.items : [];

    // Group by Department + Service
    const groupMap = new Map<string, DepartmentSummaryReportItem>();

    apps.forEach((app) => {
      const deptName = app.departmentName || 'General Administration';
      const svcName = app.serviceName || 'Standard Service';
      const key = `${deptName}___${svcName}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          departmentName: deptName,
          serviceName: svcName,
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

    // Map payments to department collections
    payments.forEach((pay) => {
      const deptName = pay.departmentName || 'General Administration';
      const svcName = pay.serviceName || 'Standard Service';
      const key = `${deptName}___${svcName}`;

      if (groupMap.has(key)) {
        const item = groupMap.get(key)!;
        item.totalCollectionAmount = (item.totalCollectionAmount || 0) + (Number(pay.totalAmount) || 0);
      }
    });

    // Compute percentages
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

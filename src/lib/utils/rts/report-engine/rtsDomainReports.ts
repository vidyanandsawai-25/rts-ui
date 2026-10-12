import {
  exportRtsReportToExcel,
  exportRtsReportToCsv,
  exportRtsReportToPdf,
  RtsReportColumn,
  RtsReportConfig,
} from './rtsReportEngine';
import type { AdminApplicationGridRow } from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { PendingClearanceItemDto } from '@/types/rts/payment.types';

export type ReportExportFormat = 'excel' | 'csv' | 'pdf';

export interface RtsApplicationExportOptions {
  fileName?: string;
  departmentName?: string;
  appliedFilters?: Record<string, string | number | boolean | null | undefined>;
  format: ReportExportFormat;
  officerName?: string;
}

export interface RtsSettlementExportOptions {
  fileName?: string;
  appliedFilters?: Record<string, string | number | boolean | null | undefined>;
  format: ReportExportFormat;
  officerName?: string;
}

/**
 * 1. RTS Applications Report Exporter
 */
export function exportRtsApplications(
  data: AdminApplicationGridRow[],
  options: RtsApplicationExportOptions
) {
  const columns: RtsReportColumn<AdminApplicationGridRow>[] = [
    {
      header: 'Sr. No.',
      key: 'id',
      width: 8,
      align: 'center',
      formatter: (_val, _row, index) => index + 1,
    },
    {
      header: 'Application No.',
      key: 'applicationNo',
      width: 18,
      align: 'left',
      formatter: (val, row) => String(val || `RTS${row.applicationId}`),
    },
    {
      header: 'Application Date',
      key: 'applicationDate',
      width: 18,
      align: 'center',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Applicant Name',
      key: 'applicantName',
      width: 25,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Service Name',
      key: 'serviceName',
      width: 32,
      align: 'left',
      formatter: (val, row) => String(row.serviceNameLocal || val || '—'),
    },
    {
      header: 'Department',
      key: 'departmentName',
      width: 22,
      align: 'left',
      formatter: (val, row) => String(row.departmentNameLocal || val || '—'),
    },
    {
      header: 'Current Status',
      key: 'currentStatus',
      width: 18,
      align: 'center',
      formatter: (val) => String(val || 'Pending'),
    },
    {
      header: 'Assigned Officer',
      key: 'assignedTo',
      width: 24,
      align: 'left',
      formatter: (val, row) => {
        const name = row.assignedToName || val || '—';
        const role = row.assignedToRole ? ` (${row.assignedToRole})` : '';
        return `${name}${role}`;
      },
    },
    {
      header: 'SLA (Days)',
      key: 'expectedSlaDays',
      width: 12,
      align: 'center',
      formatter: (val) => (val ? `${val} Days` : '7 Days'),
    },
    {
      header: 'Days Remaining / Overdue',
      key: 'remainingDays',
      width: 22,
      align: 'center',
      formatter: (val, row) => {
        if (row.overdueDays && row.overdueDays > 0) {
          return `${row.overdueDays} Days Overdue`;
        }
        if (val !== null && val !== undefined) {
          return `${val} Days Remaining`;
        }
        return '—';
      },
    },
    {
      header: 'Remarks',
      key: 'remarks',
      width: 30,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
  ];

  const config: RtsReportConfig<AdminApplicationGridRow> = {
    fileName: options.fileName || `RTS_Applications_Report_${new Date().toISOString().slice(0, 10)}`,
    metadata: {
      title: 'RTS Applications & SLA Timeline Report (अर्जनिहाय अहवाल)',
      subtitle: 'Right to Public Services Act 2015 Compliance Monitoring',
      department: options.departmentName,
      generatedBy: options.officerName || 'RTS Officer',
      appliedFilters: options.appliedFilters,
      totalRecords: data.length,
    },
    columns,
    data,
  };

  if (options.format === 'excel') {
    exportRtsReportToExcel(config);
  } else if (options.format === 'csv') {
    exportRtsReportToCsv(config);
  } else if (options.format === 'pdf') {
    exportRtsReportToPdf(config);
  }
}

/**
 * 2. RTS Payment Settlement & Clearance Report Exporter
 */
export function exportRtsPaymentSettlement(
  data: PendingClearanceItemDto[],
  options: RtsSettlementExportOptions
) {
  const columns: RtsReportColumn<PendingClearanceItemDto>[] = [
    {
      header: 'Sr. No.',
      key: 'transactionId',
      width: 8,
      align: 'center',
      formatter: (_val, _row, index) => index + 1,
    },
    {
      header: 'Application No.',
      key: 'applicationNo',
      width: 18,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Receipt No.',
      key: 'receiptNo',
      width: 18,
      align: 'center',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Citizen Name',
      key: 'citizenName',
      width: 24,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Service Name',
      key: 'serviceName',
      width: 30,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Payment Mode',
      key: 'paymentMode',
      width: 15,
      align: 'center',
      formatter: (val) => String(val || '—').toUpperCase(),
    },
    {
      header: 'Amount (₹)',
      key: 'totalAmount',
      width: 15,
      align: 'right',
      formatter: (val) => Number(val ?? 0),
    },
    {
      header: 'Instrument No.',
      key: 'instrumentNo',
      width: 16,
      align: 'center',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Instrument Date',
      key: 'instrumentDate',
      width: 16,
      align: 'center',
      formatter: (val) => {
        if (!val) return '—';
        try {
          return new Date(String(val)).toLocaleDateString('en-IN');
        } catch {
          return String(val);
        }
      },
    },
    {
      header: 'Bank Name',
      key: 'bankName',
      width: 24,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Branch',
      key: 'branchName',
      width: 18,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Clearance Date',
      key: 'clearanceDate',
      width: 16,
      align: 'center',
      formatter: (val) => {
        if (!val) return '—';
        try {
          return new Date(String(val)).toLocaleDateString('en-IN');
        } catch {
          return String(val);
        }
      },
    },
    {
      header: 'Approval Status',
      key: 'approvalStatus',
      width: 16,
      align: 'center',
      formatter: (val) => String(val || 'PENDING').toUpperCase(),
    },
    {
      header: 'Remarks / Reason',
      key: 'approvalRemarks',
      width: 28,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
  ];

  const totalAmount = data.reduce((acc, row) => acc + (Number(row.totalAmount) || 0), 0);

  const config: RtsReportConfig<PendingClearanceItemDto> = {
    fileName: options.fileName || `RTS_Payment_Settlement_${new Date().toISOString().slice(0, 10)}`,
    metadata: {
      title: 'RTS Payment Settlement & Clearance Audit Statement (पेमेंट सेटलमेंट अहवाल)',
      subtitle: 'Accounts & Clearing House Offline/Online Reconciliations',
      generatedBy: options.officerName || 'Accounts Officer',
      appliedFilters: options.appliedFilters,
      totalRecords: data.length,
      totalAmount,
    },
    columns,
    data,
  };

  if (options.format === 'excel') {
    exportRtsReportToExcel(config);
  } else if (options.format === 'csv') {
    exportRtsReportToCsv(config);
  } else if (options.format === 'pdf') {
    exportRtsReportToPdf(config);
  }
}

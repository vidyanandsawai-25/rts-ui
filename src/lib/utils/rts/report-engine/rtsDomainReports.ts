import {
  exportRtsReportToExcel,
  exportRtsReportToCsv,
  exportRtsReportToPdf,
  RtsReportColumn,
  RtsReportConfig,
} from './rtsReportEngine';
import type { AdminApplicationGridRow } from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { PendingClearanceItem as PendingClearanceItemDto } from '@/lib/api/rts/rtspayment.service';
import type { RTSAppealDashboardDetailsDto } from '@/types/rts/appeal.types';

export type ReportExportFormat = 'excel' | 'csv' | 'pdf';

export interface BaseReportExportOptions {
  fileName?: string;
  appliedFilters?: Record<string, string | number | boolean | null | undefined>;
  format: ReportExportFormat;
  officerName?: string;
  visibleColumnKeys?: string[];
}

export interface RtsApplicationExportOptions extends BaseReportExportOptions {
  departmentName?: string;
}

export interface RtsSettlementExportOptions extends BaseReportExportOptions {}

export interface RtsCollectionExportOptions extends BaseReportExportOptions {
  departmentName?: string;
}

export interface RtsSlaExportOptions extends BaseReportExportOptions {
  departmentName?: string;
}

export interface RtsAppealsExportOptions extends BaseReportExportOptions {
  departmentName?: string;
}

export interface DepartmentSummaryReportItem {
  srNo?: number;
  departmentName: string;
  departmentNameLocal?: string;
  serviceName?: string;
  serviceNameLocal?: string;
  totalApplications: number;
  approvedCount: number;
  approvedPercentage: number;
  pendingCount: number;
  rejectedCount: number;
  overdueCount: number;
  slaAdherencePercentage: number;
  totalCollectionAmount?: number;
}

export interface RtsDepartmentSummaryExportOptions extends BaseReportExportOptions {}

/**
 * Filter columns by visibleColumnKeys if provided
 */
function applyVisibleColumns<T>(columns: RtsReportColumn<T>[], visibleKeys?: string[]): RtsReportColumn<T>[] {
  if (!visibleKeys || visibleKeys.length === 0) return columns;
  return columns.filter((col) => visibleKeys.includes(String(col.key)));
}

/**
 * 1. RTS Applications Master Register Report Exporter
 */
export function exportRtsApplications(
  data: AdminApplicationGridRow[],
  options: RtsApplicationExportOptions
) {
  const allColumns: RtsReportColumn<AdminApplicationGridRow>[] = [
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
      width: 20,
      align: 'left',
      formatter: (val, row) => String(val || `RTS${row.applicationId}`),
    },
    {
      header: 'Application Date',
      key: 'applicationDate',
      width: 18,
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
      header: 'Applicant Name',
      key: 'applicantName',
      width: 26,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Service',
      key: 'serviceName',
      width: 32,
      align: 'left',
      formatter: (val, row) => String(row.serviceNameLocal || val || '—'),
    },
    {
      header: 'Department',
      key: 'departmentName',
      width: 24,
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
      width: 24,
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
      header: 'Property No / UPIC',
      key: 'propertyNo',
      width: 20,
      align: 'center',
      formatter: (_val, row) => row.propertyNo || row.upicId || '—',
    },
    {
      header: 'Remarks',
      key: 'remarks',
      width: 30,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
  ];

  const columns = applyVisibleColumns(allColumns, options.visibleColumnKeys);

  const config: RtsReportConfig<AdminApplicationGridRow> = {
    fileName: options.fileName || `RTS_Applications_Report_${new Date().toISOString().slice(0, 10)}`,
    metadata: {
      title: 'RTS Applications & SLA Timeline Register (अर्जनिहाय अहवाल)',
      subtitle: 'Right to Public Services Act 2015 Compliance Monitoring Register',
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
 * 2. RTS Payment Settlement & Clearance Audit Statement
 */
export function exportRtsPaymentSettlement(
  data: PendingClearanceItemDto[],
  options: RtsSettlementExportOptions
) {
  const allColumns: RtsReportColumn<PendingClearanceItemDto>[] = [
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
      width: 16,
      align: 'center',
      formatter: (val) => String(val || '—').toUpperCase(),
    },
    {
      header: 'Amount (₹)',
      key: 'totalAmount',
      width: 16,
      align: 'right',
      formatter: (val) => Number(val ?? 0),
    },
    {
      header: 'Instrument / Cheque No.',
      key: 'instrumentNo',
      width: 18,
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
      formatter: (val, row) => String(val || row.paymentStatus || 'PENDING').toUpperCase(),
    },
    {
      header: 'Remarks / Reason',
      key: 'remarks',
      width: 28,
      align: 'left',
      formatter: (val, row) => String(val || row.failureReason || row.cancellationReason || '—'),
    },
  ];

  const columns = applyVisibleColumns(allColumns, options.visibleColumnKeys);
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

/**
 * 3. RTS Revenue & Fee Collection Register Exporter (महसूल संकलन व भरणा अहवाल)
 */
export function exportRtsCollections(
  data: PendingClearanceItemDto[],
  options: RtsCollectionExportOptions
) {
  const allColumns: RtsReportColumn<PendingClearanceItemDto>[] = [
    {
      header: 'Sr. No.',
      key: 'transactionId',
      width: 8,
      align: 'center',
      formatter: (_val, _row, index) => index + 1,
    },
    {
      header: 'Receipt No.',
      key: 'receiptNo',
      width: 18,
      align: 'center',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Receipt Date',
      key: 'createdDate',
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
      header: 'Application No.',
      key: 'applicationNo',
      width: 18,
      align: 'left',
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
      header: 'Department',
      key: 'departmentName',
      width: 24,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Service Name',
      key: 'serviceName',
      width: 28,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Payment Mode',
      key: 'paymentMode',
      width: 16,
      align: 'center',
      formatter: (val) => String(val || '—').toUpperCase(),
    },
    {
      header: 'Fee Amount (₹)',
      key: 'totalAmount',
      width: 16,
      align: 'right',
      formatter: (val) => Number(val ?? 0),
    },
    {
      header: 'Bank / Gateway',
      key: 'bankName',
      width: 22,
      align: 'left',
      formatter: (val, row) => String(val || row.gatewayPaymentId || 'Cash Counter'),
    },
    {
      header: 'Instrument / Cheque No.',
      key: 'instrumentNo',
      width: 18,
      align: 'center',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Collection Status',
      key: 'paymentStatus',
      width: 18,
      align: 'center',
      formatter: (val, row) => (row.isReceiptCancelled ? 'CANCELLED' : String(val || 'PAID').toUpperCase()),
    },
  ];

  const columns = applyVisibleColumns(allColumns, options.visibleColumnKeys);
  const totalAmount = data.reduce((acc, row) => acc + (Number(row.totalAmount) || 0), 0);

  const config: RtsReportConfig<PendingClearanceItemDto> = {
    fileName: options.fileName || `RTS_Collection_Report_${new Date().toISOString().slice(0, 10)}`,
    metadata: {
      title: 'RTS Municipal Revenue & Fee Collection Register (महसूल संकलन अहवाल)',
      subtitle: 'Akola Municipal Corporation - Revenue Settlement & Counter Cash/Online Receipts',
      department: options.departmentName,
      generatedBy: options.officerName || 'Chief Accounts Officer',
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

/**
 * 4. RTS SLA & Timeline Compliance Exporter (सेवा हमी कायदा मुदत व विलंब अहवाल)
 */
export function exportRtsSlaCompliance(
  data: AdminApplicationGridRow[],
  options: RtsSlaExportOptions
) {
  const allColumns: RtsReportColumn<AdminApplicationGridRow>[] = [
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
      width: 20,
      align: 'left',
      formatter: (val, row) => String(val || `RTS${row.applicationId}`),
    },
    {
      header: 'Applicant Name',
      key: 'applicantName',
      width: 26,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Department',
      key: 'departmentName',
      width: 22,
      align: 'left',
      formatter: (val, row) => String(row.departmentNameLocal || val || '—'),
    },
    {
      header: 'Service Name',
      key: 'serviceName',
      width: 30,
      align: 'left',
      formatter: (val, row) => String(row.serviceNameLocal || val || '—'),
    },
    {
      header: 'Mandated SLA (Days)',
      key: 'expectedSlaDays',
      width: 16,
      align: 'center',
      formatter: (val) => (val ? `${val} Days` : '7 Days'),
    },
    {
      header: 'Days Elapsed / Status',
      key: 'overdueDays',
      width: 20,
      align: 'center',
      formatter: (_val, row) => {
        if (row.overdueDays && row.overdueDays > 0) {
          return `BREACHED (${row.overdueDays} Days Overdue)`;
        }
        if (row.dueDays === 0 || row.remainingDays === 0) {
          return 'DUE TODAY';
        }
        if (row.remainingDays !== null && row.remainingDays !== undefined) {
          return `ON TRACK (${row.remainingDays} Days Left)`;
        }
        return 'COMPLIANT';
      },
    },
    {
      header: 'Current Workflow Stage',
      key: 'currentStatus',
      width: 18,
      align: 'center',
      formatter: (val) => String(val || 'In Process'),
    },
    {
      header: 'Designated Officer',
      key: 'assignedTo',
      width: 24,
      align: 'left',
      formatter: (val, row) => String(row.assignedToName || val || '—'),
    },
    {
      header: 'Remarks / Delay Reason',
      key: 'remarks',
      width: 30,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
  ];

  const columns = applyVisibleColumns(allColumns, options.visibleColumnKeys);

  const config: RtsReportConfig<AdminApplicationGridRow> = {
    fileName: options.fileName || `RTS_SLA_Compliance_Report_${new Date().toISOString().slice(0, 10)}`,
    metadata: {
      title: 'Maharashtra Right to Public Services Act 2015 - SLA Compliance Report',
      subtitle: 'लोकसेवा हक्क कायदा २०१५ विहित मुदत पालन व विलंब आढावा अहवाल',
      department: options.departmentName,
      generatedBy: options.officerName || 'Appellate Authority Officer',
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
 * 5. RTS Department & Service MIS Summary Exporter (विभाग व सेवानिहाय सारांश अहवाल)
 */
export function exportRtsDepartmentSummary(
  data: DepartmentSummaryReportItem[],
  options: RtsDepartmentSummaryExportOptions
) {
  const allColumns: RtsReportColumn<DepartmentSummaryReportItem>[] = [
    {
      header: 'Sr. No.',
      key: 'srNo',
      width: 8,
      align: 'center',
      formatter: (_val, _row, index) => index + 1,
    },
    {
      header: 'Department Name',
      key: 'departmentName',
      width: 28,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Service Name',
      key: 'serviceName',
      width: 32,
      align: 'left',
      formatter: (val) => String(val || 'All Services'),
    },
    {
      header: 'Total Applications',
      key: 'totalApplications',
      width: 18,
      align: 'center',
      formatter: (val) => Number(val ?? 0),
    },
    {
      header: 'Approved',
      key: 'approvedCount',
      width: 14,
      align: 'center',
      formatter: (val) => Number(val ?? 0),
    },
    {
      header: 'Approval Rate (%)',
      key: 'approvedPercentage',
      width: 16,
      align: 'center',
      formatter: (val) => `${Number(val ?? 0)}%`,
    },
    {
      header: 'Pending / In-Process',
      key: 'pendingCount',
      width: 18,
      align: 'center',
      formatter: (val) => Number(val ?? 0),
    },
    {
      header: 'Rejected',
      key: 'rejectedCount',
      width: 14,
      align: 'center',
      formatter: (val) => Number(val ?? 0),
    },
    {
      header: 'SLA Breached / Overdue',
      key: 'overdueCount',
      width: 18,
      align: 'center',
      formatter: (val) => Number(val ?? 0),
    },
    {
      header: 'SLA Compliance (%)',
      key: 'slaAdherencePercentage',
      width: 18,
      align: 'center',
      formatter: (val) => `${Number(val ?? 0)}%`,
    },
    {
      header: 'Total Fee Revenue (₹)',
      key: 'totalCollectionAmount',
      width: 20,
      align: 'right',
      formatter: (val) => Number(val ?? 0),
    },
  ];

  const columns = applyVisibleColumns(allColumns, options.visibleColumnKeys);
  const totalAmount = data.reduce((acc, row) => acc + (Number(row.totalCollectionAmount) || 0), 0);

  const config: RtsReportConfig<DepartmentSummaryReportItem> = {
    fileName: options.fileName || `RTS_Department_MIS_Summary_${new Date().toISOString().slice(0, 10)}`,
    metadata: {
      title: 'RTS Departmental MIS Performance & Revenue Summary Report',
      subtitle: 'विभाग व सेवानिहाय एकत्रित कार्यक्षमता व महसूल सारांश अहवाल',
      generatedBy: options.officerName || 'Municipal Commissioner / RTS Head',
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

/**
 * 6. RTS Appeals Register & Adjudication Report Exporter
 */
export function exportRtsAppeals(
  data: RTSAppealDashboardDetailsDto[],
  options: RtsAppealsExportOptions
) {
  const allColumns: RtsReportColumn<RTSAppealDashboardDetailsDto>[] = [
    {
      header: 'Sr. No.',
      key: 'id',
      width: 8,
      align: 'center',
      formatter: (_val, _row, index) => index + 1,
    },
    {
      header: 'Appeal No.',
      key: 'appealNo',
      width: 20,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Original Application No.',
      key: 'applicationNo',
      width: 20,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Applicant Name',
      key: 'applicantName',
      width: 24,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Mobile',
      key: 'mobileNumber',
      width: 15,
      align: 'center',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Department',
      key: 'departmentName',
      width: 22,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Service',
      key: 'serviceName',
      width: 26,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Appeal Tier',
      key: 'appealLevelDisplay',
      width: 14,
      align: 'center',
      formatter: (_val, row) => row.appealLevelDisplay || (row.appealLevel === 2 ? '2nd Appeal' : '1st Appeal'),
    },
    {
      header: 'Statutory Ground',
      key: 'appealTypeName',
      width: 18,
      align: 'center',
      formatter: (val) => String(val || '—'),
    },
    {
      header: 'Filing Date',
      key: 'filingDate',
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
      header: 'Appeal Status',
      key: 'appealStatus',
      width: 16,
      align: 'center',
      formatter: (val) => String(val || 'Submitted'),
    },
    {
      header: 'Delay Condonation Required',
      key: 'isDelayed',
      width: 20,
      align: 'center',
      formatter: (val) => (val ? 'Yes (Section 18)' : 'No'),
    },
    {
      header: 'Officer Speaking Order / Remarks',
      key: 'actionRemarks',
      width: 30,
      align: 'left',
      formatter: (val) => String(val || '—'),
    },
  ];

  const columns = applyVisibleColumns(allColumns, options.visibleColumnKeys);

  const config: RtsReportConfig<RTSAppealDashboardDetailsDto> = {
    fileName: options.fileName || `RTS_Appeals_Register_${new Date().toISOString().slice(0, 10)}`,
    metadata: {
      title: 'RTS Statutory Appeals Register & Adjudication Report (अपील नोंदवही अहवाल)',
      subtitle: 'Maharashtra Right to Public Services Act (MRTSA 2015) Appellate Adjudication Compliance',
      generatedBy: options.officerName || 'Appellate Authority Officer',
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

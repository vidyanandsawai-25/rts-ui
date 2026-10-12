'use client';

import React, { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  FileText,
  FileCode,
  Download,
  Filter,
  Eye,
  RefreshCw,
  Search,
  Calendar,
  Building2,
  Briefcase,
  IndianRupee,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  CreditCard,
  Building,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  Button,
} from '@/components/common';
import RtsExportDropdown from '@/components/modules/rts/reports/RtsExportDropdown';
import {
  exportRtsApplications,
  exportRtsPaymentSettlement,
  exportRtsCollections,
  exportRtsSlaCompliance,
  exportRtsDepartmentSummary,
  type ReportExportFormat,
  type DepartmentSummaryReportItem,
} from '@/lib/utils/rts/report-engine/rtsDomainReports';
import {
  getRtsReportsLookupsAction,
  getRtsApplicationsReportDataAction,
  getAllApplicationsForExportAction,
  getRtsCollectionsReportDataAction,
  getAllCollectionsForExportAction,
  getRtsDepartmentSummaryReportDataAction,
  type RtsReportsFilterOptions,
} from '@/app/[locale]/rts/dashboard/rts-reports/actions';
import type { AdminApplicationGridRow } from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { PendingClearanceItem } from '@/types/rts/payment.types';

export type ReportDomain =
  | 'COLLECTIONS'
  | 'APPLICATIONS'
  | 'SLA_COMPLIANCE'
  | 'SETTLEMENT'
  | 'DEPARTMENT_SUMMARY';

interface ColumnDef {
  key: string;
  label: string;
  defaultVisible: boolean;
  align?: 'left' | 'center' | 'right';
  isNumeric?: boolean;
}

export default function RtsReportsCenterDashboard({ locale = 'mr' }: { locale?: string }) {
  const [, startTransition] = useTransition();

  // 1. Report Domain Selection
  const [activeDomain, setActiveDomain] = useState<ReportDomain>('COLLECTIONS');

  // 2. Filter Bar State
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [selectedBankId, setSelectedBankId] = useState<string>('ALL');
  const [selectedSla, setSelectedSla] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');
  const [datePreset, setDatePreset] = useState<string>('ALL');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // 3. Grid Data States
  const [applicationRows, setApplicationRows] = useState<AdminApplicationGridRow[]>([]);
  const [collectionItems, setCollectionItems] = useState<PendingClearanceItem[]>([]);
  const [summaryItems, setSummaryItems] = useState<DepartmentSummaryReportItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // 4. Sorting State
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 5. Lookups
  const [lookups, setLookups] = useState<RtsReportsFilterOptions>({
    departments: [],
    services: [],
    banks: [],
  });

  // Load Filter Lookups on Mount
  useEffect(() => {
    async function loadLookups() {
      try {
        const res = await getRtsReportsLookupsAction();
        setLookups(res);
      } catch (err) {
        console.error('Failed to load report lookups:', err);
      }
    }
    loadLookups();
  }, []);

  // Filtered Services according to selected department
  const filteredServices = useMemo(() => {
    if (selectedDeptId === 'ALL') return lookups.services;
    const deptIdNum = Number(selectedDeptId);
    return lookups.services.filter((s) => s.departmentId === deptIdNum);
  }, [lookups.services, selectedDeptId]);

  // 6. Column Definitions per Domain
  const domainColumnsMap = useMemo<Record<ReportDomain, ColumnDef[]>>(() => {
    return {
      COLLECTIONS: [
        { key: 'srNo', label: 'Sr. No.', defaultVisible: true, align: 'center' },
        { key: 'receiptNo', label: 'Receipt No. (पावती क्र.)', defaultVisible: true, align: 'center' },
        { key: 'createdDate', label: 'Receipt Date (तारीख)', defaultVisible: true, align: 'center' },
        { key: 'applicationNo', label: 'Application No. (अर्ज क्र.)', defaultVisible: true, align: 'left' },
        { key: 'citizenName', label: 'Citizen Name (नागरिकाचे नाव)', defaultVisible: true, align: 'left' },
        { key: 'departmentName', label: 'Department (विभाग)', defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: 'Service Name (सेवा)', defaultVisible: true, align: 'left' },
        { key: 'paymentMode', label: 'Payment Mode (भरणा पद्धत)', defaultVisible: true, align: 'center' },
        { key: 'totalAmount', label: 'Amount (रक्कम ₹)', defaultVisible: true, align: 'right', isNumeric: true },
        { key: 'bankName', label: 'Bank / Gateway', defaultVisible: true, align: 'left' },
        { key: 'instrumentNo', label: 'Cheque / Ref No.', defaultVisible: false, align: 'center' },
        { key: 'paymentStatus', label: 'Status (स्थिती)', defaultVisible: true, align: 'center' },
      ],
      APPLICATIONS: [
        { key: 'id', label: 'Sr. No.', defaultVisible: true, align: 'center' },
        { key: 'applicationNo', label: 'Application No. (अर्ज क्र.)', defaultVisible: true, align: 'left' },
        { key: 'applicationDate', label: 'Applied Date (अर्ज तारीख)', defaultVisible: true, align: 'center' },
        { key: 'applicantName', label: 'Applicant Name (अर्जदाराचे नाव)', defaultVisible: true, align: 'left' },
        { key: 'departmentName', label: 'Department (विभाग)', defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: 'Service (सेवा)', defaultVisible: true, align: 'left' },
        { key: 'currentStatus', label: 'Current Status (सद्यस्थिती)', defaultVisible: true, align: 'center' },
        { key: 'assignedTo', label: 'Assigned Officer (अधिकारी)', defaultVisible: true, align: 'left' },
        { key: 'expectedSlaDays', label: 'SLA (Days)', defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'remainingDays', label: 'Timeline Status', defaultVisible: true, align: 'center' },
        { key: 'propertyNo', label: 'Property / UPIC No.', defaultVisible: false, align: 'center' },
        { key: 'remarks', label: 'Remarks (शेरा)', defaultVisible: false, align: 'left' },
      ],
      SLA_COMPLIANCE: [
        { key: 'id', label: 'Sr. No.', defaultVisible: true, align: 'center' },
        { key: 'applicationNo', label: 'Application No.', defaultVisible: true, align: 'left' },
        { key: 'applicantName', label: 'Applicant Name', defaultVisible: true, align: 'left' },
        { key: 'departmentName', label: 'Department', defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: 'Service Name', defaultVisible: true, align: 'left' },
        { key: 'expectedSlaDays', label: 'Mandated SLA', defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'overdueDays', label: 'Timeline Compliance', defaultVisible: true, align: 'center' },
        { key: 'currentStatus', label: 'Workflow Status', defaultVisible: true, align: 'center' },
        { key: 'assignedTo', label: 'Designated Officer', defaultVisible: true, align: 'left' },
        { key: 'remarks', label: 'Delay Reason / Remarks', defaultVisible: true, align: 'left' },
      ],
      SETTLEMENT: [
        { key: 'transactionId', label: 'Sr. No.', defaultVisible: true, align: 'center' },
        { key: 'applicationNo', label: 'Application No.', defaultVisible: true, align: 'left' },
        { key: 'receiptNo', label: 'Receipt No.', defaultVisible: true, align: 'center' },
        { key: 'citizenName', label: 'Citizen Name', defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: 'Service Name', defaultVisible: true, align: 'left' },
        { key: 'paymentMode', label: 'Payment Mode', defaultVisible: true, align: 'center' },
        { key: 'totalAmount', label: 'Amount (₹)', defaultVisible: true, align: 'right', isNumeric: true },
        { key: 'instrumentNo', label: 'Instrument / Cheque No.', defaultVisible: true, align: 'center' },
        { key: 'instrumentDate', label: 'Instrument Date', defaultVisible: true, align: 'center' },
        { key: 'bankName', label: 'Bank Name', defaultVisible: true, align: 'left' },
        { key: 'clearanceDate', label: 'Clearance Date', defaultVisible: true, align: 'center' },
        { key: 'approvalStatus', label: 'Settlement Status', defaultVisible: true, align: 'center' },
        { key: 'remarks', label: 'Action Remarks', defaultVisible: false, align: 'left' },
      ],
      DEPARTMENT_SUMMARY: [
        { key: 'srNo', label: 'Sr. No.', defaultVisible: true, align: 'center' },
        { key: 'departmentName', label: 'Department (विभाग)', defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: 'Service (सेवा)', defaultVisible: true, align: 'left' },
        { key: 'totalApplications', label: 'Total Applications (एकूण अर्ज)', defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'approvedCount', label: 'Approved (मंजूर)', defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'approvedPercentage', label: 'Approval %', defaultVisible: true, align: 'center' },
        { key: 'pendingCount', label: 'Pending (प्रलंबित)', defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'rejectedCount', label: 'Rejected (नामंजूर)', defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'overdueCount', label: 'SLA Breached (मुदत उलटलेले)', defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'slaAdherencePercentage', label: 'SLA Compliance %', defaultVisible: true, align: 'center' },
        { key: 'totalCollectionAmount', label: 'Fee Revenue (एकूण संकलन ₹)', defaultVisible: true, align: 'right', isNumeric: true },
      ],
    };
  }, []);

  // 7. Visible Columns State
  const [visibleColumns, setVisibleColumns] = useState<Record<ReportDomain, string[]>>({
    COLLECTIONS: domainColumnsMap.COLLECTIONS.filter((c) => c.defaultVisible).map((c) => c.key),
    APPLICATIONS: domainColumnsMap.APPLICATIONS.filter((c) => c.defaultVisible).map((c) => c.key),
    SLA_COMPLIANCE: domainColumnsMap.SLA_COMPLIANCE.filter((c) => c.defaultVisible).map((c) => c.key),
    SETTLEMENT: domainColumnsMap.SETTLEMENT.filter((c) => c.defaultVisible).map((c) => c.key),
    DEPARTMENT_SUMMARY: domainColumnsMap.DEPARTMENT_SUMMARY.filter((c) => c.defaultVisible).map((c) => c.key),
  });

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

  const toggleColumnVisibility = (colKey: string) => {
    setVisibleColumns((prev) => {
      const currentList = prev[activeDomain];
      if (currentList.includes(colKey)) {
        if (currentList.length <= 2) {
          toast.warning('At least 2 columns must remain visible.');
          return prev;
        }
        return {
          ...prev,
          [activeDomain]: currentList.filter((k) => k !== colKey),
        };
      } else {
        return {
          ...prev,
          [activeDomain]: [...currentList, colKey],
        };
      }
    });
  };

  const handleSelectAllColumns = () => {
    setVisibleColumns((prev) => ({
      ...prev,
      [activeDomain]: domainColumnsMap[activeDomain].map((c) => c.key),
    }));
  };

  const handleResetDefaultColumns = () => {
    setVisibleColumns((prev) => ({
      ...prev,
      [activeDomain]: domainColumnsMap[activeDomain].filter((c) => c.defaultVisible).map((c) => c.key),
    }));
  };

  // 8. Handle Date Presets
  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      const todayStr = formatDateStr(today);
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (preset === 'YESTERDAY') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yestStr = formatDateStr(yest);
      setFromDate(yestStr);
      setToDate(yestStr);
    } else if (preset === 'WEEK') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      setFromDate(formatDateStr(past));
      setToDate(formatDateStr(today));
    } else if (preset === 'MONTH') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatDateStr(startOfMonth));
      setToDate(formatDateStr(today));
    } else if (preset === 'LAST_30') {
      const past = new Date(today);
      past.setDate(past.getDate() - 30);
      setFromDate(formatDateStr(past));
      setToDate(formatDateStr(today));
    } else if (preset === 'QUARTER') {
      const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
      const startOfQuarter = new Date(today.getFullYear(), quarterMonth, 1);
      setFromDate(formatDateStr(startOfQuarter));
      setToDate(formatDateStr(today));
    } else if (preset === 'ALL') {
      setFromDate('');
      setToDate('');
    }
    setPageNumber(1);
  };

  // 9. Load Report Data
  const loadReportData = useCallback(() => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const deptIdNum = selectedDeptId !== 'ALL' ? Number(selectedDeptId) : undefined;
        const svcIdNum = selectedServiceId !== 'ALL' ? Number(selectedServiceId) : undefined;

        if (activeDomain === 'COLLECTIONS' || activeDomain === 'SETTLEMENT') {
          const res = await getRtsCollectionsReportDataAction({
            pageNumber,
            pageSize,
            paymentMode: selectedMode !== 'ALL' ? selectedMode : undefined,
            statusCode: selectedStatus !== 'ALL' ? selectedStatus : undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            searchText: searchText.trim() || undefined,
          });

          setCollectionItems(res.items);
          setTotalCount(res.totalCount);
          setTotalPages(res.totalPages);
          setTotalAmount(res.totalAmount);
        } else if (activeDomain === 'APPLICATIONS' || activeDomain === 'SLA_COMPLIANCE') {
          const selectedDeptObj = lookups.departments.find((d) => d.id === deptIdNum);
          const res = await getRtsApplicationsReportDataAction(
            {
              departmentId: deptIdNum,
              departmentName: selectedDeptObj?.departmentName,
              serviceId: svcIdNum,
              status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
              fromDate: fromDate || undefined,
              toDate: toDate || undefined,
              search: searchText.trim() || undefined,
            },
            pageNumber,
            pageSize
          );

          let filteredRows = res.rows;
          if (activeDomain === 'SLA_COMPLIANCE') {
            if (selectedSla === 'OVERDUE') {
              filteredRows = filteredRows.filter((r) => (r.overdueDays || 0) > 0);
            } else if (selectedSla === 'DUE_TODAY') {
              filteredRows = filteredRows.filter((r) => r.dueDays === 0 || r.remainingDays === 0);
            } else if (selectedSla === 'WITHIN_SLA') {
              filteredRows = filteredRows.filter((r) => !r.overdueDays || r.overdueDays <= 0);
            }
          }

          setApplicationRows(filteredRows);
          setTotalCount(res.totalCount);
          setTotalPages(res.totalPages);
          setTotalAmount(0);
        } else if (activeDomain === 'DEPARTMENT_SUMMARY') {
          const res = await getRtsDepartmentSummaryReportDataAction(
            deptIdNum,
            fromDate || undefined,
            toDate || undefined
          );

          setSummaryItems(res);
          setTotalCount(res.length);
          setTotalPages(1);
          const totalRev = res.reduce((sum, item) => sum + (item.totalCollectionAmount || 0), 0);
          setTotalAmount(totalRev);
        }
      } catch (err) {
        console.error('Error fetching RTS report data:', err);
        toast.error('Failed to load report data.');
      } finally {
        setIsLoading(false);
      }
    });
  }, [
    activeDomain,
    pageNumber,
    pageSize,
    selectedDeptId,
    selectedServiceId,
    selectedStatus,
    selectedMode,
    selectedSla,
    searchText,
    fromDate,
    toDate,
    lookups.departments,
  ]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedDeptId('ALL');
    setSelectedServiceId('ALL');
    setSelectedStatus('ALL');
    setSelectedMode('ALL');
    setSelectedBankId('ALL');
    setSelectedSla('ALL');
    setSearchText('');
    setDatePreset('ALL');
    setFromDate('');
    setToDate('');
    setPageNumber(1);
  };

  // Count Active Filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedDeptId !== 'ALL') count++;
    if (selectedServiceId !== 'ALL') count++;
    if (selectedStatus !== 'ALL') count++;
    if (selectedMode !== 'ALL') count++;
    if (selectedBankId !== 'ALL') count++;
    if (selectedSla !== 'ALL') count++;
    if (searchText.trim()) count++;
    if (fromDate || toDate) count++;
    return count;
  }, [
    selectedDeptId,
    selectedServiceId,
    selectedStatus,
    selectedMode,
    selectedBankId,
    selectedSla,
    searchText,
    fromDate,
    toDate,
  ]);

  // 10. Handle Sorting
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // 11. Handle Universal Export
  const handleExport = async (format: ReportExportFormat, scope: 'page' | 'all') => {
    setIsExporting(true);
    try {
      const activeDeptObj = lookups.departments.find((d) => d.id === Number(selectedDeptId));
      const activeSvcObj = lookups.services.find((s) => s.id === Number(selectedServiceId));

      const appliedFilters = {
        Domain: activeDomain,
        Department: activeDeptObj?.departmentName || 'All Departments',
        Service: activeSvcObj?.serviceName || 'All Services',
        Status: selectedStatus !== 'ALL' ? selectedStatus : 'All Statuses',
        'Payment Mode': selectedMode !== 'ALL' ? selectedMode : undefined,
        'Date Range': fromDate ? `${fromDate} to ${toDate || 'Present'}` : undefined,
        Search: searchText || undefined,
      };

      const userVisibleKeys = visibleColumns[activeDomain];

      if (activeDomain === 'COLLECTIONS') {
        let exportData = collectionItems;
        if (scope === 'all' && totalCount > collectionItems.length) {
          toast.info('Fetching full collection dataset for export...');
          exportData = await getAllCollectionsForExportAction({
            paymentMode: selectedMode !== 'ALL' ? selectedMode : undefined,
            statusCode: selectedStatus !== 'ALL' ? selectedStatus : undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            searchText: searchText.trim() || undefined,
          });
        }
        exportRtsCollections(exportData, {
          format,
          departmentName: activeDeptObj?.departmentName,
          appliedFilters,
          visibleColumnKeys: userVisibleKeys,
        });
        toast.success(`Collections Report exported (${exportData.length} records)`);
      } else if (activeDomain === 'APPLICATIONS') {
        let exportData = applicationRows;
        if (scope === 'all' && totalCount > applicationRows.length) {
          toast.info('Fetching full applications dataset for export...');
          exportData = await getAllApplicationsForExportAction({
            departmentId: selectedDeptId !== 'ALL' ? Number(selectedDeptId) : undefined,
            serviceId: selectedServiceId !== 'ALL' ? Number(selectedServiceId) : undefined,
            status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            search: searchText.trim() || undefined,
          });
        }
        exportRtsApplications(exportData, {
          format,
          departmentName: activeDeptObj?.departmentName,
          appliedFilters,
          visibleColumnKeys: userVisibleKeys,
        });
        toast.success(`Applications Report exported (${exportData.length} records)`);
      } else if (activeDomain === 'SLA_COMPLIANCE') {
        let exportData = applicationRows;
        if (scope === 'all' && totalCount > applicationRows.length) {
          toast.info('Fetching full SLA dataset for export...');
          exportData = await getAllApplicationsForExportAction({
            departmentId: selectedDeptId !== 'ALL' ? Number(selectedDeptId) : undefined,
            serviceId: selectedServiceId !== 'ALL' ? Number(selectedServiceId) : undefined,
            status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            search: searchText.trim() || undefined,
          });
        }
        exportRtsSlaCompliance(exportData, {
          format,
          departmentName: activeDeptObj?.departmentName,
          appliedFilters,
          visibleColumnKeys: userVisibleKeys,
        });
        toast.success(`SLA Compliance Report exported (${exportData.length} records)`);
      } else if (activeDomain === 'SETTLEMENT') {
        let exportData = collectionItems;
        if (scope === 'all' && totalCount > collectionItems.length) {
          toast.info('Fetching full settlement dataset for export...');
          exportData = await getAllCollectionsForExportAction({
            paymentMode: selectedMode !== 'ALL' ? selectedMode : undefined,
            statusCode: selectedStatus !== 'ALL' ? selectedStatus : undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            searchText: searchText.trim() || undefined,
          });
        }
        exportRtsPaymentSettlement(exportData, {
          format,
          appliedFilters,
          visibleColumnKeys: userVisibleKeys,
        });
        toast.success(`Settlement Report exported (${exportData.length} records)`);
      } else if (activeDomain === 'DEPARTMENT_SUMMARY') {
        exportRtsDepartmentSummary(summaryItems, {
          format,
          appliedFilters,
          visibleColumnKeys: userVisibleKeys,
        });
        toast.success(`Department MIS Summary exported (${summaryItems.length} records)`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export report.');
    } finally {
      setIsExporting(false);
    }
  };

  // 12. Helper Badges and Formatters
  const renderStatusBadge = (statusStr: string) => {
    const s = (statusStr || 'PENDING').toUpperCase();
    if (s.includes('APPROV') || s.includes('CLEARED') || s.includes('PAID') || s.includes('SUCCESS')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" />
          {statusStr || 'Approved'}
        </span>
      );
    }
    if (s.includes('BOUNC') || s.includes('REJECT') || s.includes('CANCEL') || s.includes('FAIL')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
          <XCircle className="h-3 w-3" />
          {statusStr || 'Rejected'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
        <Clock className="h-3 w-3" />
        {statusStr || 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header Card - Official Akola Municipal Corporation Banner */}
      <Card
        padding="sm"
        className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-800">
                RTS Central Report Engine (आर.टी.एस. केंद्रीय अहवाल केंद्र)
              </h1>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-bold text-[#173B73]">
                Municipal Corporation Hub
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              महसूल संकलन (Revenue), अर्ज नोंदवही, सेवा हमी कायदा (SLA) मुदत, बँक सेटलमेंट व विभागनिहाय प्रगती अहवाल प्रणाली
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick links to related dashboards */}
          <div className="hidden lg:flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
            <Link
              href={`/${locale}/rts/dashboard/rts-applications`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition"
              title="View Applications Dashboard"
            >
              <span>Applications</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
            <Link
              href={`/${locale}/rts/dashboard/rts-settlement`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition"
              title="View Settlement Counter"
            >
              <span>Settlement</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
            <Link
              href={`/${locale}/rts/dashboard/rts-mis`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition"
              title="View MIS Analytics"
            >
              <span>MIS</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadReportData}
            disabled={isLoading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            title="Refresh Report Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export Dropdown */}
          <RtsExportDropdown
            onExport={handleExport}
            currentPageCount={
              activeDomain === 'COLLECTIONS' || activeDomain === 'SETTLEMENT'
                ? collectionItems.length
                : activeDomain === 'DEPARTMENT_SUMMARY'
                ? summaryItems.length
                : applicationRows.length
            }
            totalFilteredCount={totalCount}
            isLoading={isExporting}
            buttonLabel="Download Report"
          />
        </div>
      </Card>

      {/* 2. Report Domain Switcher (5 Major Report Categories) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {[
          {
            id: 'COLLECTIONS' as ReportDomain,
            label: 'Revenue & Collections',
            sub: 'महसूल संकलन व भरणा',
            icon: IndianRupee,
            badge: activeDomain === 'COLLECTIONS' ? totalCount : null,
            color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
            activeClass: 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 text-emerald-900',
          },
          {
            id: 'APPLICATIONS' as ReportDomain,
            label: 'Applications Register',
            sub: 'अर्ज मास्टर नोंदवही',
            icon: FileText,
            badge: activeDomain === 'APPLICATIONS' ? totalCount : null,
            color: 'text-blue-700 bg-blue-50 border-blue-200',
            activeClass: 'border-blue-600 bg-white ring-2 ring-blue-500/20 text-blue-900',
          },
          {
            id: 'SLA_COMPLIANCE' as ReportDomain,
            label: 'SLA Timeline & Delays',
            sub: 'सेवा हमी मुदत व विलंब',
            icon: Clock,
            badge: activeDomain === 'SLA_COMPLIANCE' ? totalCount : null,
            color: 'text-amber-700 bg-amber-50 border-amber-200',
            activeClass: 'border-amber-600 bg-white ring-2 ring-amber-500/20 text-amber-900',
          },
          {
            id: 'SETTLEMENT' as ReportDomain,
            label: 'Payment Settlement',
            sub: 'बँक क्लिअरन्स व ऑडिट',
            icon: CreditCard,
            badge: activeDomain === 'SETTLEMENT' ? totalCount : null,
            color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
            activeClass: 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 text-indigo-900',
          },
          {
            id: 'DEPARTMENT_SUMMARY' as ReportDomain,
            label: 'Department MIS Summary',
            sub: 'विभाग व सेवा सारांश',
            icon: Building2,
            badge: activeDomain === 'DEPARTMENT_SUMMARY' ? summaryItems.length : null,
            color: 'text-purple-700 bg-purple-50 border-purple-200',
            activeClass: 'border-purple-600 bg-white ring-2 ring-purple-500/20 text-purple-900',
          },
        ].map((domain) => {
          const isActive = activeDomain === domain.id;
          const IconComponent = domain.icon;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => {
                setActiveDomain(domain.id);
                setPageNumber(1);
              }}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                isActive
                  ? domain.activeClass + ' shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50/80 text-slate-600'
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                    isActive ? domain.color : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                {domain.badge !== null && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {domain.badge.toLocaleString()}
                  </span>
                )}
              </div>
              <span className="mt-2.5 block text-xs font-extrabold tracking-tight text-slate-800">
                {domain.label}
              </span>
              <span className="text-[10px] text-slate-500">{domain.sub}</span>
            </button>
          );
        })}
      </div>

      {/* 3. KPI Highlights Bar for Current Domain */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Entries</p>
          <p className="mt-1 font-mono text-2xl font-black text-slate-800">{totalCount.toLocaleString()}</p>
          <p className="mt-0.5 text-[10px] text-slate-500">Matching active filters</p>
        </div>

        {totalAmount > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Total Fee Revenue</p>
            <p className="mt-1 font-mono text-2xl font-black text-emerald-800">₹{totalAmount.toLocaleString('en-IN')}</p>
            <p className="mt-0.5 text-[10px] text-emerald-600">Municipal collection sum</p>
          </div>
        )}

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Active Department</p>
          <p className="mt-1 text-sm font-bold truncate text-blue-900">
            {selectedDeptId === 'ALL'
              ? 'All Departments'
              : lookups.departments.find((d) => d.id === Number(selectedDeptId))?.departmentName || 'Selected'}
          </p>
          <p className="mt-0.5 text-[10px] text-blue-600">
            {selectedServiceId === 'ALL' ? 'All Services' : 'Specific service selected'}
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Filter Scope</p>
          <p className="mt-1 text-sm font-bold text-amber-900">
            {activeFiltersCount > 0 ? `${activeFiltersCount} Filters Applied` : 'Unfiltered All'}
          </p>
          <p className="mt-0.5 text-[10px] text-amber-600">
            {datePreset !== 'ALL' ? datePreset : 'Entire date history'}
          </p>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Export Readiness</p>
          <p className="mt-1 text-sm font-bold text-purple-900">Excel / CSV / PDF</p>
          <p className="mt-0.5 text-[10px] text-purple-600">UTF-8 Devanagari Compatible</p>
        </div>
      </div>

      {/* 4. Filter Engine Panel with Show / Hide Toggle */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick Reset */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline ml-2"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset All ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Column Customizer Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnDropdownOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition"
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" />
              <span>
                Customize Columns ({visibleColumns[activeDomain].length}/{domainColumnsMap[activeDomain].length})
              </span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isColumnDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Column Customizer Popover */}
            {isColumnDropdownOpen && (
              <div className="absolute right-0 z-50 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-700">Display Columns</span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={handleSelectAllColumns}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleResetDefaultColumns}
                      className="text-slate-500 font-bold hover:underline"
                    >
                      Default
                    </button>
                  </div>
                </div>
                <div className="mt-2 max-h-60 overflow-y-auto space-y-1 py-1">
                  {domainColumnsMap[activeDomain].map((col) => {
                    const isChecked = visibleColumns[activeDomain].includes(col.key);
                    return (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleColumnVisibility(col.key)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={isChecked ? 'font-medium text-slate-800' : 'text-slate-400'}>
                          {col.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="mt-2 border-t border-slate-100 pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setIsColumnDropdownOpen(false)}
                    className="rounded-md bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Filter Inputs */}
        {showFilters && (
          <div className="pt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Department Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Department (विभाग)
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedServiceId('ALL');
                  setPageNumber(1);
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Active Departments (सर्व विभाग)</option>
                {lookups.departments.map((dept) => (
                  <option key={dept.id} value={dept.id.toString()}>
                    {dept.departmentNameLocal || dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Service Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Service (सेवा)
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  setPageNumber(1);
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Services (सर्व सेवा)</option>
                {filteredServices.map((svc) => (
                  <option key={svc.id} value={svc.id.toString()}>
                    {svc.serviceNameLocal || svc.serviceName}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Status Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Status (स्थिती)
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPageNumber(1);
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Statuses (सर्व स्थिती)</option>
                {activeDomain === 'COLLECTIONS' || activeDomain === 'SETTLEMENT' ? (
                  <>
                    <option value="PENDING_CLEARANCE">Pending Clearance</option>
                    <option value="CLEARED">Cleared / Approved</option>
                    <option value="BOUNCED">Bounced / Rejected</option>
                    <option value="CANCELLED">Receipt Cancelled</option>
                  </>
                ) : (
                  <>
                    <option value="Pending">Pending (प्रलंबित)</option>
                    <option value="Approved">Approved (मंजूर)</option>
                    <option value="Rejected">Rejected (नामंजूर)</option>
                    <option value="InProcess">In Process (प्रक्रियेत)</option>
                  </>
                )}
              </select>
            </div>

            {/* 4. Payment Mode (for Collections / Settlement) OR SLA Status */}
            {activeDomain === 'COLLECTIONS' || activeDomain === 'SETTLEMENT' ? (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Payment Mode (भरणा पद्धत)
                </label>
                <select
                  value={selectedMode}
                  onChange={(e) => {
                    setSelectedMode(e.target.value);
                    setPageNumber(1);
                  }}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All Modes (सर्व पद्धती)</option>
                  <option value="CASH">Cash Counter (रोख)</option>
                  <option value="CHEQUE">Cheque (धनादेश)</option>
                  <option value="DD">Demand Draft (डीडी)</option>
                  <option value="ONLINE">Online / Gateway / UPI</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  SLA Timeline Condition
                </label>
                <select
                  value={selectedSla}
                  onChange={(e) => {
                    setSelectedSla(e.target.value);
                    setPageNumber(1);
                  }}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">All SLA States</option>
                  <option value="WITHIN_SLA">Within SLA (विहित मुदतीत)</option>
                  <option value="DUE_TODAY">Due Today (आज मुदत समाप्त)</option>
                  <option value="OVERDUE">SLA Breached / Overdue (विलंबित)</option>
                </select>
              </div>
            )}

            {/* 5. Date Range Presets */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Date Preset (कालावधी)
              </label>
              <select
                value={datePreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Time (सर्व कालावधी)</option>
                <option value="TODAY">Today (आज)</option>
                <option value="YESTERDAY">Yesterday (काल)</option>
                <option value="WEEK">Last 7 Days (मागील ७ दिवस)</option>
                <option value="MONTH">This Month (चालू महिना)</option>
                <option value="LAST_30">Last 30 Days (मागील ३० दिवस)</option>
                <option value="QUARTER">This Quarter (चालू तिमाही)</option>
              </select>
            </div>

            {/* 6. Custom From Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                From Date (पासून)
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDatePreset('CUSTOM');
                  setPageNumber(1);
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 7. Custom To Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                To Date (पर्यंत)
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDatePreset('CUSTOM');
                  setPageNumber(1);
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 8. Search Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Search (शोध)
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder="App No, Receipt, Citizen, Cheque..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPageNumber(1);
                  }}
                  className="block w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Live Data Preview Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-800">
              Live Data Preview: {activeDomain.replace('_', ' ')}
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700">
              {totalCount.toLocaleString()} Records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">Rows per page:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Scrollable Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-[#173B73] text-white">
              <tr>
                {domainColumnsMap[activeDomain]
                  .filter((col) => visibleColumns[activeDomain].includes(col.key))
                  .map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      onClick={() => handleSort(col.key)}
                      className={`px-3 py-3 font-bold tracking-wider cursor-pointer hover:bg-white/10 transition select-none ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-flex items-center gap-1 ${
                          col.align === 'center'
                            ? 'justify-center'
                            : col.align === 'right'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <span>{col.label}</span>
                        <ArrowUpDown className="h-3 w-3 opacity-60 hover:opacity-100" />
                      </div>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={visibleColumns[activeDomain].length}
                    className="py-12 text-center text-xs font-semibold text-slate-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                      <span>Loading report dataset...</span>
                    </div>
                  </td>
                </tr>
              ) : activeDomain === 'COLLECTIONS' || activeDomain === 'SETTLEMENT' ? (
                collectionItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns[activeDomain].length}
                      className="py-12 text-center text-xs font-semibold text-slate-400"
                    >
                      No matching collection or settlement transactions found.
                    </td>
                  </tr>
                ) : (
                  collectionItems.map((item, idx) => {
                    const isEven = idx % 2 === 1;
                    return (
                      <tr
                        key={item.transactionId || idx}
                        className={`transition hover:bg-blue-50/40 ${isEven ? 'bg-slate-50/40' : 'bg-white'}`}
                      >
                        {visibleColumns[activeDomain].includes('srNo') && (
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-500">
                            {(pageNumber - 1) * pageSize + idx + 1}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('transactionId') && (
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-500">
                            {(pageNumber - 1) * pageSize + idx + 1}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('receiptNo') && (
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-[#173B73]">
                            {item.receiptNo || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('createdDate') && (
                          <td className="px-3 py-2.5 text-center text-slate-600">
                            {item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-IN') : '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('applicationNo') && (
                          <td className="px-3 py-2.5 font-mono font-bold text-slate-800">
                            {item.applicationNo || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('citizenName') && (
                          <td className="px-3 py-2.5 font-medium text-slate-800">{item.citizenName || '—'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('departmentName') && (
                          <td className="px-3 py-2.5 text-slate-600">{item.departmentName || '—'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('serviceName') && (
                          <td className="px-3 py-2.5 text-slate-700 font-medium">{item.serviceName || '—'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('paymentMode') && (
                          <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px]">
                              {(item.paymentMode || '—').toUpperCase()}
                            </span>
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('totalAmount') && (
                          <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900">
                            ₹{Number(item.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('bankName') && (
                          <td className="px-3 py-2.5 text-slate-600">{item.bankName || 'Cash Counter'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('instrumentNo') && (
                          <td className="px-3 py-2.5 text-center font-mono text-slate-600">{item.instrumentNo || '—'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('instrumentDate') && (
                          <td className="px-3 py-2.5 text-center text-slate-600">
                            {item.instrumentDate ? new Date(item.instrumentDate).toLocaleDateString('en-IN') : '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('clearanceDate') && (
                          <td className="px-3 py-2.5 text-center text-slate-600">
                            {item.clearanceDate ? new Date(item.clearanceDate).toLocaleDateString('en-IN') : '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('approvalStatus') && (
                          <td className="px-3 py-2.5 text-center">
                            {renderStatusBadge(item.approvalStatus || item.paymentStatus)}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('paymentStatus') && (
                          <td className="px-3 py-2.5 text-center">
                            {renderStatusBadge(item.isReceiptCancelled ? 'Cancelled' : item.paymentStatus)}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('remarks') && (
                          <td className="px-3 py-2.5 text-slate-500 truncate max-w-xs">{item.remarks || '—'}</td>
                        )}
                      </tr>
                    );
                  })
                )
              ) : activeDomain === 'DEPARTMENT_SUMMARY' ? (
                summaryItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns[activeDomain].length}
                      className="py-12 text-center text-xs font-semibold text-slate-400"
                    >
                      No department summary available.
                    </td>
                  </tr>
                ) : (
                  summaryItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 divide-y divide-slate-100">
                      {visibleColumns[activeDomain].includes('srNo') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                      )}
                      {visibleColumns[activeDomain].includes('departmentName') && (
                        <td className="px-3 py-2.5 font-bold text-slate-800">{item.departmentName}</td>
                      )}
                      {visibleColumns[activeDomain].includes('serviceName') && (
                        <td className="px-3 py-2.5 text-slate-700">{item.serviceName}</td>
                      )}
                      {visibleColumns[activeDomain].includes('totalApplications') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
                          {item.totalApplications.toLocaleString()}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('approvedCount') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-700">
                          {item.approvedCount.toLocaleString()}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('approvedPercentage') && (
                        <td className="px-3 py-2.5 text-center">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700">
                            {item.approvedPercentage}%
                          </span>
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('pendingCount') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-amber-700">
                          {item.pendingCount.toLocaleString()}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('rejectedCount') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-700">
                          {item.rejectedCount.toLocaleString()}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('overdueCount') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-orange-700">
                          {item.overdueCount.toLocaleString()}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('slaAdherencePercentage') && (
                        <td className="px-3 py-2.5 text-center font-bold text-slate-800">
                          {item.slaAdherencePercentage}%
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('totalCollectionAmount') && (
                        <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900">
                          ₹{(item.totalCollectionAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      )}
                    </tr>
                  ))
                )
              ) : (
                applicationRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns[activeDomain].length}
                      className="py-12 text-center text-xs font-semibold text-slate-400"
                    >
                      No matching RTS applications found.
                    </td>
                  </tr>
                ) : (
                  applicationRows.map((row, idx) => {
                    const isEven = idx % 2 === 1;
                    return (
                      <tr
                        key={row.applicationId || idx}
                        className={`transition hover:bg-blue-50/40 ${isEven ? 'bg-slate-50/40' : 'bg-white'}`}
                      >
                        {visibleColumns[activeDomain].includes('id') && (
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-500">
                            {(pageNumber - 1) * pageSize + idx + 1}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('applicationNo') && (
                          <td className="px-3 py-2.5 font-mono font-bold text-[#173B73]">
                            {row.applicationNo || `RTS${row.applicationId}`}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('applicationDate') && (
                          <td className="px-3 py-2.5 text-center text-slate-600">
                            {row.applicationDate ? new Date(row.applicationDate).toLocaleDateString('en-IN') : '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('applicantName') && (
                          <td className="px-3 py-2.5 font-medium text-slate-800">{row.applicantName || '—'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('departmentName') && (
                          <td className="px-3 py-2.5 text-slate-600">
                            {row.departmentNameLocal || row.departmentName || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('serviceName') && (
                          <td className="px-3 py-2.5 text-slate-700 font-medium">
                            {row.serviceNameLocal || row.serviceName || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('currentStatus') && (
                          <td className="px-3 py-2.5 text-center">{renderStatusBadge(row.currentStatus)}</td>
                        )}
                        {visibleColumns[activeDomain].includes('assignedTo') && (
                          <td className="px-3 py-2.5 text-slate-600">{row.assignedToName || row.assignedTo || '—'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('expectedSlaDays') && (
                          <td className="px-3 py-2.5 text-center font-mono text-slate-700">
                            {row.expectedSlaDays ? `${row.expectedSlaDays} Days` : '7 Days'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('remainingDays') && (
                          <td className="px-3 py-2.5 text-center">
                            {row.overdueDays && row.overdueDays > 0 ? (
                              <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                {row.overdueDays} Days Overdue
                              </span>
                            ) : row.dueDays === 0 || row.remainingDays === 0 ? (
                              <span className="rounded bg-orange-50 border border-orange-200 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                                Due Today
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                {row.remainingDays ?? 0} Days Left
                              </span>
                            )}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('overdueDays') && (
                          <td className="px-3 py-2.5 text-center">
                            {row.overdueDays && row.overdueDays > 0 ? (
                              <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                {row.overdueDays}d Breached
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                Compliant
                              </span>
                            )}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('propertyNo') && (
                          <td className="px-3 py-2.5 text-center font-mono text-slate-600">
                            {row.propertyNo || row.upicId || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('remarks') && (
                          <td className="px-3 py-2.5 text-slate-500 truncate max-w-xs">{row.remarks || '—'}</td>
                        )}
                      </tr>
                    );
                  })
                )
              )}
            </tbody>

            {/* Table Summary Footer */}
            {totalAmount > 0 && (
              <tfoot className="border-t-2 border-slate-300 bg-slate-100/80 font-bold">
                <tr>
                  <td colSpan={visibleColumns[activeDomain].length - 3} className="px-3 py-2.5 text-right uppercase">
                    TOTAL AMOUNT (एकूण बेरीज):
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900 text-sm">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="px-3 py-2.5 text-left text-slate-500 font-normal">
                    {totalCount.toLocaleString()} total entries
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
            <span className="text-xs text-slate-500">
              Showing page <strong className="text-slate-800">{pageNumber}</strong> of{' '}
              <strong className="text-slate-800">{totalPages}</strong> ({totalCount.toLocaleString()} total records)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(1)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                First
              </button>
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="px-2 text-xs font-bold text-blue-700 font-mono">
                {pageNumber} / {totalPages}
              </span>
              <button
                type="button"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Next
              </button>
              <button
                type="button"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber(totalPages)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

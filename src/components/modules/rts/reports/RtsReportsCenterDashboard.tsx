'use client';

import { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  FileText,
  Eye,
  RefreshCw,
  Search,
  Building2,
  IndianRupee,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  CreditCard,
  ExternalLink,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/common';
import RtsExportDropdown from '@/components/modules/rts/reports/RtsExportDropdown';
import {
  exportRtsApplications,
  exportRtsPaymentSettlement,
  exportRtsCollections,
  exportRtsSlaCompliance,
  exportRtsDepartmentSummary,
  exportRtsAppeals,
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
  getRtsAppealsReportDataAction,
  getAllAppealsForExportAction,
  type RtsReportsFilterOptions,
} from '@/app/[locale]/rts/dashboard/rts-reports/actions';
import type { AdminApplicationGridRow } from '@/app/[locale]/rts/dashboard/rts-applications/actions';
import type { PendingClearanceItem } from '@/lib/api/rts/rtspayment.service';
import type { RTSAppealDashboardDetailsDto } from '@/types/rts/appeal.types';

export type ReportDomain =
  | 'COLLECTIONS'
  | 'APPLICATIONS'
  | 'SLA_COMPLIANCE'
  | 'APPEALS'
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
  const t = useTranslations('rts.reportsCenter');
  const isMr = locale === 'mr';
  const isHi = locale === 'hi';
  const numLocale = isMr ? 'mr-IN' : 'en-IN';

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
  const [appealItems, setAppealItems] = useState<RTSAppealDashboardDetailsDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // 4. Sorting State
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // 6. Column Definitions per Domain (100% localized via next-intl)
  const domainColumnsMap = useMemo<Record<ReportDomain, ColumnDef[]>>(() => {
    return {
      COLLECTIONS: [
        { key: 'srNo', label: t('columns.srNo'), defaultVisible: true, align: 'center' },
        { key: 'receiptNo', label: t('columns.receiptNo'), defaultVisible: true, align: 'center' },
        { key: 'createdDate', label: t('columns.receiptDate'), defaultVisible: true, align: 'center' },
        { key: 'applicationNo', label: t('columns.applicationNo'), defaultVisible: true, align: 'left' },
        { key: 'citizenName', label: t('columns.citizenName'), defaultVisible: true, align: 'left' },
        { key: 'departmentName', label: t('columns.departmentName'), defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: t('columns.serviceName'), defaultVisible: true, align: 'left' },
        { key: 'paymentMode', label: t('columns.paymentMode'), defaultVisible: true, align: 'center' },
        { key: 'totalAmount', label: t('columns.totalAmount'), defaultVisible: true, align: 'right', isNumeric: true },
        { key: 'bankName', label: t('columns.bankName'), defaultVisible: true, align: 'left' },
        { key: 'instrumentNo', label: t('columns.instrumentNo'), defaultVisible: false, align: 'center' },
        { key: 'paymentStatus', label: t('columns.paymentStatus'), defaultVisible: true, align: 'center' },
      ],
      APPLICATIONS: [
        { key: 'id', label: t('columns.srNo'), defaultVisible: true, align: 'center' },
        { key: 'applicationNo', label: t('columns.applicationNo'), defaultVisible: true, align: 'left' },
        { key: 'applicationDate', label: t('columns.applicationDate'), defaultVisible: true, align: 'center' },
        { key: 'applicantName', label: t('columns.applicantName'), defaultVisible: true, align: 'left' },
        { key: 'departmentName', label: t('columns.departmentName'), defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: t('columns.serviceName'), defaultVisible: true, align: 'left' },
        { key: 'currentStatus', label: t('columns.currentStatus'), defaultVisible: true, align: 'center' },
        { key: 'assignedTo', label: t('columns.assignedTo'), defaultVisible: true, align: 'left' },
        { key: 'expectedSlaDays', label: t('columns.expectedSlaDays'), defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'remainingDays', label: t('columns.remainingDays'), defaultVisible: true, align: 'center' },
        { key: 'propertyNo', label: t('columns.propertyNo'), defaultVisible: false, align: 'center' },
        { key: 'remarks', label: t('columns.remarks'), defaultVisible: false, align: 'left' },
      ],
      SLA_COMPLIANCE: [
        { key: 'id', label: t('columns.srNo'), defaultVisible: true, align: 'center' },
        { key: 'applicationNo', label: t('columns.applicationNo'), defaultVisible: true, align: 'left' },
        { key: 'applicantName', label: t('columns.applicantName'), defaultVisible: true, align: 'left' },
        { key: 'departmentName', label: t('columns.departmentName'), defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: t('columns.serviceName'), defaultVisible: true, align: 'left' },
        { key: 'expectedSlaDays', label: t('columns.expectedSlaDays'), defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'overdueDays', label: t('columns.overdueDays'), defaultVisible: true, align: 'center' },
        { key: 'currentStatus', label: t('columns.currentStatus'), defaultVisible: true, align: 'center' },
        { key: 'assignedTo', label: t('columns.assignedTo'), defaultVisible: true, align: 'left' },
        { key: 'remarks', label: t('columns.remarks'), defaultVisible: true, align: 'left' },
      ],
      SETTLEMENT: [
        { key: 'transactionId', label: t('columns.srNo'), defaultVisible: true, align: 'center' },
        { key: 'applicationNo', label: t('columns.applicationNo'), defaultVisible: true, align: 'left' },
        { key: 'receiptNo', label: t('columns.receiptNo'), defaultVisible: true, align: 'center' },
        { key: 'citizenName', label: t('columns.citizenName'), defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: t('columns.serviceName'), defaultVisible: true, align: 'left' },
        { key: 'paymentMode', label: t('columns.paymentMode'), defaultVisible: true, align: 'center' },
        { key: 'totalAmount', label: t('columns.totalAmount'), defaultVisible: true, align: 'right', isNumeric: true },
        { key: 'instrumentNo', label: t('columns.instrumentNo'), defaultVisible: true, align: 'center' },
        { key: 'instrumentDate', label: t('columns.instrumentDate'), defaultVisible: true, align: 'center' },
        { key: 'bankName', label: t('columns.bankName'), defaultVisible: true, align: 'left' },
        { key: 'clearanceDate', label: t('columns.clearanceDate'), defaultVisible: true, align: 'center' },
        { key: 'approvalStatus', label: t('columns.approvalStatus'), defaultVisible: true, align: 'center' },
        { key: 'remarks', label: t('columns.remarks'), defaultVisible: false, align: 'left' },
      ],
      DEPARTMENT_SUMMARY: [
        { key: 'srNo', label: t('columns.srNo'), defaultVisible: true, align: 'center' },
        { key: 'departmentName', label: t('columns.departmentName'), defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: t('columns.serviceName'), defaultVisible: true, align: 'left' },
        { key: 'totalApplications', label: t('columns.totalApplications'), defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'approvedCount', label: t('columns.approvedCount'), defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'approvedPercentage', label: t('columns.approvedPercentage'), defaultVisible: true, align: 'center' },
        { key: 'pendingCount', label: t('columns.pendingCount'), defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'rejectedCount', label: t('columns.rejectedCount'), defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'overdueCount', label: t('columns.overdueCount'), defaultVisible: true, align: 'center', isNumeric: true },
        { key: 'slaAdherencePercentage', label: t('columns.slaAdherencePercentage'), defaultVisible: true, align: 'center' },
        { key: 'totalCollectionAmount', label: t('columns.totalCollectionAmount'), defaultVisible: true, align: 'right', isNumeric: true },
      ],
      APPEALS: [
        { key: 'srNo', label: t('columns.srNo'), defaultVisible: true, align: 'center' },
        { key: 'appealNo', label: isMr ? 'अपील क्रमांक' : 'Appeal No', defaultVisible: true, align: 'left' },
        { key: 'applicationNo', label: t('columns.applicationNo'), defaultVisible: true, align: 'left' },
        { key: 'applicantName', label: t('columns.applicantName'), defaultVisible: true, align: 'left' },
        { key: 'departmentName', label: t('columns.departmentName'), defaultVisible: true, align: 'left' },
        { key: 'serviceName', label: t('columns.serviceName'), defaultVisible: true, align: 'left' },
        { key: 'appealLevel', label: isMr ? 'अपील स्तर' : 'Tier', defaultVisible: true, align: 'center' },
        { key: 'appealTypeName', label: isMr ? 'तक्रार प्रकार' : 'Ground', defaultVisible: true, align: 'center' },
        { key: 'createdDate', label: isMr ? 'दाखल दिनांक' : 'Filing Date', defaultVisible: true, align: 'center' },
        { key: 'appealStatus', label: t('columns.currentStatus'), defaultVisible: true, align: 'center' },
        { key: 'delayCondonation', label: isMr ? 'विलंब माफी' : 'Delay Condonation', defaultVisible: true, align: 'center' },
        { key: 'actionRemarks', label: t('columns.remarks'), defaultVisible: false, align: 'left' },
      ],
    };
  }, [t, isMr]);

  // 7. Visible Columns State
  const [visibleColumns, setVisibleColumns] = useState<Record<ReportDomain, string[]>>({
    COLLECTIONS: domainColumnsMap.COLLECTIONS.filter((c) => c.defaultVisible).map((c) => c.key),
    APPLICATIONS: domainColumnsMap.APPLICATIONS.filter((c) => c.defaultVisible).map((c) => c.key),
    SLA_COMPLIANCE: domainColumnsMap.SLA_COMPLIANCE.filter((c) => c.defaultVisible).map((c) => c.key),
    APPEALS: domainColumnsMap.APPEALS.filter((c) => c.defaultVisible).map((c) => c.key),
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
            departmentId: deptIdNum,
            serviceId: svcIdNum,
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
        } else if (activeDomain === 'APPEALS') {
          const res = await getRtsAppealsReportDataAction({
            pageNumber,
            pageSize,
            searchTerm: searchText.trim() || undefined,
            appealStatus: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          });

          setAppealItems(res.items);
          setTotalCount(res.totalCount);
          setTotalPages(res.totalPages);
          setTotalAmount(0);
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
          toast.info(t('export.downloading'));
          exportData = await getAllCollectionsForExportAction({
            departmentId: selectedDeptId !== 'ALL' ? Number(selectedDeptId) : undefined,
            serviceId: selectedServiceId !== 'ALL' ? Number(selectedServiceId) : undefined,
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
        toast.success(`Exported (${exportData.length} records)`);
      } else if (activeDomain === 'APPLICATIONS') {
        let exportData = applicationRows;
        if (scope === 'all' && totalCount > applicationRows.length) {
          toast.info(t('export.downloading'));
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
        toast.success(`Exported (${exportData.length} records)`);
      } else if (activeDomain === 'SLA_COMPLIANCE') {
        let exportData = applicationRows;
        if (scope === 'all' && totalCount > applicationRows.length) {
          toast.info(t('export.downloading'));
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
        toast.success(`Exported (${exportData.length} records)`);
      } else if (activeDomain === 'SETTLEMENT') {
        let exportData = collectionItems;
        if (scope === 'all' && totalCount > collectionItems.length) {
          toast.info(t('export.downloading'));
          exportData = await getAllCollectionsForExportAction({
            departmentId: selectedDeptId !== 'ALL' ? Number(selectedDeptId) : undefined,
            serviceId: selectedServiceId !== 'ALL' ? Number(selectedServiceId) : undefined,
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
        toast.success(`Exported (${exportData.length} records)`);
      } else if (activeDomain === 'DEPARTMENT_SUMMARY') {
        exportRtsDepartmentSummary(summaryItems, {
          format,
          appliedFilters,
          visibleColumnKeys: userVisibleKeys,
        });
        toast.success(`Exported (${summaryItems.length} records)`);
      } else if (activeDomain === 'APPEALS') {
        let exportData = appealItems;
        if (scope === 'all' && totalCount > appealItems.length) {
          toast.info(t('export.downloading'));
          exportData = await getAllAppealsForExportAction({
            searchTerm: searchText.trim() || undefined,
            appealStatus: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          });
        }
        exportRtsAppeals(exportData, {
          format,
          appliedFilters,
          visibleColumnKeys: userVisibleKeys,
        });
        toast.success(`Exported (${exportData.length} records)`);
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Failed to export report.');
    } finally {
      setIsExporting(false);
    }
  };

  // 12. Helper Badges and Formatters (100% localized, no english in marathi)
  const renderStatusBadge = (statusStr: string) => {
    const s = (statusStr || '').toUpperCase();
    if (s.includes('APPROV') || s.includes('CLEARED') || s.includes('PAID') || s.includes('SUCCESS')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3 w-3" />
          {t('status.approved')}
        </span>
      );
    }
    if (s.includes('BOUNC') || s.includes('REJECT') || s.includes('CANCEL') || s.includes('FAIL')) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
          <XCircle className="h-3 w-3" />
          {s.includes('CANCEL') ? t('status.cancelled') : s.includes('BOUNC') ? t('status.bounced') : t('status.rejected')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
        <Clock className="h-3 w-3" />
        {s.includes('PROCESS') ? t('status.inProcess') : s.includes('CLEARANCE') ? t('status.pendingClearance') : t('status.pending')}
      </span>
    );
  };

  const formatPaymentMode = (mode: string | undefined | null) => {
    const m = (mode || '').toUpperCase();
    if (m.includes('CASH')) return t('paymentModes.cash');
    if (m.includes('CHEQUE')) return t('paymentModes.cheque');
    if (m.includes('DD')) return t('paymentModes.dd');
    return t('paymentModes.online');
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(numLocale);
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Header Card - Official Banner */}
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
                {t('title')}
              </h1>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-bold text-[#173B73]">
                {t('badge')}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t('subtitle')}
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
              title={t('tabs.applications')}
            >
              <span>{t('tabs.applications')}</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
            <Link
              href={`/${locale}/rts/dashboard/rts-settlement`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition"
              title={t('tabs.settlement')}
            >
              <span>{t('tabs.settlement')}</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
            <Link
              href={`/${locale}/rts/dashboard/rts-mis`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition"
              title={t('tabs.departmentSummary')}
            >
              <span>{t('tabs.departmentSummary')}</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadReportData}
            disabled={isLoading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            title={t('filters.resetAll')}
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('filters.done')}</span>
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
            buttonLabel={t('export.button')}
          />
        </div>
      </Card>

      {/* 2. Report Domain Switcher (6 Major Report Categories - 100% localized) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {[
          {
            id: 'COLLECTIONS' as ReportDomain,
            label: t('tabs.collections'),
            sub: t('tabs.collectionsSub'),
            icon: IndianRupee,
            badge: activeDomain === 'COLLECTIONS' ? totalCount : null,
            color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
            activeClass: 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 text-emerald-900',
          },
          {
            id: 'APPLICATIONS' as ReportDomain,
            label: t('tabs.applications'),
            sub: t('tabs.applicationsSub'),
            icon: FileText,
            badge: activeDomain === 'APPLICATIONS' ? totalCount : null,
            color: 'text-blue-700 bg-blue-50 border-blue-200',
            activeClass: 'border-blue-600 bg-white ring-2 ring-blue-500/20 text-blue-900',
          },
          {
            id: 'SLA_COMPLIANCE' as ReportDomain,
            label: t('tabs.sla'),
            sub: t('tabs.slaSub'),
            icon: Clock,
            badge: activeDomain === 'SLA_COMPLIANCE' ? totalCount : null,
            color: 'text-amber-700 bg-amber-50 border-amber-200',
            activeClass: 'border-amber-600 bg-white ring-2 ring-amber-500/20 text-amber-900',
          },
          {
            id: 'SETTLEMENT' as ReportDomain,
            label: t('tabs.settlement'),
            sub: t('tabs.settlementSub'),
            icon: CreditCard,
            badge: activeDomain === 'SETTLEMENT' ? totalCount : null,
            color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
            activeClass: 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 text-indigo-900',
          },
          {
            id: 'DEPARTMENT_SUMMARY' as ReportDomain,
            label: t('tabs.departmentSummary'),
            sub: t('tabs.departmentSummarySub'),
            icon: Building2,
            badge: activeDomain === 'DEPARTMENT_SUMMARY' ? summaryItems.length : null,
            color: 'text-purple-700 bg-purple-50 border-purple-200',
            activeClass: 'border-purple-600 bg-white ring-2 ring-purple-500/20 text-purple-900',
          },
          {
            id: 'APPEALS' as ReportDomain,
            label: isMr ? 'अपील नोंदवही व अहवाल' : isHi ? 'अपील पंजी व रिपोर्ट' : 'Appeals Register',
            sub: isMr ? '१ ली व २ री अपीले, तक्रारीचा आधार व निकाल' : isHi ? 'प्रथम व द्वितीय अपील, शिकायत व निर्णय' : '1st & 2nd Appeals, Grounds & Orders',
            icon: Scale,
            badge: activeDomain === 'APPEALS' ? totalCount : null,
            color: 'text-amber-800 bg-amber-50 border-amber-300',
            activeClass: 'border-amber-600 bg-white ring-2 ring-amber-500/20 text-amber-950',
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
                {typeof domain.badge === 'number' && !isNaN(domain.badge) && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                    {domain.badge.toLocaleString(numLocale)}
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
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {t('kpi.totalRecords')}
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-slate-800">
            {(totalCount ?? 0).toLocaleString(numLocale)}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {t('kpi.matchingFilters')}
          </p>
        </div>

        {totalAmount > 0 && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              {t('kpi.totalRevenue')}
            </p>
            <p className="mt-1 font-mono text-2xl font-black text-emerald-800">
              ₹{(totalAmount ?? 0).toLocaleString(numLocale, { minimumFractionDigits: 2 })}
            </p>
            <p className="mt-0.5 text-[10px] text-emerald-600">
              {t('kpi.revenueSub')}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            {t('kpi.activeDepartment')}
          </p>
          <p className="mt-1 text-sm font-bold truncate text-blue-900">
            {selectedDeptId === 'ALL'
              ? t('kpi.allDepartments')
              : (() => {
                  const d = lookups.departments.find((x) => x.id === Number(selectedDeptId));
                  return isMr && d?.departmentNameLocal ? d.departmentNameLocal : d?.departmentName || t('kpi.activeDepartment');
                })()}
          </p>
          <p className="mt-0.5 text-[10px] text-blue-600">
            {selectedServiceId === 'ALL' ? t('filters.allServices') : t('filters.service')}
          </p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            {t('kpi.filterScope')}
          </p>
          <p className="mt-1 text-sm font-bold text-amber-900">
            {activeFiltersCount > 0 ? t('filters.activeFiltersCount', { count: activeFiltersCount }) : t('filters.unfilteredAll')}
          </p>
          <p className="mt-0.5 text-[10px] text-amber-600">
            {datePreset !== 'ALL' ? t(`filters.${datePreset.toLowerCase()}`) || datePreset : t('kpi.allHistory')}
          </p>
        </div>

        <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
            {t('kpi.exportReadiness')}
          </p>
          <p className="mt-1 text-sm font-bold text-purple-900">{t('kpi.exportFormats')}</p>
          <p className="mt-0.5 text-[10px] text-purple-600">{t('kpi.exportEncoding')}</p>
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
              <span>{showFilters ? t('filters.hideFilters') : t('filters.showFilters')}</span>
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
                <span>{t('filters.resetAll')} ({activeFiltersCount})</span>
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
                {t('filters.columns')} ({visibleColumns[activeDomain].length}/{domainColumnsMap[activeDomain].length})
              </span>
              <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isColumnDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Column Customizer Popover */}
            {isColumnDropdownOpen && (
              <div className="absolute right-0 z-50 mt-1.5 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-700">{t('filters.displayColumns')}</span>
                  <div className="flex gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={handleSelectAllColumns}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      {t('filters.selectAllColumns')}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleResetDefaultColumns}
                      className="text-slate-500 font-bold hover:underline"
                    >
                      {t('filters.resetColumns')}
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
                    {t('filters.done')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Filter Inputs (100% localized, no parenthesis bilingual strings) */}
        {showFilters && (
          <div className="pt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Department Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('filters.department')}
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
                <option value="ALL">{t('filters.allDepartments')}</option>
                {lookups.departments.map((dept) => (
                  <option key={dept.id} value={dept.id.toString()}>
                    {isMr && dept.departmentNameLocal ? dept.departmentNameLocal : dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Service Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('filters.service')}
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  setPageNumber(1);
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">{t('filters.allServices')}</option>
                {filteredServices.map((svc) => (
                  <option key={svc.id} value={svc.id.toString()}>
                    {isMr && svc.serviceNameLocal ? svc.serviceNameLocal : svc.serviceName}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Status Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('filters.status')}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPageNumber(1);
                }}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">{t('filters.allStatuses')}</option>
                {activeDomain === 'COLLECTIONS' || activeDomain === 'SETTLEMENT' ? (
                  <>
                    <option value="PENDING_CLEARANCE">{t('status.pendingClearance')}</option>
                    <option value="CLEARED">{t('status.cleared')}</option>
                    <option value="BOUNCED">{t('status.bounced')}</option>
                    <option value="CANCELLED">{t('status.cancelled')}</option>
                  </>
                ) : (
                  <>
                    <option value="Pending">{t('status.pending')}</option>
                    <option value="Approved">{t('status.approved')}</option>
                    <option value="Rejected">{t('status.rejected')}</option>
                    <option value="InProcess">{t('status.inProcess')}</option>
                  </>
                )}
              </select>
            </div>

            {/* 4. Payment Mode OR SLA Status */}
            {activeDomain === 'COLLECTIONS' || activeDomain === 'SETTLEMENT' ? (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t('filters.paymentMode')}
                </label>
                <select
                  value={selectedMode}
                  onChange={(e) => {
                    setSelectedMode(e.target.value);
                    setPageNumber(1);
                  }}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">{t('filters.allModes')}</option>
                  <option value="CASH">{t('paymentModes.cash')}</option>
                  <option value="CHEQUE">{t('paymentModes.cheque')}</option>
                  <option value="DD">{t('paymentModes.dd')}</option>
                  <option value="ONLINE">{t('paymentModes.online')}</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {t('filters.slaCondition')}
                </label>
                <select
                  value={selectedSla}
                  onChange={(e) => {
                    setSelectedSla(e.target.value);
                    setPageNumber(1);
                  }}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="ALL">{t('filters.allSla')}</option>
                  <option value="WITHIN_SLA">{t('filters.withinSla')}</option>
                  <option value="DUE_TODAY">{t('filters.dueToday')}</option>
                  <option value="OVERDUE">{t('filters.overdue')}</option>
                </select>
              </div>
            )}

            {/* 5. Date Range Presets */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('filters.datePreset')}
              </label>
              <select
                value={datePreset}
                onChange={(e) => handleDatePresetChange(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">{t('filters.allDates')}</option>
                <option value="TODAY">{t('filters.today')}</option>
                <option value="YESTERDAY">{t('filters.yesterday')}</option>
                <option value="WEEK">{t('filters.week')}</option>
                <option value="MONTH">{t('filters.month')}</option>
                <option value="LAST_30">{t('filters.last30')}</option>
                <option value="QUARTER">{t('filters.quarter')}</option>
              </select>
            </div>

            {/* 6. Custom From Date */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {t('filters.fromDate')}
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
                {t('filters.toDate')}
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
                {t('filters.search')}
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  placeholder={t('filters.searchPlaceholder')}
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
              {t('table.livePreview')} {domainColumnsMap[activeDomain] ? t(`tabs.${activeDomain === 'COLLECTIONS' ? 'collections' : activeDomain === 'APPLICATIONS' ? 'applications' : activeDomain === 'SLA_COMPLIANCE' ? 'sla' : activeDomain === 'SETTLEMENT' ? 'settlement' : 'departmentSummary'}`) : ''}
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700">
              {t('table.recordsCount', { count: (totalCount ?? 0).toLocaleString(numLocale) })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500">{t('table.pageSize')}</label>
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
                        <ArrowUpDown
                          className={`h-3 w-3 ${
                            sortKey === col.key
                              ? sortOrder === 'asc'
                                ? 'text-amber-300 opacity-100 rotate-180'
                                : 'text-amber-300 opacity-100'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        />
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
                      <span>{t('table.loading')}</span>
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
                      {t('table.noRecords')}
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
                            {formatDate(item.createdDate)}
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
                          <td className="px-3 py-2.5 text-slate-600">
                            {isMr && item.departmentNameLocal ? item.departmentNameLocal : item.departmentName || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('serviceName') && (
                          <td className="px-3 py-2.5 text-slate-700 font-medium">
                            {isMr && item.serviceNameLocal ? item.serviceNameLocal : item.serviceName || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('paymentMode') && (
                          <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px]">
                              {formatPaymentMode(item.paymentMode)}
                            </span>
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('totalAmount') && (
                          <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900">
                            ₹{Number(item.totalAmount || 0).toLocaleString(numLocale, { minimumFractionDigits: 2 })}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('bankName') && (
                          <td className="px-3 py-2.5 text-slate-600">{item.bankName || t('paymentModes.cash')}</td>
                        )}
                        {visibleColumns[activeDomain].includes('instrumentNo') && (
                          <td className="px-3 py-2.5 text-center font-mono text-slate-600">{item.instrumentNo || '—'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('instrumentDate') && (
                          <td className="px-3 py-2.5 text-center text-slate-600">
                            {formatDate(item.instrumentDate)}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('clearanceDate') && (
                          <td className="px-3 py-2.5 text-center text-slate-600">
                            {formatDate(item.clearanceDate)}
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
                      {t('table.noRecords')}
                    </td>
                  </tr>
                ) : (
                  summaryItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 divide-y divide-slate-100">
                      {visibleColumns[activeDomain].includes('srNo') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-500">{idx + 1}</td>
                      )}
                      {visibleColumns[activeDomain].includes('departmentName') && (
                        <td className="px-3 py-2.5 font-bold text-slate-800">
                          {isMr && item.departmentNameLocal ? item.departmentNameLocal : item.departmentName}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('serviceName') && (
                        <td className="px-3 py-2.5 text-slate-700">
                          {isMr && item.serviceNameLocal ? item.serviceNameLocal : item.serviceName}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('totalApplications') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-800">
                          {item.totalApplications.toLocaleString(numLocale)}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('approvedCount') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-emerald-700">
                          {item.approvedCount.toLocaleString(numLocale)}
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
                          {item.pendingCount.toLocaleString(numLocale)}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('rejectedCount') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-rose-700">
                          {item.rejectedCount.toLocaleString(numLocale)}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('overdueCount') && (
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-orange-700">
                          {item.overdueCount.toLocaleString(numLocale)}
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('slaAdherencePercentage') && (
                        <td className="px-3 py-2.5 text-center font-bold text-slate-800">
                          {item.slaAdherencePercentage}%
                        </td>
                      )}
                      {visibleColumns[activeDomain].includes('totalCollectionAmount') && (
                        <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900">
                          ₹{(item.totalCollectionAmount || 0).toLocaleString(numLocale, { minimumFractionDigits: 2 })}
                        </td>
                      )}
                    </tr>
                  ))
                )
              ) : activeDomain === 'APPEALS' ? (
                appealItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns[activeDomain].length}
                      className="py-12 text-center text-xs font-semibold text-slate-400"
                    >
                      {t('table.noRecords')}
                    </td>
                  </tr>
                ) : (
                  appealItems.map((item, idx) => {
                    const isEven = idx % 2 === 1;
                    return (
                      <tr
                        key={item.id || idx}
                        className={`transition hover:bg-blue-50/40 ${isEven ? 'bg-slate-50/40' : 'bg-white'}`}
                      >
                        {visibleColumns[activeDomain].includes('srNo') && (
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-500">
                            {(pageNumber - 1) * pageSize + idx + 1}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('appealNo') && (
                          <td className="px-3 py-2.5 font-mono font-bold text-blue-700">
                            {item.appealNo || (item.id ? `APP-${item.id}` : '—')}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('applicationNo') && (
                          <td className="px-3 py-2.5 font-mono font-bold text-slate-700">
                            {item.applicationNo || `RTS${item.applicationId}`}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('applicantName') && (
                          <td className="px-3 py-2.5 font-medium text-slate-800">
                            {item.applicantName || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('departmentName') && (
                          <td className="px-3 py-2.5 text-slate-600">
                            {item.departmentName || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('serviceName') && (
                          <td className="px-3 py-2.5 text-slate-700 font-medium">
                            {item.serviceName || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('appealLevel') && (
                          <td className="px-3 py-2.5 text-center">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                              item.appealLevel === 2
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              {item.appealLevelDisplay || (item.appealLevel === 2 ? '2nd Appeal' : '1st Appeal')}
                            </span>
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('appealTypeName') && (
                          <td className="px-3 py-2.5 text-center">
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                              {item.appealTypeName || '—'}
                            </span>
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('createdDate') && (
                          <td className="px-3 py-2.5 text-center text-slate-600 font-mono text-xs">
                            {formatDate(item.filingDate)}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('appealStatus') && (
                          <td className="px-3 py-2.5 text-center">
                            {renderStatusBadge(item.appealStatus || 'Submitted')}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('delayCondonation') && (
                          <td className="px-3 py-2.5 text-center">
                            {item.isDelayed ? (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                                {isMr ? 'कलम १८ आवश्यक' : 'Sec 18 Req'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('actionRemarks') && (
                          <td className="px-3 py-2.5 text-slate-600 text-xs max-w-xs truncate">
                            {item.actionRemarks || '—'}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )
              ) : (
                applicationRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns[activeDomain].length}
                      className="py-12 text-center text-xs font-semibold text-slate-400"
                    >
                      {t('table.noRecords')}
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
                            {formatDate(row.applicationDate)}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('applicantName') && (
                          <td className="px-3 py-2.5 font-medium text-slate-800">{row.applicantName || '—'}</td>
                        )}
                        {visibleColumns[activeDomain].includes('departmentName') && (
                          <td className="px-3 py-2.5 text-slate-600">
                            {isMr && row.departmentNameLocal ? row.departmentNameLocal : row.departmentName || '—'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('serviceName') && (
                          <td className="px-3 py-2.5 text-slate-700 font-medium">
                            {isMr && row.serviceNameLocal ? row.serviceNameLocal : row.serviceName || '—'}
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
                            {row.expectedSlaDays ? `${row.expectedSlaDays}` : '7'}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('remainingDays') && (
                          <td className="px-3 py-2.5 text-center">
                            {row.overdueDays && row.overdueDays > 0 ? (
                              <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                {row.overdueDays} {t('table.daysOverdue')}
                              </span>
                            ) : row.dueDays === 0 || row.remainingDays === 0 ? (
                              <span className="rounded bg-orange-50 border border-orange-200 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                                {t('table.dueToday')}
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                {row.remainingDays ?? 0} {t('table.daysLeft')}
                              </span>
                            )}
                          </td>
                        )}
                        {visibleColumns[activeDomain].includes('overdueDays') && (
                          <td className="px-3 py-2.5 text-center">
                            {row.overdueDays && row.overdueDays > 0 ? (
                              <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                {row.overdueDays} {t('table.breached')}
                              </span>
                            ) : (
                              <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                {t('table.compliant')}
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
                    {t('table.totalAmountSum')}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-black text-slate-900 text-sm">
                    ₹{totalAmount.toLocaleString(numLocale, { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="px-3 py-2.5 text-left text-slate-500 font-normal">
                    {t('table.totalEntriesCount', { count: (totalCount ?? 0).toLocaleString(numLocale) })}
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
              {t('table.showing', {
                current: pageNumber,
                totalPages: totalPages,
                total: (totalCount ?? 0).toLocaleString(numLocale),
              })}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(1)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                {t('table.first')}
              </button>
              <button
                type="button"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                {t('table.previous')}
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
                {t('table.next')}
              </button>
              <button
                type="button"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber(totalPages)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                {t('table.last')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

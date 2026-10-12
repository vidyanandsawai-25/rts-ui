'use client';

import { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  CheckCircle2,
  XCircle,
  Ban,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Search,
  Clock,
  Clock3,
  Receipt,
  Eye,
  Check,
  X,
  Printer,
  CreditCard,
  ShieldCheck,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Card,
  Modal,
  Label,
} from '@/components/common';
import {
  getPendingClearancePaymentsAction,
  getClearanceStatsAction,
  approveClearanceAction,
  disapproveClearanceAction,
  cancelReceiptAction,
  uploadBulkClearanceAction,
  getBanksAction,
  getCancellationLogsAction,
} from '@/app/[locale]/service/payment/actions';
import type {
  PendingClearanceItem,
  PendingClearanceStats,
  PendingClearanceQuery,
  BulkClearanceResponse,
  RTSBankLookup,
  ReceiptCancellationLog,
} from '@/lib/api/rts/rtspayment.service';

interface RtsPaymentSettlementDashboardProps {
  locale: string;
}

type SettlementSortKey =
  | 'applicationNo'
  | 'citizenName'
  | 'serviceName'
  | 'paymentMode'
  | 'instrumentNo'
  | 'totalAmount'
  | 'paymentStatus'
  | 'receiptNo';

type SortDirection = 'asc' | 'desc';

export const RtsPaymentSettlementDashboard: React.FC<RtsPaymentSettlementDashboardProps> = ({
  locale,
}) => {
  const t = useTranslations('rts');
  const isMr = locale === 'mr';
  const displayLocale = isMr ? 'mr-IN' : 'en-IN';

  const [isPending, startTransition] = useTransition();

  const numberFormatter = useMemo(() => new Intl.NumberFormat(displayLocale), [displayLocale]);
  const formatCurrency = useCallback(
    (amount: number) => `₹ ${numberFormatter.format(amount || 0)}`,
    [numberFormatter]
  );

  // Data States
  const [items, setItems] = useState<PendingClearanceItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stats, setStats] = useState<PendingClearanceStats>({
    totalPendingDdCheque: 0,
    totalPendingOnline: 0,
    totalClearedToday: 0,
    totalBounced: 0,
    totalCancelled: 0,
    totalClearedAmountToday: 0,
  });

  // Filter States
  const [activeTab, setActiveTab] = useState<string>('PENDING_CLEARANCE');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [selectedBankName, setSelectedBankName] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Sorting States
  const [sortKey, setSortKey] = useState<SettlementSortKey | null>('applicationNo');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = useCallback((key: SettlementSortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDirection((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDirection('asc');
      return key;
    });
  }, []);

  // Lookup data
  const [banks, setBanks] = useState<RTSBankLookup[]>([]);

  // Modals States
  const [selectedItem, setSelectedItem] = useState<PendingClearanceItem | null>(null);

  // 1. Approve Clearance Modal
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [clearanceDate, setClearanceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [bankRefNo, setBankRefNo] = useState<string>('');
  const [actionRemarks, setActionRemarks] = useState<string>('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // 2. Disapprove / Bounce Modal
  const [isDisapproveOpen, setIsDisapproveOpen] = useState(false);
  const [selectedBounceReason, setSelectedBounceReason] = useState<string>('');
  const [bouncePenalty, setBouncePenalty] = useState<number>(500);

  // 3. Cancel Receipt Modal
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelledByOfficer, setCancelledByOfficer] = useState<string>('Account Officer');

  // 4. Bulk Excel Modal
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkClearanceResponse | null>(null);

  // 5. Digital Receipt View Modal
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptItem, setReceiptItem] = useState<PendingClearanceItem | null>(null);

  // 6. Cancellation Audit Trail Modal
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<ReceiptCancellationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Bounce Reasons list
  const bounceReasonsList = useMemo(
    () => [
      t('paymentSettlement.bounceReasons.insufficientFunds'),
      t('paymentSettlement.bounceReasons.signatureMismatch'),
      t('paymentSettlement.bounceReasons.accountClosed'),
      t('paymentSettlement.bounceReasons.staleCheque'),
      t('paymentSettlement.bounceReasons.stoppedPayment'),
      t('paymentSettlement.bounceReasons.drawerAccountFrozen'),
      t('paymentSettlement.bounceReasons.referToDrawer'),
    ],
    [t]
  );

  // Load Banks Lookup on Mount
  useEffect(() => {
    async function fetchBanks() {
      try {
        const res = await getBanksAction();
        if (res.success && res.data) {
          setBanks(res.data);
        }
      } catch (err) {
        console.error('Failed to load banks lookup:', err);
      }
    }
    fetchBanks();
  }, []);

  // Fetch Stats & Grid Data
  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const statsRes = await getClearanceStatsAction();
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        const query: PendingClearanceQuery = {
          pageNumber,
          pageSize,
          statusCode: activeTab !== 'ALL' ? activeTab : undefined,
          paymentMode: selectedMode !== 'ALL' ? selectedMode : undefined,
          searchText: searchText.trim() || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        };

        const res = await getPendingClearancePaymentsAction(query);
        if (res.success && res.data) {
          setItems(res.data.items);
          setTotalCount(res.data.totalCount);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setItems([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Error fetching settlement dashboard data:', err);
        toast.error(t('paymentSettlement.table.empty'));
      }
    });
  }, [pageNumber, pageSize, activeTab, selectedMode, searchText, fromDate, toDate, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
    loadData();
  };

  const handleResetFilters = () => {
    setSearchText('');
    setSelectedMode('ALL');
    setSelectedBankName('ALL');
    setFromDate('');
    setToDate('');
    setPageNumber(1);
  };

  // 1. Handle Approve Modal
  const handleOpenApprove = (item: PendingClearanceItem) => {
    setSelectedItem(item);
    setClearanceDate(new Date().toISOString().split('T')[0]);
    setBankRefNo(item.bankRefNo || '');
    setActionRemarks('');
    setIsApproveOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedItem) return;
    setIsSubmittingAction(true);
    try {
      const res = await approveClearanceAction({
        transactionId: selectedItem.transactionId,
        clearanceDate: clearanceDate,
        bankRefNo: bankRefNo || undefined,
        remarks: actionRemarks || undefined,
      });

      if (res.success) {
        toast.success(t('paymentSettlement.messages.approvedSuccess'));
        setIsApproveOpen(false);
        loadData();
      } else {
        toast.error(res.error || 'Failed to approve clearance.');
      }
    } catch {
      toast.error('Error processing approval.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // 2. Handle Disapprove / Bounce Modal
  const handleOpenDisapprove = (item: PendingClearanceItem) => {
    setSelectedItem(item);
    setSelectedBounceReason(bounceReasonsList[0] || '');
    setBouncePenalty(500);
    setActionRemarks('');
    setIsDisapproveOpen(true);
  };

  const handleConfirmDisapprove = async () => {
    if (!selectedItem) return;
    const finalReason = selectedBounceReason;
    if (!finalReason) {
      toast.error(t('paymentSettlement.fields.bounceReason'));
      return;
    }

    setIsSubmittingAction(true);
    try {
      const penaltyNote = bouncePenalty > 0 ? ` [Penalty: ₹${bouncePenalty}]` : '';
      const combinedRemarks = actionRemarks ? `${actionRemarks}${penaltyNote}` : (penaltyNote.trim() || undefined);

      const res = await disapproveClearanceAction({
        transactionId: selectedItem.transactionId,
        reason: finalReason,
        remarks: combinedRemarks,
      });

      if (res.success) {
        toast.success(t('paymentSettlement.messages.bounceSuccess'));
        setIsDisapproveOpen(false);
        loadData();
      } else {
        toast.error(res.error || 'Failed to record bounce.');
      }
    } catch {
      toast.error('Error processing bounce record.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // 3. Handle Cancel Receipt Modal
  const handleOpenCancel = (item: PendingClearanceItem) => {
    setSelectedItem(item);
    setCancelReason('');
    setCancelledByOfficer('Account Officer');
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedItem) return;
    if (!cancelReason.trim()) {
      toast.error(t('paymentSettlement.fields.cancellationReason'));
      return;
    }

    setIsSubmittingAction(true);
    try {
      const res = await cancelReceiptAction({
        transactionId: selectedItem.transactionId,
        reason: cancelReason.trim(),
        remarks: cancelledByOfficer || undefined,
      });

      if (res.success) {
        toast.success(t('paymentSettlement.messages.cancelSuccess'));
        setIsCancelOpen(false);
        loadData();
      } else {
        toast.error(res.error || 'Failed to cancel receipt.');
      }
    } catch {
      toast.error('Error cancelling receipt.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // 4. Handle Digital Receipt View
  const handleOpenReceipt = (item: PendingClearanceItem) => {
    setReceiptItem(item);
    setIsReceiptOpen(true);
  };

  // 5. Handle Audit Logs
  const handleOpenAuditLog = async (item: PendingClearanceItem) => {
    setSelectedItem(item);
    setIsAuditModalOpen(true);
    setIsLoadingLogs(true);
    try {
      const res = await getCancellationLogsAction(item.applicationId, item.transactionId);
      if (res.success && res.data) {
        setAuditLogs(res.data);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.error('Failed to load cancellation logs:', err);
      setAuditLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // 6. Bulk Excel Upload
  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error(t('paymentSettlement.messages.invalidFile'));
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', bulkFile);
      const res = await uploadBulkClearanceAction(formData);
      if (res.success && res.data) {
        setBulkResult(res.data);
        toast.success(t('paymentSettlement.messages.uploadSuccess'));
        loadData();
      } else {
        toast.error(res.error || 'Bulk upload failed.');
      }
    } catch {
      toast.error('Error during bulk file upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // KPI Metrics list matching RTS Dashboard format
  const kpiCards = useMemo(
    () => [
      {
        key: 'pendingDdCheque',
        label: t('paymentSettlement.kpi.pendingAmount'),
        value: stats.totalPendingDdCheque,
        subValue: t('paymentSettlement.kpi.txnCount', { count: stats.totalPendingDdCheque }),
        borderClassName: 'border-l-[#F59E0B]',
        iconClassName: 'bg-amber-50 border-amber-100 text-[#F59E0B]',
        Icon: Clock3,
        tabId: 'PENDING_CLEARANCE',
        mode: 'CHEQUE',
      },
      {
        key: 'pendingOnline',
        label: t('paymentSettlement.tabs.online'),
        value: stats.totalPendingOnline,
        subValue: t('paymentSettlement.kpi.txnCount', { count: stats.totalPendingOnline }),
        borderClassName: 'border-l-[#2563EB]',
        iconClassName: 'bg-blue-50 border-blue-100 text-[#2563EB]',
        Icon: CreditCard,
        tabId: 'PENDING',
        mode: 'ONLINE',
      },
      {
        key: 'todayCleared',
        label: t('paymentSettlement.kpi.todayCleared'),
        value: stats.totalClearedToday,
        subValue: formatCurrency(stats.totalClearedAmountToday),
        borderClassName: 'border-l-[#10B981]',
        iconClassName: 'bg-emerald-50 border-emerald-100 text-[#10B981]',
        Icon: CheckCircle2,
        tabId: 'SUCCESS',
        mode: 'ALL',
      },
      {
        key: 'bounced',
        label: t('paymentSettlement.kpi.bouncedCheques'),
        value: stats.totalBounced,
        subValue: t('paymentSettlement.kpi.txnCount', { count: stats.totalBounced }),
        borderClassName: 'border-l-rose-500',
        iconClassName: 'bg-rose-50 border-rose-100 text-rose-600',
        Icon: XCircle,
        tabId: 'BOUNCED',
        mode: 'ALL',
      },
      {
        key: 'cancelled',
        label: t('paymentSettlement.kpi.cancelledReceipts'),
        value: stats.totalCancelled,
        subValue: t('paymentSettlement.kpi.receiptsCount', { count: stats.totalCancelled }),
        borderClassName: 'border-l-violet-500',
        iconClassName: 'bg-violet-50 border-violet-100 text-violet-600',
        Icon: Ban,
        tabId: 'CANCELLED',
        mode: 'ALL',
      },
    ],
    [stats, t, formatCurrency]
  );

  const tabs = useMemo(
    () => [
      {
        id: 'PENDING_CLEARANCE',
        label: t('paymentSettlement.tabs.chequeDd'),
        count: stats.totalPendingDdCheque,
      },
      {
        id: 'PENDING',
        label: t('paymentSettlement.tabs.online'),
        count: stats.totalPendingOnline,
      },
      {
        id: 'SUCCESS',
        label: t('paymentSettlement.tabs.cleared'),
        count: stats.totalClearedToday,
      },
      {
        id: 'BOUNCED',
        label: t('paymentSettlement.tabs.bounced'),
        count: stats.totalBounced,
      },
      {
        id: 'CANCELLED',
        label: t('paymentSettlement.tabs.cancelled'),
        count: stats.totalCancelled,
      },
      {
        id: 'ALL',
        label: t('paymentSettlement.tabs.allPending'),
        count: totalCount,
      },
    ],
    [stats, totalCount, t]
  );

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    return [...items].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (sortKey === 'totalAmount') {
        const numA = Number(valA) || 0;
        const numB = Number(valB) || 0;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const strA = (valA ?? '').toString().toLowerCase();
      const strB = (valB ?? '').toString().toLowerCase();

      return sortDirection === 'asc'
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [items, sortKey, sortDirection]);

  const renderSortableHeader = useCallback(
    (key: SettlementSortKey, label: string, align: 'left' | 'center' | 'right' = 'left') => {
      const isActive = sortKey === key;
      const Icon = !isActive ? ArrowUpDown : sortDirection === 'asc' ? ArrowUp : ArrowDown;

      return (
        <button
          type="button"
          onClick={() => handleSort(key)}
          className={`group inline-flex items-center gap-1.5 rounded px-1 py-0.5 text-inherit transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/80 ${align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''
            }`}
          title={`${label} द्वारे क्रमवारी लावा`}
        >
          <span>{label}</span>
          <Icon
            aria-hidden
            className={`h-3 w-3 shrink-0 ${isActive ? 'opacity-100 text-amber-300' : 'opacity-60 group-hover:opacity-100'
              }`}
          />
        </button>
      );
    },
    [sortKey, sortDirection, handleSort]
  );

  return (
    <div className="space-y-4">
      {/* 1. Header Card - Pure RTS White Aesthetic */}
      <Card
        padding="sm"
        className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-800">
                {t('paymentSettlement.title')}
              </h1>
              <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold text-[#173B73]">
                {t('paymentSettlement.badge')}
              </span>
            </div>
            <p className="mt-0.5 text-[13px] text-slate-500">
              {t('paymentSettlement.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/${locale}/rts/dashboard/rts-reports`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-100"
            title="Open RTS Central Report Engine"
          >
            <Layers className="h-4 w-4 text-blue-600" />
            <span>Reports Center</span>
          </Link>

          <a
            href="/api/rts/clearance-template"
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            {t('paymentSettlement.buttons.downloadTemplate')}
          </a>

          <button
            onClick={() => {
              setBulkFile(null);
              setBulkResult(null);
              setIsBulkOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#173B73] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#122e5a]"
          >
            <Upload className="h-4 w-4" />
            {t('paymentSettlement.buttons.bulkUpload')}
          </button>

          <button
            onClick={() => loadData()}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            title={t('paymentSettlement.buttons.refresh')}
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </Card>

      {/* 2. KPI Cards - RTS Left-Bordered Card Pattern */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((metric) => (
          <Card
            key={metric.key}
            padding="none"
            className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-[4px] ${metric.borderClassName}`}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab(metric.tabId);
                setSelectedMode(metric.mode);
                setPageNumber(1);
              }}
              className="flex w-full items-center justify-between px-3.5 py-4 text-left"
            >
              <div className="flex flex-col min-w-0">
                <span
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate"
                  title={metric.label}
                >
                  {metric.label}
                </span>

                <div className="mt-2.5 flex items-baseline gap-1">
                  <span className="text-2xl font-bold tracking-tight text-slate-900">
                    {numberFormatter.format(metric.value)}
                  </span>
                </div>

                <span className="mt-1 text-[11px] font-medium text-slate-500">
                  {metric.subValue}
                </span>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${metric.iconClassName}`}
              >
                <metric.Icon className="h-5 w-5" />
              </div>
            </button>
          </Card>
        ))}
      </div>

      {/* 3. Filter Bar & Tabs */}
      <Card padding="md" className="rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPageNumber(1);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${activeTab === tab.id
                  ? 'bg-[#173B73] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                    }`}
                >
                  {numberFormatter.format(tab.count)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filter Inputs Form */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 items-end">
          {/* Search Box */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">
              {t('paymentSettlement.filters.searchLabel')}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('paymentSettlement.filters.searchPlaceholder')}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-[#173B73] focus:outline-none focus:ring-1 focus:ring-[#173B73]"
              />
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">
              {t('paymentSettlement.table.mode')}
            </Label>
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#173B73] focus:outline-none focus:ring-1 focus:ring-[#173B73]"
            >
              <option value="ALL">{t('paymentSettlement.filters.allModes')}</option>
              <option value="CHEQUE">{t('paymentSettlement.filters.cheque')}</option>
              <option value="DD">{t('paymentSettlement.filters.dd')}</option>
              <option value="ONLINE">{t('paymentSettlement.filters.online')}</option>
              <option value="CASH">{t('paymentSettlement.filters.cash')}</option>
            </select>
          </div>

          {/* Bank Master Dropdown */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">
              {t('paymentSettlement.table.bank')}
            </Label>
            <select
              value={selectedBankName}
              onChange={(e) => {
                setSelectedBankName(e.target.value);
                setPageNumber(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#173B73] focus:outline-none focus:ring-1 focus:ring-[#173B73]"
            >
              <option value="ALL">{t('paymentSettlement.filters.allBanks')}</option>
              {banks.map((b) => (
                <option key={b.id} value={b.bankName}>
                  {b.bankName}
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">
              {t('paymentSettlement.filters.fromDate')}
            </Label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#173B73] focus:outline-none focus:ring-1 focus:ring-[#173B73]"
            />
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-600">
              {t('paymentSettlement.filters.toDate')}
            </Label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#173B73] focus:outline-none focus:ring-1 focus:ring-[#173B73]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl bg-[#173B73] py-2 px-3 text-xs font-bold text-white shadow-sm hover:bg-[#122e5a] transition"
            >
              {t('paymentSettlement.buttons.filter')}
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              {t('paymentSettlement.buttons.clearFilters')}
            </button>
          </div>
        </form>
      </Card>

      {/* 4. Transactions Data Table - Signature RTS Akola #0A3275 Header with Column Sorting */}
      <Card padding="none" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-[#0A3275] text-white text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">{t('paymentSettlement.table.srNo')}</th>
                <th className="py-3.5 px-4">
                  {renderSortableHeader('applicationNo', t('paymentSettlement.table.applicationNo'))}
                </th>
                <th className="py-3.5 px-4">
                  {renderSortableHeader('citizenName', t('paymentSettlement.table.applicant'))}
                </th>
                <th className="py-3.5 px-4">
                  {renderSortableHeader('serviceName', t('paymentSettlement.table.service'))}
                </th>
                <th className="py-3.5 px-4">
                  {renderSortableHeader('paymentMode', t('paymentSettlement.table.mode'))}
                </th>
                <th className="py-3.5 px-4">
                  {renderSortableHeader('instrumentNo', t('paymentSettlement.table.instrument'))}
                </th>
                <th className="py-3.5 px-4 text-right">
                  {renderSortableHeader('totalAmount', t('paymentSettlement.table.amount'), 'right')}
                </th>
                <th className="py-3.5 px-4 text-center">
                  {renderSortableHeader('paymentStatus', t('paymentSettlement.table.status'), 'center')}
                </th>
                <th className="py-3.5 px-4 text-center">
                  {renderSortableHeader('receiptNo', t('paymentSettlement.table.receiptNo'), 'center')}
                </th>
                <th className="py-3.5 px-4 text-center w-40">{t('paymentSettlement.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Receipt className="h-7 w-7" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {t('paymentSettlement.table.empty')}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedItems.map((item, index) => {
                  const isSuccess = item.paymentStatus?.toUpperCase() === 'SUCCESS';
                  const isBounced = item.paymentStatus?.toUpperCase() === 'BOUNCED';
                  const isPendingClearance =
                    item.paymentStatus?.toUpperCase() === 'PENDING_CLEARANCE' ||
                    item.paymentStatus?.toUpperCase() === 'PENDING';
                  const isCancelled = item.isReceiptCancelled;

                  return (
                    <tr
                      key={item.transactionId}
                      className={`hover:bg-blue-50/40 transition-colors ${isCancelled ? 'bg-rose-50/20' : ''
                        }`}
                    >
                      {/* Sr. No. */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                        {numberFormatter.format((pageNumber - 1) * pageSize + index + 1)}
                      </td>

                      {/* App No */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#173B73] font-mono text-[13px]">
                          {item.applicationNo}
                        </div>
                      </td>

                      {/* Citizen */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold">
                          {item.citizenName || '-'}
                        </div>
                        {item.citizenMobile && (
                          <div className="text-[11px] text-slate-400 font-mono">{item.citizenMobile}</div>
                        )}
                      </td>

                      {/* Service & Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900 leading-snug">
                          {item.serviceName}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 mt-0.5">
                          {item.departmentName}
                        </div>
                      </td>

                      {/* Mode Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${item.paymentMode === 'CHEQUE'
                              ? 'bg-amber-100 text-amber-800'
                              : item.paymentMode === 'DD'
                                ? 'bg-purple-100 text-purple-800'
                                : item.paymentMode === 'ONLINE'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                          {item.paymentMode}
                        </span>
                      </td>

                      {/* Instrument & Bank Info */}
                      <td className="py-3.5 px-4">
                        {item.instrumentNo ? (
                          <div>
                            <span className="font-mono font-bold text-slate-800 text-[11px]">
                              #{item.instrumentNo}
                            </span>
                            {item.instrumentDate && (
                              <span className="text-slate-400 text-[10px] ml-1">
                                ({new Date(item.instrumentDate).toLocaleDateString(displayLocale)})
                              </span>
                            )}
                            <div className="text-[11px] text-slate-600 truncate max-w-[180px]">
                              {item.bankName} {item.branchName ? `(${item.branchName})` : ''}
                            </div>
                          </div>
                        ) : item.bankRefNo ? (
                          <div>
                            <span className="font-mono text-[11px] text-slate-600">
                              Ref: {item.bankRefNo}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-slate-900 font-mono text-[13px]">
                          {formatCurrency(item.totalAmount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isCancelled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-black text-rose-800 border border-rose-300">
                            <Ban className="h-3 w-3 text-rose-600" />
                            {t('paymentSettlement.status.cancelled')}
                          </span>
                        ) : isBounced ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                            <XCircle className="h-3 w-3 text-rose-500" />
                            {t('paymentSettlement.status.bounced')}
                          </span>
                        ) : isSuccess ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {t('paymentSettlement.status.cleared')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                            <Clock className="h-3 w-3 text-amber-500" />
                            {t('paymentSettlement.status.pending')}
                          </span>
                        )}
                      </td>

                      {/* Receipt No */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {item.receiptNo ? (
                          <div>
                            <span
                              className={`font-bold ${item.receiptNo.startsWith('PROV/')
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                                }`}
                            >
                              {item.receiptNo}
                            </span>
                            {item.receiptDate && (
                              <div className="text-[10px] text-slate-400">
                                {new Date(item.receiptDate).toLocaleDateString(displayLocale)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isPendingClearance && (
                            <>
                              <button
                                onClick={() => handleOpenApprove(item)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-600 transition"
                                title={t('paymentSettlement.buttons.approve')}
                              >
                                <Check className="h-3.5 w-3.5" />
                                {t('paymentSettlement.buttons.approve')}
                              </button>

                              <button
                                onClick={() => handleOpenDisapprove(item)}
                                className="inline-flex items-center gap-1 rounded-lg bg-rose-700 px-2 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-rose-600 transition"
                                title={t('paymentSettlement.buttons.bounce')}
                              >
                                <X className="h-3.5 w-3.5" />
                                {t('paymentSettlement.buttons.bounce')}
                              </button>
                            </>
                          )}

                          {isSuccess && !isCancelled && (
                            <>
                              <button
                                onClick={() => handleOpenReceipt(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                                title={t('paymentSettlement.buttons.viewReceipt')}
                              >
                                <Eye className="h-3.5 w-3.5 text-blue-600" />
                                {t('paymentSettlement.buttons.viewReceipt')}
                              </button>

                              <button
                                onClick={() => handleOpenCancel(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition"
                                title={t('paymentSettlement.buttons.cancelReceipt')}
                              >
                                <Ban className="h-3.5 w-3.5" />
                                {t('paymentSettlement.buttons.cancelReceipt')}
                              </button>
                            </>
                          )}

                          {isCancelled && (
                            <>
                              <button
                                onClick={() => handleOpenReceipt(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition"
                                title={t('paymentSettlement.buttons.viewReceipt')}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                {t('paymentSettlement.buttons.viewReceipt')}
                              </button>

                              <button
                                onClick={() => handleOpenAuditLog(item)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                                title={t('paymentSettlement.buttons.auditTrail')}
                              >
                                <FileSpreadsheet className="h-3.5 w-3.5 text-[#173B73]" />
                                {t('paymentSettlement.buttons.auditTrail')}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:flex-row">
          <div className="text-xs text-slate-500">
            {t('paymentSettlement.filters.recordsCount', { count: totalCount })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('paymentSettlement.buttons.previous')}
            </button>

            <span className="text-xs font-bold text-slate-700 px-2">
              {numberFormatter.format(pageNumber)} / {numberFormatter.format(totalPages)}
            </span>

            <button
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              disabled={pageNumber >= totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {t('paymentSettlement.buttons.next')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* 5. Approve Clearance Modal */}
      <Modal
        open={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('paymentSettlement.modals.approveTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('paymentSettlement.table.applicationNo')}: {selectedItem?.applicationNo}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-2 text-xs">
          {/* Summary Box */}
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-slate-700">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">{t('paymentSettlement.table.applicant')}:</span>
                <span className="font-bold text-slate-800">{selectedItem?.citizenName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t('paymentSettlement.table.amount')}:</span>
                <span className="font-black text-emerald-800 text-sm">
                  {formatCurrency(selectedItem?.totalAmount || 0)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t('paymentSettlement.table.instrument')}:</span>
                <span className="font-mono font-bold text-slate-900">
                  {selectedItem?.instrumentNo || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">{t('paymentSettlement.table.bank')}:</span>
                <span className="font-semibold text-slate-900">
                  {selectedItem?.bankName || '-'} {selectedItem?.branchName ? `(${selectedItem.branchName})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {t('paymentSettlement.fields.clearanceDate')} *
              </Label>
              <input
                type="date"
                value={clearanceDate}
                onChange={(e) => setClearanceDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {t('paymentSettlement.fields.remarks')}
              </Label>
              <input
                type="text"
                placeholder={t('paymentSettlement.fields.remarksPlaceholder')}
                value={bankRefNo}
                onChange={(e) => setBankRefNo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {t('paymentSettlement.fields.remarks')}
              </Label>
              <textarea
                rows={2}
                placeholder={t('paymentSettlement.fields.remarksPlaceholder')}
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="rounded-xl bg-blue-50 p-2.5 text-[11px] text-blue-800 border border-blue-100 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
            <span>
              {t('paymentSettlement.modals.approveSubtitle')}
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsApproveOpen(false)}
              disabled={isSubmittingAction}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('paymentSettlement.buttons.close')}
            </button>
            <button
              type="button"
              onClick={handleConfirmApprove}
              disabled={isSubmittingAction}
              className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {isSubmittingAction ? '...' : t('paymentSettlement.buttons.submit')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 6. Disapprove / Bounce Modal */}
      <Modal
        open={isDisapproveOpen}
        onClose={() => setIsDisapproveOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-700 text-white shadow-sm">
              <X className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('paymentSettlement.modals.bounceTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('paymentSettlement.table.applicationNo')}: {selectedItem?.applicationNo}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">{t('paymentSettlement.table.instrument')}:</span>
              <span className="font-mono font-bold text-slate-900">{selectedItem?.instrumentNo || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('paymentSettlement.table.bank')}:</span>
              <span className="font-semibold">{selectedItem?.bankName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{t('paymentSettlement.table.amount')}:</span>
              <span className="font-bold text-rose-700">{formatCurrency(selectedItem?.totalAmount || 0)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {t('paymentSettlement.fields.bounceReason')} *
              </Label>
              <select
                value={selectedBounceReason}
                onChange={(e) => setSelectedBounceReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
              >
                {bounceReasonsList.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {t('paymentSettlement.fields.penaltyAmount')}
              </Label>
              <input
                type="number"
                min={0}
                value={bouncePenalty}
                onChange={(e) => setBouncePenalty(Number(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {t('paymentSettlement.fields.remarks')}
              </Label>
              <textarea
                rows={2}
                placeholder={t('paymentSettlement.fields.remarksPlaceholder')}
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDisapproveOpen(false)}
              disabled={isSubmittingAction}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('paymentSettlement.buttons.close')}
            </button>
            <button
              type="button"
              onClick={handleConfirmDisapprove}
              disabled={isSubmittingAction}
              className="rounded-xl bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-600 transition disabled:opacity-50"
            >
              {isSubmittingAction ? '...' : t('paymentSettlement.buttons.submit')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 7. Cancel Receipt & Reversal Modal */}
      <Modal
        open={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-800 text-white shadow-sm">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('paymentSettlement.modals.cancelTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('paymentSettlement.table.receiptNo')}: {selectedItem?.receiptNo}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 space-y-1.5 text-slate-700">
            <div className="flex items-center gap-2 text-rose-800 font-bold">
              <AlertOctagon className="h-4 w-4 shrink-0 text-rose-700" />
              <span>{t('paymentSettlement.messages.confirmCancel')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-rose-200/60 mt-2">
              <div>
                <span className="text-slate-500 block text-[11px]">{t('paymentSettlement.table.applicationNo')}:</span>
                <span className="font-mono font-bold text-slate-900">{selectedItem?.applicationNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">{t('paymentSettlement.table.amount')}:</span>
                <span className="font-black text-rose-800">{formatCurrency(selectedItem?.totalAmount || 0)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {t('paymentSettlement.fields.cancellationReason')} *
              </Label>
              <textarea
                rows={3}
                placeholder={t('paymentSettlement.fields.cancellationReasonPlaceholder')}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-800 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">
                {t('paymentSettlement.fields.cancelledBy')}
              </Label>
              <input
                type="text"
                value={cancelledByOfficer}
                onChange={(e) => setCancelledByOfficer(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCancelOpen(false)}
              disabled={isSubmittingAction}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('paymentSettlement.buttons.close')}
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={isSubmittingAction}
              className="rounded-xl bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-800 transition disabled:opacity-50"
            >
              {isSubmittingAction ? '...' : t('paymentSettlement.buttons.submit')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 8. Bulk Bank Scroll Upload Modal */}
      <Modal
        open={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#173B73] text-white shadow-sm">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('paymentSettlement.modals.uploadTitle')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('paymentSettlement.modals.uploadSubtitle')}
              </p>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <FileSpreadsheet className="mx-auto h-10 w-10 text-emerald-600" />
            <div className="mt-2 text-xs font-semibold text-slate-700">
              {bulkFile ? bulkFile.name : t('paymentSettlement.fields.excelFile')}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              InstrumentNo, BankName, Amount, ClearanceDate, BankRefNo
            </p>

            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#173B73] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#122e5a]">
              <span>{t('paymentSettlement.buttons.bulkUpload')}</span>
              <input
                type="file"
                accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setBulkFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {bulkResult && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs">Upload Summary:</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Total Rows</div>
                  <div className="font-bold text-slate-800">{bulkResult.totalRows}</div>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <div className="text-emerald-700 text-[10px]">Processed</div>
                  <div className="font-bold text-emerald-700">{bulkResult.processedCount}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg">
                  <div className="text-blue-700 text-[10px]">Success</div>
                  <div className="font-bold text-blue-700">{bulkResult.successCount}</div>
                </div>
                <div className="bg-rose-50 p-2 rounded-lg">
                  <div className="text-rose-700 text-[10px]">Failed</div>
                  <div className="font-bold text-rose-700">{bulkResult.failureCount}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBulkOpen(false)}
              disabled={isUploading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('paymentSettlement.buttons.close')}
            </button>
            <button
              type="button"
              onClick={handleBulkUpload}
              disabled={!bulkFile || isUploading}
              className="rounded-xl bg-[#173B73] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#122e5a] transition disabled:opacity-50"
            >
              {isUploading ? '...' : t('paymentSettlement.buttons.uploadAndProcess')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 9. Official Digital Receipt Modal */}
      <Modal
        open={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        maxWidth="md"
        title={
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#173B73]" />
            <span className="font-bold text-slate-900">{t('paymentSettlement.modals.receiptTitle')}</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2 text-xs">
          {receiptItem && (
            <div className="relative rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
              {/* CANCELLED Watermark Overlay */}
              {receiptItem.isReceiptCancelled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="transform -rotate-45 border-4 border-rose-600 px-8 py-3 text-3xl font-black tracking-widest text-rose-600/60 uppercase">
                    CANCELLED / रद्द
                  </div>
                </div>
              )}

              {/* Receipt Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <h2 className="text-base font-extrabold text-[#173B73]">
                  {isMr ? 'अकोला महानगरपालिका' : 'AKOLA MUNICIPAL CORPORATION'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isMr ? 'महाराष्ट्र लोकसेवा हक्क अधिनियम अंतर्गत अधिकृत पावती' : 'Maharashtra Right to Public Services Act - Official Fee Receipt'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-0.5 font-mono text-xs font-bold text-slate-800">
                  {receiptItem.receiptNo}
                </div>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('paymentSettlement.table.applicationNo')}:</span>
                  <span className="font-mono font-bold text-slate-900">{receiptItem.applicationNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('paymentSettlement.fields.clearanceDate')}:</span>
                  <span className="font-bold text-slate-900">
                    {receiptItem.receiptDate
                      ? new Date(receiptItem.receiptDate).toLocaleDateString(displayLocale)
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('paymentSettlement.table.applicant')}:</span>
                  <span className="font-bold text-slate-900">{receiptItem.citizenName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('paymentSettlement.table.service')}:</span>
                  <span className="font-bold text-slate-900">{receiptItem.serviceName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('paymentSettlement.table.mode')}:</span>
                  <span className="font-bold text-slate-900">{receiptItem.paymentMode}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('paymentSettlement.table.instrument')}:</span>
                  <span className="font-mono font-bold text-slate-900">{receiptItem.instrumentNo || '-'}</span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl mt-3">
                <span className="font-bold text-slate-700 text-xs">Total Amount Paid / एकूण शुल्क:</span>
                <span className="text-lg font-black text-emerald-800 font-mono">
                  {formatCurrency(receiptItem.totalAmount)}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsReceiptOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('paymentSettlement.buttons.close')}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl bg-[#173B73] px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-[#122e5a] inline-flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" />
              {t('paymentSettlement.buttons.print')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 10. Cancellation Audit Trail Modal */}
      <Modal
        open={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        maxWidth="lg"
        title={
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-[#173B73]" />
            <span className="font-bold text-slate-900">{t('paymentSettlement.modals.auditTitle')}</span>
          </div>
        }
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Cancelled By</th>
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingLogs ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No cancellation logs found for this transaction.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-600">
                        {new Date(log.cancelledDate).toLocaleString(displayLocale)}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {log.cancelledByName || log.cancelledBy || 'Officer'}
                      </td>
                      <td className="py-2 px-3 font-mono text-rose-700 font-bold">
                        {log.receiptNumber}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {log.cancellationReason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAuditModalOpen(false)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t('paymentSettlement.buttons.close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RtsPaymentSettlementDashboard;

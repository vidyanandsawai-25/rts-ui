import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { logger } from '@/lib/utils/logger';
import type { JobPropertyItem } from '@/types/addTaxes.types';
import type { JobAuditItem } from '@/components/modules/property-tax/add-taxes/auditMonitorTab/AuditMonitorColumns';

export interface AuditMonitorActions {
  getAuditListAction: (payload: Record<string, string | number>) => Promise<{ items?: JobAuditItem[]; totalCount?: number; totalPages?: number } | null>;
  getAuditDetailAction: (jobId: string) => Promise<JobAuditItem | null>;
  getJobPropertiesAction: (jobId: string, pageNumber: number, pageSize: number, status?: string) => Promise<{ items?: JobPropertyItem[] } | JobPropertyItem[] | null>;
}

export interface UseAuditMonitorProps {
  financeYearId?: string;
  refreshKey?: number;
  actions: AuditMonitorActions;
}

export function useAuditMonitor({ financeYearId, refreshKey, actions }: UseAuditMonitorProps) {
  const t = useTranslations('addTaxes');

  // Filter input states
  const [selectedJobCode, setSelectedJobCode] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Applied filter query states
  const [appliedJobCode, setAppliedJobCode] = useState<string>('');
  const [appliedStatus, setAppliedStatus] = useState<string>('');
  const [appliedDate, setAppliedDate] = useState<string>('');

  // Data & Refresh states
  const [manualRefreshKey, setManualRefreshKey] = useState(0);
  const [allJobCodes, setAllJobCodes] = useState<string[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobAuditItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Overall dynamic stats
  const [stats, setStats] = useState({ total: 0, completed: 0, running: 0, failed: 0 });

  // Modal detail states
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobAuditItem | null>(null);
  const [detailProperties, setDetailProperties] = useState<JobPropertyItem[]>([]);
  const [detailTotalCount, setDetailTotalCount] = useState(0);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(10);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Fetch initial suggestion list and statistics ONCE on mount / financeYearId change / refreshKey change
  useEffect(() => {
    let isCancelled = false;
    const fetchInitialData = async () => {
      try {
        const baseQuery: Record<string, string | number> = {};
        if (financeYearId) {
          baseQuery.FinanceYearId = financeYearId;
        }

        // Fetch first page and query status counts in parallel
        const [firstPageRes, completedRes, inProgressRes, pendingRes, scheduledRes, failedRes] = await Promise.all([
          actions.getAuditListAction({ ...baseQuery, PageNumber: 1, PageSize: 100 }),
          actions.getAuditListAction({ ...baseQuery, Status: 'Completed', PageNumber: 1, PageSize: 1 }),
          actions.getAuditListAction({ ...baseQuery, Status: 'InProgress', PageNumber: 1, PageSize: 1 }),
          actions.getAuditListAction({ ...baseQuery, Status: 'Pending', PageNumber: 1, PageSize: 1 }),
          actions.getAuditListAction({ ...baseQuery, Status: 'Scheduled', PageNumber: 1, PageSize: 1 }),
          actions.getAuditListAction({ ...baseQuery, Status: 'Failed', PageNumber: 1, PageSize: 1 }),
        ]);

        if (isCancelled) return;

        let allItems = firstPageRes?.items || [];
        const totalCountFromApi = typeof firstPageRes?.totalCount === 'number' ? firstPageRes.totalCount : allItems.length;
        const totalPages = firstPageRes?.totalPages || Math.ceil(totalCountFromApi / 100);

        // If there are additional pages (up to 10 pages / 1000 items), fetch them to build complete job code suggestions & item list
        if (totalPages > 1 && totalPages <= 10) {
          const remainingPromises = [];
          for (let p = 2; p <= totalPages; p++) {
            remainingPromises.push(actions.getAuditListAction({ ...baseQuery, PageNumber: p, PageSize: 100 }));
          }
          const remainingResults = await Promise.all(remainingPromises);
          if (isCancelled) return;
          const additionalItems = remainingResults.flatMap((r) => r?.items || []);
          allItems = [...allItems, ...additionalItems];
        }

        const codes = Array.from(new Set(allItems.map((j) => j.jobId).filter(Boolean)));
        setAllJobCodes(codes);

        // Status counts from direct status queries
        const statusCompletedCount = completedRes?.totalCount ?? 0;
        const statusInProgressCount = inProgressRes?.totalCount ?? 0;
        const statusPendingCount = pendingRes?.totalCount ?? 0;
        const statusScheduledCount = scheduledRes?.totalCount ?? 0;
        const statusFailedCount = failedRes?.totalCount ?? 0;
        const totalRunningFromStatus = statusInProgressCount + statusPendingCount + statusScheduledCount;

        // If allItems contains all records, count directly from allItems for 100% precision
        const isAllItemsComplete = allItems.length >= totalCountFromApi;
        const computedCompleted = isAllItemsComplete
          ? allItems.filter((j) => ['completed', 'success'].includes(j.status?.toLowerCase())).length
          : Math.max(statusCompletedCount, allItems.filter((j) => ['completed', 'success'].includes(j.status?.toLowerCase())).length);

        const computedRunning = isAllItemsComplete
          ? allItems.filter((j) => ['running', 'inprogress', 'pending', 'started', 'scheduled'].includes(j.status?.toLowerCase())).length
          : Math.max(totalRunningFromStatus, allItems.filter((j) => ['running', 'inprogress', 'pending', 'started', 'scheduled'].includes(j.status?.toLowerCase())).length);

        const computedFailed = isAllItemsComplete
          ? allItems.filter((j) => ['failed', 'error'].includes(j.status?.toLowerCase())).length
          : Math.max(statusFailedCount, allItems.filter((j) => ['failed', 'error'].includes(j.status?.toLowerCase())).length);

        setStats({
          total: totalCountFromApi,
          completed: computedCompleted,
          running: computedRunning,
          failed: computedFailed,
        });
      } catch (err) {
        logger.error('Failed to fetch initial audit data client-side', { error: err as Error });
        if (!isCancelled) {
          setAllJobCodes([]);
          setStats({ total: 0, completed: 0, running: 0, failed: 0 });
        }
      }
    };
    fetchInitialData();
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financeYearId, refreshKey, manualRefreshKey]);

  // Fetch paginated jobs based on filters, pagination, financeYearId, and refreshKey
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const query: Record<string, string | number> = {
          PageNumber: pageNumber,
          PageSize: pageSize,
        };
        if (financeYearId) query.FinanceYearId = financeYearId;
        if (appliedJobCode) query.JobCode = appliedJobCode;
        if (appliedStatus) query.Status = appliedStatus;
        if (appliedDate) query.StartTime = appliedDate;

        const res = await actions.getAuditListAction(query);
        if (res) {
          const currentTotal = typeof res.totalCount === 'number' ? res.totalCount : (res.items?.length || 0);
          setFilteredJobs(res.items || []);
          setTotalCount(currentTotal);
          setTotalPages(res.totalPages || 0);

          if (!appliedJobCode && !appliedStatus && !appliedDate) {
            setStats((prev) => ({
              ...prev,
              total: currentTotal,
            }));
          }
        } else {
          setFilteredJobs([]);
          setTotalCount(0);
          setTotalPages(0);
        }
      } catch (err) {
        logger.error('Failed to fetch filtered audit page client-side', { error: err as Error });
        setFilteredJobs([]);
        setTotalCount(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedJobCode, appliedStatus, appliedDate, pageNumber, pageSize, financeYearId, refreshKey, manualRefreshKey]);

  // Load Modal Details on demand
  useEffect(() => {
    if (!selectedJobId) {
      const timer = setTimeout(() => {
        setSelectedJobDetails(null);
        setDetailProperties([]);
        setDetailTotalCount(0);
      }, 0);
      return () => clearTimeout(timer);
    }

    let cancelled = false;
    const fetchDetails = async () => {
      setIsDetailLoading(true);
      try {
        const numericJobId = selectedJobId.split('-').pop() || '';
        const [detailsRes, propertiesRes] = await Promise.all([
          actions.getAuditDetailAction(numericJobId),
          actions.getJobPropertiesAction(numericJobId, detailPage, detailPageSize)
        ]);

        if (cancelled) return;

        setSelectedJobDetails(detailsRes);

        let properties: JobPropertyItem[] = [];
        let total = 0;
        const pRes = propertiesRes as Record<string, unknown> | null;
        const dRes = detailsRes as Record<string, unknown> | null;

        if (pRes) {
          if (Array.isArray(pRes)) {
            properties = pRes as JobPropertyItem[];
            total = pRes.length;
          } else {
            properties = (pRes.items as JobPropertyItem[]) || [];
            total = typeof pRes.totalCount === 'number'
              ? (pRes.totalCount as number)
              : (properties.length || 0);
          }
        }

        const summaryObj = dRes?.summary as Record<string, unknown> | undefined;
        const summaryTotal = (summaryObj?.totalSelected as number) || (summaryObj?.TotalSelected as number);
        if (summaryTotal && summaryTotal > total) {
          total = summaryTotal;
        }

        setDetailProperties(properties);
        setDetailTotalCount(total);
      } catch (err) {
        logger.error('Failed to fetch job details client-side', { error: err as Error });
      } finally {
        if (!cancelled) {
          setIsDetailLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      void fetchDetails();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedJobId, detailPage, detailPageSize, actions]);

  const jobOptions = useMemo(() => {
    return [{ value: '', label: t('audit.filters.allJobs') }, ...allJobCodes.map((code) => ({ value: code, label: code }))];
  }, [allJobCodes, t]);

  const handleApplyFilter = () => {
    setAppliedJobCode(selectedJobCode);
    setAppliedStatus(selectedStatus);
    setAppliedDate(selectedDate);
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSelectedJobCode('');
    setSelectedStatus('');
    setSelectedDate('');
    setAppliedJobCode('');
    setAppliedStatus('');
    setAppliedDate('');
    setPageNumber(1);
    setManualRefreshKey((prev) => prev + 1);
  };

  const handleViewJobDetails = (job: JobAuditItem) => {
    setSelectedJobId(job.jobId);
    setDetailPage(1);
  };

  return {
    t,
    selectedJobCode,
    setSelectedJobCode,
    selectedStatus,
    setSelectedStatus,
    selectedDate,
    setSelectedDate,
    jobOptions,
    stats,
    filteredJobs,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    setPageNumber,
    setPageSize,
    isLoading,
    handleApplyFilter,
    handleResetFilters,
    handleViewJobDetails,
    selectedJobId,
    setSelectedJobId,
    selectedJobDetails,
    detailProperties,
    detailTotalCount,
    detailPage,
    detailPageSize,
    isDetailLoading,
    setDetailPage,
    setDetailPageSize,
  };
}

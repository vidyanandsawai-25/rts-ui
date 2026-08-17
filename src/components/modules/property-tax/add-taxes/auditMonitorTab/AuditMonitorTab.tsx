'use client';

import { useState, useMemo } from 'react';
import { logger } from '@/lib/utils/logger';

import { Calendar } from 'lucide-react';
import { SearchButton, ClearButton, ViewButton } from '@/components/common/ActionButtons';

import { MasterTable } from '@/components/common/MasterTable';
import { Select } from '@/components/common/select';
import { SearchSelect } from '@/components/common/SearchSelect';

import { getAuditColumns, JobAuditItem } from './AuditMonitorColumns';
import { JobDetailModal } from './JobDetailModal';
import type { JobPropertyItem } from '@/types/addTaxes.types';
import { useTranslations } from 'next-intl';

import { useEffect } from 'react';

type JobAuditRow = JobAuditItem & Record<string, unknown>;

interface AuditMonitorTabProps {
  financeYearId?: string;
  actions: {
    getAuditListAction: (payload: Record<string, string | number>) => Promise<{ items?: JobAuditItem[]; totalCount?: number; totalPages?: number } | null>;
    getAuditDetailAction: (jobId: string) => Promise<JobAuditItem | null>;
    getJobPropertiesAction: (jobId: string, pageNumber: number, pageSize: number, status?: string) => Promise<{ items?: JobPropertyItem[] } | JobPropertyItem[] | null>;
  };
}

export function AuditMonitorTab({ financeYearId, actions }: AuditMonitorTabProps) {
  const t = useTranslations('addTaxes');

  // Filter input states
  const [selectedJobCode, setSelectedJobCode] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Applied filter query states
  const [appliedJobCode, setAppliedJobCode] = useState<string>('');
  const [appliedStatus, setAppliedStatus] = useState<string>('');
  const [appliedDate, setAppliedDate] = useState<string>('');

  // Data states
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

  // Fetch initial suggestion list and statistics ONCE on mount / financeYearId change
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const query: Record<string, string | number> = { PageSize: 1000 };
        if (financeYearId) {
          query.FinanceYearId = financeYearId;
        }
        const res = await actions.getAuditListAction(query);
        if (res?.items) {
          const items = res.items;
          const codes = items.map((j) => j.jobId).filter(Boolean);
          setAllJobCodes(codes);

          const computedStats = {
            total: typeof res.totalCount === 'number' ? res.totalCount : items.length,
            completed: items.filter((j) => ['completed', 'success'].includes(j.status?.toLowerCase())).length,
            running: items.filter((j) => ['running', 'inprogress', 'pending', 'started'].includes(j.status?.toLowerCase())).length,
            failed: items.filter((j) => ['failed', 'error'].includes(j.status?.toLowerCase())).length,
          };
          setStats(computedStats);
        } else {
          setAllJobCodes([]);
          setStats({ total: 0, completed: 0, running: 0, failed: 0 });
        }
      } catch (err) {
        logger.error('Failed to fetch initial audit data client-side', { error: err as Error });
        setAllJobCodes([]);
        setStats({ total: 0, completed: 0, running: 0, failed: 0 });
      }
    };
    fetchInitialData();
  }, [financeYearId, actions]);

  // Fetch paginated jobs based on filters, pagination, and financeYearId
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
  }, [appliedJobCode, appliedStatus, appliedDate, pageNumber, pageSize, financeYearId, actions]);

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
  };

  const handleViewJobDetails = (job: JobAuditItem) => {
    setSelectedJobId(job.jobId);
    setDetailPage(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col 2xl:flex-row gap-2 items-end">

          {/* Stats - Text/Span Version */}
          <div className="flex gap-4 items-end overflow-x-auto pb-1 2xl:pb-0 hide-scrollbar w-full 2xl:w-auto shrink-0">
            <div className="flex flex-col">
              <span className="block mb-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{t('audit.stats.totalJobs')}</span>
              <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md min-w-[48px] text-center border border-slate-200 h-[36px] flex items-center justify-center">{stats.total}</span>
            </div>

            <div className="flex flex-col">
              <span className="block mb-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{t('audit.stats.completed')}</span>
              <span className="text-sm font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-md min-w-[48px] text-center border border-green-200 h-[36px] flex items-center justify-center">{stats.completed}</span>
            </div>

            <div className="flex flex-col">
              <span className="block mb-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{t('audit.stats.running')}</span>
              <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-md min-w-[48px] text-center border border-blue-200 h-[36px] flex items-center justify-center">{stats.running}</span>
            </div>

            <div className="flex flex-col">
              <span className="block mb-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{t('audit.stats.failed')}</span>
              <span className="text-sm font-bold text-red-700 bg-red-50 px-3 py-1.5 rounded-md min-w-[48px] text-center border border-red-200 h-[36px] flex items-center justify-center">{stats.failed}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden 2xl:block w-px self-stretch bg-slate-200 mx-1" />

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3 items-end w-full flex-1 min-w-0">
            <div className="flex-1 w-full min-w-0">
              <span className="block mb-1 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{t('audit.filters.searchJobId')}</span>
              <SearchSelect options={jobOptions} value={selectedJobCode} onChange={(_, val) => setSelectedJobCode(val)} placeholder={t('audit.filters.searchPlaceholder')} />
            </div>

            <div className="w-full lg:w-40">
              <Select
                label={t('audit.filters.status')}
                options={[
                  { value: '', label: t('audit.status.all') },
                  { value: 'Completed', label: t('audit.status.completed') },
                  { value: 'InProgress', label: t('audit.status.inProgress') },
                  { value: 'Pending', label: t('audit.status.pending') },
                  { value: 'Scheduled', label: t('audit.status.scheduled') },
                  { value: 'Failed', label: t('audit.status.failed') },
                ]}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                selectSize="sm"
              />
            </div>

            <div className="w-full lg:w-44 flex flex-col">
              <span className="mb-1 text-[10px] text-gray-500 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-400" /> {t('audit.filters.date')}
              </span>
              <input
                type="date"
                className="border border-slate-300 rounded-md px-3 py-1 text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-500 min-h-[32px]"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full lg:w-auto items-end">
              <SearchButton size='sm' label={t('audit.buttons.applyFilter')} onClick={handleApplyFilter} className="flex-1 lg:flex-none" />
              <ClearButton size='sm' label={t('audit.buttons.resetFilters')} onClick={handleResetFilters} className="flex-1 lg:flex-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
        <MasterTable<JobAuditRow>
          columns={getAuditColumns(t)}
          data={filteredJobs as JobAuditRow[]}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setPageNumber(1);
          }}
          paginationConfig={{ enabled: true, showPageSizeSelector: true }}
          actionLabel={t('audit.columns.action')}
          renderActions={(row: JobAuditRow) => (
            <ViewButton onClick={() => handleViewJobDetails(row)}>{t('audit.buttons.viewDetails')}</ViewButton>
          )}
          loading={isLoading}
          height="lg"
          emptyText={t('audit.emptyState.noData', { fallback: 'No data available' })}
        />
      </div>

      <JobDetailModal
        selectedJobDetails={selectedJobDetails}
        onClose={() => setSelectedJobId(null)}
        detailProperties={detailProperties}
        isDetailLoading={isDetailLoading}
        totalCount={detailTotalCount}
        detailPage={detailPage}
        detailPageSize={detailPageSize}
        onPageChange={(page) => setDetailPage(page)}
        onPageSizeChange={(size) => {
          setDetailPageSize(size);
          setDetailPage(1);
        }}
      />
    </div>
  );
}

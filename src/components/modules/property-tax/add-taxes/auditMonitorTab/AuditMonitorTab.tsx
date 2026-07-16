'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { RefreshCw, Calendar } from 'lucide-react';
import { SearchButton, ClearButton, ViewButton, IconOnlyActionButton } from '@/components/common/ActionButtons';
import { DashboardCard } from '@/components/common/DashboardCard';
import { MasterTable } from '@/components/common/MasterTable';
import { Select } from '@/components/common/select';
import { SearchSelect } from '@/components/common/SearchSelect';
import { JobPropertyItem } from '@/types/addTaxes.types';
import { getAuditColumns, JobAuditItem } from './AuditMonitorColumns';
import { JobDetailModal } from './JobDetailModal';
import { useTranslations } from 'next-intl';

interface AuditMonitorTabProps {
  allJobCodes: string[];
  filteredJobs: JobAuditItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  stats: {
    total: number;
    completed: number;
    running: number;
    failed: number;
  };
  selectedJobDetails: JobAuditItem | null;
  detailProperties: JobPropertyItem[];
}

export function AuditMonitorTab({
  allJobCodes,
  filteredJobs,
  totalCount,
  totalPages,
  pageNumber,
  pageSize,
  stats,
  selectedJobDetails,
  detailProperties,
}: AuditMonitorTabProps) {
  const t = useTranslations('addTaxes');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for filter inputs
  const [selectedJobCode, setSelectedJobCode] = useState<string>(searchParams.get('SearchJobId') || '');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('Status') || '');
  const [selectedDate, setSelectedDate] = useState<string>(searchParams.get('Date') || '');

  // Helper to batch update search parameters in Next.js URL
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key in updates) {
      const val = updates[key];
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const jobOptions = useMemo(() => {
    return [{ value: '', label: t('audit.filters.allJobs') }, ...allJobCodes.map((code) => ({ value: code, label: code }))];
  }, [allJobCodes, t]);

  const handleApplyFilter = () => {
    updateParams({
      SearchJobId: selectedJobCode,
      Status: selectedStatus,
      Date: selectedDate,
      auditPage: '1', // Reset page to 1
    });
  };

  const handleResetFilters = () => {
    setSelectedJobCode('');
    setSelectedStatus('');
    setSelectedDate('');
    updateParams({
      SearchJobId: null,
      Status: null,
      Date: null,
      auditPage: '1',
    });
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const handleViewJobDetails = (job: JobAuditItem) => {
    updateParams({
      selectedJobId: job.jobId,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard label={t('audit.stats.totalJobs')} value={stats.total} subLabel={t('audit.stats.totalJobsSub')} />
        <DashboardCard label={t('audit.stats.completed')} value={stats.completed} subLabel={t('audit.stats.completedSub')} valueColor="text-green-600" />
        <DashboardCard label={t('audit.stats.running')} value={stats.running} subLabel={t('audit.stats.runningSub')} valueColor="text-blue-600" />
        <DashboardCard label={t('audit.stats.failed')} value={stats.failed} subLabel={t('audit.stats.failedSub')} valueColor="text-red-600" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full min-w-0">
            <span className="block mb-1 text-xs text-gray-700 font-semibold">{t('audit.filters.searchJobId')}</span>
            <SearchSelect options={jobOptions} value={selectedJobCode} onChange={(_, val) => setSelectedJobCode(val)} placeholder={t('audit.filters.searchPlaceholder')} />
          </div>

          <div className="w-full lg:w-48">
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

          <div className="w-full lg:w-48 flex flex-col">
            <span className="mb-1 text-xs text-gray-700 font-semibold flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-500" /> {t('audit.filters.date')}
            </span>
            <input
              type="date"
              className="border border-slate-300 rounded-md px-3 py-1.5 text-sm text-slate-800 bg-white hover:border-slate-400 focus:ring-1 focus:ring-blue-500 min-h-[36px]"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto items-end">
            <SearchButton label={t('audit.buttons.applyFilter')} onClick={handleApplyFilter} className="flex-1 lg:flex-none" />
            <ClearButton label={t('audit.buttons.resetFilters')} onClick={handleResetFilters} className="flex-1 lg:flex-none" />
            <IconOnlyActionButton
              icon={RefreshCw}
              aria-label={t('audit.buttons.syncData')}
              title={t('audit.buttons.syncData')}
              onClick={handleRefresh}
              className="lg:flex-none h-[36px]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
        <MasterTable
          columns={getAuditColumns(t)}
          data={filteredJobs as any[]}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={(p) => updateParams({ auditPage: String(p) })}
          onPageSizeChange={(s) => updateParams({ auditPageSize: String(s), auditPage: '1' })}
          paginationConfig={{ enabled: true, showPageSizeSelector: true }}
          actionLabel={t('audit.columns.action')}
          renderActions={(row: any) => (
            <ViewButton onClick={() => handleViewJobDetails(row)}>{t('audit.buttons.viewDetails')}</ViewButton>
          )}
          height="lg"
        />
      </div>

      <JobDetailModal
        selectedJobDetails={selectedJobDetails}
        onClose={() =>
          updateParams({
            selectedJobId: null,
            detailPage: null,
            detailPageSize: null,
          })
        }
        detailProperties={detailProperties}
        isDetailLoading={false}
      />
    </div>
  );
}

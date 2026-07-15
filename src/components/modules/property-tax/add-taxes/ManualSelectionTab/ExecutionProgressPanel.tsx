/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { MasterTable } from '@/components/common/MasterTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DashboardCard } from '@/components/common/DashboardCard';
import {
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { getJobPropertiesAction } from '@/app/[locale]/property-tax/add-taxes/actions';
import { getProgressPanelColumns } from './ExecutionProgressPanelColumns';
import { logger } from '@/lib/utils/logger';

interface ExecutionProgressPanelProps {
  jobId: string;
  totalRecords: number;
  onComplete?: () => void;
}

export function ExecutionProgressPanel({ jobId, totalRecords, onComplete }: ExecutionProgressPanelProps) {
  const t = useTranslations('addTaxes');
  const [isExpanded, setIsExpanded] = useState(true);
  const [processed, setProcessed] = useState(0);
  const [added, setAdded] = useState(0);
  const [failed, setFailed] = useState(0);
  const [status, setStatus] = useState<'InProgress' | 'Completed'>('InProgress');

  const [logs, setLogs] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = searchParams.get('jobPage');
  const pageSizeParam = searchParams.get('jobPageSize');

  const pageNumber = pageParam ? Number(pageParam) : 1;
  const pageSize = pageSizeParam ? Number(pageSizeParam) : 10;

  const setPageNumber = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('jobPage', String(page));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setPageSize = (size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('jobPage', '1');
    params.set('jobPageSize', String(size));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Real progress polling from API
  useEffect(() => {
    const numericJobId = jobId.split('-').pop() || '';
    if (!numericJobId) return;

    let isSubscribed = true;

    const fetchProgress = async () => {
      try {
        const response = await getJobPropertiesAction(numericJobId);
        if (!isSubscribed) return;

        if (response) {
          setLogs(response);

          const totalProcessed = response.length;
          setProcessed(totalProcessed);

          const successItems = response.filter(x => x.status !== 'Failed').length;
          setAdded(successItems);

          const failedItems = response.filter(x => x.status === 'Failed').length;
          setFailed(failedItems);

          if (totalProcessed >= totalRecords) {
            setStatus('Completed');
            onComplete?.();
          }
        }
      } catch (e) {
        logger.error('Failed to fetch job properties progress', { error: e as Error });
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [jobId, totalRecords, onComplete]);

  const percentage = totalRecords > 0 ? Math.floor((processed / totalRecords) * 100) : 0;
  const pending = Math.max(0, totalRecords - processed);

  const columns = getProgressPanelColumns(t);

  const paginatedLogs = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, pageNumber, pageSize]);

  return (
    <Card className="border border-blue-200 bg-[#F4F8FE] mb-6 overflow-hidden p-2 py-4 mb-0">
      {/* Header (Always visible) */}
      <div
        className="px-2 py-1 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-500 animate-spin-slow" />
            <h3 className="text-lg font-semibold text-gray-800">{t('progressPanel.title')}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {status === 'InProgress' ? t('progressPanel.processing') : t('progressPanel.completed')}
            </span>
            {status === 'InProgress' ? (
              <StatusBadge variant="pending" label={t('progressPanel.inProgress')} />
            ) : (
              <StatusBadge variant="status" value={true} activeLabel={t('progressPanel.completed')} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-xs text-gray-500 font-medium">{jobId}</div>
          <div className="flex items-center gap-3 w-48">
            <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-xs font-bold text-[#1E3A8A] w-8">{percentage}%</div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-blue-600" /> : <ChevronDown className="h-5 w-5 text-blue-600" />}
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-blue-100 bg-white">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="text-sm font-bold text-gray-900">{t('progressPanel.propertiesProcessed', { processed, total: totalRecords })}</div>
              <div className="text-xs text-gray-500 mt-0.5">{t('progressPanel.expandListNotice')}</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-4 mb-2">
            <DashboardCard
              label={t('progressPanel.stats.total')}
              value={totalRecords}
              valueColor="text-gray-800"
            />
            <DashboardCard
              label={t('progressPanel.stats.processed')}
              value={processed}
              valueColor="text-blue-600"
            />
            <DashboardCard
              label={t('progressPanel.stats.added')}
              value={added}
              valueColor="text-green-600"
            />
            <DashboardCard
              label={t('progressPanel.stats.failed')}
              value={failed}
              valueColor="text-red-500"
            />
            <DashboardCard
              label={t('progressPanel.stats.pending')}
              value={pending}
              valueColor="text-orange-500"
            />
          </div>

          {/* MasterTable */}
          <MasterTable
            columns={columns}
            data={paginatedLogs}
            totalCount={logs.length}
            loading={status === 'InProgress' && logs.length === 0}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalPages={Math.ceil(logs.length / pageSize)}
            onPageChange={setPageNumber}
            onPageSizeChange={setPageSize}
            paginationConfig={{ enabled: true, showPageSizeSelector: true }}
            height="sm"
          />
        </div>
      )}
    </Card>
  );
}

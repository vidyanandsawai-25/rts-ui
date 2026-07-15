/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from '@/components/common/Modal';
import { MasterTable } from '@/components/common/MasterTable';
import { Loader2 } from 'lucide-react';
import { DashboardCard } from '@/components/common/DashboardCard';
import { Badge } from '@/components/common/Badge';
import { getDetailColumns } from './AuditMonitorColumns';
import { JobPropertyItem } from '@/types/addTaxes.types';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export interface JobDetailModalProps {
  selectedJobDetails: any | null;
  onClose: () => void;
  detailProperties: JobPropertyItem[];
  isDetailLoading: boolean;
}

export function JobDetailModal({
  selectedJobDetails,
  onClose,
  detailProperties,
  isDetailLoading,
}: JobDetailModalProps) {
  const t = useTranslations('addTaxes');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const detailPage = Number(searchParams.get('detailPage')) || 1;
  const detailPageSize = Number(searchParams.get('detailPageSize')) || 10;

  const updateDetailParams = (page: number, size: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('detailPage', String(page));
    params.set('detailPageSize', String(size));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!selectedJobDetails) return null;

  const summary = selectedJobDetails.summary || {
    totalSelected: 0,
    successfullyAdded: 0,
    skippedRecords: 0,
    failed: 0,
  };

  const propertiesArray = Array.isArray(detailProperties) ? detailProperties : [];

  const paginatedProperties = propertiesArray.slice(
    (detailPage - 1) * detailPageSize,
    detailPage * detailPageSize
  );

  return (
    <Modal
      open={!!selectedJobDetails}
      onClose={onClose}
      title={t('audit.jobDetail.title', { jobId: selectedJobDetails.jobId || selectedJobDetails.JobId })}
      subtitle={
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="default" size="sm">
            <span className="text-blue-500 font-normal mr-1">{t('audit.jobDetail.operationLabel')}</span>
            {selectedJobDetails.operation || selectedJobDetails.Operation}
          </Badge>
          <Badge variant="secondary" size="sm">
            <span className="text-gray-500 font-normal mr-1">{t('audit.jobDetail.doneByLabel')}</span>
            {selectedJobDetails.startedBy || selectedJobDetails.StartedBy || selectedJobDetails.doneBy}
          </Badge>
          <Badge variant="outline" size="sm">
            <span className="text-gray-500 font-normal mr-1">{t('audit.jobDetail.durationLabel')}</span>
            {selectedJobDetails.duration || selectedJobDetails.Duration}
          </Badge>
          <Badge variant="warning" size="sm">
            <span className="text-yellow-600 font-normal mr-1">{t('audit.jobDetail.financialYearLabel')}</span>
            {selectedJobDetails.financeYear || selectedJobDetails.FinanceYear}
          </Badge>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-6">

        {/* Dynamic statistics cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DashboardCard label={t('preview.totalSelected')} value={summary.totalSelected || summary.TotalSelected || 0} />
          <DashboardCard label={t('progressPanel.stats.added')} value={summary.successfullyAdded || summary.SuccessfullyAdded || 0} valueColor="text-green-600" />
          <DashboardCard label={t('preview.skipped')} value={summary.skippedRecords || summary.SkippedRecords || 0} valueColor="text-orange-500" />
          <DashboardCard label={t('progressPanel.stats.failed')} value={summary.failed || summary.Failed || 0} valueColor="text-red-600" />
        </div>

        {/* Properties table list */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {isDetailLoading ? (
            <div className="p-16 flex flex-col items-center justify-center text-gray-500 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium">{t('audit.jobDetail.loadingText')}</p>
            </div>
          ) : (
            <MasterTable
              columns={propertiesArray.length > 0 ? getDetailColumns(t) : []}
              data={paginatedProperties as any[]}
              pageNumber={detailPage}
              pageSize={detailPageSize}
              totalCount={propertiesArray.length}
              totalPages={Math.ceil(propertiesArray.length / detailPageSize)}
              onPageChange={(p) => updateDetailParams(p, detailPageSize)}
              onPageSizeChange={(s) => updateDetailParams(1, s)}
              paginationConfig={{
                enabled: true,
                showPageSizeSelector: true,
              }}
              height="md"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

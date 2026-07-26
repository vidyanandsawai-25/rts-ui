'use client';

import { useTranslations } from 'next-intl';
import {
  FloorDetailsReassessmentTable,
  type FloorDetailsReassessmentTableColumn,
  getFloorDetailCellClasses,
} from '@/components/common/FloorDetailsReassessmentTable';
import type { MappedFloorDetail } from '@/types/reassessment.types';
import type { SharedAutoScrollController } from '@/hooks/ptis/reassessment/useSharedAutoScroll';

interface OldFloorDetailsProps {
  data: MappedFloorDetail[];
  scrollContainerRef?: React.Ref<HTMLDivElement>;
  autoScrollController?: SharedAutoScrollController;
}

export function OldFloorDetails({ data, scrollContainerRef,  autoScrollController, }: OldFloorDetailsProps) {
  const t = useTranslations('reassessment');

  const formatNumberish = (val: unknown): string =>
    typeof val === 'number' ? val.toLocaleString() : '-';

  const formatTaxLiability = (val: unknown): string =>
    typeof val === 'string' || typeof val === 'number' ? String(val) : '-';

  const oldColumns: FloorDetailsReassessmentTableColumn[] = [
    {
      key: 'floor',
      label: t('floorDetails.columns.floor'),
      width: '64px',
      align: 'center',
      cellClassName: 'font-bold',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.floor}</div>
      ),
    },
    {
      key: 'conYear',
      label: t('floorDetails.columns.conYear'),
      width: '96px',
      align: 'center',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.conYear}</div>
      ),
    },
    {
      key: 'asstYear',
      label: t('floorDetails.columns.asstYear'),
      width: '96px',
      align: 'center',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.asstYear}</div>
      ),
    },
    {
      key: 'constType',
      label: t('floorDetails.columns.constType'),
      width: '96px',
      align: 'center',
      cellClassName: 'font-bold text-sky-800',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.constType}</div>
      ),
    },
    {
      key: 'use',
      label: t('floorDetails.columns.use'),
      width: '128px',
      align: 'center',
      cellClassName: 'text-emerald-700',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.use}</div>
      ),
    },
    {
      key: 'carpetAreaSqFt',
      label: t('floorDetails.columns.carpetArea'),
      width: '128px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>
          {row.carpetAreaSqFt} / {row.carpetAreaSqM}
        </div>
      ),
    },
    {
      key: 'builtUpAreaSqFt',
      label: t('floorDetails.columns.builtUpArea'),
      width: '128px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>
          {row.builtUpAreaSqFt} / {row.builtUpAreaSqM}
        </div>
      ),
    },
    {
      key: 'rate',
      label: t('floorDetails.columns.rate'),
      width: '96px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.rate}</div>
      ),
    },
    {
      key: 'yearlyRate',
      label: t('floorDetails.columns.yearlyRate'),
      width: '96px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.yearlyRate}</div>
      ),
    },
    {
      key: 'financialYear',
      label: t('floorDetails.columns.financialYear'),
      width: '96px',
      align: 'center',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.financialYear}</div>
      ),
    },
    {
      key: 'ocCertificateNo',
      label: t('floorDetails.columns.ocCertificateNo'),
      width: '160px',
      align: 'center',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.ocCertificateNo || '-'}</div>
      ),
    },
    {
      key: 'ocCertificateIssueDate',
      label: t('floorDetails.columns.ocCertificateIssueDate'),
      width: '160px',
      align: 'center',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.ocCertificateIssueDate || '-'}</div>
      ),
    },
    {
      key: 'ccCertificateNo',
      label: t('floorDetails.columns.ccCertificateNo'),
      width: '160px',
      align: 'center',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.ccCertificateNo || '-'}</div>
      ),
    },
    {
      key: 'ccCertificateIssueDate',
      label: t('floorDetails.columns.ccCertificateIssueDate'),
      width: '160px',
      align: 'center',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.ccCertificateIssueDate || '-'}</div>
      ),
    },
    {
      key: 'renter',
      label: t('floorDetails.columns.renter'),
      width: '144px',
      align: 'center',
      cellClassName: 'text-emerald-700',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.renter}</div>
      ),
    },
    {
      key: 'taxLiability',
      label: t('floorDetails.columns.taxLiability'),
      width: '128px',
      align: 'center',
      cellClassName: 'font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>
          {formatTaxLiability(row.taxLiability)}
        </div>
      ),
    },
    {
      key: 'rentMy',
      label: t('floorDetails.columns.rentMy'),
      width: '112px',
      align: 'center',
      cellClassName: 'font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.rentMy}</div>
      ),
    },
    {
      key: 'rentalValue',
      label: t('floorDetails.columns.rentalValue'),
      width: '128px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>
          {formatNumberish(row.rentalValue)}
        </div>
      ),
    },
    {
      key: 'depreciation',
      label: t('floorDetails.columns.depreciation'),
      width: '112px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.depreciation}</div>
      ),
    },
    {
      key: 'alv',
      label: t('floorDetails.columns.alv'),
      width: '128px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>
          {formatNumberish(row.alv)}
        </div>
      ),
    },
    {
      key: 'mr',
      label: t('floorDetails.columns.mr'),
      width: '96px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>{row.mr}</div>
      ),
    },
    {
      key: 'rv',
      label: t('floorDetails.columns.rv'),
      width: '128px',
      align: 'center',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>
          {formatNumberish(row.rv)}
        </div>
      ),
    },
    {
      key: 'status',
      label: t('floorDetails.columns.status'),
      width: '96px',
      align: 'center',
      render: (_val, row) => (
        <div className={getFloorDetailCellClasses(row.status)}>
          {row.status === 'Unchanged'
            ? t('floorDetails.statuses.unchanged')
            : row.status === 'Added'
            ? t('floorDetails.statuses.added')
            : row.status === 'Removed'
            ? t('floorDetails.statuses.removed')
            : '-'}
        </div>
      ),
    },
  ];

  return (
    <div className="flex-grow flex flex-col min-w-0">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold text-[#2f5597]">{t('floorDetails.oldTitle')}</h4>
      </div>

      <div className="min-w-0">
        <FloorDetailsReassessmentTable
          columns={oldColumns}
          data={data}
          showScrollButtons={true}
          scrollContainerRef={scrollContainerRef}
          containerId="old-table-container"
          autoScrollController={autoScrollController}
          instanceId="old"
        />
      </div>
    </div>
  );
}
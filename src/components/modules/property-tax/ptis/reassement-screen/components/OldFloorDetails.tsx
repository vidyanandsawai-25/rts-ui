'use client';

import { useTranslations } from 'next-intl';
import { EyeIconButton, MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import { cn } from '@/lib/utils/cn';
import type { MappedFloorDetail } from '@/types/reassessment.types';

interface OldFloorDetailsProps {
  data: MappedFloorDetail[];
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
  scrollContainerRef?: React.Ref<HTMLDivElement>;
}

export function OldFloorDetails({ 
  data, 
  isAutoScrolling, 
  onToggleAutoScroll,
  scrollContainerRef 
}: OldFloorDetailsProps) {
  // Translations
  const t = useTranslations('reassessment');

  const formatNumberish = (val: unknown): string => {
    return typeof val === 'number' ? val.toLocaleString() : '-';
  };

  const formatTaxLiability = (val: unknown): string => {
    return typeof val === 'string' || typeof val === 'number' ? String(val) : '-';
  };

  const getCellClasses = (status: string | undefined) => {
    return cn(
      "h-[24px] rounded px-1.5 py-0.5 border border-gray-300 shadow-sm hover:border-blue-500 hover:shadow transition-all duration-150 cursor-pointer text-xs text-center text-gray-900",
      status === 'Unchanged' && "bg-green-200",
      status === 'Added' && "bg-red-300",
      status === 'Removed' && "bg-yellow-200"
    );
  };

  // Column definitions for Old Floor Details
  const oldColumns: Column<MappedFloorDetail>[] = [
    {
      key: 'floor',
      label: t('floorDetails.columns.floor'),
      width: '64px',
      align: 'left',
      cellClassName: 'font-bold',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'conYear',
      label: t('floorDetails.columns.conYear'),
      width: '96px',
      align: 'left',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'asstYear',
      label: t('floorDetails.columns.asstYear'),
      width: '96px',
      align: 'left',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'constType',
      label: t('floorDetails.columns.constType'),
      width: '96px',
      align: 'left',
      cellClassName: 'font-bold text-sky-800',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'use',
      label: t('floorDetails.columns.use'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'carpetAreaSqFt',
      label: t('floorDetails.columns.carpetArea'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>
          {row.carpetAreaSqFt} / {row.carpetAreaSqM}
        </div>
      )
    },
    {
      key: 'builtUpAreaSqFt',
      label: t('floorDetails.columns.builtUpArea'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>
          {row.builtUpAreaSqFt} / {row.builtUpAreaSqM}
        </div>
      )
    },
    {
      key: 'rate',
      label: t('floorDetails.columns.rate'),
      width: '96px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'yearlyRate',
      label: t('floorDetails.columns.yearlyRate'),
      width: '96px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'financialYear',
      label: t('floorDetails.columns.financialYear'),
      width: '96px',
      align: 'left',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'renter',
      label: t('floorDetails.columns.renter'),
      width: '144px',
      align: 'left',
      cellClassName: 'text-emerald-700',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'taxLiability',
      label: t('floorDetails.columns.taxLiability'),
      width: '128px',
      align: 'left',
      cellClassName: 'font-mono',
      render: (val: unknown, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{formatTaxLiability(val)}</div>
      )
    },
    {
      key: 'rentMy',
      label: t('floorDetails.columns.rentMy'),
      width: '112px',
      align: 'left',
      cellClassName: 'font-mono',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'rentalValue',
      label: t('floorDetails.columns.rentalValue'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (val: unknown, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{formatNumberish(val)}</div>
      )
    },
    {
      key: 'depreciation',
      label: t('floorDetails.columns.depreciation'),
      width: '112px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'alv',
      label: t('floorDetails.columns.alv'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (val: unknown, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{formatNumberish(val)}</div>
      )
    },
    {
      key: 'mr',
      label: t('floorDetails.columns.mr'),
      width: '96px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono',
      render: (val: any, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{val}</div>
      )
    },
    {
      key: 'rv',
      label: t('floorDetails.columns.rv'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (val: unknown, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>{formatNumberish(val)}</div>
      )
    },
    {
      key: 'status',
      label: t('floorDetails.columns.status'),
      width: '96px',
      align: 'left',
      render: (val: unknown, row: MappedFloorDetail) => (
        <div className={getCellClasses(row.status)}>
          {val === 'Unchanged' ? t('floorDetails.statuses.unchanged') : 
           val === 'Added' ? t('floorDetails.statuses.added') : 
           val === 'Removed' ? t('floorDetails.statuses.removed') : '-'}
        </div>
      )
    }
  ];

  return (
    <div className="flex-grow flex flex-col min-w-0">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold text-[#2f5597]">{t('floorDetails.oldTitle')}</h4>
        <EyeIconButton
          onClick={onToggleAutoScroll}
          isAutoScrolling={isAutoScrolling}
          startTitle={t('buttons.startAutoScroll')}
          stopTitle={t('buttons.stopAutoScroll')}
        />
      </div>

      <div id="old-table-container" className="min-w-0">
        <MasterTable
          columns={oldColumns}
          data={data}
          paginationConfig={{ enabled: false }}
          tableClassName="w-max min-w-full text-xs font-medium border-collapse"
          theadClassName="bg-[#d9e3ec] text-black font-bold border-b border-gray-300 [&_th]:whitespace-nowrap [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-r [&_th]:border-gray-300/60 text-center font-sans"
          rowClassName={(row) => cn(
            "transition-colors [&_td]:p-1.5 [&_td]:border-r [&_td]:border-gray-200/60"
          )}
          height="xs"
          scrollContainerRef={scrollContainerRef}
        />
      </div>
    </div>
  );
}
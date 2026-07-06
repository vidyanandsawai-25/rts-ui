'use client';

import { useTranslations } from 'next-intl';
import { EyeIconButton, MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
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

  // Column definitions for Old Floor Details
  const oldColumns: Column<MappedFloorDetail>[] = [
    {
      key: 'floor',
      label: t('floorDetails.columns.floor'),
      width: '64px',
      align: 'left',
      cellClassName: 'font-bold'
    },
    {
      key: 'conYear',
      label: t('floorDetails.columns.conYear'),
      width: '96px',
      align: 'left'
    },
    {
      key: 'asstYear',
      label: t('floorDetails.columns.asstYear'),
      width: '96px',
      align: 'left'
    },
    {
      key: 'constType',
      label: t('floorDetails.columns.constType'),
      width: '96px',
      align: 'left',
      cellClassName: 'font-bold text-sky-800'
    },
    {
      key: 'use',
      label: t('floorDetails.columns.use'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700'
    },
    {
      key: 'carpetAreaSqFt',
      label: t('floorDetails.columns.carpetArea'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_, row: MappedFloorDetail) => `${row.carpetAreaSqFt} / ${row.carpetAreaSqM}`
    },
    {
      key: 'builtUpAreaSqFt',
      label: t('floorDetails.columns.builtUpArea'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono',
      render: (_, row: MappedFloorDetail) => `${row.builtUpAreaSqFt} / ${row.builtUpAreaSqM}`
    },
    {
      key: 'rate',
      label: t('floorDetails.columns.rate'),
      width: '96px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono'
    },
    {
      key: 'renter',
      label: t('floorDetails.columns.renter'),
      width: '144px',
      align: 'left',
      cellClassName: 'text-emerald-700'
    },
    {
      key: 'taxLiability',
      label: t('floorDetails.columns.taxLiability'),
      width: '128px',
      align: 'left',
      cellClassName: 'font-mono',
      render: (val: unknown) => formatTaxLiability(val)
    },
    {
      key: 'rentMy',
      label: t('floorDetails.columns.rentMy'),
      width: '112px',
      align: 'left',
      cellClassName: 'font-mono'
    },
    {
      key: 'rentalValue',
      label: t('floorDetails.columns.rentalValue'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (val: unknown) => formatNumberish(val)
    },
    {
      key: 'depreciation',
      label: t('floorDetails.columns.depreciation'),
      width: '112px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono'
    },
    {
      key: 'alv',
      label: t('floorDetails.columns.alv'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (val: unknown) => formatNumberish(val)
    },
    {
      key: 'mr',
      label: t('floorDetails.columns.mr'),
      width: '96px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-mono'
    },
    {
      key: 'rv',
      label: t('floorDetails.columns.rv'),
      width: '128px',
      align: 'left',
      cellClassName: 'text-emerald-700 font-bold font-mono',
      render: (val: unknown) => formatNumberish(val)
    }
  ];

  return (
    <div className="flex-grow flex flex-col min-w-0">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-sky-950">{t('floorDetails.oldTitle')}</h4>
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
                    rowClassName={() => "[&_td]:p-1.5 [&_td]:border-r [&_td]:border-gray-200"}
                    height="xs"
                    scrollContainerRef={scrollContainerRef}
                />
            </div>
        </div>
    );
}
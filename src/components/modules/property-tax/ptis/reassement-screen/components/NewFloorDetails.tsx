'use client';

import { useTranslations } from 'next-intl';
import { EyeIconButton, MasterTable } from '@/components/common';
import type { Column } from '@/components/common/MasterTable';
import { cn } from '@/lib/utils/cn';
import type { MappedFloorDetail } from '@/types/reassessment.types';

interface NewFloorDetailsProps {
  data: MappedFloorDetail[];
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
  scrollContainerRef?: React.Ref<HTMLDivElement>;
}

export function NewFloorDetails({ 
  data, 
  isAutoScrolling, 
  onToggleAutoScroll,
  scrollContainerRef 
}: NewFloorDetailsProps) {
  // Translations
  const t = useTranslations('reassessment');

  const formatNumberish = (val: unknown): string => {
    return typeof val === 'number' ? val.toLocaleString() : '-';
  };

  const formatTaxLiability = (val: unknown): string => {
    return typeof val === 'string' || typeof val === 'number' ? String(val) : '-';
  };
  
  // Column definitions for New Floor Details
  const newColumns: Column<MappedFloorDetail>[] = [
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
      cellClassName: 'font-bold font-mono',
      render: (val: unknown) => formatNumberish(val)
    },
    {
      key: 'depreciation',
      label: t('floorDetails.columns.depreciation'),
      width: '112px',
      align: 'left',
      cellClassName: 'font-mono'
    },
    {
      key: 'alv',
      label: t('floorDetails.columns.alv'),
      width: '128px',
      align: 'left',
      cellClassName: 'font-bold font-mono',
      render: (val: unknown) => formatNumberish(val)
    },
    {
      key: 'mr',
      label: t('floorDetails.columns.mr'),
      width: '96px',
      align: 'left',
      cellClassName: 'font-mono'
    },
    {
      key: 'rv',
      label: t('floorDetails.columns.rv'),
      width: '128px',
      align: 'left',
      cellClassName: 'font-bold font-mono',
      render: (val: unknown) => formatNumberish(val)
    },
    {
      key: 'status',
      label: t('floorDetails.columns.status'),
      width: '96px',
      align: 'left',
      render: (val: unknown) => (
        <span className={cn(
          "inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm",
          val === 'Same' && "bg-emerald-100 text-emerald-800 border-emerald-200",
          val === 'Changed' && "bg-amber-100 text-amber-800 border-amber-200",
          val === 'New' && "bg-rose-100 text-rose-800 border-rose-200"
        )}>
          {val === 'Same' ? t('floorDetails.statuses.same') : 
           val === 'Changed' ? t('floorDetails.statuses.changed') : 
           t('floorDetails.statuses.new')}
        </span>
      )
    }
  ];

  return (
    <div className="flex-grow flex flex-col min-w-0">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-blue-950">{t('floorDetails.newTitle')}</h4>
        <EyeIconButton
          onClick={onToggleAutoScroll}
          isAutoScrolling={isAutoScrolling}
          startTitle={t('buttons.startAutoScroll')}
          stopTitle={t('buttons.stopAutoScroll')}
        />
      </div>

            <div id="new-table-container" className="min-w-0">
                <MasterTable
                    columns={newColumns}
                    data={data}
                    paginationConfig={{ enabled: false }}
                    tableClassName="w-max min-w-full text-xs font-medium border-collapse"
                    theadClassName="bg-[#d9e3ec] text-black font-bold border-b border-gray-300 [&_th]:whitespace-nowrap [&_th]:px-2 [&_th]:py-1.5 [&_th]:border-r [&_th]:border-gray-300/60 text-center font-sans"
                    rowClassName={(row) => cn(
                        "transition-colors [&_td]:p-1.5 [&_td]:border-r [&_td]:border-gray-200/60",
                        row.status === 'Same' && "bg-emerald-50/40 hover:bg-emerald-50/70 text-emerald-950",
                        row.status === 'Changed' && "bg-amber-50/40 hover:bg-amber-50/70 text-amber-950",
                        row.status === 'New' && "bg-rose-50/40 hover:bg-rose-50/70 text-rose-950"
                    )}
                    height="xs"
                    scrollContainerRef={scrollContainerRef}
                />
            </div>
        </div>
    );
}
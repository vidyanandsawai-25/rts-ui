'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Drawer } from '@/components/common/Drawer';
import { MasterTable } from '@/components/common/MasterTable';
import { PropertyCombineDetails } from '@/types/combine-property.types';
import { useMemo } from 'react';
import { Merge } from 'lucide-react';
import { getCombinePropertyHistoryColumns } from './combinePropertyColumns';

export interface CombinePropertyHistoryProps {
  historyDetails: PropertyCombineDetails[];
}

export type HistoryRow = PropertyCombineDetails & Record<string, unknown>;

export function CombinePropertyHistory({ historyDetails }: CombinePropertyHistoryProps) {
  const router = useRouter();
  const t = useTranslations('combineProperty');

  const historyColumns = useMemo(() => getCombinePropertyHistoryColumns(t as unknown as (key: string) => string), [t]);

  const DrawerTitle = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shrink-0 shadow-sm">
        <Merge className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <h2 id="drawer-title" className="text-sm font-bold text-gray-900 leading-tight">
            {t('combinePropertyHistory') || 'Combine Property History Details'}
          </h2>
        </div>
      </div>
    </div>
  );

  return (
    <Drawer
      open={true}
      onClose={() => router.back()}
      title={DrawerTitle}
      width="xl"
      className="combine-property-history-drawer text-dark"
    >
      <div className="p-4 flex flex-col h-full bg-[#f4f7fb]">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <MasterTable<HistoryRow>
            columns={historyColumns}
            data={historyDetails as HistoryRow[]}
            paginationConfig={{ enabled: false }}
            height="md"
            getRowKey={(row, i) => `history-detail-${row.propertyId || 0}-${i}`}
            emptyText={t('emptyTableText') || 'No details found'}
          />
        </div>
      </div>
    </Drawer>
  );
}

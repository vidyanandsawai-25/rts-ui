import { FloorDetailsTable, type FloorDetailsTableColumn } from '@/components/common';
import { type DualMethodResponse } from '@/types/dualMethod.types';
import { formatIndianNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

import { getTranslations } from 'next-intl/server';
import { getTranslatedTaxLabel } from '@/lib/utils/ptis';
import {
  type ComparisonRow,
  getUniqueTaxNames,
  buildTaxKeyMap,
  buildComparisonRows,
} from '@/lib/utils/ptis-table-helpers';

interface DualMethodComparisonTableProps {
  dualMethodData: DualMethodResponse | null;
  locale: string;
}

export async function DualMethodComparisonTable({
  dualMethodData,
  locale,
}: DualMethodComparisonTableProps) {
  const t = await getTranslations({ locale, namespace: 'ptis.modules.DualMethod' });
  const rootT = await getTranslations({ locale, namespace: 'ptis' });

  const taxNames = getUniqueTaxNames(dualMethodData);
  const taxKeyMap = buildTaxKeyMap(taxNames);

  const labels: { id: string; key: keyof DualMethodResponse; label: string; color: string }[] = [
    {
      id: 'old',
      key: 'oldTaxes',
      label: t('comparisonTable.oldTaxes'),
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      id: 'rv',
      key: 'rvTaxes',
      label: t('comparisonTable.rvTaxes'),
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      id: 'cv',
      key: 'cvTaxes',
      label: t('comparisonTable.cvTaxes'),
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
    {
      id: 'retain',
      key: 'retainTaxes',
      label: t('comparisonTable.retainTaxes'),
      color: 'bg-red-50 text-red-600 border-red-200',
    },
  ];

  const rows = buildComparisonRows(dualMethodData, taxNames, labels, taxKeyMap);

  const headerText = 'text-[#1e293b] text-[10px] font-bold py-2 whitespace-nowrap px-3';

  const columns: FloorDetailsTableColumn<ComparisonRow>[] = [
    {
      key: 'label',
      label: t('comparisonTable.taxes'),
      headerClassName: cn(
        headerText,
        'sticky left-0 z-30 bg-[#F1F5F9] w-[130px] border-r border-slate-200'
      ),
      cellClassName: 'sticky left-0 bg-white z-10 border-r border-slate-100',
      render: (row) => (
        <div
          className={cn(
            'px-2 py-0.5 rounded-full border text-center text-[12px] font-bold tracking-tight whitespace-nowrap min-w-[100px] mx-auto',
            row.colorClass
          )}
        >
          {row.label}
        </div>
      ),
    },
  ];

  taxNames.forEach((taxName) => {
    const translatedLabel = getTranslatedTaxLabel(rootT, taxName);
    const key = taxKeyMap[taxName];

    columns.push({
      key,
      label: translatedLabel.toUpperCase(),
      headerClassName: cn(headerText, 'text-center min-w-[90px] border-r border-slate-200'),
      cellClassName: 'text-center border-r border-slate-100 ',
      render: (row) => (
        <div className="text-center text-[12px] whitespace-nowrap text-[#2563eb] font-semibold">
          {formatIndianNumber(row[key] as number)}
        </div>
      ),
    });
  });

  columns.push({
    key: 'totalTax',
    label: t('comparisonTable.totalTax'),
    headerClassName: cn(
      headerText,
      'text-center sticky right-0 z-30 bg-[#F1F5F9] border-l border-slate-200 min-w-[100px]'
    ),
    cellClassName: 'text-center sticky right-0 bg-white z-10 border-l border-slate-100',
    render: (row) => (
      <div className="text-center text-[12px] whitespace-nowrap font-black text-[#1e3a8a]">
        {formatIndianNumber(row.totalTax)}
      </div>
    ),
  });

  return (
    <div className="mx-0 mt-0">
      <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <FloorDetailsTable<ComparisonRow>
          data={rows}
          columns={columns}
          showExpandColumn={false}
          striped={false}
          hoverable={true}
          showBorder={false}
          containerClassName="border-none"
          theadClassName="bg-[#F1F5F9] border-b border-slate-200"
          headerBadgeClassName="text-[10px] h-8 bg-slate-200/50 border-slate-300 text-slate-700"
          emptyMessage={t('comparisonTable.emptyMessage')}
        />
      </div>
    </div>
  );
}

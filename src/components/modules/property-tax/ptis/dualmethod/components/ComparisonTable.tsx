'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { FloorDetailsTable, type FloorDetailsTableColumn } from '@/components/common';
import { type DualMethodResponse } from '@/types/dualMethod.types';
import { formatIndianNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
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

export const DualMethodComparisonTable: React.FC<DualMethodComparisonTableProps> = ({
  dualMethodData,
  locale: _locale,
}) => {
  const t = useTranslations('ptis.modules.DualMethod');
  const rootT = useTranslations('ptis');

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

  const HEADER_TEXT_CLASSES = 'text-white text-[10.5px] font-bold tracking-tight py-2 uppercase';
  const CELL_CENTER_CLASS = 'text-center px-0.5';
  const NUMBER_CELL_CLASSES = 'border border-blue-200 rounded-md px-1.5 py-0.5 text-center bg-white text-[12px] min-w-[50px] shadow-2xs font-semibold text-slate-800 hover:border-blue-300 transition-colors';
  const TOTAL_CELL_CLASSES = 'border border-emerald-300 rounded-md px-1.5 py-0.5 text-center bg-emerald-50/80 text-[12px] min-w-[60px] font-bold text-emerald-800 shadow-2xs hover:border-emerald-400 transition-colors';

  const columns: FloorDetailsTableColumn<ComparisonRow>[] = [
    {
      key: 'label',
      label: t('comparisonTable.taxes'),
      headerClassName: `${HEADER_TEXT_CLASSES} ${CELL_CENTER_CLASS} sticky left-0 z-20 bg-[#1e3a8a] min-w-[115px] w-[115px] border-r border-blue-700/60`,
      cellClassName: `${CELL_CENTER_CLASS} sticky left-0 z-10 bg-white min-w-[115px] w-[115px] border-r border-blue-200`,
      render: (row) => (
        <div className="w-full flex items-center justify-center px-0.5">
          <div
            className={cn(
              'px-1.5 py-0.5 rounded-md shadow-2xs border text-center text-[11px] font-bold tracking-tight uppercase transition-all whitespace-nowrap inline-flex items-center justify-center w-full',
              row.colorClass
            )}
          >
            {row.label}
          </div>
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
      headerClassName: `${HEADER_TEXT_CLASSES} ${CELL_CENTER_CLASS}`,
      cellClassName: CELL_CENTER_CLASS,
      render: (row) => {
        const num = Number(row[key] ?? 0);
        const decimals = Number.isInteger(num) ? 0 : 2;
        return (
          <div className={NUMBER_CELL_CLASSES}>
            {formatIndianNumber(num, decimals, decimals)}
          </div>
        );
      },
    });
  });

  columns.push({
    key: 'totalTax',
    label: t('comparisonTable.totalTax'),
    headerClassName: `${HEADER_TEXT_CLASSES} ${CELL_CENTER_CLASS} sticky right-0 z-20 bg-[#1e3a8a] min-w-[85px] w-[85px] border-l border-blue-700/60`,
    cellClassName: `${CELL_CENTER_CLASS} sticky right-0 z-10 bg-white min-w-[85px] w-[85px] border-l border-blue-200`,
    render: (row) => {
      const num = Number(row.totalTax ?? 0);
      const decimals = Number.isInteger(num) ? 0 : 2;
      return (
        <div className={TOTAL_CELL_CLASSES}>
          {formatIndianNumber(num, decimals, decimals)}
        </div>
      );
    },
  });

  return (
    <div className="w-full tax-details-container overflow-x-auto max-h-[300px] overflow-y-auto" data-testid="master-table">
      <FloorDetailsTable<ComparisonRow>
        data={rows}
        columns={columns}
        showExpandColumn={false}
        showScrollButtons={false}
        tableClassName="w-full border-collapse"
        theadClassName="bg-[#1e3a8a] text-white border-b border-blue-700/60 shadow-xs"
        emptyMessage={t('comparisonTable.emptyMessage')}
      />
    </div>
  );
};

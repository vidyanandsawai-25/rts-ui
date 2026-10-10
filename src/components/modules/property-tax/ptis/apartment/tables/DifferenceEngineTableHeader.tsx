'use client';

import React from 'react';
import { PtisTaxMode } from '@/types/property-tax/apartment';
import type { ApartmentSortPanel, ApartmentSortState } from '@/lib/utils/apartment-sort';
import { PtisTableHeader, type PtisColumnDef } from './PtisTableHeader';
import { useTranslations } from 'next-intl';


const DIFFERENCE_COLUMNS: PtisColumnDef[] = [
  { key: 'carpetFt', labelKey: 'carpetFt', titleKey: 'carpetFtTitle', defaultLabel: 'CARPET (sq.ft)', defaultTitle: 'Carpet Area Difference in Square Feet', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'carpetMtr', labelKey: 'carpetMtr', titleKey: 'carpetMtrTitle', defaultLabel: 'CARPET (sq.mt)', defaultTitle: 'Carpet Area Difference in Square Meters', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'buaFt', labelKey: 'buaFt', titleKey: 'buaFtTitle', defaultLabel: 'BUA (sq.ft)', defaultTitle: 'Built-up Area Difference in Square Feet', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'buaMtr', labelKey: 'buaMtr', titleKey: 'buaMtrTitle', defaultLabel: 'BUA (sq.mt)', defaultTitle: 'Built-up Area Difference in Square Meters', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'rv', labelKey: 'rv', titleKey: 'rvTitle', defaultLabel: 'RV', defaultTitle: 'Rateable Value Difference', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'cv', labelKey: 'cv', titleKey: 'cvTitle', defaultLabel: 'CV', defaultTitle: 'Capital Value Difference', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'tax', labelKey: 'totalTax', titleKey: 'totalTaxTitle', defaultLabel: 'TOTAL TAX', defaultTitle: 'Total Property Tax Difference', className: 'px-3 py-2 text-right min-w-[100px]' },
  { key: 'rtTax', labelKey: 'retroTax', titleKey: 'retroTaxTitle', defaultLabel: 'RETRO TAX', defaultTitle: 'Retrospective Tax Difference', className: 'px-3 py-2 text-right min-w-[100px]' },
];

interface DifferenceEngineTableHeaderProps {
  taxMode?: PtisTaxMode;
  sort?: ApartmentSortState | null;
  onSort?: (panel: ApartmentSortPanel, column: string) => void;
}

export const DifferenceEngineTableHeader: React.FC<DifferenceEngineTableHeaderProps> = ({ taxMode, sort, onSort }) => {
  const t = useTranslations('ptisRedesign.differenceColumns');
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const visibleColumns = DIFFERENCE_COLUMNS.filter((col) => {
    if (col.key === 'rv') return showRv;
    if (col.key === 'cv') return showCv;
    return true;
  });

  return (
    <PtisTableHeader
      panel="difference"
      columns={visibleColumns}
      translate={(key) => t(key)}
      theadClassName="sticky top-0 z-20 shadow-xs bg-amber-50/95 border-b border-amber-200"
      rowClassName="border-b border-amber-200 text-amber-950 font-bold uppercase tracking-wider text-[10px] h-10"
      sort={sort}
      onSort={onSort}
    />
  );
};

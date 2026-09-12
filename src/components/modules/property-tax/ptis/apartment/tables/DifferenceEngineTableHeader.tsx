'use client';

import React from 'react';
import { Tooltip } from '@/components/common/Tooltip';
import { cn } from '@/lib/utils/cn';

import { PtisTaxMode } from '@/types/property-tax/apartment';

interface ColumnDef {
  key: string;
  label: string;
  title: string;
  className: string;
}

const DIFFERENCE_COLUMNS: ColumnDef[] = [
  { key: 'carpetFt', label: 'CARPET (FT²)', title: 'Carpet Area Difference in Square Feet', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'carpetMtr', label: 'CARPET (M²)', title: 'Carpet Area Difference in Square Meters', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'buaFt', label: 'BUA (FT²)', title: 'Built-up Area Difference in Square Feet', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'buaMtr', label: 'BUA (M²)', title: 'Built-up Area Difference in Square Meters', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'rv', label: 'RV', title: 'Rateable Value Difference', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'cv', label: 'CV', title: 'Capital Value Difference', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'tax', label: 'TOTAL TAX', title: 'Total Property Tax Difference', className: 'px-3 py-2 text-right min-w-[100px]' },
  { key: 'rtTax', label: 'RETRO TAX', title: 'Retrospective Tax Difference', className: 'px-3 py-2 text-right min-w-[100px]' },
];

export const DifferenceEngineTableHeader: React.FC<{ taxMode?: PtisTaxMode }> = ({ taxMode }) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const visibleColumns = DIFFERENCE_COLUMNS.filter((col) => {
    if (col.key === 'rv') return showRv;
    if (col.key === 'cv') return showCv;
    return true;
  });

  return (
    <thead className="sticky top-0 z-20 shadow-xs bg-amber-50/95 border-b border-amber-200">
      <tr className="border-b border-amber-200 text-amber-950 font-bold uppercase tracking-wider text-[10px] h-10">
        {visibleColumns.map((col) => (
          <th
            key={col.key}
            className={cn('whitespace-nowrap', col.className)}
          >
            <Tooltip content={col.title} placement="top">
              <span className="cursor-help inline-block">{col.label}</span>
            </Tooltip>
          </th>
        ))}
      </tr>
    </thead>
  );
};

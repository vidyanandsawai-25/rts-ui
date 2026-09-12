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

const NEW_SURVEY_COLUMNS: ColumnDef[] = [
  { key: 'action', label: '#', title: 'Serial Number & Row Actions', className: 'px-1 py-1 text-center w-16 min-w-[64px] sticky left-0 bg-blue-100/90 text-blue-950 z-30 border-r border-blue-200 shadow-2xs' },
  { key: 'prop', label: 'PROP / FLAT NO', title: 'Property Number / Flat or Shop Number', className: 'px-3 py-2 text-left min-w-[110px]' },
  { key: 'wgFl', label: 'WING / FLOOR', title: 'Wing Name and Floor Number', className: 'px-3 py-2 text-left min-w-[120px]' },
  { key: 'type', label: 'TYPE', title: 'Apartment Type / Property Category', className: 'px-3 py-2 text-left min-w-[80px]' },
  { key: 'cty', label: 'CONST TYPE', title: 'Construction Type', className: 'px-3 py-2 text-left min-w-[120px]' },
  { key: 'ayr', label: 'ASMT YEAR', title: 'Assessment Year', className: 'px-3 py-2 text-center min-w-[85px]' },
  { key: 'cyr', label: 'CONST YEAR', title: 'Construction Year', className: 'px-3 py-2 text-center min-w-[85px]' },
  { key: 'use', label: 'USE', title: 'Type of Use / Sub-type of Use', className: 'px-3 py-2 text-left min-w-[80px]' },
  { key: 'cpt', label: 'CARPET (FT/M)', title: 'Carpet Area in Square Feet / Square Meters', className: 'px-3 py-2 text-right min-w-[140px]' },
  { key: 'bua', label: 'BUA (FT/M)', title: 'Built-up Area in Square Feet / Square Meters', className: 'px-3 py-2 text-right min-w-[140px]' },
  { key: 'ocNo', label: 'OC NO', title: 'Occupancy Certificate Number / CSN', className: 'px-3 py-2 text-left min-w-[90px]' },
  { key: 'ocDate', label: 'OC DATE', title: 'Occupancy Certificate Date', className: 'px-3 py-2 text-center min-w-[95px]' },
  { key: 'renter', label: 'RENTER', title: 'Renter / Tenant Name', className: 'px-3 py-2 text-left min-w-[110px]' },
  { key: 'rent', label: 'RENT (M/Y)', title: 'Rent (Monthly / Yearly)', className: 'px-3 py-2 text-right min-w-[110px]' },
  { key: 'appliedOn', label: 'APPLIED ON', title: 'Rate Applied On (Carpet / Built-up Area)', className: 'px-3 py-2 text-left min-w-[90px]' },
  { key: 'rate', label: 'RATE (M/Y)', title: 'Rate per Unit Area (Monthly / Yearly)', className: 'px-3 py-2 text-right min-w-[100px]' },
  { key: 'yrv', label: 'YRV', title: 'Yearly Rental Value', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'depr', label: 'DEPR', title: 'Depreciation Amount and Percentage', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'alv', label: 'ALV', title: 'Annual Letting Value', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'mr', label: 'M & R', title: 'Maintenance & Repair Allowance', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'rv', label: 'RV', title: 'Rateable Value', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'cv', label: 'CV', title: 'Capital Value', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'tax', label: 'TAX', title: 'Total Property Tax Amount', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'img', label: 'IMG', title: 'Property Photos', className: 'px-2 py-2 text-center min-w-[50px]' },
  { key: 'plan', label: 'PLAN', title: 'Floor Plan / Sanction Plan Document', className: 'px-2 py-2 text-center min-w-[50px]' },
  { key: 'rules', label: 'RULES', title: 'Applied Assessment Rules & Discounts', className: 'px-2 py-2 text-center min-w-[55px]' },
];

export const NewSurveyTableHeader: React.FC<{ taxMode?: PtisTaxMode }> = ({ taxMode }) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const visibleColumns = NEW_SURVEY_COLUMNS.filter((col) => {
    if (col.key === 'rv') return showRv;
    if (col.key === 'cv') return showCv;
    return true;
  });

  return (
    <thead className="sticky top-0 z-20 shadow-xs bg-blue-50/95 border-b border-blue-200">
      <tr className="border-b border-blue-200 text-blue-950 font-bold uppercase tracking-wider text-[10px] h-10">
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

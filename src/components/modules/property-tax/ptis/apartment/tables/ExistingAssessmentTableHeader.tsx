'use client';

import React from 'react';
import { Tooltip } from '@/components/common/Tooltip';
import { cn } from '@/lib/utils/cn';
import { PtisTaxMode } from '@/types/property-tax/apartment';
import { useTranslations } from 'next-intl';

interface ColumnDef {
  key: string;
  labelKey: string;
  titleKey: string;
  defaultLabel: string;
  defaultTitle: string;
  className: string;
}

const EXISTING_ASSESSMENT_COLUMNS: ColumnDef[] = [
  { key: 'index', labelKey: 'srNo', titleKey: 'srNoTitle', defaultLabel: '#', defaultTitle: 'Serial Number / Row Index', className: 'px-1 py-1 text-center w-12 sticky left-0 bg-emerald-100/90 text-emerald-950 z-30 border-r border-emerald-200 shadow-2xs' },
  { key: 'prop', labelKey: 'propNo', titleKey: 'propNoTitle', defaultLabel: 'PROP NO', defaultTitle: 'Property Number / Partition Number / Flat Number', className: 'px-2.5 py-2 text-left w-28 min-w-[100px] max-w-[125px]' },
  { key: 'wgFl', labelKey: 'wingFloor', titleKey: 'wingFloorTitle', defaultLabel: 'WING / FLOOR', defaultTitle: 'Wing Name and Floor Number', className: 'px-3 py-2 text-left min-w-[120px]' },
  { key: 'type', labelKey: 'type', titleKey: 'typeTitle', defaultLabel: 'TYPE', defaultTitle: 'Apartment Type / Property Category', className: 'px-3 py-2 text-left min-w-[80px]' },
  { key: 'cty', labelKey: 'constType', titleKey: 'constTypeTitle', defaultLabel: 'CONST TYPE', defaultTitle: 'Construction Type', className: 'px-3 py-2 text-left min-w-[120px]' },
  { key: 'ayr', labelKey: 'asmtYear', titleKey: 'asmtYearTitle', defaultLabel: 'ASMT YEAR', defaultTitle: 'Assessment Year', className: 'px-3 py-2 text-center min-w-[85px]' },
  { key: 'cyr', labelKey: 'constYear', titleKey: 'constYearTitle', defaultLabel: 'CONST YEAR', defaultTitle: 'Construction Year', className: 'px-3 py-2 text-center min-w-[85px]' },
  { key: 'use', labelKey: 'use', titleKey: 'useTitle', defaultLabel: 'USE', defaultTitle: 'Type of Use / Sub-type of Use', className: 'px-3 py-2 text-left min-w-[80px]' },
  { key: 'cpt', labelKey: 'carpet', titleKey: 'carpetTitle', defaultLabel: 'CARPET (FT/M)', defaultTitle: 'Carpet Area in Square Feet / Square Meters', className: 'px-3 py-2 text-right min-w-[140px]' },
  { key: 'bua', labelKey: 'builtup', titleKey: 'builtupTitle', defaultLabel: 'BUA (FT/M)', defaultTitle: 'Built-up Area in Square Feet / Square Meters', className: 'px-3 py-2 text-right min-w-[140px]' },
  { key: 'ocNo', labelKey: 'ocNo', titleKey: 'ocNoTitle', defaultLabel: 'OC NO', defaultTitle: 'Occupancy Certificate Number / CSN', className: 'px-3 py-2 text-left min-w-[90px]' },
  { key: 'ocDate', labelKey: 'ocDate', titleKey: 'ocDateTitle', defaultLabel: 'OC DATE', defaultTitle: 'Occupancy Certificate Date', className: 'px-3 py-2 text-center min-w-[95px]' },
  { key: 'renter', labelKey: 'renter', titleKey: 'renterTitle', defaultLabel: 'RENTER', defaultTitle: 'Renter / Tenant Name', className: 'px-3 py-2 text-left min-w-[110px]' },
  { key: 'rent', labelKey: 'rent', titleKey: 'rentTitle', defaultLabel: 'RENT (M/Y)', defaultTitle: 'Rent (Monthly / Yearly)', className: 'px-3 py-2 text-right min-w-[110px]' },
  { key: 'alv', labelKey: 'alv', titleKey: 'alvTitle', defaultLabel: 'ALV', defaultTitle: 'Annual Letting Value', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'rv', labelKey: 'rv', titleKey: 'rvTitle', defaultLabel: 'RV', defaultTitle: 'Rateable Value', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'cv', labelKey: 'cv', titleKey: 'cvTitle', defaultLabel: 'CV', defaultTitle: 'Capital Value', className: 'px-3 py-2 text-right min-w-[95px]' },
  { key: 'tax', labelKey: 'tax', titleKey: 'taxTitle', defaultLabel: 'TAX', defaultTitle: 'Total Property Tax Amount', className: 'px-3 py-2 text-right min-w-[105px]' },
  { key: 'img', labelKey: 'img', titleKey: 'imgTitle', defaultLabel: 'IMG', defaultTitle: 'Property Photos', className: 'px-2 py-2 text-center min-w-[50px]' },
  { key: 'plan', labelKey: 'plan', titleKey: 'planTitle', defaultLabel: 'PLAN', defaultTitle: 'Floor Plan / Sanction Plan Document', className: 'px-2 py-2 text-center min-w-[50px]' },
  { key: 'rules', labelKey: 'rules', titleKey: 'rulesTitle', defaultLabel: 'RULES', defaultTitle: 'Applied Assessment Rules & Discounts', className: 'px-2 py-2 text-center min-w-[55px]' },
];

export const ExistingAssessmentTableHeader: React.FC<{ taxMode?: PtisTaxMode }> = ({ taxMode }) => {
  const t = useTranslations('ptisRedesign.columns');
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const visibleColumns = EXISTING_ASSESSMENT_COLUMNS.filter((col) => {
    if (col.key === 'rv') return showRv;
    if (col.key === 'cv') return showCv;
    return true;
  });

  return (
    <thead className="sticky top-0 z-20 shadow-xs bg-emerald-50/95 border-b border-emerald-200">
      <tr className="border-b border-emerald-200 text-emerald-950 font-bold uppercase tracking-wider text-[10px] h-10">
        {visibleColumns.map((col) => {
          const label = t(col.labelKey) || col.defaultLabel;
          const title = t(col.titleKey) || col.defaultTitle;
          return (
            <th
              key={col.key}
              className={cn('whitespace-nowrap', col.className)}
            >
              <Tooltip content={title} placement="top">
                <span className="cursor-help inline-block">{label}</span>
              </Tooltip>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};


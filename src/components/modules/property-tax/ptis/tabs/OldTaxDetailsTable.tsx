import React from 'react';
import { useTranslations } from 'next-intl';
import type { OldTaxesData } from '@/types/ptis.types';

interface OldTaxDetailsTableProps {
  oldTaxesData: OldTaxesData | null | undefined;
  showOldTaxInfo: boolean;
}

export const OldTaxDetailsTable: React.FC<OldTaxDetailsTableProps> = ({
  oldTaxesData,
  showOldTaxInfo,
}) => {
  const t = useTranslations('ptis');

  if (!showOldTaxInfo) return null;

  if (!oldTaxesData || !oldTaxesData.taxYears || oldTaxesData.taxYears.length === 0) {
    return (
      <div className="mt-0.5 p-2 text-center text-sm text-slate-500 bg-slate-50 rounded border border-dashed border-slate-300">
        {t('fields.noTaxDetails')}
      </div>
    );
  }

  return (
    <div className="mt-0.5 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded border border-blue-100 p-1 shadow-inner">
      <div className="divide-y divide-blue-100/50">
        {oldTaxesData.taxYears.map((yearData, yearIdx: number) => {
          const wardNo = yearData.oldWardNo?.toString() ?? '';
          const propertyNo = yearData.oldPropertyNo ?? '';
          const partitionNo = yearData.oldPartitionNo?.toString() ?? '';
          const wardPropPartNo = [wardNo, propertyNo, partitionNo].filter(Boolean).join(' - ');

          const activeTaxes = yearData.taxes.filter(
            (tax) => Number(tax.taxAmount) !== 0
          );

          return (
            <div
              key={yearIdx}
              className="py-1.5 px-2 text-xs text-slate-700 leading-relaxed font-medium hover:bg-white/60 transition-colors rounded-sm"
            >
              <span className="font-bold text-indigo-700">{t('fields.wardPropPartNo')}: </span>
              <span className="font-semibold text-slate-900">{wardPropPartNo || '-'}</span>
              <span className="text-slate-400 font-normal">, </span>

              <span className="font-bold text-blue-700">{t('fields.year')} = </span>
              <span className="font-semibold text-slate-950">{yearData.yearCode || yearData.year}</span>

              {activeTaxes.map((tax) => (
                <React.Fragment key={tax.taxId}>
                  <span className="text-slate-400 font-normal">, </span>
                  <span className="text-slate-600 font-semibold">{tax.taxName} = </span>
                  <span className="text-slate-900 font-bold tabular-nums">{tax.taxAmount}</span>
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

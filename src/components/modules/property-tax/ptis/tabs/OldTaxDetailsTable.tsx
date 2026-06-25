import React from 'react';
import { useTranslations } from 'next-intl';
import { ValueDisplay } from './components/ValueDisplay';
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
    <div className="mt-0.5 space-y-1">
      {oldTaxesData.taxYears.map((yearData, yearIdx: number) => (
        <div
          key={yearIdx}
          className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 rounded p-1 shadow-sm border border-blue-200"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-1">
            {/* Year Field */}
            <div className="relative">
              <div
                id={`tax-year-${yearIdx}-label`}
                className="absolute -top-1.5 left-1 px-0.5 text-sm text-blue-800 bg-blue-50 z-10 leading-none"
              >
                {t('fields.year')}
              </div>
              <div className="rounded bg-gradient-to-br from-blue-50 to-blue-100 p-0.5 shadow-sm mt-0.5">
                <ValueDisplay
                  aria-labelledby={`tax-year-${yearIdx}-label`}
                  value={yearData.year || ''}
                  className="font-semibold px-0.5 h-6"
                />
              </div>
            </div>

            {/* Dynamic Taxes */}
            {yearData.taxes
              .filter((tax) => Number(tax.taxAmount) !== 0)
              .map((tax) => (
                <div key={tax.taxId} className="relative">
                  <div
                    id={`tax-${yearIdx}-${tax.taxId}-label`}
                    title={tax.taxName}
                    className="absolute -top-1.5 left-1 px-0.5 text-sm text-blue-800 bg-blue-50 z-10 leading-none truncate max-w-full"
                  >
                    {tax.taxName}
                  </div>
                  <div className="rounded bg-gradient-to-br from-blue-50 to-blue-100 p-0.5 shadow-sm mt-0.5">
                    <ValueDisplay
                      aria-labelledby={`tax-${yearIdx}-${tax.taxId}-label`}
                      value={tax.taxAmount ?? 0}
                    />
                  </div>
                </div>
              ))}

            {/* Tax Total */}
            {Number(yearData.taxTotal) !== 0 && (
              <div className="relative">
                <div
                  id={`tax-total-${yearIdx}-label`}
                  className="absolute -top-1.5 left-1 px-0.5 text-sm text-blue-800 bg-blue-50 z-10 leading-none"
                >
                  {t('fields.taxTotal')}
                </div>
                <div className="rounded bg-gradient-to-br from-blue-50 to-blue-100 p-0.5 shadow-sm mt-0.5">
                  <ValueDisplay
                    aria-labelledby={`tax-total-${yearIdx}-label`}
                    value={yearData.taxTotal ?? 0}
                  />
                </div>
              </div>
            )}

            {/* Interest */}
            {Number(yearData.interest) !== 0 && (
              <div className="relative">
                <div
                  id={`tax-interest-${yearIdx}-label`}
                  className="absolute -top-1.5 left-1 px-0.5 text-sm text-blue-800 bg-blue-50 z-10 leading-none"
                >
                  {t('fields.interest')}
                </div>
                <div className="rounded bg-gradient-to-br from-blue-50 to-blue-100 p-0.5 shadow-sm mt-0.5">
                  <ValueDisplay
                    aria-labelledby={`tax-interest-${yearIdx}-label`}
                    value={yearData.interest ?? 0}
                  />
                </div>
              </div>
            )}

            {/* Net Total */}
            {Number(yearData.netTotal) !== 0 && (
              <div className="relative">
                <div
                  id={`tax-net-total-${yearIdx}-label`}
                  className="absolute -top-1.5 left-1 px-0.5 text-sm text-blue-800 bg-blue-50 z-10 leading-none"
                >
                  {t('fields.netTotal')}
                </div>
                <div className="rounded bg-gradient-to-br from-blue-50 to-blue-100 p-0.5 shadow-sm mt-0.5">
                  <ValueDisplay
                    aria-labelledby={`tax-net-total-${yearIdx}-label`}
                    value={yearData.netTotal ?? 0}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatTaxAmount, getTranslatedTaxLabel } from '@/lib/utils/ptis';
import type { PtisTaxDetail } from '@/types/ptis-core.types';

export type TaxEntry = PtisTaxDetail;

/**
 * Properties for the ShowTaxOnExpand component
 */
export interface ShowTaxOnExpandProps {
  /** Array of tax entries to display */
  taxes: TaxEntry[];
  /** Current locale for translations */
  locale: string;
  /** Primary color for text and background (default: #1D4ED8) */
  color?: string;
  /** Border color for the tax chips (default: #93C5FD) */
  borderColor?: string;
}

/**
 * Helper to normalize tax entries and ensure default values
 */
function buildTaxEntries(taxes: TaxEntry[] | undefined): TaxEntry[] {
  if (Array.isArray(taxes) && taxes.length > 0) {
    return taxes
      .filter(
        (tax) =>
          tax.taxName?.toUpperCase() !== 'TAXTOTAL' && tax.taxName?.toUpperCase() !== 'TOTAL'
      )
      .map((tax) => ({
        taxName: tax.taxName,
        amount: tax.amount ?? 0,
        percentage: tax.percentage ?? 0,
        taxId: tax.taxId ?? 0,
      }));
  }
  return [];
}

/**
 * A shared component to display a horizontal list of tax breakdowns.
 * Used when expanding rows in PTIS tables (Rateable, Capital, etc.)
 */
export const ShowTaxOnExpand: React.FC<ShowTaxOnExpandProps> = ({
  taxes,
  locale: _locale,
  color = '#1D4ED8',
  borderColor = '#93C5FD',
}) => {
  const t = useTranslations('ptis');
  const commonT = useTranslations('common');
  const currencySymbol = commonT('Grid.currencySymbol');

  const entries = buildTaxEntries(taxes).map((tax) => ({
    displayLabel: getTranslatedTaxLabel(t as any, tax.taxName),
    color,
    borderColor,
    ...tax,
  }));

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="flex flex-nowrap items-center gap-1" data-testid="expanded-tax-row">
          {entries.map((tax, index) => (
            <div
              key={`${tax.taxId}-${tax.taxName}-${index}`}
              className="flex min-w-max items-center gap-1.5 whitespace-nowrap rounded border px-2 py-1 text-[11px]"
              style={{
                borderColor: tax.borderColor,
                color: tax.color,
                backgroundColor: `${tax.borderColor}10`,
              }}
            >
              <span className="font-semibold">{tax.displayLabel}:</span>
              <span className="font-bold">{formatTaxAmount(currencySymbol, tax.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
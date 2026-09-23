'use client';

import React from 'react';
import { PtisTaxMode } from '@/types/property-tax/apartment';
import { cn } from '@/lib/utils/cn';

interface DifferenceEngineTableFooterProps {
  totalDiffs?: {
    carpetDiff: number;
    buaDiff: number;
    rvDiff: number;
    cvDiff?: number;
    taxDiff: number;
    rtTaxDiff: number;
  };
  taxMode?: PtisTaxMode;
}

export const DifferenceEngineTableFooter: React.FC<DifferenceEngineTableFooterProps> = ({ totalDiffs, taxMode }) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const carpetTotal = totalDiffs?.carpetDiff ?? 0;
  const buaTotal = totalDiffs?.buaDiff ?? 0;
  const rvTotal = totalDiffs?.rvDiff ?? 0;
  const cvTotal = totalDiffs?.cvDiff ?? null;
  const taxTotal = totalDiffs?.taxDiff ?? 0;
  const rtTaxTotal = totalDiffs?.rtTaxDiff ?? 0;

  const formatFooterDiff = (val: number | null | undefined, unit?: string, isCurrency = false) => {
    if (val == null) return { text: '-', className: 'text-amber-100/60' };
    if (val === 0) {
      const text = isCurrency ? '₹0' : unit ? `0 ${unit}` : '0';
      return { text, className: 'text-amber-100' };
    }
    const absFormatted = Math.abs(val).toLocaleString();
    if (val < 0) {
      const text = isCurrency ? `-₹${absFormatted}` : unit ? `-${absFormatted} ${unit}` : `-${absFormatted}`;
      return { text, className: 'text-rose-300 font-bold' };
    }
    const text = isCurrency ? `+₹${absFormatted}` : unit ? `+${absFormatted} ${unit}` : `+${absFormatted}`;
    return { text, className: 'text-emerald-300 font-bold' };
  };

  const carpetData = formatFooterDiff(carpetTotal, 'sq.ft');
  const buaData = formatFooterDiff(buaTotal, 'sq.ft');
  const rvData = formatFooterDiff(rvTotal, undefined, true);
  const cvData = formatFooterDiff(cvTotal, undefined, true);
  const taxData = formatFooterDiff(taxTotal, undefined, true);
  const rtTaxData = formatFooterDiff(rtTaxTotal, undefined, true);

  return (
    <tfoot className="sticky bottom-0 z-20 shadow-md bg-gradient-to-r from-[#78350f] via-[#92400e] to-[#78350f]">
      <tr className="border-t-2 border-amber-400/80 font-extrabold text-white h-10 border-b border-amber-900/40">
        <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', carpetData.className)}>
          {carpetData.text}
        </td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-amber-100/60">
          -
        </td>
        <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', buaData.className)}>
          {buaData.text}
        </td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-amber-100/60">
          -
        </td>
        {showRv && (
          <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', rvData.className)}>
            {rvData.text}
          </td>
        )}
        {showCv && (
          <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', cvData.className)}>
            {cvData.text}
          </td>
        )}
        <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', taxData.className)}>
          {taxData.text}
        </td>
        <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', rtTaxData.className)}>
          {rtTaxData.text}
        </td>
      </tr>
    </tfoot>
  );
};

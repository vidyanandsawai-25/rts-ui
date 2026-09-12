/* eslint-disable i18next/no-literal-string */
'use client';

import React from 'react';
import { PtisTaxMode } from '@/types/property-tax/apartment';

interface DifferenceEngineTableFooterProps {
  totalDiffs?: {
    carpetDiff: number;
    buaDiff: number;
    rvDiff: number;
    cvDiff?: number;
    taxDiff: number;
    rtTaxDiff: number;
  };
  totalDeltas?: {
    carpetDelta: number;
    buaDelta: number;
    rvDelta: number;
    cvDelta?: number;
    taxDelta: number;
    rtTaxDelta: number;
  };
  taxMode?: PtisTaxMode;
}

export const DifferenceEngineTableFooter: React.FC<DifferenceEngineTableFooterProps> = ({ totalDiffs, totalDeltas, taxMode }) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const carpetTotal = Math.abs(totalDiffs?.carpetDiff ?? totalDeltas?.carpetDelta ?? 0);
  const buaTotal = Math.abs(totalDiffs?.buaDiff ?? totalDeltas?.buaDelta ?? 0);
  const rvTotal = Math.abs(totalDiffs?.rvDiff ?? totalDeltas?.rvDelta ?? 0);
  const cvTotal = Math.abs(totalDiffs?.cvDiff ?? totalDeltas?.cvDelta ?? 0);
  const taxTotal = Math.abs(totalDiffs?.taxDiff ?? totalDeltas?.taxDelta ?? 0);
  const rtTaxTotal = Math.abs(totalDiffs?.rtTaxDiff ?? totalDeltas?.rtTaxDelta ?? 0);

  return (
    <tfoot className="sticky bottom-0 z-20 shadow-md bg-gradient-to-r from-[#78350f] via-[#92400e] to-[#78350f]">
      <tr className="border-t-2 border-amber-400/80 font-extrabold text-white h-10 border-b border-amber-900/40">
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-white">
          {carpetTotal.toLocaleString()} sq.ft
        </td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-white">
          -
        </td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-white">
          {buaTotal.toLocaleString()} sq.ft
        </td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-white">
          -
        </td>
        {showRv && (
          <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-white">
            ₹{rvTotal.toLocaleString()}
          </td>
        )}
        {showCv && (
          <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-white">
            {cvTotal ? `₹${cvTotal.toLocaleString()}` : '-'}
          </td>
        )}
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-white">
          ₹{taxTotal.toLocaleString()}
        </td>
        <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap text-white">
          ₹{rtTaxTotal.toLocaleString()}
        </td>
      </tr>
    </tfoot>
  );
};

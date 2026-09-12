/* eslint-disable i18next/no-literal-string */
'use client';

import React from 'react';
import { UnitDifference, PtisTaxMode } from '@/types/property-tax/apartment';
import { cn } from '@/lib/utils/cn';

interface DifferenceEngineTableRowProps {
  diff: UnitDifference;
  idx: number;
  isHovered: boolean;
  isExpanded: boolean;
  onHoverUnit: (id: string | null) => void;
  onToggleExpandRow: (id: string) => void;
  taxMode?: PtisTaxMode;
}

export const DifferenceEngineTableRow: React.FC<DifferenceEngineTableRowProps> = ({
  diff,
  idx,
  isHovered,
  isExpanded,
  onHoverUnit,
  onToggleExpandRow,
  taxMode,
}) => {
  const showRv = taxMode !== 'capital';
  const showCv = taxMode !== 'rateable';
  const raw = diff.rawDiff;
  const carpetFt = raw?.carpetAreaSqFeetDiff ?? diff.carpetDiff ?? 0;
  const carpetMtr = raw?.carpetAreaSqMeterDiff ?? 0;
  const buaFt = raw?.builtupAreaSqFeetDiff ?? diff.buaDiff ?? 0;
  const buaMtr = raw?.builtupAreaSqMeterDiff ?? 0;
  const rvVal = raw?.rateableValueDiff ?? diff.rvDiff ?? 0;
  const cvVal = raw?.capitalValueDiff ?? diff.capitalValueDiff ?? null;
  const taxVal = raw?.totalTaxDiff ?? diff.taxDiff ?? 0;
  const rtTaxVal = raw?.retroTaxDiff ?? diff.rtTaxDiff ?? 0;

  return (
    <React.Fragment key={diff.unitId ? `${diff.unitId}-${idx}` : idx}>
      <tr
        onMouseEnter={() => onHoverUnit(diff.unitId)}
        onMouseLeave={() => onHoverUnit(null)}
        onClick={() => onToggleExpandRow(diff.unitId)}
        className={cn(
          'h-11 transition-colors cursor-pointer hover:bg-amber-50/60',
          isHovered && 'bg-amber-100/80',
          isExpanded && 'bg-amber-100/90'
        )}
      >
        <td className="px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap text-zinc-800">
          {carpetFt.toLocaleString()} sq.ft
        </td>
        <td className="px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap text-zinc-800">
          {carpetMtr.toLocaleString()} m²
        </td>
        <td className="px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap text-zinc-800">
          {buaFt.toLocaleString()} sq.ft
        </td>
        <td className="px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap text-zinc-800">
          {buaMtr.toLocaleString()} m²
        </td>
        {showRv && (
          <td className="px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap text-zinc-800">
            ₹{rvVal.toLocaleString()}
          </td>
        )}
        {showCv && (
          <td className="px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap text-zinc-800">
            {cvVal != null ? `₹${cvVal.toLocaleString()}` : '-'}
          </td>
        )}
        <td className="px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap text-zinc-800">
          ₹{taxVal.toLocaleString()}
        </td>
        <td className="px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap text-zinc-800">
          ₹{rtTaxVal.toLocaleString()}
        </td>
      </tr>

      {/* Synchronized Row Height when Expanded */}
      {isExpanded && (
        <tr className="bg-amber-50/20 border-b border-amber-200 transition-all h-12">
          <td colSpan={showRv && showCv ? 8 : (showRv || showCv ? 7 : 6)} className="p-1 text-zinc-400 font-sans h-12 align-middle text-center text-[10px]">
            <span className="italic">Details displayed across columns</span>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

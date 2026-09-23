'use client';

import React from 'react';
import { UnitDifference, PtisTaxMode } from '@/types/property-tax/apartment';
import { cn } from '@/lib/utils/cn';

import { useTranslations } from 'next-intl';

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
  const t = useTranslations('ptisRedesign.differenceColumns');
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

  const formatDiff = (val: number | null | undefined, unit?: string, isCurrency = false) => {
    if (val == null) return { text: '-', className: 'text-zinc-400 font-semibold' };
    if (val === 0) {
      const text = isCurrency ? '₹0' : unit ? `0 ${unit}` : '0';
      return { text, className: 'text-zinc-500 font-semibold' };
    }
    const absFormatted = Math.abs(val).toLocaleString();
    if (val < 0) {
      const text = isCurrency ? `-₹${absFormatted}` : unit ? `-${absFormatted} ${unit}` : `-${absFormatted}`;
      return { text, className: 'text-rose-600 font-bold' };
    }
    const text = isCurrency ? `+₹${absFormatted}` : unit ? `+${absFormatted} ${unit}` : `+${absFormatted}`;
    return { text, className: 'text-emerald-600 font-bold' };
  };

  const carpetFtData = formatDiff(carpetFt, 'sq.ft');
  const carpetMtrData = formatDiff(carpetMtr, 'sq.mt');
  const buaFtData = formatDiff(buaFt, 'sq.ft');
  const buaMtrData = formatDiff(buaMtr, 'sq.mt');
  const rvData = formatDiff(rvVal, undefined, true);
  const cvData = formatDiff(cvVal, undefined, true);
  const taxData = formatDiff(taxVal, undefined, true);
  const rtTaxData = formatDiff(rtTaxVal, undefined, true);

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
        <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', carpetFtData.className)}>
          {carpetFtData.text}
        </td>
        <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', carpetMtrData.className)}>
          {carpetMtrData.text}
        </td>
        <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', buaFtData.className)}>
          {buaFtData.text}
        </td>
        <td className={cn('px-3 py-1.5 text-right font-mono whitespace-nowrap', buaMtrData.className)}>
          {buaMtrData.text}
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

      {/* Synchronized Row Height when Expanded */}
      {isExpanded && (
        <tr className="bg-amber-50/20 border-b border-amber-200 transition-all h-12">
          <td colSpan={showRv && showCv ? 8 : (showRv || showCv ? 7 : 6)} className="p-1 text-zinc-400 font-sans h-12 align-middle text-center text-[10px]">
            <span className="italic">{t('detailsAcrossColumns') || 'Details displayed across columns'}</span>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

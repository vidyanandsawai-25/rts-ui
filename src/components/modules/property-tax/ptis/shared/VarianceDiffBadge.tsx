'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCompactCurrency, formatCompactNumber } from '@/lib/utils/propertyComparison.utils';
import { Tooltip } from '@/components/common/Tooltip';

interface VarianceDiffBadgeProps {
  diff: number;
  unit?: string;
  isCurrency?: boolean;
  className?: string;
}

/**
 * VarianceDiffBadge Component
 * Compact badge rendering animated up/down arrows with Indian compact formatting (L for Lakh, Cr for Crore)
 * and custom Tooltip displaying the exact full value on hover.
 */
export function VarianceDiffBadge({
  diff,
  unit,
  isCurrency = false,
  className = '',
}: VarianceDiffBadgeProps) {
  const tVal = useTranslations('ptis.modules.PtisTaxDetails');
  const isPositive = diff > 0;
  const isNegative = diff < 0;

  const colorClass = isPositive
    ? 'text-emerald-600 bg-emerald-50/80 border-emerald-100'
    : isNegative
    ? 'text-rose-600 bg-rose-50/80 border-rose-100'
    : 'text-gray-500 bg-gray-50 border-gray-100';

  const formattedObj = isCurrency
    ? formatCompactCurrency(Math.abs(diff))
    : formatCompactNumber(Math.abs(diff), unit);

  return (
    <Tooltip 
      content={
        <div className="flex flex-col items-center justify-center leading-tight py-0.5">
          <span className="text-[11px] font-semibold text-white/90">{tVal('fullChange')}</span>
          <span className="text-[13px] font-extrabold text-white mt-0.5">{formattedObj.full}</span>
        </div>
      } 
      placement="top"
    >
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border font-bold text-[11.5px] xl:text-xs shrink-0 transition-all duration-300 hover:scale-105 cursor-help ${colorClass} ${className}`}
      >
        {isPositive && (
          <span className="inline-block animate-bounce [animation-duration:1.5s]">
            <ArrowUp className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
        {isNegative && (
          <span className="inline-block animate-bounce [animation-duration:1.5s]">
            <ArrowDown className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
        {!isPositive && !isNegative && (
          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
        )}
        <span>{formattedObj.compact}</span>
      </div>
    </Tooltip>
  );
}

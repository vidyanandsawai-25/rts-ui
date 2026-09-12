/* eslint-disable i18next/no-literal-string */
'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { PropertyPerformanceData } from '@/types/property-tax/apartment';
import { AnimatedMascot, type MascotMood } from './AnimatedMascot';
import { PropertyMasterRevenueStats } from './PropertyMasterRevenueStats';

interface PropertyMasterRevenueCardProps {
  performance?: PropertyPerformanceData;
  descriptionRegional?: string;
}

export const PropertyMasterRevenueCard: React.FC<PropertyMasterRevenueCardProps> = ({
  performance,
  descriptionRegional,
}) => {
  const mascotMood: MascotMood = React.useMemo(() => {
    if (!performance) return 'neutral';

    const isNegative =
      performance.isGrowthNegative ||
      (performance.changePercent != null && performance.changePercent < 0) ||
      (performance.rawDifferenceAmount != null && performance.rawDifferenceAmount < 0);

    if (isNegative) return 'sad';

    const isZeroOrDefault =
      !performance.thisAssessmentRevenue ||
      performance.thisAssessmentRevenue === '₹0' ||
      performance.thisAssessmentRevenue === '-' ||
      (!performance.changePercent && !performance.rawDifferenceAmount);

    if (isZeroOrDefault) return 'neutral';

    const isPositive =
      (performance.changePercent != null && performance.changePercent > 0) ||
      (performance.rawDifferenceAmount != null && performance.rawDifferenceAmount > 0);

    if (isPositive) return 'happy';

    return 'neutral';
  }, [performance]);

  return (
    <div className="w-full xl:w-[330px] bg-white rounded-xl border border-slate-200/90 px-2 pt-1.5 pb-2 shadow-2xs shrink-0 flex flex-col justify-between gap-1.5">
      {/* Top: Header Row with DESC */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1 gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-slate-800" />
          <span className="text-[11px] font-black text-slate-900 tracking-tight whitespace-nowrap">
            ADD. REVENUE
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-slate-600 tracking-tight">DESC:</span>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-red-500 bg-red-50/40 text-red-600 font-bold text-[11px] leading-normal tracking-tight whitespace-nowrap">
            {descriptionRegional || '-'}
          </span>
        </div>
      </div>

      {/* Middle: 3D Mascot Avatar + Amount & Growth Pill */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <AnimatedMascot className="w-14 h-14" size={56} mood={mascotMood} />
        <div
          className="flex flex-col items-end"
          title={
            performance?.oldCurrentTax && performance.oldCurrentTax !== '-'
              ? `Old Current Tax: ${performance.oldCurrentTax}${
                  performance.differenceAmount ? ` | Diff: ${performance.differenceAmount}` : ''
                }`
              : undefined
          }
        >
          <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">
            {performance?.thisAssessmentRevenue || '₹0'}
          </span>
          {performance?.revenueGrowthPct ? (
            <span
              className={`text-[10px] font-bold tracking-tight mt-1 ${
                performance?.isGrowthNegative ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {performance.revenueGrowthPct}
            </span>
          ) : null}
        </div>
      </div>

      {/* Bottom: 6 Grid Mini Cards */}
      <PropertyMasterRevenueStats performance={performance} />
    </div>
  );
};

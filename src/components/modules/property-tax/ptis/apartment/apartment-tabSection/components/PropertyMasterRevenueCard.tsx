'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('appartmentQC');

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
    <div className="w-full lg:w-[280px] xl:w-[310px] 2xl:w-[330px] bg-white rounded-xl border border-slate-200/90 px-2 pt-1.5 pb-2 shadow-2xs shrink-0 flex flex-col justify-between gap-1.5">
      {/* Top: Header Row with DESC */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1 gap-1.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <TrendingUp className="w-4 h-4 xl:w-5 xl:h-5 text-slate-900" />
          <span className="text-[13px] xl:text-[15px] font-black text-slate-900 tracking-tight whitespace-nowrap">
            {t('revenueCard.addRevenue') || 'ADD. REVENUE'}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[9px] xl:text-[10px] font-bold text-slate-600 tracking-tight">{t('revenueCard.desc') || 'DESC:'}</span>
          <span className="inline-flex items-center justify-center px-1.5 xl:px-2 py-0.5 rounded border border-red-500 bg-red-50/40 text-red-600 font-bold text-[10px] xl:text-[11px] leading-normal tracking-tight whitespace-nowrap">
            {descriptionRegional || '-'}
          </span>
        </div>
      </div>

      {/* Middle: 3D Mascot Avatar + Amount & Growth Pill */}
      <div className="flex items-center justify-between px-1 py-0.5">
        <AnimatedMascot className="w-16 h-16 xl:w-20 xl:h-20 shrink-0" size={72} mood={mascotMood} />
        <div
          className="flex flex-col items-end"
          title={
            performance?.oldCurrentTax && performance.oldCurrentTax !== '-'
              ? `${t('revenueCard.oldCurrentTax') || 'Old Current Tax'}: ${performance.oldCurrentTax}${
                  performance.differenceAmount ? ` | Diff: ${performance.differenceAmount}` : ''
                }`
              : undefined
          }
        >
          <span className="text-xl xl:text-2xl font-black text-slate-900 leading-none tracking-tight">
            {performance?.thisAssessmentRevenue || '₹0'}
          </span>
          {performance?.revenueGrowthPct ? (
            <span
              className={`text-xs xl:text-[13px] font-extrabold tracking-tight mt-0.5 xl:mt-1 ${
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


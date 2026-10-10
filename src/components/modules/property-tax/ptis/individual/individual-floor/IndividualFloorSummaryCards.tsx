'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Home, Building2, UserCheck, Percent, BarChart3, TrendingUp, TrendingDown, Scale, ShieldCheck, Scaling } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { RateableValueResponse } from '@/types/rateableValue.types';
import type { CapitalValueResponse, CapitalValueItem } from '@/types/capitalValue.types';
import type { DualMethodResponse } from '@/types/dualMethod.types';
import type { OldDetailsData } from '@/types/ptis.types';
import type { PtisTaxMode } from '@/types/property-tax/apartment';
import type { PropertyComparisonResponse } from '@/types/propertyComparison.types';

export interface IndividualFloorSummaryCardsProps {
  rateableData?: RateableValueResponse | null;
  capitalData?: CapitalValueResponse | null;
  dualMethodData?: DualMethodResponse | null;
  comparisonData?: PropertyComparisonResponse | null;
  oldDetailsData?: OldDetailsData | null;
  taxMode?: PtisTaxMode;
  isLoading?: boolean;
  className?: string;
}

export interface IndividualFloorSummaryCardsSkeletonProps {
  taxMode?: PtisTaxMode;
  className?: string;
}

export const IndividualFloorSummaryCardsSkeleton: React.FC<IndividualFloorSummaryCardsSkeletonProps> = ({
  taxMode = 'rateable',
  className,
}) => {
  const isCapitalMode = taxMode === 'capital';
  const cardCount = isCapitalMode ? 4 : 5;

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 my-0 select-none w-full items-stretch',
        isCapitalMode ? 'lg:grid-cols-4' : 'lg:grid-cols-5',
        className
      )}
    >
      {Array.from({ length: cardCount }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-slate-200 p-2.5 px-3 shadow-2xs flex items-center justify-between gap-3 min-w-0 w-full animate-pulse"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8.5 h-8.5 rounded-lg bg-slate-200 shrink-0" />
            <div className="h-7 w-[1px] bg-slate-200 shrink-0" />
            <div className="flex flex-col gap-1 min-w-0">
              <div className="h-3.5 bg-slate-200 rounded w-20" />
              <div className="h-3 bg-slate-200 rounded w-28" />
            </div>
          </div>
          <div className="h-6 w-16 bg-slate-200 rounded-full shrink-0 ml-auto" />
        </div>
      ))}
    </div>
  );
};

export const IndividualFloorSummaryCards: React.FC<IndividualFloorSummaryCardsProps> = ({
  rateableData,
  capitalData,
  dualMethodData,
  comparisonData,
  oldDetailsData,
  taxMode = 'rateable',
  isLoading = false,
  className,
}) => {
  const isCapitalMode = taxMode === 'capital';
  const isDualMode = taxMode === 'dual';
  const t = useTranslations('individual.summaryCards');
  const tCommon = useTranslations('common');

  const capitalItems: CapitalValueItem[] = useMemo(() => {
    if (!capitalData) return [];
    if (Array.isArray(capitalData)) return capitalData;
    if (Array.isArray(capitalData.items)) return capitalData.items;
    if (Array.isArray(capitalData.details)) return capitalData.details;
    return [];
  }, [capitalData]);

  const totalCapitalValue = useMemo(() => {
    if (!capitalData) return 0;
    if (!Array.isArray(capitalData) && capitalData.totalCapitalValue != null) {
      return Number(capitalData.totalCapitalValue);
    }
    return capitalItems.reduce((sum, item) => sum + (Number(item.capitalValue) || 0), 0);
  }, [capitalData, capitalItems]);

  const totalCapitalTax = useMemo(() => {
    if (!capitalData) return 0;
    if (!Array.isArray(capitalData) && capitalData.totalTax != null) {
      return Number(capitalData.totalTax);
    }
    return capitalItems.reduce((sum, item) => sum + (Number(item.taxTotal) || 0), 0);
  }, [capitalData, capitalItems]);

  const rateableDetails = useMemo(() => {
    if (!rateableData) return [];
    return (
      rateableData.details ??
      rateableData.items ??
      (rateableData as unknown as { rateableValueDetails?: Array<{ use?: string; annualRentalValue?: number; rateableValue?: number; taxTotal?: number }> })?.rateableValueDetails ??
      []
    );
  }, [rateableData]);

  const sumRateableAlv = useMemo(() => {
    return rateableDetails.reduce((sum, item) => sum + (Number(item.annualRentalValue) || 0), 0);
  }, [rateableDetails]);

  const sumRateableRv = useMemo(() => {
    return rateableDetails.reduce((sum, item) => sum + (Number(item.rateableValue) || 0), 0);
  }, [rateableDetails]);

  const sumRateableTax = useMemo(() => {
    return rateableDetails.reduce((sum, item) => sum + (Number(item.taxTotal) || 0), 0);
  }, [rateableDetails]);

  if (isLoading) {
    return <IndividualFloorSummaryCardsSkeleton taxMode={taxMode} className={className} />;
  }

  // AREA
  const compArea = comparisonData?.area;
  const hasCompArea = compArea != null;
  const oldArea = hasCompArea ? compArea.old : (oldDetailsData?.oldPlotArea ? Number(oldDetailsData.oldPlotArea) : 0);
  const newArea = hasCompArea ? compArea.new : 0;
  const changeArea = hasCompArea ? compArea.change : (newArea - oldArea);

  // CHANGES OF USE
  const findUseName = (items: unknown[]): string | null => {
    if (!Array.isArray(items)) return null;
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const rec = item as Record<string, unknown>;
      const val = rec.use || rec.usageDescription || rec.typeOfUseDescription || rec.natureTypeBuilding || rec.subTypeOfUse;
      if (val && String(val).trim() !== '' && String(val) !== '-') {
        return String(val);
      }
    }
    return null;
  };

  const oldUse =
    comparisonData?.changeOfUse?.oldUse ||
    oldDetailsData?.oldTypeOfUseId ||
    (oldDetailsData as unknown as { oldUse?: string })?.oldUse ||
    (oldDetailsData as unknown as { oldTypeOfUseDescription?: string })?.oldTypeOfUseDescription ||
    '-';

  const newUse =
    comparisonData?.changeOfUse?.newUse ||
    (isCapitalMode
      ? findUseName(capitalItems) || findUseName(rateableDetails)
      : findUseName(rateableDetails) || findUseName(capitalItems)) ||
    '-';

  const isUseUpdated =
    comparisonData?.changeOfUse != null
      ? Boolean(comparisonData.changeOfUse.hasChanged)
      : (oldUse !== '-' && newUse !== '-' && oldUse.trim().toLowerCase() !== newUse.trim().toLowerCase());

  // ALV
  const compAlv = comparisonData?.alv;
  const hasCompAlv = compAlv != null;
  const oldAlv = hasCompAlv
    ? compAlv.old
    : oldDetailsData?.oldALV
      ? Number(oldDetailsData.oldALV)
      : 0;
  const newAlv = hasCompAlv
    ? compAlv.new
    : (rateableData as unknown as { totalAnnualRentalValue?: number })?.totalAnnualRentalValue ??
    (rateableData?.totalRateableValue != null && sumRateableAlv === 0
      ? rateableData.totalRateableValue
      : sumRateableAlv);
  const alvPercent =
    hasCompAlv && compAlv.changePercent != null
      ? compAlv.changePercent
      : oldAlv > 0
        ? ((newAlv - oldAlv) / oldAlv) * 100
        : newAlv > 0
          ? 100
          : 0;
  const formattedAlvDelta = `${alvPercent >= 0 ? '+' : ''}${alvPercent.toFixed(2)}%`;

  // RV
  const compRv = comparisonData?.rv;
  const hasCompRv = compRv != null;
  const oldRv = hasCompRv
    ? compRv.old
    : oldDetailsData?.oldRV
      ? Number(oldDetailsData.oldRV)
      : 0;
  const newRv = hasCompRv
    ? compRv.new
    : rateableData?.totalRateableValue ?? sumRateableRv;
  const rvPercent =
    hasCompRv && compRv.changePercent != null
      ? compRv.changePercent
      : oldRv > 0
        ? ((newRv - oldRv) / oldRv) * 100
        : newRv > 0
          ? 100
          : 0;
  const formattedRvDelta = `${rvPercent >= 0 ? '+' : ''}${rvPercent.toFixed(2)}%`;

  // CV
  const compCv = comparisonData?.cv;
  const hasCompCv = compCv != null;
  const oldCv = hasCompCv
    ? compCv.old
    : oldDetailsData?.oldCV
      ? Number(oldDetailsData.oldCV)
      : 0;
  const newCv = hasCompCv
    ? compCv.new
    : totalCapitalValue;
  const cvPercent =
    hasCompCv && compCv.changePercent != null
      ? compCv.changePercent
      : oldCv > 0
        ? ((newCv - oldCv) / oldCv) * 100
        : newCv > 0
          ? 100
          : 0;
  const formattedCvDelta = `${cvPercent >= 0 ? '+' : ''}${cvPercent.toFixed(2)}%`;

  // TAX
  const compTax = comparisonData?.tax;
  const hasCompTax = compTax != null;
  const oldTax = hasCompTax
    ? compTax.old
    : oldDetailsData?.oldTotalTax
      ? Number(oldDetailsData.oldTotalTax)
      : 0;
  const newTax = hasCompTax
    ? compTax.new
    : isCapitalMode
      ? totalCapitalTax
      : rateableData?.totalTax ?? sumRateableTax;
  const taxPercent =
    hasCompTax && compTax.changePercent != null
      ? compTax.changePercent
      : oldTax > 0
        ? ((newTax - oldTax) / oldTax) * 100
        : newTax > 0
          ? 100
          : 0;
  const formattedTaxDelta = `${taxPercent >= 0 ? '+' : ''}${taxPercent.toFixed(2)}%`;

  const formatRupeeShort = (val: number | string | undefined | null, hasSource: boolean) => {
    if (!hasSource || val === undefined || val === null || val === '') return '-';
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num)) return '-';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 my-0 select-none w-full items-stretch',
        isCapitalMode ? 'lg:grid-cols-4' : 'lg:grid-cols-5',
        className
      )}
    >
      {/* Card 1: AREA */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 px-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5 min-w-0 w-full h-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8.5 h-8.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Scaling className="w-4 h-4 text-blue-600" />
          </div>

          <div className="h-7 w-[1px] bg-slate-200 shrink-0" />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="text-xs font-black text-slate-900 tracking-wide uppercase truncate">{t('area')}</span>
              {compArea?.unit && (
                <span className="text-[10.5px] font-semibold text-slate-500 uppercase shrink-0">
                  ({compArea.unit})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600 truncate">
              <span className="truncate">
                <span className="text-slate-500 font-semibold">{t('old')} </span>
                <span className="font-bold text-slate-700">{oldArea > 0 ? Number(oldArea).toFixed(2) : '-'}</span>
              </span>
              <span className="truncate">
                <span className="text-slate-500 font-semibold">{t('new')} </span>
                <span className="font-black text-slate-900">{newArea > 0 ? Number(newArea).toFixed(2) : '-'}</span>
              </span>
            </div>
          </div>
        </div>

        {hasCompArea && changeArea !== 0 && (
          <div className="shrink-0 ml-auto">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs leading-none">
              {changeArea < 0 ? (
                <TrendingDown className="w-3 h-3 text-blue-600 shrink-0" />
              ) : (
                <TrendingUp className="w-3 h-3 text-blue-600 shrink-0" />
              )}
              <span className="truncate">
                {changeArea > 0 ? `+${changeArea.toFixed(2)}` : `${changeArea.toFixed(2)}`}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Card 2: CHANGES OF USE */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 px-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5 min-w-0 w-full h-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8.5 h-8.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <Home className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-7 w-[1px] bg-slate-200 shrink-0" />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="text-xs font-black text-slate-900 tracking-wide uppercase truncate">{t('changesOfUse')}</span>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600 truncate">
              <span className="truncate" title={oldUse}>
                <span className="text-slate-500 font-semibold">{t('old')} </span>
                <span className="font-bold text-slate-700">{oldUse}</span>
              </span>
              <span className="truncate" title={newUse}>
                <span className="text-slate-500 font-semibold">{t('new')} </span>
                <span className="font-black text-slate-900">{newUse}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 ml-auto">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border shadow-2xs leading-none',
              isUseUpdated
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            )}
          >
            <ShieldCheck className={cn('w-3 h-3 shrink-0', isUseUpdated ? 'text-emerald-600' : 'text-slate-400')} />
            <span className="truncate">{isUseUpdated ? tCommon('yes') : tCommon('no')}</span>
          </span>
        </div>
      </div>

      {/* Card 3: ALV (Hidden on Capital Value Method) */}
      {!isCapitalMode && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 px-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5 min-w-0 w-full h-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8.5 h-8.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="h-7 w-[1px] bg-slate-200 shrink-0" />

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1 min-w-0 truncate">
                <span className="text-xs font-black text-slate-900 tracking-wide uppercase truncate">{t('alv')}</span>
              </div>

              <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600 truncate">
                <span className="truncate">
                  <span className="text-slate-500 font-semibold">{t('old')} </span>
                  <span className="font-bold text-slate-700">{formatRupeeShort(oldAlv, hasCompAlv || Boolean(oldDetailsData?.oldALV))}</span>
                </span>
                <span className="truncate">
                  <span className="text-slate-500 font-semibold">{t('new')} </span>
                  <span className="font-black text-slate-900">{formatRupeeShort(newAlv, hasCompAlv || Boolean(newAlv > 0 || rateableData != null))}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 ml-auto">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-2xs leading-none">
              <BarChart3 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">{formattedAlvDelta}</span>
            </span>
          </div>
        </div>
      )}

      {/* Card 4: RATEABLE / CAPITAL / DUAL */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 px-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5 min-w-0 w-full h-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8.5 h-8.5 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
            {isDualMode ? (
              <Scale className="w-4 h-4 text-purple-600" />
            ) : (
              <UserCheck className="w-4 h-4 text-purple-600" />
            )}
          </div>

          <div className="h-7 w-[1px] bg-slate-200 shrink-0" />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="text-xs font-black text-slate-900 tracking-wide uppercase truncate">
                {isCapitalMode ? t('capitalValue') : isDualMode ? t('rvVsCv') : t('rateableValue')}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600 truncate">
              {isDualMode ? (
                <>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('rv')} </span>
                    <span className="font-bold text-slate-700">{formatRupeeShort(compRv?.new ?? dualMethodData?.totalRv ?? rateableData?.totalRateableValue ?? sumRateableRv, hasCompRv || Boolean(dualMethodData?.totalRv || rateableData != null))}</span>
                  </span>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('cv')} </span>
                    <span className="font-black text-purple-900">{formatRupeeShort(compCv?.new ?? dualMethodData?.totalCv ?? totalCapitalValue, hasCompCv || Boolean(dualMethodData?.totalCv || capitalData != null))}</span>
                  </span>
                </>
              ) : isCapitalMode ? (
                <>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('old')} </span>
                    <span className="font-bold text-slate-700">{formatRupeeShort(oldCv, hasCompCv || Boolean(oldDetailsData?.oldCV))}</span>
                  </span>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('new')} </span>
                    <span className="font-black text-slate-900">{formatRupeeShort(newCv, hasCompCv || Boolean(capitalData != null || totalCapitalValue > 0))}</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('old')} </span>
                    <span className="font-bold text-slate-700">{formatRupeeShort(oldRv, hasCompRv || Boolean(oldDetailsData?.oldRV))}</span>
                  </span>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('new')} </span>
                    <span className="font-black text-slate-900">{formatRupeeShort(newRv, hasCompRv || Boolean(rateableData != null || newRv > 0))}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 ml-auto">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-100 shadow-2xs leading-none">            
             {!isDualMode && (isCapitalMode ? cvPercent : rvPercent) < 0 ? (
               <TrendingDown className="w-3 h-3 text-purple-600 shrink-0" />
             ) : (
               <TrendingUp className="w-3 h-3 text-purple-600 shrink-0" />
             )}
            <span className="truncate">{isDualMode ? t('rvCvm') : isCapitalMode ? formattedCvDelta : formattedRvDelta}</span>
          </span>
        </div>
      </div>

      {/* Card 5: TAX */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-2.5 px-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-2.5 min-w-0 w-full h-full">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8.5 h-8.5 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <Percent className="w-4 h-4 text-rose-600" />
          </div>

          <div className="h-7 w-[1px] bg-slate-200 shrink-0" />

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="text-xs font-black text-slate-900 tracking-wide uppercase truncate">
                {isDualMode ? t('taxRetained') : t('taxCurrent')}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] font-semibold text-slate-600 truncate">
              {isDualMode ? (
                <>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('old')} </span>
                    <span className="font-bold text-slate-700">{formatRupeeShort(compTax?.old ?? dualMethodData?.oldTaxesTotal ?? oldTax, hasCompTax || Boolean(dualMethodData?.oldTaxesTotal || oldTax))}</span>
                  </span>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('retained')} </span>
                    <span className="font-black text-rose-700">{formatRupeeShort(compTax?.new ?? dualMethodData?.retainTaxesTotal ?? rateableData?.totalTax ?? sumRateableTax, hasCompTax || Boolean(dualMethodData?.retainTaxesTotal || rateableData != null))}</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('old')} </span>
                    <span className="font-bold text-slate-700">{formatRupeeShort(oldTax, hasCompTax || Boolean(oldDetailsData?.oldTotalTax))}</span>
                  </span>
                  <span className="truncate">
                    <span className="text-slate-500 font-semibold">{t('new')} </span>
                    <span className="font-black text-slate-900">{formatRupeeShort(newTax, hasCompTax || Boolean(newTax > 0 || (isCapitalMode ? capitalData != null : rateableData != null)))}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 ml-auto">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-100 shadow-2xs leading-none">
            <TrendingUp className="w-3 h-3 text-rose-600 shrink-0" />
            <span className="truncate">{isDualMode ? t('beneficial') : formattedTaxDelta}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default IndividualFloorSummaryCards;

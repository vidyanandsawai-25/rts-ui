'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Home, Building2, UserCheck, Percent, BarChart3, TrendingUp, Scale, ShieldCheck, Scaling, Ruler } from 'lucide-react';
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
}

export const IndividualFloorSummaryCards: React.FC<IndividualFloorSummaryCardsProps> = ({
  rateableData,
  capitalData,
  dualMethodData,
  comparisonData,
  oldDetailsData,
  taxMode = 'rateable',
}) => {
  const isCapitalMode = taxMode === 'capital';
  const isDualMode = taxMode === 'dual';
  const t = useTranslations('individual.summaryCards');

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

  // AREA
  const compArea = comparisonData?.area;
  const hasCompArea = compArea != null;
  const oldArea = hasCompArea ? compArea.old : (oldDetailsData?.oldPlotArea ? Number(oldDetailsData.oldPlotArea) : 0);
  const newArea = hasCompArea ? compArea.new : 0;
  const changeArea = hasCompArea ? compArea.change : (newArea - oldArea);
  const areaUnit = compArea?.unit;

  // CHANGES OF USE
  const oldUse = comparisonData?.changeOfUse?.oldUse || oldDetailsData?.oldTypeOfUseId || '-';
  const newUse =
    comparisonData?.changeOfUse?.newUse ||
    (isCapitalMode
      ? capitalItems[0]?.typeOfUseDescription || '-'
      : rateableDetails[0]?.use || capitalItems[0]?.typeOfUseDescription || '-');
  const hasChangedUse =
    comparisonData?.changeOfUse != null
      ? Boolean(comparisonData.changeOfUse.hasChanged)
      : false;
  const updatedCount = isCapitalMode
    ? capitalItems.length
    : (rateableDetails.length || capitalItems.length) ?? 0;

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

  const formatRupee = (val: number | string | undefined | null, hasSource: boolean) => {
    if (!hasSource || val === undefined || val === null || val === '') return '-';
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    if (isNaN(num)) return '-';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 my-0 select-none w-full items-stretch">
      {/* Card 1: AREA */}
      <div className="bg-white rounded-lg border border-blue-400 border-t-[2.5px] border-t-blue-700 p-2 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-w-0 w-full h-full">
        <div className="flex items-center justify-between gap-1 mb-0.5 min-w-0">
          <span className="text-[10px] font-black text-blue-900 tracking-wider uppercase truncate">
            {t('area')}
          </span>
          <Ruler className="w-3 h-3 text-blue-600 shrink-0" />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md border border-blue-300 bg-blue-50/80 flex items-center justify-center shrink-0">
            <Scaling className="w-3 h-3 text-blue-600" />
          </div>

          <div className="flex flex-col min-w-0 leading-none space-y-0.5">
            <span className="text-[9.5px] font-bold text-slate-500 truncate">
              {t('old')} <span className="font-extrabold text-slate-800">{oldArea > 0 ? `${Number(oldArea).toFixed(2)} ${areaUnit}` : '-'}</span>
            </span>
            <span className="text-[9.5px] font-bold text-slate-500 truncate">
              {t('new')} <span className="font-black text-slate-900">{newArea > 0 ? `${Number(newArea).toFixed(2)} ${areaUnit}` : '-'}</span>
            </span>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8.5px] font-extrabold bg-emerald-100/70 text-emerald-700 border border-emerald-300/80 leading-none max-w-full truncate">
                <TrendingUp className="w-2 h-2 text-emerald-600 shrink-0" />
                <span className="truncate">{changeArea !== 0 ? `↑ ${changeArea > 0 ? '+' : ''}${changeArea.toFixed(2)} ${areaUnit}` : '-'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: CHANGES OF USE */}
      <div className="bg-white rounded-lg border border-blue-400 border-t-[2.5px] border-t-blue-700 p-2 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-w-0 w-full h-full">
        <div className="flex items-center justify-between gap-1 mb-0.5 min-w-0">
          <span className="text-[10px] font-black text-blue-900 tracking-wider uppercase truncate">
            {t('changesOfUse')}
          </span>
          <Home className="w-3 h-3 text-amber-700/80 shrink-0" />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md border border-emerald-300 bg-emerald-50/80 flex items-center justify-center shrink-0">
            <Home className="w-3 h-3 text-emerald-600" />
          </div>

          <div className="flex flex-col min-w-0 leading-none space-y-0.5">
            <span className="text-[9.5px] font-bold text-slate-500 truncate">
              {t('old')} <span className="font-extrabold text-slate-800">{oldUse}</span>
            </span>
            <span className="text-[9.5px] font-bold text-slate-500 truncate">
              {t('new')} <span className="font-black text-slate-900">{newUse}</span>
            </span>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8.5px] font-extrabold bg-emerald-100/70 text-emerald-700 border border-emerald-300/80 leading-none max-w-full truncate">
                <Home className="w-2 h-2 text-emerald-600 shrink-0" />
                <span className="truncate">{hasChangedUse ? t('changed') : t('updated', { count: updatedCount })}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: ALV */}
      <div className="bg-white rounded-lg border border-blue-400 border-t-[2.5px] border-t-blue-700 p-2 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-w-0 w-full h-full">
        <div className="flex items-center justify-between gap-1 mb-0.5 min-w-0">
          <span className="text-[10px] font-black text-blue-900 tracking-wider uppercase truncate">
            {t('alv')}
          </span>
          <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md border border-emerald-300 bg-emerald-50/80 flex items-center justify-center shrink-0">
            <Building2 className="w-3 h-3 text-emerald-600" />
          </div>

          <div className="flex flex-col min-w-0 leading-none space-y-0.5">
            <span className="text-[9.5px] font-bold text-slate-500 truncate">
              {t('old')} <span className="font-extrabold text-slate-800">{formatRupee(oldAlv, hasCompAlv || Boolean(oldDetailsData?.oldALV))}</span>
            </span>
            <span className="text-[9.5px] font-bold text-slate-500 truncate">
              {t('new')} <span className="font-black text-slate-900">{isCapitalMode ? '-' : formatRupee(newAlv, hasCompAlv || Boolean(newAlv > 0 || rateableData != null))}</span>
            </span>
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8.5px] font-extrabold bg-emerald-100/70 text-emerald-700 border border-emerald-300/80 leading-none max-w-full truncate">
                <BarChart3 className="w-2 h-2 text-emerald-600 shrink-0" />
                <span className="truncate">{isCapitalMode ? t('cvm') : formattedAlvDelta}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: RATEABLE / CAPITAL / DUAL */}
      <div className="bg-white rounded-lg border border-blue-400 border-t-[2.5px] border-t-blue-700 p-2 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-w-0 w-full h-full">
        <div className="flex items-center justify-between gap-1 mb-0.5 min-w-0">
          <span className="text-[10px] font-black text-blue-900 tracking-wider uppercase truncate">
            {isCapitalMode ? t('capitalValue') : isDualMode ? t('rvVsCv') : t('rateableValue')}
          </span>
          {isDualMode ? (
            <Scale className="w-3 h-3 text-purple-600 shrink-0" />
          ) : (
            <TrendingUp className="w-3 h-3 text-blue-500 shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md border border-emerald-300 bg-emerald-50/80 flex items-center justify-center shrink-0">
            <UserCheck className="w-3 h-3 text-emerald-600" />
          </div>

          <div className="flex flex-col min-w-0 leading-none space-y-0.5">
            {isDualMode ? (
              <>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('rv')} <span className="font-extrabold text-slate-800">{formatRupee(compRv?.new ?? dualMethodData?.totalRv ?? rateableData?.totalRateableValue ?? sumRateableRv, hasCompRv || Boolean(dualMethodData?.totalRv || rateableData != null))}</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('cv')} <span className="font-black text-purple-900">{formatRupee(compCv?.new ?? dualMethodData?.totalCv ?? totalCapitalValue, hasCompCv || Boolean(dualMethodData?.totalCv || capitalData != null))}</span>
                </span>
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8.5px] font-extrabold bg-purple-100/70 text-purple-700 border border-purple-300/80 leading-none max-w-full truncate">
                    <Scale className="w-2 h-2 text-purple-600 shrink-0" />
                    <span className="truncate">{t('rvCvm')}</span>
                  </span>
                </div>
              </>
            ) : isCapitalMode ? (
              <>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('old')} <span className="font-extrabold text-slate-800">{formatRupee(oldCv, hasCompCv || Boolean(oldDetailsData?.oldCV))}</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('new')} <span className="font-black text-slate-900">{formatRupee(newCv, hasCompCv || Boolean(capitalData != null || totalCapitalValue > 0))}</span>
                </span>
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8.5px] font-extrabold bg-emerald-100/70 text-emerald-700 border border-emerald-300/80 leading-none max-w-full truncate">
                    <BarChart3 className="w-2 h-2 text-emerald-600 shrink-0" />
                    <span className="truncate">{formattedCvDelta}</span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('old')} <span className="font-extrabold text-slate-800">{formatRupee(oldRv, hasCompRv || Boolean(oldDetailsData?.oldRV))}</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('new')} <span className="font-black text-slate-900">{formatRupee(newRv, hasCompRv || Boolean(rateableData != null || newRv > 0))}</span>
                </span>
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8.5px] font-extrabold bg-emerald-100/70 text-emerald-700 border border-emerald-300/80 leading-none max-w-full truncate">
                    <TrendingUp className="w-2 h-2 text-emerald-600 shrink-0" />
                    <span className="truncate">{formattedRvDelta}</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card 5: TAX (CURRENT / RETAINED) */}
      <div className="bg-white rounded-lg border border-blue-400 border-t-[2.5px] border-t-blue-700 p-2 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between min-w-0 w-full h-full">
        <div className="flex items-center justify-between gap-1 mb-0.5 min-w-0">
          <span className="text-[10px] font-black text-blue-900 tracking-wider uppercase truncate">
            {isDualMode ? t('taxRetained') : t('taxCurrent')}
          </span>
          {isDualMode ? (
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
          ) : (
            <BarChart3 className="w-3 h-3 text-pink-500 shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md border border-emerald-300 bg-emerald-50/80 flex items-center justify-center shrink-0">
            <Percent className="w-3 h-3 text-emerald-600" />
          </div>

          <div className="flex flex-col min-w-0 leading-none space-y-0.5">
            {isDualMode ? (
              <>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('old')} <span className="font-extrabold text-slate-800">{formatRupee(compTax?.old ?? dualMethodData?.oldTaxesTotal ?? oldTax, hasCompTax || Boolean(dualMethodData?.oldTaxesTotal || oldTax))}</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('retained')} <span className="font-black text-rose-700">{formatRupee(compTax?.new ?? dualMethodData?.retainTaxesTotal ?? rateableData?.totalTax ?? sumRateableTax, hasCompTax || Boolean(dualMethodData?.retainTaxesTotal || rateableData != null))}</span>
                </span>
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8.5px] font-extrabold bg-emerald-100/70 text-emerald-700 border border-emerald-300/80 leading-none max-w-full truncate">
                    <ShieldCheck className="w-2 h-2 text-emerald-600 shrink-0" />
                    <span className="truncate">{t('beneficial')}</span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('old')} <span className="font-extrabold text-slate-800">{formatRupee(oldTax, hasCompTax || Boolean(oldDetailsData?.oldTotalTax))}</span>
                </span>
                <span className="text-[9.5px] font-bold text-slate-500 truncate">
                  {t('new')} <span className="font-black text-slate-900">{formatRupee(newTax, hasCompTax || Boolean(newTax > 0 || (isCapitalMode ? capitalData != null : rateableData != null)))}</span>
                </span>
                <div className="pt-0.5">
                  <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8.5px] font-extrabold bg-emerald-100/70 text-emerald-700 border border-emerald-300/80 leading-none max-w-full truncate">
                    <BarChart3 className="w-2 h-2 text-emerald-600 shrink-0" />
                    <span className="truncate">{formattedTaxDelta}</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualFloorSummaryCards;
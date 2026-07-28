import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import { type BadgeThemeColor } from './TaxBadge';
import { getTranslations } from 'next-intl/server';
import { TaxDetailsContainer } from './TaxDetailsContainer';
import { formatIndianNumber } from '@/lib/utils/format';

/**
 * Represents a single badge in the summary footer (maintained for prop compatibility)
 */
export interface SummaryBadge {
  label: string;
  value: number | string;
  color: BadgeThemeColor;
}

export interface ValuationSummaryFooterProps {
  title: string;
  badges?: SummaryBadge[];
  initialTaxDetails?: TaxDetailsData;
  locale?: string;
}

/**
 * ValuationSummaryFooter Component
 * Displays a clean title, metrics cards for Area, Change of Use, RV, and Tax,
 * and the tabbed TaxDetails section.
 */
export async function ValuationSummaryFooter({
  title,
  badges,
  initialTaxDetails,
  locale = 'en',
}: ValuationSummaryFooterProps) {
  const tVal = await getTranslations({ locale, namespace: 'ptis.modules.PtisTaxDetails' });

  // Find badges by matching translated labels to avoid sequence mismatch issues
  const oldValRVBadge = badges?.find(
    item => item.label === tVal('oldTotalRv') || item.label === tVal('oldTotalCv')
  );
  const newValRVBadge = badges?.find(
    item => item.label === tVal('totalRv') || item.label === tVal('totalCv')
  );
  const oldTaxBadge = badges?.find(
    item => item.label === tVal('oldTotalTax')
  );
  const newTaxBadge = badges?.find(
    item => item.label === tVal('totalTax')
  );

  const oldValRV = Number(oldValRVBadge?.value ?? 0);
  const newValRV = Number(newValRVBadge?.value ?? 0);
  const valDiffRV = newValRV - oldValRV;

  const oldTax = Number(oldTaxBadge?.value ?? 0);
  const newTax = Number(newTaxBadge?.value ?? 0);
  const taxDiff = newTax - oldTax;

  const isCV = oldValRVBadge?.label === tVal('oldTotalCv');
  const valLabel = isCV ? tVal('cv') : tVal('rv');

  // Static simplified data matching specifications
  const oldArea = 0;
  const newArea = 0;
  const areaDiff = 0;

  const oldUseType: string = 'N/A';
  const newUseType: string = 'Mix';

  // Simple formatting helper
  const formatCurrency = (val: number) => {
    const decimals = Number.isInteger(val) ? 0 : 2;
    return '₹' + formatIndianNumber(val, decimals, decimals);
  };

  const getDiffColor = (diff: number) => {
    if (diff > 0) return 'text-emerald-600';
    if (diff < 0) return 'text-rose-600';
    return 'text-gray-500';
  };

  const getDiffArrow = (diff: number) => {
    if (diff > 0) return '↑ ';
    if (diff < 0) return '↓ ';
    return '';
  };

  const metricsCards = (
    <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 w-full lg:w-auto">
      {/* Card 1: Area */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-100 p-1.5 px-3 shadow-sm transition-all duration-200 hover:shadow-md">
        <span className="text-blue-600 font-extrabold text-xs">{tVal('area')}</span>
        <div className="border-l border-gray-200 h-7 mx-0.5"></div>
        <div className="flex flex-col text-[9.5px] xl:text-[10px] text-gray-500 leading-tight">
          <span>{tVal('oldLabel')}{' '}<span className="font-semibold text-gray-700">{oldArea}{' '}{tVal('m2Unit')}</span></span>
          <span>{tVal('newLabel')}{' '}<span className="font-semibold text-blue-600">{newArea}{' '}{tVal('m2Unit')}</span></span>
        </div>
        <div className="border-l border-gray-200 h-7 mx-0.5"></div>
        <span className="text-emerald-600 font-extrabold text-[10px] xl:text-xs flex items-center shrink-0">
          {getDiffArrow(areaDiff) || '↑ '}{areaDiff.toLocaleString('en-IN')}{' '}{tVal('m2Unit')}
        </span>
      </div>

      {/* Card 2: Change of Use */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-100 p-1.5 px-3 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex flex-col items-start leading-tight">
          <span className="text-purple-600 font-extrabold text-[10px]">{tVal('changeOfUse')}</span>
          <span className="text-[8px] xl:text-[9px] font-black px-1 py-0.5 rounded-sm uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200 leading-none mt-0.5">
            {oldUseType !== newUseType ? tVal('yes') : tVal('no')}
          </span>
        </div>
        <div className="border-l border-gray-200 h-7 mx-0.5"></div>
        <div className="flex flex-col text-[9.5px] xl:text-[10px] text-gray-500 leading-tight">
          <span>{tVal('oldLabel')}{' '}<span className="font-semibold text-gray-700">{oldUseType}</span></span>
          <span>{tVal('newLabel')}{' '}<span className="font-semibold text-purple-600">{newUseType}</span></span>
        </div>
      </div>

      {/* Card 3: RV/CV */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-100 p-1.5 px-3 shadow-sm transition-all duration-200 hover:shadow-md">
        <span className="text-orange-600 font-extrabold text-xs">{valLabel}</span>
        <div className="border-l border-gray-200 h-7 mx-0.5"></div>
        <div className="flex flex-col text-[9.5px] xl:text-[10px] text-gray-500 leading-tight">
          <span>{tVal('oldLabel')}{' '}<span className="font-semibold text-gray-700">{formatCurrency(oldValRV)}</span></span>
          <span>{tVal('newLabel')}{' '}<span className="font-semibold text-orange-600">{formatCurrency(newValRV)}</span></span>
        </div>
        <div className="border-l border-gray-200 h-7 mx-0.5"></div>
        <span className={`font-extrabold text-[10px] xl:text-xs flex items-center shrink-0 ${getDiffColor(valDiffRV)}`}>
          {getDiffArrow(valDiffRV)}{formatCurrency(Math.abs(valDiffRV))}
        </span>
      </div>

      {/* Card 4: Tax */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-100 p-1.5 px-3 shadow-sm transition-all duration-200 hover:shadow-md">
        <span className="text-emerald-600 font-extrabold text-xs">{tVal('tax')}</span>
        <div className="border-l border-gray-200 h-7 mx-0.5"></div>
        <div className="flex flex-col text-[9.5px] xl:text-[10px] text-gray-500 leading-tight">
          <span>{tVal('oldLabel')}{' '}<span className="font-semibold text-gray-700">{formatCurrency(oldTax)}</span></span>
          <span>{tVal('newLabel')}{' '}<span className="font-semibold text-emerald-600">{formatCurrency(newTax)}</span></span>
        </div>
        <div className="border-l border-gray-200 h-7 mx-0.5"></div>
        <span className={`font-extrabold text-[10px] xl:text-xs flex items-center shrink-0 ${getDiffColor(taxDiff)}`}>
          {getDiffArrow(taxDiff)}{formatCurrency(Math.abs(taxDiff))}
        </span>
      </div>
    </div>
  );

  return (
    <TaxDetailsContainer
      title={title}
      initialTaxDetails={initialTaxDetails}
      metricsCards={metricsCards}
    />
  );
}

import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import TaxDetails from '../TaxDetails/TaxDetails';
import { type BadgeThemeColor } from './TaxBadge';

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
}

/**
 * ValuationSummaryFooter Component
 * Displays a clean title, a Net Impact summary card, and metrics cards for Area, Change of Use, RV, and Tax.
 */
export function ValuationSummaryFooter({
  title,
  badges,
  initialTaxDetails,
}: ValuationSummaryFooterProps) {

  // Static simplified data matching specifications
  const oldArea = 18.63;
  const newArea = 1193.08;
  const areaDiff = 1174.45;

  const oldUseType = 'N/A';
  const newUseType = 'Mix';

  const oldVal = 3434;
  const newVal = 128882;
  const valDiff = 125548;

  const oldTax = 0;
  const newTax = 47310;
  const taxDiff = 47310;

  // Simple formatting helper
  const formatCurrency = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  console.log("badges :", badges);

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-xs">
      {/* Banner / Header with tighter padding and smaller overall size */}
      <div className="flex flex-col xl:flex-row w-full items-center justify-between gap-2 border-t-2 border-blue-700 bg-blue-50/70 p-1.5 px-3">
        <div className="flex items-center gap-2 shrink-0">
          <h3 className="text-xs font-black tracking-wide text-blue-900 uppercase">
            {title.includes("Summary") ? title : `${title} & Reassessment Summary`}
          </h3>

          {/* Small Summary Card highlighting Net Impact */}
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-md py-0.5 px-1.5 shadow-xs shrink-0">
            <span className="text-emerald-700 font-extrabold text-[8px] uppercase tracking-wider">Impact</span>
            <div className="border-l border-emerald-200 h-3.5 mx-0.5"></div>
            <span className="text-emerald-700 font-black text-[11px]">↑ ₹47,310</span>
          </div>
        </div>

        {/* Cards Row with tight margins and small sizing */}
        <div className="flex flex-wrap items-center justify-center xl:justify-end gap-1.5 w-full xl:w-auto">
          {/* Card 1: Area */}
          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-blue-100 p-1 px-2 shadow-xs transition-all duration-200 hover:shadow-xs">
            <span className="text-blue-600 font-extrabold text-[10px]">Area</span>
            <div className="border-l border-gray-200 h-5.5 mx-0.5"></div>
            <div className="flex flex-col text-[8.5px] text-gray-500 leading-tight">
              <span>OLD: <span className="font-semibold text-gray-700">{oldArea} m²</span></span>
              <span>NEW: <span className="font-semibold text-blue-600">{newArea} m²</span></span>
            </div>
            <div className="border-l border-gray-200 h-5.5 mx-0.5"></div>
            <span className="text-emerald-600 font-extrabold text-[9.5px] flex items-center shrink-0">
              ↑ {areaDiff.toLocaleString('en-IN')} m²
            </span>
          </div>

          {/* Card 2: Change of Use */}
          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-blue-100 p-1 px-2 shadow-xs transition-all duration-200 hover:shadow-xs">
            <div className="flex flex-col items-start leading-tight">
              <span className="text-purple-600 font-extrabold text-[8.5px]">Change of Use</span>
              <span className="text-[7.5px] font-black px-0.5 rounded-xs uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200 leading-none">
                NO
              </span>
            </div>
            <div className="border-l border-gray-200 h-5.5 mx-0.5"></div>
            <div className="flex flex-col text-[8.5px] text-gray-500 leading-tight">
              <span>OLD: <span className="font-semibold text-gray-700">{oldUseType}</span></span>
              <span>NEW: <span className="font-semibold text-purple-600">{newUseType}</span></span>
            </div>
          </div>

          {/* Card 3: RV/CV */}
          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-blue-100 p-1 px-2 shadow-xs transition-all duration-200 hover:shadow-xs">
            <span className="text-orange-600 font-extrabold text-[10px]">RV</span>
            <div className="border-l border-gray-200 h-5.5 mx-0.5"></div>
            <div className="flex flex-col text-[8.5px] text-gray-500 leading-tight">
              <span>OLD: <span className="font-semibold text-gray-700">{formatCurrency(oldVal)}</span></span>
              <span>NEW: <span className="font-semibold text-orange-600">{formatCurrency(newVal)}</span></span>
            </div>
            <div className="border-l border-gray-200 h-5.5 mx-0.5"></div>
            <span className="text-emerald-600 font-extrabold text-[9.5px] flex items-center shrink-0">
              ↑ {formatCurrency(valDiff)}
            </span>
          </div>

          {/* Card 4: Tax */}
          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-blue-100 p-1 px-2 shadow-xs transition-all duration-200 hover:shadow-xs">
            <span className="text-emerald-600 font-extrabold text-[10px]">Tax</span>
            <div className="border-l border-gray-200 h-5.5 mx-0.5"></div>
            <div className="flex flex-col text-[8.5px] text-gray-500 leading-tight">
              <span>OLD: <span className="font-semibold text-gray-700">{formatCurrency(oldTax)}</span></span>
              <span>NEW: <span className="font-semibold text-emerald-600">{formatCurrency(newTax)}</span></span>
            </div>
            <div className="border-l border-gray-200 h-5.5 mx-0.5"></div>
            <span className="text-emerald-600 font-extrabold text-[9.5px] flex items-center shrink-0">
              ↑ {formatCurrency(taxDiff)}
            </span>
          </div>
        </div>
      </div>
      <TaxDetails initialTaxDetails={initialTaxDetails} />
    </div>
  );
}

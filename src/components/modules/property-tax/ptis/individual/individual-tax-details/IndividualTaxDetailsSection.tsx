'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ApartmentTaxDetailsItem } from '@/types/property-tax/apartment';
import type { PtisTaxMode } from '@/types/property-tax/apartment';
import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import { convertApartmentTaxDetailsToTaxDetailsData } from './individual-tax-details.utils';
import TaxDetails from './TaxDetails/TaxDetails';

export interface IndividualTaxDetailsSectionProps {
  taxDetails?: ApartmentTaxDetailsItem | null;
  rateableTaxDetails?: TaxDetailsData | null;
  capitalTaxDetails?: TaxDetailsData | null;
  wardId?: string | number | null;
  propertyNo?: string | null;
  propertyId?: string | number | null;
  taxMode?: PtisTaxMode;
  isLoading?: boolean;
}

export function IndividualTaxDetailsSection({
  taxDetails,
  rateableTaxDetails,
  capitalTaxDetails,
  taxMode = 'rateable',
  isLoading = false,
}: IndividualTaxDetailsSectionProps) {
  const tTax = useTranslations('appartmentQC.taxDetails');
  const tInd = useTranslations('individual');
  const [activeTab, setActiveTab] = useState<'current' | 'pending'>('current');

  const currentTaxType = useMemo(() => {
    if (taxMode === 'capital') return 'CV';
    if (taxMode === 'dual') return 'Dual';
    return 'RV';
  }, [taxMode]);

  const activeTaxDetailsData = useMemo(() => {
    if (currentTaxType === 'CV') {
      return capitalTaxDetails || null;
    }
    return rateableTaxDetails || null;
  }, [currentTaxType, capitalTaxDetails, rateableTaxDetails]);

  const arrearsCount = taxDetails?.arrears?.length || 0;

  const initialTaxDetailsData = useMemo(() => {
    if (activeTaxDetailsData) {
      return activeTaxDetailsData;
    }
    return convertApartmentTaxDetailsToTaxDetailsData(taxDetails);
  }, [activeTaxDetailsData, taxDetails]);

  if (isLoading) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-lg p-6 shadow-2xs animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
        <div className="h-32 bg-slate-100 rounded"></div>
      </div>
    );
  }

  const modeBadgeText =
    currentTaxType === 'CV'
      ? (tInd.has?.('modes.modeCv') ? tInd('modes.modeCv') : 'Mode: Capital Value (CV)')
      : currentTaxType === 'Dual'
        ? (tInd.has?.('modes.modeDual') ? tInd('modes.modeDual') : 'Mode: Dual Method (RV + CVM)')
        : (tInd.has?.('modes.modeRv') ? tInd('modes.modeRv') : 'Mode: Rateable Value (RV)');

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden font-sans select-none relative">
      {/* Top Header bar with Tabs & Valuation Mode Badge */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-zinc-50 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('current')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'current'
                ? 'bg-white text-[#0047cc] shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
                }`}
            >
              {tTax('taxDetailsTab', { type: currentTaxType })}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'pending'
                ? 'bg-white text-[#0047cc] shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
                }`}
            >
              {tTax('arrearsTab')}
              {arrearsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-100 text-[#0047cc] rounded-full font-bold">
                  {arrearsCount}
                </span>
              )}
            </button>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-[#0047cc] border border-blue-200 rounded-md">
            {modeBadgeText}
          </span>
        </div>
      </div>

      {/* Tax Table using TaxDetails Folder Component */}
      <TaxDetails
        initialTaxDetails={initialTaxDetailsData}
        activeTab={activeTab}
      />
    </div>
  );
}

export default IndividualTaxDetailsSection;

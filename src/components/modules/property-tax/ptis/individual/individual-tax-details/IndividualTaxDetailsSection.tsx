'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { ApartmentTaxDetailsItem } from '@/types/property-tax/apartment';
import type { PtisTaxMode } from '@/types/property-tax/apartment';
import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import { getIndividualTaxDetailsAction } from '@/app/[locale]/property-tax/ptis/individual/action';
import { getRateableTaxDetails, getCapitalTaxDetails } from '@/app/[locale]/property-tax/ptis/TaxDetails/action';
import { convertApartmentTaxDetailsToTaxDetailsData } from './individual-tax-details.utils';
import TaxDetails from './TaxDetails/TaxDetails';

export interface IndividualTaxDetailsSectionProps {
  taxDetails?: ApartmentTaxDetailsItem | null;
  wardId?: string | number | null;
  propertyNo?: string | null;
  propertyId?: string | number | null;
  taxMode?: PtisTaxMode;
  isLoading?: boolean;
}

export function IndividualTaxDetailsSection({
  taxDetails,
  wardId,
  propertyNo,
  propertyId,
  taxMode = 'rateable',
  isLoading = false,
}: IndividualTaxDetailsSectionProps) {
  const tTax = useTranslations('appartmentQC.taxDetails');
  const tInd = useTranslations('individual');
  const [activeTab, setActiveTab] = useState<'current' | 'pending'>('current');
  const [fetchedTaxDetailsData, setFetchedTaxDetailsData] = useState<TaxDetailsData | null>(null);
  const [detailsData, setDetailsData] = useState<ApartmentTaxDetailsItem | null>(null);

  const currentTaxType = useMemo(() => {
    if (taxMode === 'capital') return 'CV';
    if (taxMode === 'dual') return 'Dual';
    return 'RV';
  }, [taxMode]);

  // If taxDetails is provided by SSR, initialize with its key so we don't duplicate fetch on mount
  const initialKey = taxDetails
    ? (propertyId ? `PROP_${propertyId}_${currentTaxType}` : `WARD_${wardId}_${propertyNo}_${currentTaxType}`)
    : '';
  const lastFetchedRef = useRef<string>(initialKey);

  useEffect(() => {
    const cleanPropId = propertyId != null ? String(propertyId).trim() : '';
    const cleanWardId = wardId != null ? String(wardId).trim() : '';
    const cleanPropNo = propertyNo != null ? String(propertyNo).trim() : '';

    if (!cleanPropId && (!cleanWardId || !cleanPropNo)) {
      return;
    }

    const fetchKey = cleanPropId
      ? `PROP_${cleanPropId}_${currentTaxType}`
      : `WARD_${cleanWardId}_${cleanPropNo}_${currentTaxType}`;

    if (lastFetchedRef.current === fetchKey) {
      return;
    }
    lastFetchedRef.current = fetchKey;

    let active = true;

    async function loadTaxDetails() {
      try {
        if (cleanPropId) {
          const action = currentTaxType === 'CV' ? getCapitalTaxDetails : getRateableTaxDetails;
          const res = await action(cleanPropId);
          if (active) {
            if (res && res.success && res.data) {
              setFetchedTaxDetailsData(res.data);
              setDetailsData(null);
            } else {
              setFetchedTaxDetailsData(null);
            }
          }
        } else {
          const res = await getIndividualTaxDetailsAction(cleanWardId, cleanPropNo, currentTaxType);
          if (active) {
            if (res && res.success && res.items) {
              setDetailsData(res.items);
              setFetchedTaxDetailsData(null);
            } else {
              setDetailsData(null);
            }
          }
        }
      } catch {
        if (active) {
          setFetchedTaxDetailsData(null);
          setDetailsData(null);
        }
      }
    }

    loadTaxDetails();

    return () => {
      active = false;
    };
  }, [propertyId, wardId, propertyNo, currentTaxType]);

  const activeData = detailsData || taxDetails || null;
  const arrearsCount = activeData?.arrears?.length || 0;

  const initialTaxDetailsData = useMemo(() => {
    if (fetchedTaxDetailsData) {
      return fetchedTaxDetailsData;
    }
    return convertApartmentTaxDetailsToTaxDetailsData(activeData);
  }, [fetchedTaxDetailsData, activeData]);

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

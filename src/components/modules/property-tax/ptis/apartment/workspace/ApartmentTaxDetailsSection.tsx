/* eslint-disable i18next/no-literal-string */
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ApartmentTaxDetailsItem,
  TaxHeadItem,
} from '@/types/property-tax/apartment';
import { PtisTaxMode } from '@/types/property-tax/apartment';
import { getApartmentTaxDetailsAction } from '@/app/[locale]/property-tax/ptis/apartment/action';
import { ApartmentTaxDetailsSkeleton } from '../tables/ApartmentTaxDetailsSkeleton';

export interface ApartmentTaxDetailsSectionProps {
  taxDetails?: ApartmentTaxDetailsItem | null;
  wardId?: string | number | null;
  propertyNo?: string | null;
  taxMode?: PtisTaxMode;
  isLoading?: boolean;
}

const formatVal = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
};

export function ApartmentTaxDetailsSection({
  taxDetails,
  wardId,
  propertyNo,
  taxMode = 'rateable',
  isLoading = false,
}: ApartmentTaxDetailsSectionProps) {
  const [activeTab, setActiveTab] = useState<'taxDetails' | 'arrears'>('taxDetails');
  const [prevTaxDetails, setPrevTaxDetails] = useState<ApartmentTaxDetailsItem | null | undefined>(taxDetails);
  const [detailsData, setDetailsData] = useState<ApartmentTaxDetailsItem | null | undefined>(taxDetails);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const isFirstMountRef = useRef<boolean>(true);

  if (taxDetails !== prevTaxDetails) {
    setPrevTaxDetails(taxDetails);
    setDetailsData(taxDetails);
  }

  const currentTaxType = useMemo(() => {
    if (taxMode === 'capital') return 'CV';
    if (taxMode === 'dual') return 'Dual';
    return 'RV';
  }, [taxMode]);

  useEffect(() => {
    if (isFirstMountRef.current) { isFirstMountRef.current = false; if (taxDetails) return; }
    if (!wardId || !propertyNo) return;
    let active = true;

    async function loadTaxDetails() {
      setIsFetching(true);
      try {
        const res = await getApartmentTaxDetailsAction(wardId!, propertyNo!, currentTaxType);
        if (active && res.success && res.items) setDetailsData(res.items);
      } catch (err) {
        console.error('Error fetching tax details for mode:', currentTaxType, err);
      } finally {
        if (active) setIsFetching(false);
      }
    }

    loadTaxDetails();
    return () => { active = false; };
  }, [wardId, propertyNo, currentTaxType, taxDetails]);

  const currentTaxHeads: TaxHeadItem[] = useMemo(() => {
    if (!detailsData?.currentTaxes || detailsData.currentTaxes.length === 0) return [];
    return detailsData.currentTaxes.flatMap((group) => group.taxHeads || []);
  }, [detailsData]);

  const arrearsHeads: TaxHeadItem[] = useMemo(() => detailsData?.arrears || [], [detailsData]);
  const activeHeads = activeTab === 'taxDetails' ? currentTaxHeads : arrearsHeads;

  const uniqueTaxNames = useMemo(() => {
    const names: string[] = [];
    const seen = new Set<string>();
    activeHeads.forEach((head) => {
      const name = head.taxName?.trim();
      if (name && !seen.has(name)) { seen.add(name); names.push(name); }
    });
    return names;
  }, [activeHeads]);

  const policyCodeRows = useMemo(() => {
    const groupMap = new Map<string, Map<string, number | null | undefined>>();
    const groupOrder: string[] = [];
    activeHeads.forEach((head) => {
      const code = head.policyCode?.trim() || 'NETTAX';
      const name = head.taxName?.trim();
      if (!groupMap.has(code)) { groupMap.set(code, new Map()); groupOrder.push(code); }
      if (name) groupMap.get(code)!.set(name, head.taxAmount);
    });
    return groupOrder.map((code) => ({ policyCode: code, taxAmountsByName: groupMap.get(code)! }));
  }, [activeHeads]);

  if (isLoading) {
    return <ApartmentTaxDetailsSkeleton />;
  }

  return (
    <div className="mx-3 mt-4 bg-white border border-zinc-200 rounded-lg shadow-xs overflow-hidden font-sans select-none relative">
      {isFetching && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded-md shadow-md animate-pulse">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading {currentTaxType} Tax Details...
          </div>
        </div>
      )}

      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-zinc-50 border-b border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('taxDetails')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                activeTab === 'taxDetails' ? 'bg-white text-blue-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Tax Details ({currentTaxType})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('arrears')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                activeTab === 'arrears' ? 'bg-white text-blue-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Arrears
              {arrearsHeads.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded-full font-bold">
                  {arrearsHeads.length}
                </span>
              )}
            </button>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
            Mode: {currentTaxType === 'CV' ? 'Capital Value (CV)' : currentTaxType === 'Dual' ? 'Dual Method (RV + CVM)' : 'Rateable Value (RV)'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs min-w-max">
          <thead>
            <tr className="bg-[#1E3A8A] text-white">
              <th className="p-2 border border-blue-900 font-bold uppercase tracking-wider text-[11px] min-w-[120px]">
                TAXES
              </th>
              {uniqueTaxNames.map((taxName, idx) => (
                <th key={`${taxName}-${idx}`} className="p-2 border border-blue-900 font-bold uppercase tracking-wider text-[11px] text-center">
                  {taxName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {policyCodeRows.length > 0 ? (
              policyCodeRows.map((row) => (
                <tr key={row.policyCode} className="bg-white hover:bg-zinc-50/50 transition-colors">
                  <td className="p-2 border border-zinc-200 font-extrabold text-[11px] text-[#1E3A8A] uppercase">
                    {row.policyCode}
                  </td>
                  {uniqueTaxNames.map((taxName, idx) => (
                    <td key={`${row.policyCode}-${taxName}-${idx}`} className="p-2 border border-zinc-200 text-center font-semibold text-zinc-800">
                      {formatVal(row.taxAmountsByName.get(taxName))}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={uniqueTaxNames.length + 1 || 1} className="p-4 text-center text-zinc-500 italic">
                  No tax details available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

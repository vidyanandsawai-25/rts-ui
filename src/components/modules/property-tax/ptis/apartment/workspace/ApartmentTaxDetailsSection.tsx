/* eslint-disable i18next/no-literal-string */
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('appartmentQC');
  const [activeTab, setActiveTab] = useState<'taxDetails' | 'arrears'>('taxDetails');
  const [detailsData, setDetailsData] = useState<ApartmentTaxDetailsItem | null>(null);
  const lastFetchedRef = useRef<string>('');

  const currentTaxType = useMemo(() => {
    if (taxMode === 'capital') return 'CV';
    if (taxMode === 'dual') return 'Dual';
    return 'RV';
  }, [taxMode]);

  useEffect(() => {
    const cleanWardId = wardId != null ? String(wardId).trim() : '';
    const cleanPropNo = propertyNo != null ? String(propertyNo).trim() : '';

    if (!cleanWardId || !cleanPropNo) {
      return;
    }

    const fetchKey = `${cleanWardId}_${cleanPropNo}_${currentTaxType}`;
    if (lastFetchedRef.current === fetchKey) {
      return; // Already fetched for this selection
    }
    lastFetchedRef.current = fetchKey;

    let active = true;

    async function loadTaxDetails() {
      try {
        const res = await getApartmentTaxDetailsAction(
          cleanWardId,
          cleanPropNo,
          currentTaxType
        );
        if (active) {
          if (res && res.success && res.items) {
            setDetailsData(res.items);
          } else {
            setDetailsData(null);
          }
        }
      } catch (err) {
        console.error('Error fetching tax details for mode:', currentTaxType, err);
        if (active) setDetailsData(null);
      }
    }

    loadTaxDetails();
    return () => { active = false; };
  }, [wardId, propertyNo, currentTaxType]);

  const activeData = useMemo(() => {
    return detailsData || taxDetails || null;
  }, [detailsData, taxDetails]);

  const currentTaxHeads: TaxHeadItem[] = useMemo(() => {
    if (!activeData?.currentTaxes || activeData.currentTaxes.length === 0) return [];
    return activeData.currentTaxes.flatMap((group) => group.taxHeads || []);
  }, [activeData]);

  const arrearsHeads: TaxHeadItem[] = useMemo(() => activeData?.arrears || [], [activeData]);
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

      <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-zinc-50 border-b border-zinc-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('taxDetails')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${activeTab === 'taxDetails' ? 'bg-white text-blue-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
            >
              {t('taxDetails.taxDetailsTab', { type: currentTaxType })}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('arrears')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${activeTab === 'arrears' ? 'bg-white text-blue-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
            >
              {t('taxDetails.arrearsTab')}
            </button>
          </div>
          {/* <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
            Mode: {currentTaxType === 'CV' ? 'Capital Value (CV)' : currentTaxType === 'Dual' ? 'Dual Method (RV + CVM)' : 'Rateable Value (RV)'}
          </span> */}
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

/* eslint-disable i18next/no-literal-string */
'use client';

import React, { useState } from 'react';
import { AssessmentUnit } from '@/types/property-tax/apartment';
import type { PropertyRuleLogItem } from '@/types/rule-engine';
import { cn } from '@/lib/utils/cn';
import { TaxRulesModalHeader } from '../tax-rules/TaxRulesModalHeader';
import { TaxRulesKpiCards } from '../tax-rules/TaxRulesKpiCards';
import { TaxRulesTable } from '../tax-rules/TaxRulesTable';
import { TaxRulesRetroTable } from '../tax-rules/TaxRulesRetroTable';
import { TaxDiscountsTable } from '../tax-rules/TaxDiscountsTable';
import { useTaxRulesModalData } from '@/hooks/property-tax/apartment';

interface TaxRulesDiscountsModalProps {
  open: boolean;
  onClose: () => void;
  unit: AssessmentUnit | null;
  appliedRules?: PropertyRuleLogItem[];
  apartmentName?: string;
  wingName?: string;
  onViewDocument?: (guid: string, title?: string) => void;
}

export const TaxRulesDiscountsModal: React.FC<TaxRulesDiscountsModalProps> = ({
  open,
  onClose,
  unit,
  appliedRules = [],
  apartmentName,
  wingName,
  onViewDocument,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'discounts' | 'retro'>('rules');

  const {
    baseValue,
    taxationRules,
    totalSurcharge,
    totalReduction,
    cumulativeFinalTax,
    netImpact,
    retroTaxRows,
    retroTotalInterest,
    retroGrandTotal,
    discounts,
    loadingDiscounts,
    loadingTaxData,
    appliedDiscountsCount,
    discountPercentageBenefit,
    discountFixedBenefit,
    discountTotalBenefit,
    discountFinalTax,
  } = useTaxRulesModalData({ open, unit, appliedRules });

  const resolvedApartment = apartmentName || unit?.owner || 'Property Details';
  const resolvedWing = unit?.wgFl || wingName || unit?.rawSurvey?.wing || '-';
  const resolvedUnitNo = unit?.prop || unit?.rawSurvey?.flatOrShopNo || '-';
  const resolvedUse = unit?.use || unit?.rawSurvey?.typeOfUse || '-';
  const resolvedOwner = unit?.owner || unit?.rawSurvey?.ownerName || '-';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose}>
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 font-sans animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <TaxRulesModalHeader onClose={onClose} apartmentName={resolvedApartment} wingName={resolvedWing} unitNo={resolvedUnitNo} use={resolvedUse} owner={resolvedOwner} baseValue={baseValue} />

        {/* Tab Navigation Matching Screenshots 1, 2, 3 Exactly */}
        <div className="px-6 pt-4 pb-2.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 select-none',
                activeTab === 'rules'
                  ? 'bg-white border-2 border-red-500 text-red-600 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              )}
            >
              <span>TAXATION RULES APPLIED</span>
              <span className={cn('px-1.5 py-0.2 rounded text-[10px] font-mono font-bold', activeTab === 'rules' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-white text-slate-600 border border-slate-200')}>
                {taxationRules.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('discounts')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 select-none',
                activeTab === 'discounts'
                  ? 'bg-white border-2 border-emerald-500 text-emerald-600 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              )}
            >
              <span>DISCOUNTS APPLIED</span>
              <span className={cn('px-1.5 py-0.2 rounded text-[10px] font-mono font-bold', activeTab === 'discounts' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white text-slate-600 border border-slate-200')}>
                {appliedDiscountsCount}/{discounts.length || 8}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('retro')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 select-none',
                activeTab === 'retro'
                  ? 'bg-white border-2 border-amber-500 text-amber-700 shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              )}
            >
              <span>RETROSPECTIVE TAX CALC</span>
              <span className={cn('px-1.5 py-0.2 rounded text-[10px] font-mono font-bold', activeTab === 'retro' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-white text-slate-600 border border-slate-200')}>
                {loadingTaxData ? '...' : `${retroTaxRows.length} YRS`}
              </span>
            </button>
          </div>

          <span className="text-slate-400 text-xs font-semibold">Unit-level view</span>
        </div>

        {/* Tab-Specific KPI Metric Summary Cards */}
        <TaxRulesKpiCards
          activeTab={activeTab}
          baseValue={baseValue}
          totalSurcharge={totalSurcharge}
          totalReduction={totalReduction}
          cumulativeFinalTax={cumulativeFinalTax}
          netImpact={netImpact}
          discountPercentageBenefit={discountPercentageBenefit}
          discountFixedBenefit={discountFixedBenefit}
          discountTotalBenefit={discountTotalBenefit}
          discountFinalTax={discountFinalTax}
          retroYearsCount={retroTaxRows.length}
          retroTotalInterest={retroTotalInterest}
          retroGrandTotal={retroGrandTotal}
        />

        {/* Table Content Area */}
        <div className="px-6 py-4 overflow-y-auto flex-1 bg-white">
          {activeTab === 'rules' && <TaxRulesTable rules={taxationRules} />}
          {activeTab === 'discounts' && (
            <TaxDiscountsTable
              discounts={discounts}
              loading={loadingDiscounts}
              baseTax={baseValue}
              useGroup={resolvedUse}
              onViewDocument={onViewDocument}
            />
          )}
          {activeTab === 'retro' && <TaxRulesRetroTable rows={retroTaxRows} loading={loadingTaxData} />}
        </div>

        {/* Modal Footer Exactly Matching Screenshots */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 italic font-normal">
            * Unit-specific view: Apartment + Wing + Unit level rules and discounts. Discounts require prior approval with valid supporting documents.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#181836] hover:bg-[#25224e] text-white font-extrabold text-xs transition-all shadow-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

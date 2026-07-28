'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import TaxDetails from '../TaxDetails/TaxDetails';

interface TaxDetailsContainerProps {
  title?: string;
  initialTaxDetails?: TaxDetailsData;
  metricsCards: React.ReactNode;
}

export function TaxDetailsContainer({
  initialTaxDetails,
  metricsCards,
}: TaxDetailsContainerProps) {
  const t = useTranslations('ptisMainTaxDetails');
  const [activeTab, setActiveTab] = useState<'current' | 'pending'>('current');

  // Count total pending tax entries across all policies
  const pendingCount = useMemo(() => {
    const policies = initialTaxDetails?.policies || [];
    let count = 0;
    policies.forEach((p) => {
      if (p.pendingYears) {
        count += p.pendingYears.length;
      }
    });
    return count;
  }, [initialTaxDetails]);

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-md">
      {/* 1. Header Bar: Tabs on Left (replacing title), Metric Cards on Right */}
      <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 px-3 pt-2 pb-0 flex flex-wrap items-center justify-between gap-3 border-b border-blue-200/80">
        <div className="flex items-center gap-1.5 -mb-px">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide rounded-t-lg border-t-2 border-x transition-all ${
              activeTab === 'current'
                ? 'bg-[#1e3a8a] text-white border-t-blue-500 border-x-blue-900 shadow-xs'
                : 'bg-slate-200/80 text-slate-700 border-transparent hover:bg-slate-300 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('taxDetails')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-semibold tracking-wide rounded-t-lg border-t-2 border-x transition-all ${
              activeTab === 'pending'
                ? 'bg-[#1e3a8a] text-white border-t-blue-500 border-x-blue-900 shadow-xs'
                : 'bg-slate-200/80 text-slate-700 border-transparent hover:bg-slate-300 hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('arrearsTaxes')}
            {pendingCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-300 text-slate-800'
                }`}
              >
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Summary Metrics Cards */}
        <div className="flex items-center gap-2.5 pb-2">
          {metricsCards}
        </div>
      </div>

      {/* 2. Tax Details Table */}
      <TaxDetails initialTaxDetails={initialTaxDetails} activeTab={activeTab} />
    </div>
  );
}

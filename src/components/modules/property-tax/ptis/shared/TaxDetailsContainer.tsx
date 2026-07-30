'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock } from 'lucide-react';
import type { TaxDetailsData } from '@/types/ptisMain-taxdetails.types';
import { Tabs, TabList, Tab, Badge, Tooltip } from '@/components/common';
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
      <Tabs
        value={activeTab}
        onChange={(val) => setActiveTab(val as 'current' | 'pending')}
        variant="line"
      >
        {/* 1. Header Bar: Tabs on Left (replacing title), Metric Cards on Right */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 px-2.5 pt-1.5 pb-0 flex flex-wrap items-end justify-between gap-2 border-b border-blue-200/80">
          <TabList className="border-b-0 p-0 bg-transparent flex items-end gap-2.5 -mb-px" scrollable={false}>
            <Tooltip content="Current Taxes" placement="top">
              <Tab
                value="current"
                icon={CheckCircle2}
                className={`inline-flex flex-row items-center justify-center gap-2.5 px-7 py-2.5 min-w-[170px] sm:min-w-[190px] text-[13.5px] font-semibold tracking-wide rounded-t-lg border-b-0 whitespace-nowrap transition-all ${
                  activeTab === 'current'
                    ? 'bg-[#1e3a8a] text-white border-t-2 border-t-blue-500 border-x border-x-[#1e3a8a] shadow-xs'
                    : 'bg-slate-200/90 text-slate-700 border-t-2 border-t-transparent border-x border-x-transparent hover:bg-slate-300/80 hover:text-slate-900'
                }`}
              >
                {t('taxDetails')}
              </Tab>
            </Tooltip>

            <Tooltip content="Previous Taxes" placement="top">
              <Tab
                value="pending"
                icon={Clock}
                className={`inline-flex flex-row items-center justify-center gap-2.5 px-7 py-2.5 min-w-[170px] sm:min-w-[190px] text-[13.5px] font-semibold tracking-wide rounded-t-lg border-b-0 whitespace-nowrap transition-all ${
                  activeTab === 'pending'
                    ? 'bg-[#1e3a8a] text-white border-t-2 border-t-blue-500 border-x border-x-[#1e3a8a] shadow-xs'
                    : 'bg-slate-200/90 text-slate-700 border-t-2 border-t-transparent border-x border-x-transparent hover:bg-slate-300/80 hover:text-slate-900'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span>{t('arrearsTaxes')}</span>
                  {pendingCount > 0 && (
                    <Badge
                      size="sm"
                      className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border-transparent transition-colors shrink-0 ${
                        activeTab === 'pending'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-300 text-slate-800'
                      }`}
                    >
                      {pendingCount}
                    </Badge>
                  )}
                </span>
              </Tab>
            </Tooltip>
          </TabList>

          {/* Summary Metrics Cards */}
          <div className="flex items-center gap-2 pb-1 pt-0.5">
            {metricsCards}
          </div>
        </div>

        {/* 2. Tax Details Table */}
        <TaxDetails initialTaxDetails={initialTaxDetails} activeTab={activeTab} />
      </Tabs>
    </div>
  );
}

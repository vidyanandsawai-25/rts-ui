'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tabs } from '@/components/common/Tabs';
const { TabList, Tab } = Tabs;

import { DualMethodSection } from '@/components/modules/property-tax/ptis/dualmethod';
import AppartmentQCSection from '@/components/modules/property-tax/ptis/appartmentQC/AppartmentQCSection';
import { PtisSearchParams } from '@/lib/utils/params';
import type { DualMethodSectionData } from '@/components/modules/property-tax/ptis/dualmethod/dual-method-data';
import type { ApartmentQCDetail, PagedResponse } from '@/types/apartmentQC.types';

interface PtisMainScreenProps {
  locale: string;
  propertyId?: number;
  ptisParams: PtisSearchParams;
  resolvedSearchParams: Record<string, string | string[] | undefined>;
  error?: string;
  initialApartmentData?: {
    amenities: PagedResponse<ApartmentQCDetail>;
    commercial: PagedResponse<ApartmentQCDetail>;
    residential: PagedResponse<ApartmentQCDetail>;
  };
  initialDualSectionData?: DualMethodSectionData;
  wardId?: number | string;
  propertyNo?: string;
  rateableSection?: React.ReactNode;
  capitalSection?: React.ReactNode;
  dualRateableSection?: React.ReactNode;
  dualCapitalSection?: React.ReactNode;
}

const PtisMainScreen: React.FC<PtisMainScreenProps> = (props) => {
  const {
    locale,
    initialDualSectionData,
    initialApartmentData,
    wardId,
    propertyNo,
    ptisParams,
    propertyId,
    resolvedSearchParams,
    rateableSection,
    capitalSection,
    dualRateableSection,
    dualCapitalSection
  } = props;

  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('ptis');

  const activeTab = ptisParams.tab || 'rateable';

  const handleTabChange = (value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('valuationTab', value.toString());
    router.push(`?${params.toString()}`);
  };

  const tabs = [
    { value: 'rateable', label: t('tabs.rateable'), activeGradient: 'from-indigo-600 to-purple-600' },
    { value: 'capital', label: t('tabs.capital'), activeGradient: 'from-purple-600 to-pink-600' },
    { value: 'dual', label: t('tabs.dual'), activeGradient: 'from-orange-600 to-red-600' },
    { value: 'apartment', label: t('tabs.apartment'), activeGradient: 'from-blue-600 to-blue-800'}
  ];

  return (
    <div className="bg-[#f1f5f9]">
      <div className="w-full px-1 py-0 sm:px-2">
        <main className="w-full mx-auto">
          {/* Premium Style Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-indigo-50 overflow-hidden">
            <div className="bg-slate-50 border-b border-indigo-50 p-1.5">
              <Tabs value={activeTab} onChange={handleTabChange} variant="pills" size="md">
                <TabList
                  scrollable={true}
                  className="bg-white border border-indigo-100 p-1 rounded-full flex flex-wrap gap-2 shadow-inner inline-flex"
                >
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.value}
                      value={tab.value}
                      className={cn(
                        'transition-all cursor-pointer duration-300 px-4 py-1 rounded-full text-xs font-bold min-w-[100px] text-center',
                        activeTab === tab.value
                          ? `bg-gradient-to-r ${tab.activeGradient} text-white shadow-sm`
                          : 'text-indigo-600 hover:bg-white hover:text-indigo-800'
                      )}
                    >
                      {tab.label}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
            </div>

            {/* Content Area */}
            <div className="bg-white min-h-[200px]">
              {activeTab === 'capital' ? (
                <div className="p-0.5 sm:p-1">
                  {capitalSection}
                </div>
              ) : activeTab === 'rateable' ? (
                <div className="p-0.5 sm:p-1">
                  {rateableSection}
                </div>
              ) : activeTab === 'apartment' ? (
                <div className="p-0.5 sm:p-1">
                  <AppartmentQCSection
                    initialData={initialApartmentData}
                    wardId={wardId?.toString() || ''}
                    propertyNo={propertyNo || ''}
                  />
                </div>
              ) : activeTab === 'dual' ? (
                <div className="p-0.5 sm:p-1">
                  <DualMethodSection
                    propertyId={propertyId}
                    searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
                    locale={locale}
                    initialData={initialDualSectionData}
                    rateableSection={dualRateableSection}
                    capitalSection={dualCapitalSection}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-400">
                  <div className="p-1 rounded-full bg-slate-50 border border-slate-100 mb-4 text-4xl opacity-20">
                    📊
                  </div>
                  <p className="font-medium text-lg">
                    {t('noDataAvailable')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PtisMainScreen;

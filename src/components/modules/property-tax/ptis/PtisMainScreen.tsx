'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tabs } from '@/components/common/Tabs';
import { Building, Home, Building2, Calculator, GitMerge, IndianRupee, Scale } from 'lucide-react';
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
  const activeMainTab = searchParams.get('appartmentTab') || 'amenities';
  const activeSubTab = searchParams.get('subTab') || 'rateable';

  const handleTabChange = (value: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('valuationTab', value.toString());
    router.push(`?${params.toString()}`);
  };

  const handleApartmentMainTabChange = (v: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('valuationTab', 'apartment');
    params.set('appartmentTab', v.toString());
    params.set('subTab', 'rateable');
    params.set('pageNumber', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleApartmentSubTabChange = (v: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('valuationTab', 'apartment');
    params.set('appartmentTab', activeMainTab);
    params.set('subTab', v.toString());
    params.set('pageNumber', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const tabs = [
    { value: 'rateable', label: t('tabs.rateable'), icon: Scale },
    { value: 'capital', label: t('tabs.capital'), icon: IndianRupee },
    { value: 'dual', label: t('tabs.dual'), icon: GitMerge },
    { value: 'apartment', label: t('tabs.apartment'), icon: Building2 },
  ];

  return (
    <div className="bg-[#f1f5f9]">
      <div className="w-full px-1 py-0 sm:px-2">
        <main className="w-full mx-auto">
          {/* Premium Style Tabs */}
          <div className="bg-white rounded-xl shadow-lg border border-indigo-50 overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onChange={handleTabChange} variant="pills" size="md">
                  <TabList
                    scrollable={false}
                    className="flex gap-2"
                  >
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <Tab
                          key={tab.value}
                          value={tab.value}
                          className={cn(
                            'transition-all cursor-pointer duration-300 px-3 py-2 text-sm font-semibold',
                            activeTab === tab.value
                              ? 'text-blue-600 border-blue-600'
                              : 'text-gray-600 hover:text-gray-900'
                          )}
                        >
                          <span className="inline-flex items-center">
                            {activeTab === tab.value && Icon && <Icon className="w-4 h-4 mr-2" />}
                            {tab.label}
                          </span>
                        </Tab>
                      );
                    })}
                  </TabList>
                </Tabs>

                {activeTab === 'apartment' && (
                  <div className="flex items-center gap-3">
                    <Tabs value={activeMainTab} onChange={handleApartmentMainTabChange} variant="pills" size="sm" activeTabClassName="bg-blue-700 text-white shadow-sm rounded-lg border-none">
                      <TabList className="bg-gray-100 p-1 rounded-lg inline-flex gap-1">
                        <Tab value="amenities" icon={Building2}>{t('apartmentTabs.amenities')}</Tab>
                        <Tab value="commercial" icon={Building}>{t('apartmentTabs.commercial')}</Tab>
                        <Tab value="residential" icon={Home}>{t('apartmentTabs.residential')}</Tab>
                      </TabList>
                    </Tabs>
                    <Tabs value={activeSubTab} onChange={handleApartmentSubTabChange} variant="pills" size="sm" activeTabClassName="bg-green-700 text-white shadow-sm rounded-lg border-none">  
                      <TabList className="bg-gray-100 p-1 rounded-lg inline-flex gap-1">
                        <Tab value="rateable" icon={Calculator}>{t('apartmentTabs.rateable')}</Tab>
                        <Tab value="capital" icon={IndianRupee}>{t('apartmentTabs.capital')}</Tab>
                        <Tab value="dual-method" icon={GitMerge}>{t('apartmentTabs.dual')}</Tab>
                      </TabList>
                    </Tabs>
                  </div>
                )}
              </div>
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

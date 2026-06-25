'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tabs } from '@/components/common/Tabs';
import { Building, Home, Building2, Calculator, GitMerge, IndianRupee } from 'lucide-react';
const { TabList, Tab } = Tabs;

import { DualMethodSection } from '@/components/modules/property-tax/ptis/dualmethod';
import AppartmentQCSection from '@/components/modules/property-tax/ptis/appartmentQC/AppartmentQCSection';
import { Button } from '@/components/common';
import { AppliedRulesDrawer } from './AppliedRulesDrawer';
import type { PtisMainScreenProps } from '@/types/ptis-screen/ptis-screen.types';
import { fetchPropertyRuleLogsAction } from '@/app/[locale]/property-tax/ptis/actions';

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

  const [isAppliedRulesDrawerOpen, setIsAppliedRulesDrawerOpen] = useState(false);
  const [hasAppliedRules, setHasAppliedRules] = useState(false);

  React.useEffect(() => {
    if (propertyId) {
      fetchPropertyRuleLogsAction(propertyId)
        .then((result) => {
          if (result.success && result.data && result.data.items && result.data.items.length > 0) {
            setHasAppliedRules(true);
          } else {
            setHasAppliedRules(false);
          }
        })
        .catch(() => {
          setHasAppliedRules(false);
        });
    } else {
      setHasAppliedRules(false);
    }
  }, [propertyId]);

  const activeTab = ptisParams.tab || 'rateable';
  const activeMainTab = searchParams.get('appartmentTab') || 'amenities';
  const activeSubTab = searchParams.get('subTab') || 'rateable';

  const updateParams = (updates: Record<string, string>, replace = false) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => params.set(key, val));
    const url = `?${params.toString()}`;
    if (replace) router.replace(url, { scroll: false });
    else router.push(url);
  };

  const handleTabChange = (value: string | number) => updateParams({ valuationTab: value.toString() });

  const handleApartmentMainTabChange = (v: string | number) =>
    updateParams({ valuationTab: 'apartment', appartmentTab: v.toString(), subTab: 'rateable', pageNumber: '1' }, true);

  const handleApartmentSubTabChange = (v: string | number) =>
    updateParams({ valuationTab: 'apartment', appartmentTab: activeMainTab, subTab: v.toString(), pageNumber: '1' }, true);

  const tabs = [
    { value: 'rateable', label: t('tabs.rateable'), activeGradient: 'from-indigo-600 to-purple-600' },
    { value: 'capital', label: t('tabs.capital'), activeGradient: 'from-purple-600 to-pink-600' },
    { value: 'dual', label: t('tabs.dual'), activeGradient: 'from-orange-600 to-red-600' },
    { value: 'apartment', label: t('tabs.apartment'), activeGradient: 'from-blue-600 to-blue-800' }
  ];

  return (
    <div className="bg-[#f1f5f9]">
      <div className="w-full px-1 py-0 sm:px-2">
        <main className="w-full mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-indigo-50 overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between">
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

                {activeTab !== 'apartment' && propertyId && hasAppliedRules && (
                  <Button
                    id="applied-rules-tab-btn"
                    variant="secondary"
                    size="sm"
                    icon={GitMerge}
                    onClick={() => setIsAppliedRulesDrawerOpen(true)}
                    className="bg-gradient-to-r from-indigo-50 via-white to-blue-50 border border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 hover:text-indigo-900 transition-all duration-300 font-bold shadow-sm rounded-lg"
                  >
                    {t('appliedRules.buttonLabel')}
                  </Button>
                )}

                {activeTab === 'apartment' && (
                  <div className="flex items-center gap-3 flex-wrap">
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
                    {propertyId && hasAppliedRules && (
                      <Button
                        id="applied-rules-apartment-btn"
                        variant="secondary"
                        size="sm"
                        icon={GitMerge}
                        onClick={() => setIsAppliedRulesDrawerOpen(true)}
                        className="bg-gradient-to-r from-indigo-50 via-white to-blue-50 border border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 hover:text-indigo-900 transition-all duration-300 font-bold shadow-sm rounded-lg"
                      >
                        {t('appliedRules.buttonLabel')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white min-h-[200px] p-0.5 sm:p-1">
              {activeTab === 'capital' && capitalSection}
              {activeTab === 'rateable' && rateableSection}
              {activeTab === 'apartment' && (
                <AppartmentQCSection
                  initialData={initialApartmentData}
                  wardId={wardId?.toString() || ''}
                  propertyNo={propertyNo || ''}
                />
              )}
              {activeTab === 'dual' && (
                <DualMethodSection
                  propertyId={propertyId}
                  searchParams={resolvedSearchParams as Record<string, string | string[] | undefined>}
                  locale={locale}
                  initialData={initialDualSectionData}
                  rateableSection={dualRateableSection}
                  capitalSection={dualCapitalSection}
                />
              )}
              {!['rateable', 'capital', 'apartment', 'dual'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-400 p-4">
                  <div className="p-1 rounded-full bg-slate-50 border border-slate-100 mb-4 text-4xl opacity-20">📊</div>
                  <p className="font-medium text-lg">{t('noDataAvailable')}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <AppliedRulesDrawer
        open={isAppliedRulesDrawerOpen}
        onClose={() => setIsAppliedRulesDrawerOpen(false)}
        propertyId={propertyId}
        propertyNo={propertyNo}
        locale={locale}
      />
    </div>
  );
};

export default PtisMainScreen;

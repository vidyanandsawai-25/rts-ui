'use client';

import { useState, useMemo, useCallback, useEffect, useTransition, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tabs } from '@/components/common';
import { Building, Home, Building2, Calculator, GitMerge, IndianRupee } from 'lucide-react';
import CommonPropertyTable from './CommonPropertyTable';
import { ApartmentQCDetail, PagedResponse } from '@/types/apartmentQC.types';
import { LoadingPage } from '@/components/common/LoadingPage';
import { getApartmentQCColumns } from './apartmentQC.columns';
import { emptyPagedResponse, transformApartmentData, getTabTitle } from './apartmentQC.utils';

interface AppartmentQCSectionProps {
  initialData?: {
    amenities: PagedResponse<ApartmentQCDetail>;
    commercial: PagedResponse<ApartmentQCDetail>;
    residential: PagedResponse<ApartmentQCDetail>;
  };
  wardId?: string;
  propertyNo?: string;
}

const AppartmentQCSection = ({
  initialData = {
    amenities: emptyPagedResponse,
    commercial: emptyPagedResponse,
    residential: emptyPagedResponse
  },
}: AppartmentQCSectionProps) => {
  const router = useRouter();
  const t = useTranslations("ptis");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeMainTab = searchParams.get('appartmentTab') || 'amenities';
  const activeSubTab = searchParams.get('subTab') || 'rateable';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('searchTerm') || '');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const isUpdatingFromUrl = useRef(false);

  useEffect(() => {
    const urlSearchTerm = searchParams.get('searchTerm') || '';
    if (urlSearchTerm !== searchQuery && !isUpdatingFromUrl.current) {
      queueMicrotask(() => setSearchQuery(urlSearchTerm));
    }
  }, [searchParams, searchQuery]);

  const tabs = useMemo(() => [
    { value: 'amenities', label: t("apartmentTabs.amenities"), icon: Building2, content: null },
    { value: 'commercial', label: t("apartmentTabs.commercial"), icon: Building, content: null },
    { value: 'residential', label: t("apartmentTabs.residential"), icon: Home, content: null },
  ], [t]);

  const subTabs = useMemo(() => [
    { value: 'rateable', label: t("apartmentTabs.rateable"), icon: Calculator, content: null },
    { value: 'capital', label: t("apartmentTabs.capital"), icon: IndianRupee, content: null },
    { value: 'dual-method', label: t("apartmentTabs.dual"), icon: GitMerge, content: null },
  ], [t]);

  const updateUrl = useCallback((params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '') newParams.delete(key);
      else newParams.set(key, String(value));
    });
    startTransition(() => router.replace(`${pathname}?${newParams.toString()}`, { scroll: false }));
  }, [searchParams, pathname, router]);

  const activePagedData = useMemo(() => {
    if (!initialData) return emptyPagedResponse;
    if (activeMainTab === 'commercial') return initialData.commercial || emptyPagedResponse;
    if (activeMainTab === 'residential') return initialData.residential || emptyPagedResponse;
    return initialData.amenities || emptyPagedResponse;
  }, [activeMainTab, initialData]);

  const tAqc = useTranslations("appartmentQC");
  const columns = useMemo(() => getApartmentQCColumns(activeMainTab, activeSubTab, tAqc), [activeMainTab, activeSubTab, tAqc]);
  const convertedData = useMemo(() => transformApartmentData(activePagedData.items || [], activeMainTab), [activePagedData, activeMainTab]);

  const handleMainTabChange = (v: string | number) => updateUrl({ tab: 'apartment', appartmentTab: v.toString(), subTab: 'rateable', pageNumber: 1 });
  const handleSubTabChange = (v: string | number) => updateUrl({ tab: 'apartment', appartmentTab: activeMainTab, subTab: v.toString(), pageNumber: 1 });

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="flex flex-row gap-4 p-4 border-b border-gray-100 bg-gray-50/50">
        <Tabs
          className="flex flex-row w-fit p-1 bg-white border border-gray-200 shadow-sm rounded-xl"
          value={activeMainTab}
          variant="pills"
          items={tabs}
          onChange={handleMainTabChange}
          size="sm"
          activeTabClassName="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md border-none"
        />
        <Tabs
          className="flex flex-row p-1 bg-white border border-gray-200 shadow-sm rounded-xl"
          value={activeSubTab}
          variant="pills"
          items={subTabs}
          onChange={handleSubTabChange}
          size="sm"
          activeTabClassName="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md border-none"
        />
      </div>

      <div className="flex-1 overflow-auto text-gray-900 bg-gray-50/30 p-2 relative min-h-[400px]">
        {isPending && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <LoadingPage translationNamespace="ptis.loading" />
          </div>
        )}
        <div className="space-y-6">
          <CommonPropertyTable
            columns={columns} data={convertedData} title={getTabTitle(activeMainTab, tAqc)} activeTab={activeSubTab}
            searchQuery={searchQuery} onSearchChange={(q) => { isUpdatingFromUrl.current = true; setSearchQuery(q); updateUrl({ searchTerm: q, pageNumber: 1 }); setTimeout(() => { isUpdatingFromUrl.current = false; }, 0); }}
            onRowClick={(row) => router.push(`/property-tax/ptis/appartmentQC/${activeMainTab}/edit/${row.propertyNo || row.propertyId}`)}
            loading={isPending} isAutoScrolling={isAutoScrolling} onToggleAutoScroll={() => setIsAutoScrolling(!isAutoScrolling)}
            pageNumber={activePagedData.pageNumber} pageSize={activePagedData.pageSize} totalCount={activePagedData.totalCount} totalPages={activePagedData.totalPages}
            onPageChange={(p) => updateUrl({ pageNumber: p })} onPageSizeChange={(s) => updateUrl({ pageSize: s, pageNumber: 1 })}
            applyTypeColors={activeMainTab === 'commercial' || activeMainTab === 'residential'}
          />
        </div>
      </div>
    </div>
  );
};

export default AppartmentQCSection;

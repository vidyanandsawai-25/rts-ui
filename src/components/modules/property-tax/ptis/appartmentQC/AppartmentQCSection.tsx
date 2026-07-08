'use client';
import { useState, useMemo, useCallback, useEffect, useTransition, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import CommonPropertyTable from './CommonPropertyTable';
import ApartmentTaxDetailsTable from './ApartmentTaxDetailsTable';
import { ApartmentQCDetail, PagedResponse } from '@/types/apartmentQC.types';
import { LoadingPage } from '@/components/common/LoadingPage';
import { getApartmentQCColumns } from './apartmentQC.columns';
import { emptyPagedResponse, transformApartmentData, getTabTitle } from './apartmentQC.utils';
import { useAppartmentQCSectionData } from '@/hooks/apartmentQc/useAppartmentQCSectionData';
import { useColumnFilters } from '@/hooks/apartmentQc/useColumnFilters';

interface AppartmentQCSectionProps {
  initialData?: {
    amenities: PagedResponse<ApartmentQCDetail>;
    commercial: PagedResponse<ApartmentQCDetail>;
    residential: PagedResponse<ApartmentQCDetail>;
  };
  wardId?: string;
  propertyNo?: string;
  partitionNo?: string;
}



const AppartmentQCSection = ({
  initialData = {
    amenities: emptyPagedResponse,
    commercial: emptyPagedResponse,
    residential: emptyPagedResponse
  },
  wardId = "",
  propertyNo = "",
  partitionNo,
}: AppartmentQCSectionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const activeMainTab = searchParams.get('appartmentTab') || 'amenities';
  const activeSubTab = searchParams.get('subTab') || 'rateable';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = searchParams.get('sortOrder') || '';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('searchTerm') || '');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const isUpdatingFromUrl = useRef(false);

  // Column filters
  const { activeFilters, handleFilterChange, fetchFilterOptions, isFilterPending } = useColumnFilters({
    wardId,
    propertyNo,
    activeMainTab,
  });

  const {
    taxDetails,
    dualMethodDetails,
    taxDetailsLoading
  } = useAppartmentQCSectionData({
    wardId,
    propertyNo,
    partitionNo,
    activeMainTab,
    activeSubTab,
    drawerOpen: searchParams.get('drawer') === 'edit',
    selectedPropertyId: searchParams.get('editPropertyId')
  });

  useEffect(() => {
    const urlSearchTerm = searchParams.get('searchTerm') || '';
    if (urlSearchTerm !== searchQuery && !isUpdatingFromUrl.current) {
      queueMicrotask(() => setSearchQuery(urlSearchTerm));
    }
  }, [searchParams, searchQuery]);

  const updateUrl = useCallback((params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '') newParams.delete(key);
      else newParams.set(key, String(value));
    });
    startTransition(() => router.replace(`${pathname}?${newParams.toString()}`, { scroll: false }));
  }, [searchParams, pathname, router]);

  const handleSort = useCallback((columnKey: string) => {
    const currentSortBy = searchParams.get('sortBy') || '';
    const currentSortOrder = searchParams.get('sortOrder') || '';

    let nextSortBy: string | null = columnKey;
    let nextSortOrder: string | null = 'asc';

    if (currentSortBy === columnKey) {
      if (currentSortOrder === 'asc') {
        nextSortOrder = 'desc';
      } else if (currentSortOrder === 'desc') {
        nextSortBy = null;
        nextSortOrder = null;
      }
    }

    updateUrl({ sortBy: nextSortBy, sortOrder: nextSortOrder, pageNumber: 1 });
  }, [searchParams, updateUrl]);

  const activePagedData = useMemo(() => {
    if (!initialData) return emptyPagedResponse;
    if (activeMainTab === 'commercial') return initialData.commercial || emptyPagedResponse;
    if (activeMainTab === 'residential') return initialData.residential || emptyPagedResponse;
    return initialData.amenities || emptyPagedResponse;
  }, [activeMainTab, initialData]);

  const tAqc = useTranslations("appartmentQC");
  const columns = useMemo(() => getApartmentQCColumns(activeMainTab, activeSubTab, tAqc, activePagedData.pageNumber, activePagedData.pageSize), [activeMainTab, activeSubTab, tAqc, activePagedData.pageNumber, activePagedData.pageSize]);
  const convertedData = useMemo(() => transformApartmentData(activePagedData.items || [], activeMainTab), [activePagedData, activeMainTab]);

  const handleRowClick = useCallback((row: Record<string, unknown>) => {
    const basePath = pathname.endsWith('/appartmentQC') ? pathname : pathname + '/appartmentQC';
    const params = new URLSearchParams(searchParams.toString());
    
    const propertyIdVal = String(row.id || row.propertyDetailsId || row.propertyId || '');
    if (propertyIdVal) params.set('editPropertyId', propertyIdVal);
    
    params.delete('parentPropertyId');
    params.delete('parentPropertyNo');
    
    params.set('returnTab', 'propertydetails');
    params.set('valuationTab', 'apartment');
    params.set('appartmentTab', activeMainTab);
    params.set('subTab', activeSubTab);

    router.push(`${basePath}/appartmentQCDrawer/Property?${params.toString()}`);
  }, [pathname, router, searchParams, activeMainTab, activeSubTab]);



  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="flex-1 overflow-auto text-gray-900 bg-gray-50/30 p-2 relative min-h-[200px]">
        {(isPending || isFilterPending) && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <LoadingPage translationNamespace="ptis.loading" />
          </div>
        )}
        <div className="space-y-6">
          <CommonPropertyTable
            columns={columns} data={convertedData} title={getTabTitle(activeMainTab, tAqc)} activeTab={activeSubTab}
            searchQuery={searchQuery} onSearchChange={(q) => { isUpdatingFromUrl.current = true; setSearchQuery(q); updateUrl({ searchTerm: q, pageNumber: 1 }); setTimeout(() => { isUpdatingFromUrl.current = false; }, 0); }}
            onRowClick={handleRowClick}
            loading={isPending || isFilterPending} isAutoScrolling={isAutoScrolling} onToggleAutoScroll={() => setIsAutoScrolling(!isAutoScrolling)}
            pageNumber={activePagedData.pageNumber} pageSize={activePagedData.pageSize} totalCount={activePagedData.totalCount} totalPages={activePagedData.totalPages}
            onPageChange={(p) => updateUrl({ pageNumber: p })} onPageSizeChange={(s) => updateUrl({ pageSize: s, pageNumber: 1 })}
            _applyTypeColors={activeMainTab === 'commercial' || activeMainTab === 'residential'}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onFetchFilterOptions={fetchFilterOptions}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            wardId={wardId}
            propertyNo={propertyNo}
          />

          {/* Tax Details Table - shown for all sub-tabs */}
          <ApartmentTaxDetailsTable
            taxDetails={taxDetails}
            dualMethodDetails={dualMethodDetails}
            loading={taxDetailsLoading}
            activeMainTab={activeMainTab}
            activeSubTab={activeSubTab}
          />
        </div>
      </div>
    </div>
  );
};

export default AppartmentQCSection;

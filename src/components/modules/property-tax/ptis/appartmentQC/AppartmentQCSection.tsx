'use client';
import { useState, useMemo, useCallback, useEffect, useTransition, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import CommonPropertyTable from './CommonPropertyTable';
import ApartmentTaxDetailsTable from './ApartmentTaxDetailsTable';
import { ApartmentQCDetail, PagedResponse, ApartmentTaxDetailsItems, DualMethodTaxDetails } from '@/types/apartmentQC.types';
import { LoadingPage } from '@/components/common/LoadingPage';
import { getApartmentQCColumns } from './apartmentQC.columns';
import { emptyPagedResponse, transformApartmentData, getTabTitle } from './apartmentQC.utils';
import PropertyDetailsEditScreenNew from './PropertyDetailsEditScreen';
import {
  fetchApartmentQCDetailsSafeAction,
  fetchFloorQCByPropertyIdSafeAction,
  fetchAllPropertyTypesAction,
  fetchApartmentPropertyTaxDetailsByTabAction,
  fetchApartmentPropertyTaxDetailsCvByTabAction,
  fetchDualMethodTaxDetailsByTabAction,
} from '@/app/[locale]/property-tax/ptis/appartmentQC/action';
import { useColumnFilters } from '@/hooks/apartmentQc/useColumnFilters';

interface AppartmentQCSectionProps {
  initialData?: {
    amenities: PagedResponse<ApartmentQCDetail>;
    commercial: PagedResponse<ApartmentQCDetail>;
    residential: PagedResponse<ApartmentQCDetail>;
  };
  wardId?: string;
  propertyNo?: string;
}

interface DrawerLocalData {
  basicInfo: ApartmentQCDetail | null;
  floorQCData: ApartmentQCDetail[];
  propertyTypes: Array<{ value: string; label: string }>;
}

const AppartmentQCSection = ({
  initialData = {
    amenities: emptyPagedResponse,
    commercial: emptyPagedResponse,
    residential: emptyPagedResponse
  },
  wardId = '',
  propertyNo = '',
}: AppartmentQCSectionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  // const [drawerLoading, setDrawerLoading] = useState(false);

  const activeMainTab = searchParams.get('appartmentTab') || 'amenities';
  const activeSubTab = searchParams.get('subTab') || 'rateable';
  const sortBy = searchParams.get('sortBy') || '';
  const sortOrder = searchParams.get('sortOrder') || '';
  const [searchQuery, setSearchQuery] = useState(searchParams.get('searchTerm') || '');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const isUpdatingFromUrl = useRef(false);

  // Column filters
  const { activeFilters, handleFilterChange, fetchFilterOptions } = useColumnFilters({
    wardId,
    propertyNo,
  });

  // Tax details state - supports rateable, capital, and dual method
  const [taxDetails, setTaxDetails] = useState<ApartmentTaxDetailsItems | null>(null);
  const [dualMethodDetails, setDualMethodDetails] = useState<DualMethodTaxDetails | null>(null);
  const [taxDetailsLoading, setTaxDetailsLoading] = useState(false);

  // Function to refetch tax details (used when property details drawer is closed after saving)
  const refetchTaxDetails = useCallback(async () => {
    if (!wardId || !propertyNo) {
      return;
    }

    try {
      setTaxDetails(null);
      setDualMethodDetails(null);
      setTaxDetailsLoading(true);

      if (activeSubTab === 'rateable') {
        const result = await fetchApartmentPropertyTaxDetailsByTabAction(wardId, propertyNo, activeMainTab);
        if (result.success && result.data) {
          setTaxDetails(result.data);
        }
      } else if (activeSubTab === 'capital') {
        const result = await fetchApartmentPropertyTaxDetailsCvByTabAction(wardId, propertyNo, activeMainTab);
        if (result.success && result.data) {
          setTaxDetails(result.data);
        }
      } else if (activeSubTab === 'dual-method') {
        const result = await fetchDualMethodTaxDetailsByTabAction(wardId, propertyNo, activeMainTab);
        if (result.success && result.data) {
          setDualMethodDetails(result.data);
        }
      }
    } catch {
      // Error handled silently, state already null
    } finally {
      setTaxDetailsLoading(false);
    }
  }, [activeSubTab, activeMainTab, wardId, propertyNo]);

  useEffect(() => {
    const urlSearchTerm = searchParams.get('searchTerm') || '';
    if (urlSearchTerm !== searchQuery && !isUpdatingFromUrl.current) {
      queueMicrotask(() => setSearchQuery(urlSearchTerm));
    }
  }, [searchParams, searchQuery]);

  // Fetch tax details based on selected sub-tab (rateable, capital, or dual-method)
  useEffect(() => {
    if (!wardId || !propertyNo) {
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        if (!cancelled) {
          await refetchTaxDetails();
        }
      } catch {
        // Error handled silently
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [activeSubTab, activeMainTab, wardId, propertyNo, refetchTaxDetails]);

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
    const propertyId = String(row.id || row.propertyDetailsId || '');
    if (!propertyId) return;

    // Open drawer by updating URL params instead of navigating
    // Keep the original propertyId and use editPropertyId for the drawer
    const params = new URLSearchParams(searchParams.toString());
    params.set('drawer', 'edit');
    params.set('editPropertyId', propertyId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, router]);

  // Drawer state management - fetch data client-side when drawer opens
  const drawerOpen = searchParams.get('drawer') === 'edit';
  const selectedPropertyId = searchParams.get('editPropertyId');

  const [drawerLocalData, setDrawerLocalData] = useState<DrawerLocalData | null>(null);

  // Fetch drawer data client-side when the drawer opens. The reset to `null`
  // lives in the cleanup return so React's set-state-in-effect rule is happy
  // — cleanups are exempt and they still fire on dep changes / unmount.
  useEffect(() => {
    if (!drawerOpen || !selectedPropertyId) return;

    let cancelled = false;

    // queueMicrotask(() => setDrawerLoading(true));   // ✅ START LOADING

    const type = activeSubTab === 'dual-method' ? 'dual' : activeSubTab;

    Promise.all([
      fetchApartmentQCDetailsSafeAction({ propertyId: selectedPropertyId, pageSize: 1 }),
      fetchFloorQCByPropertyIdSafeAction(Number(selectedPropertyId), type),
      fetchAllPropertyTypesAction(),
    ])
      .then(([basicArr, floorArr, propTypesRes]) => {
        if (cancelled) return;

        setDrawerLocalData({
          basicInfo: basicArr.length > 0 ? basicArr[0] : null,
          floorQCData: floorArr,
          propertyTypes: propTypesRes.success && propTypesRes.data ? propTypesRes.data : [],
        });
      })
      .catch(() => {
        if (cancelled) return;

        setDrawerLocalData({
          basicInfo: null,
          floorQCData: [],
          propertyTypes: [],
        });
      })
      // .finally(() => {
      //   if (!cancelled) queueMicrotask(() => setDrawerLoading(false));  // ✅ STOP LOADING
      // });

    return () => {
      cancelled = true;
      setDrawerLocalData(null);
      // setDrawerLoading(false);
    };
  }, [drawerOpen, selectedPropertyId, activeSubTab]);

  const selectedPropertyData = drawerLocalData?.basicInfo ?? null;

  const handleCloseDrawer = useCallback(async () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('drawer');
    params.delete('editPropertyId');
    // Keep the original propertyId intact
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    // Refetch tax details when drawer is closed
    await refetchTaxDetails();
  }, [searchParams, pathname, router, refetchTaxDetails]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="flex-1 overflow-auto text-gray-900 bg-gray-50/30 p-2 relative min-h-[200px]">
        {isPending && (
          <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <LoadingPage translationNamespace="ptis.loading" />
          </div>
        )}
        <div className="space-y-6">
          <CommonPropertyTable
            columns={columns} data={convertedData} title={getTabTitle(activeMainTab, tAqc)} activeTab={activeSubTab}
            searchQuery={searchQuery} onSearchChange={(q) => { isUpdatingFromUrl.current = true; setSearchQuery(q); updateUrl({ searchTerm: q, pageNumber: 1 }); setTimeout(() => { isUpdatingFromUrl.current = false; }, 0); }}
            onRowClick={handleRowClick}
            loading={isPending} isAutoScrolling={isAutoScrolling} onToggleAutoScroll={() => setIsAutoScrolling(!isAutoScrolling)}
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

       <PropertyDetailsEditScreenNew
            key={`property-edit-${selectedPropertyId || 'new'}`}
            open={drawerOpen}
            onClose={handleCloseDrawer}
            onSaveOrClose={refetchTaxDetails}
            propertyData={selectedPropertyData}
            subTab={activeSubTab}
            returnTo={activeMainTab as 'amenities' | 'commercial' | 'residential'}
            initialFloorQCData={drawerLocalData?.floorQCData}
            initialPropertyTypes={drawerLocalData?.propertyTypes}
          />
    </div>
  );
};

export default AppartmentQCSection;

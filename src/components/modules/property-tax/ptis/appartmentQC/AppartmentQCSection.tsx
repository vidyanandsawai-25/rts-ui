'use client';

import { useState, useMemo, useCallback, useEffect, useTransition, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Tabs } from '@/components/common';
import { Building, Home, Building2, Calculator, GitMerge, IndianRupee, Loader2 } from 'lucide-react';
import CommonPropertyTable from './CommonPropertyTable';
import TaxDetailsTable from './TaxDetailsTable';
import { ApartmentQCDetail, PagedResponse } from '@/types/apartmentQC.types';

import { formatNumericDate } from '@/lib/utils/format';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AmenitiesRow = Record<string, any>;

const emptyPagedResponse: PagedResponse<ApartmentQCDetail> = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 10,
  totalPages: 1,
  hasPrevious: false,
  hasNext: false,
};

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
  wardId: _wardId = "",
  propertyNo: _propertyNo = ""
}: AppartmentQCSectionProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Get active tabs from URL search params
  const activeMainTab = searchParams.get('appartmentTab') || 'amenities';
  const activeSubTab = searchParams.get('subTab') || 'rateable';

  // Initialize search query from URL parameter
  const initialSearchQuery = searchParams.get('searchTerm') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Track if we're updating from URL to prevent circular updates
  const isUpdatingFromUrl = useRef(false);

  // Synchronize local search query with URL if search term changes
  useEffect(() => {
    const urlSearchTerm = searchParams.get('searchTerm') || '';
    if (urlSearchTerm !== searchQuery && !isUpdatingFromUrl.current) {
      // Use queueMicrotask to defer the state update
      queueMicrotask(() => {
        setSearchQuery(urlSearchTerm);
      });
    }
  }, [searchParams, searchQuery]);

  const tabs = [
    { value: 'amenities', label: 'Amenities', icon: Building2, content: null },
    { value: 'commercial', label: 'Commercial Details', icon: Building, content: null },
    { value: 'residential', label: 'Residential Details', icon: Home, content: null },
  ];

  const subTabs = [
    { value: 'rateable', label: 'Rateable', icon: Calculator, content: null },
    { value: 'capital', label: 'Capital', icon: IndianRupee, content: null },
    { value: 'dual-method', label: 'Dual Method', icon: GitMerge, content: null },
  ];

  // Helper to update URL params without full page reload/scroll
  const updateUrl = useCallback(
    (params: Record<string, string | number | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, String(value));
        }
      });
      const query = newParams.toString();
      startTransition(() => {
        router.replace(`${pathname}${query ? `?${query}` : ''}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  // Get active page data based on current tab
  const activePagedData = useMemo(() => {
    if (!initialData) return emptyPagedResponse;
    switch (activeMainTab) {
      case 'commercial':
        return initialData.commercial || emptyPagedResponse;
      case 'residential':
        return initialData.residential || emptyPagedResponse;
      default:
        return initialData.amenities || emptyPagedResponse;
    }
  }, [activeMainTab, initialData]);

  const handleMainTabChange = (v: string | number) => {
    updateUrl({
      tab: 'apartment',
      appartmentTab: v.toString(),
      subTab: 'rateable',
      pageNumber: 1
    });
  };

  const handleSubTabChange = (v: string | number) => {
    updateUrl({
      tab: 'apartment',
      appartmentTab: activeMainTab,
      subTab: v.toString(),
      pageNumber: 1
    });
  };

  const handlePageChange = (p: number) => {
    updateUrl({ pageNumber: p });
  };

  const handlePageSizeChange = (s: number) => {
    updateUrl({ pageSize: s, pageNumber: 1 });
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling((prev) => !prev);
  };

  const handleRowClick = useCallback(
    (row: AmenitiesRow) => {
      const propertyId = row.propertyNo || row.propertyId;
      router.push(`/property-tax/ptis/appartmentQC/${activeMainTab}/edit/${propertyId}`);
    },
    [router, activeMainTab]
  );

  // Columns definition (same as before)
  const columns = useMemo(() => {
    if (activeMainTab === 'commercial') {
      if (activeSubTab === 'dual-method') {
        return [
          { key: "propertyNo", label: "Partition No." },
          { key: "oldPropertyNo", label: "Old Property No." },
          { key: "wingName", label: "Wing Name" },
          { key: "flatOrShopNo", label: "Shop No." },
          { key: "ownerName", label: "Owner Name" },
          { key: "occupierName", label: "Occupier Name" },
          { key: "flatOrShopName", label: "Shop Name" },
          { key: "rentMonthly", label: "Rent" },
          { key: "renterName", label: "Renter Name" },
          { key: "typeOfUse", label: "Description" },
          { key: "type", label: "Type" },
          { key: "floor", label: "Floor" },
          { key: "assessmentYear", label: "Assessment Year" },
          { key: "constructionYear", label: "Survey Construction Year" },
          { key: "constructionType", label: "Construction Type" },
          { key: "toiletCount", label: "Toilet Count" },
          { key: "carpetASqFt", label: "Carpet Area (sqFt)" },
          { key: "carpetASqMtr", label: "Carpet Area (sqMtr)" },
          { key: "builtupASqFt", label: "Builtup Area (sqFt)" },
          { key: "builtupASqMtr", label: "Builtup Area (sqMtr)" },
          { key: "oldConstArea", label: "Old Construction Area" },
          { key: "oldRV", label: "Old RV" },
          { key: "oldTotalTax", label: "Old Tax" },
          { key: "rateableValue", label: "New RV" },
          { key: "newTaxTotalRV", label: "New Tax(RV)" },
          { key: "capitalValue", label: "Capital value" },
          { key: "newTaxTotalCV", label: "Total Tax(CV)" },
          { key: "mobileNo", label: "Mobile No." },
          { key: "emailId", label: "Email ID" },
          { key: "ocDate", label: "OC Date" },
        ];
      } else if (activeSubTab === 'capital') {
        return [
          { key: "propertyNo", label: "Property No" },
          { key: "oldPropertyNo", label: "Old Property No." },
          { key: "wingName", label: "Wing Name" },
          { key: "flatOrShopNo", label: "Shop No." },
          { key: "ownerName", label: "Owner Name" },
          { key: "occupierName", label: "Occupier Name" },
          { key: "flatOrShopName", label: "Shop Name" },
          { key: "rentMonthly", label: "Rent" },
          { key: "renterName", label: "Renter Name" },
          { key: "typeOfUse", label: "Description" },
          { key: "type", label: "Type" },
          { key: "floor", label: "Floor" },
          { key: "assessmentYear", label: "Asst Year" },
          { key: "constructionYear", label: "Con Year" },
          { key: "constructionType", label: "Con Type" },
          { key: "toiletCount", label: "Toilet Count" },
          { key: "carpetASqFt", label: "Carpet A (sqFt)" },
          { key: "carpetASqMtr", label: "Carpet A (sqMtr)" },
          { key: "builtupASqFt", label: "Buildup A (sqFt)" },
          { key: "builtupASqMtr", label: "Buildup A (sqMtr)" },
          { key: "oldConstArea", label: "Old Construction Area" },
          { key: "oldRV", label: "Old RV (CV)" },
          { key: "capitalValue", label: "New CV" },
          { key: "oldTotalTax", label: "Old Tax" },
          { key: "newTaxTotalCV", label: "New Tax" },
          { key: "mobileNo", label: "Mobile No." },
          { key: "emailId", label: "Email ID" },
          { key: "ocDate", label: "OC Date" },
        ];
      } else {
        return [
          { key: "propertyNo", label: "Property No" },
          { key: "oldPropertyNo", label: "Old Property No." },
          { key: "wingName", label: "Wing Name" },
          { key: "flatOrShopNo", label: "Shop No." },
          { key: "ownerName", label: "Owner Name" },
          { key: "occupierName", label: "Occupier Name" },
          { key: "flatOrShopName", label: "Shop Name" },
          { key: "rentMonthly", label: "Rent" },
          { key: "renterName", label: "Renter Name" },
          { key: "typeOfUse", label: "Description" },
          { key: "type", label: "Type" },
          { key: "floor", label: "Floor" },
          { key: "assessmentYear", label: "Asst Year" },
          { key: "constructionYear", label: "Con Year" },
          { key: "constructionType", label: "Con Type" },
          { key: "toiletCount", label: "Toilet Count" },
          { key: "carpetASqFt", label: "Carpet A (sqFt)" },
          { key: "carpetASqMtr", label: "Carpet A (sqMtr)" },
          { key: "builtupASqFt", label: "Buildup A (sqFt)" },
          { key: "builtupASqMtr", label: "Buildup A (sqMtr)" },
          { key: "oldConstArea", label: "Old Construction Area" },
          { key: "oldRV", label: "Old RV" },
          { key: "rateableValue", label: "New RV" },
          { key: "oldTotalTax", label: "Old Tax" },
          { key: "newTaxTotal", label: "New Tax" },
          { key: "mobileNo", label: "Mobile No." },
          { key: "emailId", label: "Email ID" },
          { key: "ocDate", label: "OC Date" },
        ];
      }
    }

    if (activeMainTab === 'residential') {
      if (activeSubTab === 'dual-method') {
        return [
          { key: "propertyNo", label: "Partition No." },
          { key: "oldPropertyNo", label: "Old Property No." },
          { key: "wingName", label: "Wing Name" },
          { key: "flatOrShopNo", label: "Flat No." },
          { key: "ownerName", label: "Owner Name" },
          { key: "occupierName", label: "Occupier Name" },
          { key: "rentMonthly", label: "Rent" },
          { key: "renterName", label: "Renter Name" },
          { key: "typeOfUse", label: "Description" },
          { key: "type", label: "Type" },
          { key: "floor", label: "Floor" },
          { key: "assessmentYear", label: "Assessment Year" },
          { key: "constructionYear", label: "Survey Construction Year" },
          { key: "constructionType", label: "Construction Type" },
          { key: "bhk", label: "BHK" },
          { key: "toiletCount", label: "Toilet Count" },
          { key: "carpetASqFt", label: "Carpet Area (sqFt)" },
          { key: "carpetASqMtr", label: "Carpet Area (sqMtr)" },
          { key: "builtupASqFt", label: "Builtup Area (sqFt)" },
          { key: "builtupASqMtr", label: "Builtup Area (sqMtr)" },
          { key: "oldConstArea", label: "Old Construction Area" },
          { key: "oldRV", label: "Old RV" },
          { key: "oldTotalTax", label: "Old Tax" },
          { key: "rateableValue", label: "New RV" },
          { key: "newTaxTotalRV", label: "New Tax(RV)" },
          { key: "capitalValue", label: "Capital value" },
          { key: "newTaxTotalCV", label: "Total Tax(CV)" },
          { key: "mobileNo", label: "Mobile No" },
          { key: "emailId", label: "Email ID" },
          { key: "ocDate", label: "OC Date" },
        ];
      } else if (activeSubTab === 'capital') {
        return [
          { key: "propertyNo", label: "Property No" },
          { key: "oldPropertyNo", label: "Old Property No." },
          { key: "wingName", label: "Wing Name" },
          { key: "flatOrShopNo", label: "Flat No." },
          { key: "ownerName", label: "Owner Name" },
          { key: "occupierName", label: "Occupier Name" },
          { key: "rentMonthly", label: "Rent" },
          { key: "renterName", label: "Renter Name" },
          { key: "typeOfUse", label: "Description" },
          { key: "type", label: "Type" },
          { key: "floor", label: "Floor" },
          { key: "assessmentYear", label: "Asst Year" },
          { key: "constructionYear", label: "Con Year" },
          { key: "constructionType", label: "Con Type" },
          { key: "bhk", label: "BHK" },
          { key: "toiletCount", label: "Toilet Count" },
          { key: "carpetASqFt", label: "Carpet A (sqFt)" },
          { key: "carpetASqMtr", label: "Carpet A (sqMtr)" },
          { key: "builtupASqFt", label: "Buildup A (sqFt)" },
          { key: "builtupASqMtr", label: "Buildup A (sqMtr)" },
          { key: "oldConstArea", label: "Old Construction Area" },
          { key: "oldRV", label: "Old RV (CV)" },
          { key: "capitalValue", label: "New CV" },
          { key: "oldTotalTax", label: "Old Tax" },
          { key: "newTaxTotalCV", label: "New Tax" },
          { key: "mobileNo", label: "Mobile No" },
          { key: "emailId", label: "Email ID" },
          { key: "ocDate", label: "OC Date" },
        ];
      } else {
        return [
          { key: "propertyNo", label: "Property No" },
          { key: "oldPropertyNo", label: "Old Property No." },
          { key: "wingName", label: "Wing Name" },
          { key: "flatOrShopNo", label: "Flat No." },
          { key: "ownerName", label: "Owner Name" },
          { key: "occupierName", label: "Occupier Name" },
          { key: "rentMonthly", label: "Rent" },
          { key: "renterName", label: "Renter Name" },
          { key: "typeOfUse", label: "Description" },
          { key: "type", label: "Type" },
          { key: "floor", label: "Floor" },
          { key: "assessmentYear", label: "Asst Year" },
          { key: "constructionYear", label: "Con Year" },
          { key: "constructionType", label: "Con Type" },
          { key: "bhk", label: "BHK" },
          { key: "toiletCount", label: "Toilet Count" },
          { key: "carpetASqFt", label: "Carpet A (sqFt)" },
          { key: "carpetASqMtr", label: "Carpet A (sqMtr)" },
          { key: "builtupASqFt", label: "Buildup A (sqFt)" },
          { key: "builtupASqMtr", label: "Buildup A (sqMtr)" },
          { key: "oldConstArea", label: "Old Construction Area" },
          { key: "oldRV", label: "Old RV" },
          { key: "rateableValue", label: "New RV" },
          { key: "oldTotalTax", label: "Old Tax" },
          { key: "newTaxTotal", label: "New Tax" },
          { key: "mobileNo", label: "Mobile No" },
          { key: "emailId", label: "Email ID" },
          { key: "ocDate", label: "OC Date" },
        ];
      }
    }

    const baseColumns = [
      { key: 'propertyNo', label: 'Property No' },
      { key: 'floor', label: 'Floor' },
      { key: 'assessmentYear', label: 'Asst Year' },
      { key: 'constructionYear', label: 'Con Year' },
      { key: 'typeOfUse', label: 'Use' },
      { key: 'carpetArea', label: 'Carpet A (sqFt/sqMtr)' },
      { key: 'builtupArea', label: 'Buildup A (sqFt/sqMtr)' },
      { key: 'oldConstArea', label: 'Old Con A' },
      { key: 'oldRV', label: 'Old RV' },
      { key: 'ocDate', label: 'OC Date' },
    ];

    if (activeSubTab === 'capital') {
      baseColumns.push({ key: 'cv', label: 'CV' });
    } else if (activeSubTab === 'dual-method') {
      baseColumns.push({ key: 'cv', label: 'CV' });
      baseColumns.push({ key: 'newRV', label: 'New RV' });
    } else {
      baseColumns.push({ key: 'newRV', label: 'New RV' });
    }

    baseColumns.push({ key: 'totalTax', label: 'Total Tax' });
    return baseColumns;
  }, [activeMainTab, activeSubTab]);

  const convertedData: AmenitiesRow[] = useMemo(() => {
    const items = activePagedData.items || [];

    if (activeMainTab === 'commercial' || activeMainTab === 'residential') {
      return items.map((item) => ({
        ...item,
        oldPropertyNo: item.oldPropertyNo || '-',
        // wingName: item.wingName || '-',
        flatOrShopNo: item.flatOrShopNo || '-',
        flatOrShopName: item.flatOrShopName || '-',
        ownerName: item.ownerName || '-',
        occupierName: item.occupierName || '-',
        rentMonthly: item.rentMonthly || 0,
        renterName: item.renterName || '-',
        typeOfUse: item.typeOfUse || '-',
        type: item.type || '-',
        floor: item.floor || '-',
        assessmentYear: item.assessmentYear || '-',
        constructionYear: item.constructionYear || '-',
        constructionType: item.constructionType || '-',
        // bhk: item.bhk || '-',
        // toiletCount: item.toiletCount || '-',
        carpetASqFt: item.carpetASqFt || 0,
        carpetASqMtr: item.carpetASqMtr || 0,
        builtupASqFt: item.builtupASqFt || 0,
        builtupASqMtr: item.builtupASqMtr || 0,
        oldConstArea: item.oldConstArea || '-',
        oldRV: item.oldRV || '-',
        oldTotalTax: item.oldTotalTax || '-',
        rateableValue: item.rateableValue || '-',
        capitalValue: item.capitalValue || '-',
        newTaxTotal: item.newTaxTotal || 0,
        newTaxTotalRV: item.newTaxTotalRV || 0,
        newTaxTotalCV: item.newTaxTotalCV || 0,
        mobileNo: item.mobileNo || '-',
        emailId: item.emailId || '-',
        ocDate: item.ocDate ? formatNumericDate(item.ocDate) : '-',
      }));
    }

    return items.map((item) => ({
      ...item,
      propertyNo: item.propertyNo,
      floor: item.floor || '-',
      assessmentYear: item.assessmentYear || '-',
      constructionYear: item.constructionYear || '-',
      typeOfUse: item.typeOfUse || '-',
      carpetArea: `${item.carpetASqFt || 0} / ${item.carpetASqMtr || 0}`,
      builtupArea: `${item.builtupASqFt || 0} / ${item.builtupASqMtr || 0}`,
      oldConstArea: item.oldConstArea || '-',
      oldRV: item.oldRV || '-',
      newRV: item.newTaxTotalRV || '-',
      cv: item.newTaxTotalCV || '-',
      totalTax: item.newTaxTotal || 0,
      ocDate: item.ocDate ? formatNumericDate(item.ocDate) : '-',
    }));
  }, [activePagedData, activeMainTab]);

  const getTitle = () => {
    switch (activeMainTab) {
      case 'commercial':
        return 'Property Tax Commercial Details';
      case 'residential':
        return 'Property Tax Residential Details';
      default:
        return 'Property Tax Amenities';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-2 flex items-center justify-between"> */}
      <div className="flex flex-row gap-4">
        <Tabs
          className="flex flex-row w-fit p-1 bg-white/50 rounded-xl"
          value={activeMainTab}
          variant="pills"
          items={tabs}
          onChange={handleMainTabChange}
          size="sm"
        />

        <Tabs
          className="flex flex-row p-1 bg-white/50 rounded-xl"
          value={activeSubTab}
          variant="pills"
          items={subTabs}
          onChange={handleSubTabChange}
          size="sm"
        />
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-medium bg-white px-3 py-1 rounded-full shadow-sm">
          <Loader2 className="h-3 w-3 animate-spin" />
          Updating...
        </div>
      )}
      {/* </div> */}

      <div className="flex-1 overflow-auto text-gray-900 bg-gray-50/30 p-2">
        <div className="space-y-6">
          <CommonPropertyTable
            columns={columns}
            data={convertedData}
            title={getTitle()}
            activeTab={activeSubTab}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              isUpdatingFromUrl.current = true;
              setSearchQuery(q);
              updateUrl({ searchTerm: q, pageNumber: 1 });
              // Reset flag after URL update
              setTimeout(() => {
                isUpdatingFromUrl.current = false;
              }, 0);
            }}
            onRowClick={handleRowClick}
            loading={isPending}
            isAutoScrolling={isAutoScrolling}
            onToggleAutoScroll={toggleAutoScroll}
            pageNumber={activePagedData.pageNumber}
            pageSize={activePagedData.pageSize}
            totalCount={activePagedData.totalCount}
            totalPages={activePagedData.totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            applyTypeColors={activeMainTab === 'commercial' || activeMainTab === 'residential'}
          />
          <TaxDetailsTable />
        </div>
      </div>
    </div>
  );
};

export default AppartmentQCSection;

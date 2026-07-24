'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import PropertyDetailsTab from '@/components/modules/property-tax/ptis/tabs/PropertyDetailsTab';
import KycDetailsTab from '@/components/modules/property-tax/ptis/tabs/KycDetailsTab';
import SocietyDetailsTab from '@/components/modules/property-tax/ptis/tabs/SocietyDetailsTab';
import OldDetailsTab from '@/components/modules/property-tax/ptis/tabs/OldDetailsTab';
import DiscountDataTab from '@/components/modules/property-tax/ptis/tabs/DiscountDataTab';
import BuildingPermissionTab from '@/components/modules/property-tax/ptis/tabs/BuildingPermissionTab';
import { PropertySearchBar } from './tabs/components/PropertySearchBar';
import { PropertyTabHeaders } from './tabs/components/PropertyTabHeaders';
import { useSyncedSearchParams } from '@/hooks/ptis/tab/useSyncedSearchParams';
import { useWardOptions } from '@/hooks/ptis/tab/useWardOptions';
import { usePropertyOptions } from '@/hooks/ptis/tab/usePropertyOptions';
import { usePropertySearch } from '@/hooks/ptis/tab/usePropertySearch';
import { useSyncedTabData } from '@/hooks/ptis/tab/useSyncedTabData';
import { usePropertySearchState } from '@/hooks/ptis/tab/usePropertySearchState';
import { usePropertySuggestions } from '@/hooks/ptis/tab/usePropertySuggestions';
import { Tabs, TabValue } from '@/components/common/Tabs';
import type { PtisTabId, PtisInitialData } from '@/types/ptis.types';
import { PTIS_TABS } from '@/types/ptis.types';
import type { SearchSelectOption } from '@/components/common/SearchSelect';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

interface PropertyTabSectionProps {
  initialData?: PtisInitialData;
  initialWardId?: number | null;
  initialTab?: string;
  forceActiveTab?: PtisTabId;
  initialError?: string;
  onFilterChange?: (wardNo: string, propertyNo: string) => void;
}

const EMPTY_ARRAY: never[] = [];

export default function PropertyTabSection({
  initialData,
  initialWardId = null,
  initialTab,
  forceActiveTab,
  initialError,
}: PropertyTabSectionProps) {
  const t = useTranslations('ptis');

  // Surface initial fetch errors (SSR) as client-side toasts
  useEffect(() => {
    if (initialError) {
      toast.error(initialError);
    }
  }, [initialError]);

  // 1. Hook: URL State Management (Source of Truth)
  const urlState = useSyncedSearchParams();

  // 2. Hook: Local Draft State (Prevents automatic searching on every selection)
  const { draft, setWardNo, setPropertyNo, setPartitionNo, setPropertyId, handleWardSelection } =
    usePropertySearchState({
      ...urlState,
      wardId: urlState.wardId || initialWardId,
    });

  // 3. Hook: Search & Navigation Logic
  const { isSearching, handleSearchProperty, updateUrl } = usePropertySearch();

  // 4. Hook: Data Sync (Binds raw API data to UI components)
  const {
    data,
    kycDetailsData,
    societyDetailsData,
    buildingPermissionData,
    oldDetailsData,
    oldFloorTableData,
    showOldFloorInfo,
    setShowOldFloorInfo,
    oldTaxesData,
    showOldTaxInfo,
    setShowOldTaxInfo,
    showOldMapInfo,
    setShowOldMapInfo,
    discountDetails,
    mappedPropertiesData,
  } = useSyncedTabData(
    initialData?.propertyDetails,
    initialData?.kycDetails,
    initialData?.societyDetails,
    initialData?.oldDetails,
    initialData?.oldFloorTableData,
    initialData?.showOldFloorInfo,
    initialData?.oldTaxesData,
    initialData?.showOldTaxInfo,
    initialData?.discountDetails,
    initialData?.buildingPermission,
    initialData?.showOldMapInfo,
    initialData?.mappedPropertiesData
  );

  // 5. Hook: Options Management
  const { wardOptions, isFetchingWardOptions, handleFetchWardList } = useWardOptions(
    initialData?.wardOptions || EMPTY_ARRAY
  );

  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 400);

  const { propertiesList, setPropertiesList, isSearchingProperties } = usePropertySuggestions(
    draft.wardId,
    debouncedSearchText,
    draft.propertyId
  );

  // 6. State Handlers
  const onWardChangeCommit = useCallback(
    (id: number | null, no: string) => {
      handleWardSelection(id, no);
      setPropertiesList([]);
      setSearchText('');
      updateUrl({
        wardNo: no || null,
        wardId: id ? id.toString() : null,
        propertyNo: null,
        partitionNo: null,
        propertyId: null,
      });
    },
    [handleWardSelection, updateUrl, setPropertiesList, setSearchText]
  );

  // Sync state with server-side rawPropertyData changes
  useEffect(() => {
    if (initialData?.rawPropertyData) {
      setPropertiesList(initialData.rawPropertyData);
    }
  }, [initialData?.rawPropertyData, setPropertiesList]);

  const dynamicPropertyOptions = useMemo<SearchSelectOption[]>(() => {
    return propertiesList.map((p) => {
      const trimmedPartitionNo = (p.partitionNo ?? '').trim();
      const normalizedPartitionNo = trimmedPartitionNo === '0' ? '' : trimmedPartitionNo;
      return {
        label: `${p.propertyNo}${normalizedPartitionNo ? ` - ${normalizedPartitionNo}` : ''}`,
        value: JSON.stringify({
          propertyNo: p.propertyNo,
          partitionNo: normalizedPartitionNo,
          propertyId: p.propertyId,
        }),
      };
    });
  }, [propertiesList]);

  const { propertyOptions, propertyOptionValueMap, partitionOptions, partitionValueMap } =
    usePropertyOptions(
      draft.propertyNo,
      dynamicPropertyOptions,
      propertiesList
    );



  // 7. Tabs Management (Optimistic UI Pattern)
  const validatedInitialTab =
    initialTab && PTIS_TABS.includes(initialTab as PtisTabId)
      ? (initialTab as PtisTabId)
      : (PTIS_TABS[0] as PtisTabId);
  const activeTab = forceActiveTab || validatedInitialTab;

  const [localTab, setLocalTab] = useState<PtisTabId>(activeTab);
  const [prevActiveTab, setPrevActiveTab] = useState<PtisTabId>(activeTab);

  // Sync local state with URL changes during render phase to avoid cascading effects
  if (activeTab !== prevActiveTab) {
    setLocalTab(activeTab);
    setPrevActiveTab(activeTab);
  }

  const handleTabChange = useCallback(
    (value: TabValue) => {
      const targetTab = value as PtisTabId;

      // Update UI immediately for snappy feedback
      setLocalTab(targetTab);

      updateUrl({ tab: targetTab === 'propertydetails' ? null : targetTab });
    },
    [updateUrl]
  );

  const handleShowFloorInfoChange = useCallback(
    (value: boolean) => {
      if (value !== showOldFloorInfo) {
        setShowOldFloorInfo(value);
        updateUrl({ showFloor: value ? 'true' : null });
      }
    },
    [showOldFloorInfo, setShowOldFloorInfo, updateUrl]
  );

  const handleShowTaxInfoChange = useCallback(
    (value: boolean) => {
      if (value !== showOldTaxInfo) {
        setShowOldTaxInfo(value);
        updateUrl({ showOldTax: value ? 'true' : null });
      }
    },
    [showOldTaxInfo, setShowOldTaxInfo, updateUrl]
  );

  const handleShowMapInfoChange = useCallback(
    (value: boolean) => {
      if (value !== showOldMapInfo) {
        setShowOldMapInfo(value);
        updateUrl({ showMapDetails: value ? 'true' : null });
      }
    },
    [showOldMapInfo, setShowOldMapInfo, updateUrl]
  );

  return (
    <div className="overflow-visible rounded-lg border border-slate-200 bg-white shadow-lg">
      <h1 className="sr-only">{t('title')}</h1>
      <Tabs value={localTab} onChange={handleTabChange} fullWidth={true}>
        <PropertySearchBar
          wardNo={draft.wardNo}
          setWardNo={setWardNo}
          wardId={draft.wardId}
          setWardId={onWardChangeCommit}
          propertyNo={draft.propertyNo}
          setPropertyNo={setPropertyNo}
          partitionNo={draft.partitionNo}
          setPartitionNo={setPartitionNo}
          propertyId={draft.propertyId}
          setPropertyId={setPropertyId}
          wardOptions={wardOptions}
          isFetchingWardOptions={isFetchingWardOptions}
          onFetchWardList={handleFetchWardList}
          propertyOptions={propertyOptions}
          propertyOptionValueMap={propertyOptionValueMap}
          partitionOptions={partitionOptions}
          partitionValueMap={partitionValueMap}
          isSearching={isSearching}
          onSearch={handleSearchProperty}
          upicId={data.upicId}
          ownerName={data.ownerName || kycDetailsData.propertyHolderName}
          propertyDescription={data.propertyDescription}
          tabHeaderInfo={initialData?.tabHeaderInfo}
          onPropertySearchChange={setSearchText}
          isSearchingProperties={isSearchingProperties}
        />

        <PropertyTabHeaders activeTab={localTab} />

        <div className="p-0">
          <Tabs.TabPanel value="propertydetails" className="mt-0 pt-0">
            <PropertyDetailsTab data={data} />
          </Tabs.TabPanel>
          <Tabs.TabPanel value="kycdetails" className="mt-0 pt-0">
            <KycDetailsTab data={kycDetailsData} />
          </Tabs.TabPanel>
          <Tabs.TabPanel value="societydetails" className="mt-0 pt-0">
            <SocietyDetailsTab data={societyDetailsData} />
          </Tabs.TabPanel>
          <Tabs.TabPanel value="buildingpermission" className="mt-0 pt-0">
            <BuildingPermissionTab
              data={buildingPermissionData}
              onFieldChange={() => {}}
              readOnly={true}
            />
          </Tabs.TabPanel>
          <Tabs.TabPanel value="discountdetails" className="mt-0 pt-0">
            <DiscountDataTab
              propertyId={draft.propertyId ? Number(draft.propertyId) : undefined}
              initialData={discountDetails}
              readOnly={true}
            />
          </Tabs.TabPanel>
          <Tabs.TabPanel value="olddetails" className="mt-0 pt-0">
            <OldDetailsTab
              oldDetailsData={oldDetailsData}
              oldFloorTableData={oldFloorTableData}
              showOldFloorInfo={showOldFloorInfo}
              setShowOldFloorInfo={handleShowFloorInfoChange}
              oldTaxesData={oldTaxesData}
              showOldTaxInfo={showOldTaxInfo}
              setShowOldTaxInfo={handleShowTaxInfoChange}
              showOldMapInfo={showOldMapInfo}
              setShowOldMapInfo={handleShowMapInfoChange}
              mappedPropertiesData={mappedPropertiesData}
            />
          </Tabs.TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

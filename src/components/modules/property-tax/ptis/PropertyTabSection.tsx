'use client';

import { useCallback, useEffect, useState } from 'react';
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
import { Tabs, TabValue } from '@/components/common/Tabs';
import type { PtisTabId, PtisInitialData } from '@/types/ptis.types';
import { PTIS_TABS } from '@/types/ptis.types';

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

  // 4. State Handlers
  const onWardChangeCommit = useCallback(
    (id: number | null, no: string) => {
      handleWardSelection(id, no);
      updateUrl({
        wardNo: no || null,
        wardId: id ? id.toString() : null,
        propertyNo: null,
        partitionNo: null,
        propertyId: null,
      });
    },
    [handleWardSelection, updateUrl]
  );

  // 5. Hook: Data Sync (Binds raw API data to UI components)
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
    discountDetails,
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
    initialData?.buildingPermission
  );

  // 6. Hook: Options Management
  const { wardOptions, isFetchingWardOptions, handleFetchWardList } = useWardOptions(
    initialData?.wardOptions || EMPTY_ARRAY
  );

  const { propertyOptions, propertyOptionValueMap, partitionOptions, partitionValueMap } =
    usePropertyOptions(
      draft.propertyNo,
      initialData?.propertyOptions || EMPTY_ARRAY,
      initialData?.rawPropertyData || EMPTY_ARRAY
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
            <DiscountDataTab initialData={discountDetails} readOnly={true} />
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
            />
          </Tabs.TabPanel>
        </div>
      </Tabs>
    </div>
  );
}

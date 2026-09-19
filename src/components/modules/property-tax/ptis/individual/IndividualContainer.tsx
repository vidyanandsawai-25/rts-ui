'use client';

import React from 'react';
import { PropertySearchBar } from '@/components/modules/property-tax/ptis/tabs/components/PropertySearchBar';
import { IndividualPropertyMasterCard } from './individual-tabSection/IndividualPropertyMasterCard';
import type { IndividualPropertyMasterData } from '@/types/property-tax/individual';
import type { PtisInitialData } from '@/types/ptis.types';
import { useIndividualPropertySearch } from '@/hooks/property-tax/individual';

export interface IndividualContainerProps {
  initialData?: PtisInitialData;
  initialWardId?: number | null;
  initialPropertyMasterData?: IndividualPropertyMasterData;
  isLoading?: boolean;
}

const EMPTY_INITIAL_DATA: PtisInitialData = {
  wardOptions: [],
  propertyOptions: [],
  rawPropertyData: [],
  tabHeaderInfo: undefined,
};

export const IndividualContainer: React.FC<IndividualContainerProps> = ({
  initialData = EMPTY_INITIAL_DATA,
  initialWardId = null,
  initialPropertyMasterData,
  isLoading = false,
}) => {
  const search = useIndividualPropertySearch(
    initialData,
    initialWardId,
    initialPropertyMasterData
  );
  const { draft, isSearching, propertyId } = search;

  const resolvedUpicId =
    initialPropertyMasterData?.upic && initialPropertyMasterData.upic !== '-'
      ? initialPropertyMasterData.upic
      : initialData?.propertyDetails?.upicId || initialData?.tabHeaderInfo?.upicId || '';

  const resolvedOwnerName =
    initialPropertyMasterData?.ownerName && initialPropertyMasterData.ownerName !== '-'
      ? initialPropertyMasterData.ownerName
      : initialData?.kycDetails?.propertyHolderName || initialData?.tabHeaderInfo?.ownerName || '';

  const resolvedDescription =
    initialPropertyMasterData?.propertyDescription && initialPropertyMasterData.propertyDescription !== '-'
      ? initialPropertyMasterData.propertyDescription
      : initialData?.propertyDetails?.propertyDescription || initialData?.tabHeaderInfo?.description || '';

  return (
    <div className="w-full flex flex-col bg-slate-100 min-h-screen text-zinc-900 select-none pb-16 font-sans">
      {/* 1. TOP SEARCH BAR */}
      <div className="px-3 pt-2">
        <div className="rounded-xl border border-blue-200/80 shadow-xs bg-white relative z-30">
          <PropertySearchBar
            wardNo={draft.wardNo}
            setWardNo={search.setWardNo}
            wardId={draft.wardId}
            setWardId={search.onWardChangeCommit}
            propertyNo={draft.propertyNo}
            setPropertyNo={search.setPropertyNo}
            partitionNo={draft.partitionNo}
            setPartitionNo={search.setPartitionNo}
            propertyId={draft.propertyId}
            setPropertyId={search.setPropertyId}
            category={draft.category}
            categoryLabel={draft.categoryLabel}
            setCategory={search.setCategory}
            wardOptions={search.wardOptions}
            isFetchingWardOptions={search.isFetchingWardOptions}
            onFetchWardList={search.handleFetchWardList}
            propertyOptions={search.propertyOptions}
            propertyOptionValueMap={search.propertyOptionValueMap}
            partitionOptions={search.partitionOptions}
            partitionValueMap={search.partitionValueMap}
            isSearching={isSearching || isLoading}
            onSearch={search.handleSearchProperty}
            upicId={resolvedUpicId}
            ownerName={resolvedOwnerName}
            propertyDescription={resolvedDescription}
            tabHeaderInfo={initialData?.tabHeaderInfo}
            onPropertySearchChange={search.setSearchText}
            onPartitionSearchChange={search.setPartitionSearchText}
            isSearchingProperties={search.isSearchingProperties}
            showSummaryInfo={false}
          />
        </div>
      </div>

      {/* 2. INDIVIDUAL TAB SECTION (PROPERTY MASTER CARD) */}
      <div className="px-3 pt-2">
        <IndividualPropertyMasterCard
          data={initialPropertyMasterData}
          propertyId={propertyId ? Number(propertyId) : undefined}
          wardNo={draft.wardNo}
          isLoading={isSearching || isLoading}
        />
      </div>
    </div>
  );
};

export default IndividualContainer;

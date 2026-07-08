'use client';

import React from 'react';
import { SearchSelect, type SearchSelectOption } from '@/components/common';
import { UpdateButton } from '@/components/common/ActionButtons';
import FloorTable from '../FloorTable';
import SelectPropertiesTable from '../SelectPropertiesTable';
import { FloorData } from '@/types/room-details.types';
import { LookupData } from '@/lib/utils/floorSubmission/floor-mappers';
import { SelectableProperty } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';

interface PropertyWiseTabProps {
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  properties: SelectableProperty[];
  selectedIds: Set<string | number>;
  onToggle: (id: string | number) => void;
  onClearSelection: () => void;
  isLoading: boolean;
  disabledIds: Set<string | number>;
  isApplying: boolean;
  onApply: () => void;

  // Search props
  wardOptions: SearchSelectOption[];
  searchWardId: string;
  handleWardChange: (name: string | undefined, value: string) => void;
  isFetchingWards: boolean;
  propertyOptions: SearchSelectOption[];
  searchPropertyNo: string;
  setSearchPropertyNo: (val: string) => void;
  isFetchingProperties: boolean;
  sanitizeWardNo: (val: string) => string;
  sanitizePropertyNo: (val: string) => string;
  handleSearchProperties: () => void;

  // FloorTable props
  filteredFloors: FloorData[];
  floorSearch: string;
  setFloorSearch: (val: string) => void;
  selectedFloor: FloorData | null;
  setSelectedFloor: (val: FloorData | null) => void;
  isAddingNewFloor: boolean;
  setIsAddingNewFloor: (val: boolean) => void;
  handleAddFloor: () => void;
  updateUrlParams: (params: Record<string, string | null>) => void;
  handleDeleteFloor: (floor: FloorData) => void;
  startTransition: (fn: () => void) => void;
  setFormErrors: (errors: Record<string, string>) => void;
  floorLookup: LookupData[];
  subFloorLookup: LookupData[];
  constructionLookup: LookupData[];
  useLookup: LookupData[];
  subTypeData: LookupData[];
  setEditingFloorForm: (val: FloorData) => void;
}

export const PropertyWiseTab: React.FC<PropertyWiseTabProps> = ({
  t,
  properties,
  selectedIds,
  onToggle,
  onClearSelection,
  isLoading,
  disabledIds,
  isApplying,
  onApply,
  wardOptions,
  searchWardId,
  handleWardChange,
  isFetchingWards,
  propertyOptions,
  searchPropertyNo,
  setSearchPropertyNo,
  isFetchingProperties,
  sanitizeWardNo,
  sanitizePropertyNo,
  handleSearchProperties,
  ...floorTableProps
}) => {
  return (
    <>
      <FloorTable
        {...floorTableProps}
        t={t}
        handleOpenDataEntrySameAs={() => {}}
        viewOnly
      />

      <div className="flex items-end gap-3 mt-3 px-1 mb-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="property-wise-search-ward-id" className="text-[11px] font-semibold text-slate-600">
            {t('floor.selectProperties.wardNo')}
          </label>
          <div className="w-44 relative [&_ul]:top-full [&_ul]:!z-30">
            <SearchSelect
              id="property-wise-search-ward-id"
              options={wardOptions}
              value={searchWardId}
              onChange={handleWardChange}
              sanitizeInput={sanitizeWardNo}
              className="h-8 text-xs"
              isLoading={isFetchingWards}
              loadingPlaceholder={t('search.loading')}
              noOptionsPlaceholder={t('search.noOptionsAvailable')}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="property-wise-search-property-no" className="text-[11px] font-semibold text-slate-600">
            {t('floor.selectProperties.propertyNo')}
          </label>
          <div className="w-44 relative [&_ul]:top-full [&_ul]:!z-30">
            <SearchSelect
              id="property-wise-search-property-no"
              options={propertyOptions}
              value={searchPropertyNo}
              onChange={(_name, val) => setSearchPropertyNo(val)}
              sanitizeInput={sanitizePropertyNo}
              className="h-8 text-xs"
              disabled={!searchWardId || isFetchingProperties}
              isLoading={isFetchingProperties}
              loadingPlaceholder={t('search.loading')}
              noOptionsPlaceholder={t('search.noOptionsAvailable')}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSearchProperties}
          disabled={!searchWardId || !searchPropertyNo.trim() || isLoading}
          className="h-8 px-4 rounded-md bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {t('floor.selectProperties.search')}
        </button>
      </div>

      <SelectPropertiesTable
        t={t}
        properties={properties}
        selectedIds={selectedIds}
        onToggle={onToggle}
        onClearSelection={onClearSelection}
        isLoading={isLoading}
        disabledIds={disabledIds}
        hideTypeColumn={true}
      />

      <div className="flex justify-end mt-4 px-1">
        <UpdateButton
          type="button"
          size="sm"
          label={isApplying ? t('floor.selectProperties.applying') : t('floor.selectProperties.applyPropertyButton')}
          onClick={onApply}
          disabled={selectedIds.size === 0}
          isLoading={isApplying}
          className="h-9 px-5 text-xs font-semibold rounded-md"
        />
      </div>
    </>
  );
};

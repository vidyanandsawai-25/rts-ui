'use client';

import { useTranslations } from 'next-intl';
import { Filter, Building, MapPin, Users, ChevronDown } from 'lucide-react';
import {
  SearchInput,
  SearchSelect,
  Select,
  Button,
} from '@/components/common';
import { AssetTypeFilter } from './AssetTypeFilter';
import type { AssetRegisterFiltersProps } from '@/types/asset/asset-register/municipal-asset-register.types';
import { useAssetRegisterFilters } from '@/hooks/asset/asset-register/useAssetRegisterFilters';
import {
  getMainSearchPlaceholder,
  type AssetRegisterSearchField,
} from '@/lib/utils/asset-utils/asset-register-filters';
import { getSearchFieldOptions } from './AssetRegisterSearchFieldOptions';

export function AssetRegisterFilters({
  search,
  searchField: searchFieldProp,
  AssetNo,
  AssetTypeId,
  ZoneId,
  WardId,
  DepartmentId,
  assetTypeOptions,
  zoneOptions,
  wardOptions,
  owningDepartmentOptions,
  categoryId,
  categoryOptions = [],
  exportButton,
}: AssetRegisterFiltersProps) {
  const t = useTranslations('assetRegister');
  const {
    searchValue,
    assetNoSearch,
    searchField,
    showFiltersPanel,
    handleSearchChange,
    handleAssetNoSearchChange,
    handleSearchFieldChange,
    handleAssetTypeChange,
    handleZoneChange,
    handleWardChange,
    handleOwningDepartmentChange,
    handleAssetCategoryChange,
    handleFiltersPanelToggle,
  } = useAssetRegisterFilters({
    search,
    searchField: searchFieldProp,
    assetNo: AssetNo,
  });

  const searchFieldOptions = getSearchFieldOptions(t);

  return (
    <div className="flex w-full flex-wrap items-center gap-2 overflow-visible [&_input]:!h-9 [&_input]:!py-1.5 [&_input]:!rounded-xl [&_input]:!border-slate-200 [&_input:hover]:!border-slate-300 [&_input]:!text-slate-700 [&_input]:!font-medium [&_button[role=combobox]]:!h-9 [&_button[role=combobox]]:!rounded-xl [&_button[role=combobox]]:!border-slate-200 [&_button[role=combobox]:hover]:!border-slate-300 [&_button[role=combobox]_span]:!text-sm [&_button[role=combobox]_span]:!text-slate-700 [&_button[role=combobox]_span]:!font-medium [&_button[role=combobox]_svg]:!w-4 [&_button[role=combobox]_svg]:!h-4 [&_button[role=combobox]_svg]:!text-slate-400">
      {/* Left-aligned Filters (First group) */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search Field Selector + SearchInput */}
        <div className="flex items-center justify-between gap-1.5 w-full sm:w-[360px] flex-shrink-0">
          {/* Search Field Selector */}
          <Select
            options={searchFieldOptions}
            value={searchField}
            onChange={(_, val) => {
                handleSearchFieldChange(val as AssetRegisterSearchField);
            }}
            placeholder="Select search field"
            selectSize="sm"
            className="w-auto flex-shrink-0 [&>ul]:min-w-[180px] [&>ul]:!border-slate-200 [&>ul]:!rounded-xl [&>ul]:!shadow-xl [&>ul]:!py-1.5"
          />

          {/* Common SearchInput */}
          <div className="flex-1 w-full sm:w-[180px]">
            <SearchInput
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={getMainSearchPlaceholder(
                searchField,
                t('Search_assets') || 'Search assets ...',
                t('Search_by_Asset_ID') || 'Search by Asset ID...',
                t('Search_by_Asset_Name') || 'Search by Asset Name...',
                t('Search_by_Address') || 'Search by Address...'
              )}
              className="mb-0 w-full"
              showClear={false}
            />
          </div>
        </div>

        {categoryOptions.length > 0 && (
          <div className="w-full sm:w-[190px] relative [&_ul]:!min-w-[275px]">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-400">
              <Building className="w-4 h-4" />
            </div>
            <SearchSelect
              name="assetCategory"
              label=""
              options={categoryOptions}
              value={categoryId ? String(categoryId) : 'all'}
              onChange={(_, value) => handleAssetCategoryChange(value)}
              placeholder={t('All_Asset_Categories') || 'Asset Category'}
              className="w-full !pl-9"
            />
          </div>
        )}

        <AssetTypeFilter
          assetTypeId={AssetTypeId}
          assetTypeOptions={assetTypeOptions}
          handleAssetTypeChange={handleAssetTypeChange}
          placeholder={t('All_Asset_Types') || 'All Asset Types'}
        />

        <div className="w-full sm:w-[190px] relative [&_ul]:!min-w-[275px]">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-400">
            <Building className="w-4 h-4" />
          </div>
          <SearchSelect
            name="owningDepartment"
            label=""
            options={owningDepartmentOptions}
            value={DepartmentId}
            onChange={(_, value) => handleOwningDepartmentChange(value)}
            placeholder={t('All_Departments') || 'All Departments'}
            className="w-full !pl-9"
          />
        </div>
      </div>

      {/* Right-aligned Filters + Buttons (Second group) */}
      <div className="flex flex-wrap items-center gap-2 ml-auto">
        {showFiltersPanel && (
          <>
            <div className="w-full sm:w-[186px] relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <SearchSelect
                key={ZoneId || 'all'}
                name="zone"
                label=""
                options={zoneOptions}
                value={ZoneId}
                onChange={(_, value) => handleZoneChange(value)}
                placeholder={t('All_Zones') || 'All Zones'}
                className="w-full !pl-9"
              />
            </div>

            <div className="w-full sm:w-[186px] relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-slate-400">
                <Users className="w-4 h-4" />
              </div>
              <SearchSelect
                key={WardId || 'all'}
                name="ward"
                label=""
                options={wardOptions}
                value={WardId}
                onChange={(_, value) => handleWardChange(value)}
                placeholder={t('All_Wards') || 'All Wards'}
                className="w-full !pl-9"
              />
            </div>

            <div className="w-full sm:w-[180px]">
              <SearchInput
                value={assetNoSearch}
                onChange={handleAssetNoSearchChange}
                placeholder="Asset No"
                className="mb-0 w-full"
                showClear={false}
              />
            </div>
          </>
        )}

        <Button
          onClick={handleFiltersPanelToggle}
          variant="secondary"
          size="sm"
          icon={Filter}
          className={`rounded-xl border text-xs font-semibold h-9 transition-all focus:outline-none ${showFiltersPanel
            ? '!bg-blue-500 !border-blue-500 !text-white hover:!bg-blue-600'
            : '!bg-white !border-slate-200 !text-black hover:!border-slate-300 hover:!bg-slate-50'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <span>{t('Filters') || 'Filters'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFiltersPanel ? 'rotate-180 text-white' : 'text-slate-500'}`} />
          </span>
        </Button>

        {/* Export Excel Button */}
        {exportButton && (
          <div className="flex-shrink-0 ">
            {exportButton}
          </div>
        )}
      </div>
    </div>
  );
}
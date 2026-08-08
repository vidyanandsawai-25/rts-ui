"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { SearchSelect, ValidationMessage, SaveButton, CancelButton } from "@/components/common";
import { PropertyRangeFields } from "./PropertyRangeFields";

interface PropertySelectionCriteriaProps {
  t: (key: string) => string;
  selectedScopeId: number | null;
  handleScopeChange: (val: number) => void;
  scopeOptions: any[];
  loadingScopeOptions: boolean;
  activeScopeDetails: any;
  filterValues: any;
  setFilterValues: any;
  handleZoneChange: (val: string) => void;
  zoneOptions: any[];
  handleWardChange: (val: string) => void;
  wardOptions: any[];
  propertyTypeOptions: any[];
  propertyOptions?: any[];
  fromPropertyOptions: any[];
  toPropertyOptions: any[];
  handlePropertyDropdownFocus: () => void;
  loadingPropertyOptions: boolean;
  isPropertyDropdownDisabled: boolean;
  filterSubmitted: boolean;
  loadingShowProperties: boolean;
  canShowProperties: boolean;
  handleShowProperties: () => void;
  handleFilterCancel: () => void;
  hasAnyFilterValue: boolean;
  handleFromPropertyChange: (val: string) => void;
  handleToPropertyChange: (val: string) => void;
  hasMore?: boolean;
  onLoadMore?: (searchQuery?: string) => void;
  isLoadingMore?: boolean;
  propertySearchTerm?: string;
  onPropertySearchChange?: (val: string) => void;
  fromHasMore?: boolean;
  onFromLoadMore?: (searchQuery?: string) => void;
  isFromLoadingMore?: boolean;
  fromPropertySearchTerm?: string;
  onFromPropertySearchChange?: (val: string) => void;
  loadingFromPropertyOptions?: boolean;
  toHasMore?: boolean;
  onToLoadMore?: (searchQuery?: string) => void;
  isToLoadingMore?: boolean;
  toPropertySearchTerm?: string;
  onToPropertySearchChange?: (val: string) => void;
  loadingToPropertyOptions?: boolean;
}

export const PropertySelectionCriteria = ({
  t,
  selectedScopeId,
  handleScopeChange,
  scopeOptions,
  loadingScopeOptions,
  activeScopeDetails,
  filterValues,
  setFilterValues,
  handleZoneChange,
  zoneOptions,
  handleWardChange,
  wardOptions,
  propertyTypeOptions,
  propertyOptions,
  fromPropertyOptions,
  toPropertyOptions,
  handlePropertyDropdownFocus,
  handleFromPropertyChange,
  handleToPropertyChange,
  loadingPropertyOptions,
  isPropertyDropdownDisabled,
  filterSubmitted,
  loadingShowProperties,
  canShowProperties,
  handleShowProperties,
  handleFilterCancel,
  hasAnyFilterValue,
  hasMore,
  onLoadMore,
  isLoadingMore,
  propertySearchTerm,
  onPropertySearchChange,
  fromHasMore,
  onFromLoadMore,
  isFromLoadingMore,
  fromPropertySearchTerm,
  onFromPropertySearchChange,
  loadingFromPropertyOptions,
  toHasMore,
  onToLoadMore,
  isToLoadingMore,
  toPropertySearchTerm,
  onToPropertySearchChange,
  loadingToPropertyOptions,
}: PropertySelectionCriteriaProps) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-start relative z-50">
      <div className="col-span-12 lg:col-span-2 relative z-[60]">
        <div className="block text-sm font-medium mb-1.5 text-slate-700">
          {t("propertyCriteria.selectionCriteria")}
        </div>
        <SearchSelect
          id="scope-select"
          value={selectedScopeId ? String(selectedScopeId) : ""}
          onChange={(_, val) => handleScopeChange(Number(val))}
          options={scopeOptions.map(opt => ({
            label: t(`propertyCriteria.scopes.${opt.name}`) || opt.displayName,
            value: String(opt.id)
          }))}
          disabled={loadingScopeOptions}
          isLoading={loadingScopeOptions}
          placeholder={t("propertyCriteria.selectCriteria") || "Select Criteria"}
        />
      </div>

      {activeScopeDetails?.options.includes("Zone") && (
        <div className="col-span-12 lg:col-span-2 relative z-[60]">
          <div className="block text-sm font-medium mb-1.5 text-slate-700">
            {t("filter.zoneNumber")} <span className="text-red-500 ml-0.5">*</span>
          </div>
          <SearchSelect
            id="zone-select"
            value={filterValues.zoneId}
            onChange={(_, val) => handleZoneChange(val)}
            options={zoneOptions}
            placeholder={t("filter.selectZone")} // Add translation
            required
          />
          <ValidationMessage
            visible={filterSubmitted && !filterValues.zoneId}
            message={t("messages.zoneRequired")}
          />
        </div>
      )}

      {activeScopeDetails?.options.includes("Ward") && (
        <div className="col-span-12 lg:col-span-2 relative z-[60]">
          <div className="block text-sm font-medium mb-1.5 text-slate-700">
            {t("filter.wardNumber")} <span className="text-red-500 ml-0.5">*</span>
          </div>
          <SearchSelect
            id="ward-select"
            value={filterValues.wardId}
            onChange={(_, val) => handleWardChange(val)}
            options={wardOptions}
            placeholder={t("filter.selectWard")}
            required
            disabled={activeScopeDetails?.options.includes("Zone") && !filterValues.zoneId}
          />
          <ValidationMessage
            visible={filterSubmitted && !filterValues.wardId}
            message={t("messages.wardRequired")}
          />
        </div>
      )}

      {activeScopeDetails?.options.includes("Property Type") && activeScopeDetails?.name !== "WardSector" && (
        <div className="col-span-12 lg:col-span-2 relative z-[60]">
          <div className="block text-sm font-medium mb-1.5 text-slate-700">
            {t("filter.propertyType")} <span className="text-red-500 ml-0.5">*</span>
          </div>
          <SearchSelect
            id="property-type-select"
            options={propertyTypeOptions}
            value={filterValues.propertyTypeId}
            onChange={(_, val) =>
              setFilterValues((prev: any) => ({
                ...prev,
                propertyTypeId: val,
              }))
            }
            placeholder={t("filter.selectPropertyType")}
            required
          />
          <ValidationMessage
            visible={filterSubmitted && !filterValues.propertyTypeId}
            message={t("messages.propertyTypeRequired")}
          />
        </div>
      )}

      <PropertyRangeFields
        t={t}
        activeScopeDetails={activeScopeDetails}
        filterValues={filterValues}
        propertyOptions={propertyOptions}
        fromPropertyOptions={fromPropertyOptions}
        toPropertyOptions={toPropertyOptions}
        handlePropertyDropdownFocus={handlePropertyDropdownFocus}
        handleFromPropertyChange={handleFromPropertyChange}
        handleToPropertyChange={handleToPropertyChange}
        loadingPropertyOptions={loadingPropertyOptions}
        isPropertyDropdownDisabled={isPropertyDropdownDisabled}
        filterSubmitted={filterSubmitted}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        isLoadingMore={isLoadingMore}
        propertySearchTerm={propertySearchTerm}
        onPropertySearchChange={onPropertySearchChange}
        fromHasMore={fromHasMore}
        onFromLoadMore={onFromLoadMore}
        isFromLoadingMore={isFromLoadingMore}
        fromPropertySearchTerm={fromPropertySearchTerm}
        onFromPropertySearchChange={onFromPropertySearchChange}
        loadingFromPropertyOptions={loadingFromPropertyOptions}
        toHasMore={toHasMore}
        onToLoadMore={onToLoadMore}
        isToLoadingMore={isToLoadingMore}
        toPropertySearchTerm={toPropertySearchTerm}
        onToPropertySearchChange={onToPropertySearchChange}
        loadingToPropertyOptions={loadingToPropertyOptions}
      />

      <div className="col-span-12 lg:col-span-2 flex gap-2 shrink-0 items-end mt-6">
        <SaveButton
          label={loadingShowProperties ? t("loading.message") : t("filter.show")}
          onClick={handleShowProperties}
          disabled={loadingShowProperties || !canShowProperties}
          size="sm"
        />
        <CancelButton
          label={t("filter.clear")}
          onClick={handleFilterCancel}
          size="sm"
          disabled={!hasAnyFilterValue}
        />
      </div>
    </div>
  );
};

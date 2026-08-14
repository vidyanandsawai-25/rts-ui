/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SearchSelectPaginated } from "@/components/common";

interface PropertyRangeFieldsProps {
  t: (key: string) => string;
  activeScopeDetails: any;
  filterValues: any;
  propertyOptions?: any[];
  fromPropertyOptions: any[];
  toPropertyOptions: any[];
  handlePropertyDropdownFocus: () => void;
  handleFromPropertyChange: (val: string) => void;
  handleToPropertyChange: (val: string) => void;
  loadingPropertyOptions: boolean;
  isPropertyDropdownDisabled: boolean;
  filterSubmitted: boolean;
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
  fieldClassName?: string;
}

export const PropertyRangeFields = ({
  t,
  activeScopeDetails,
  filterValues,
  propertyOptions,
  fromPropertyOptions,
  toPropertyOptions,
  handlePropertyDropdownFocus,
  handleFromPropertyChange,
  handleToPropertyChange,
  loadingPropertyOptions,
  isPropertyDropdownDisabled,
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
  fieldClassName,
}: PropertyRangeFieldsProps) => {
  return (
    <>
      {activeScopeDetails?.options.includes("Property No") && (
        <div className="col-span-12 lg:col-span-2 relative z-[60]">
          <div className="block text-sm font-medium mb-1.5 text-slate-700">
            {t("filter.propertyNo")} <span className="text-red-500 ml-0.5">*</span>
          </div>
          <SearchSelectPaginated
            id="property-no-select"
            key={`prop-no-${filterValues.wardId}`}
            options={propertyOptions || fromPropertyOptions}
            value={filterValues.fromPropertyNo}
            onChange={(_, val) => handleFromPropertyChange(val)}
            onInputFocus={handlePropertyDropdownFocus}
            placeholder={loadingPropertyOptions ? t("loading.message") : t("filter.selectPropertyNo")}
            required
            disabled={isPropertyDropdownDisabled}
            isLoading={loadingPropertyOptions}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            isLoadingMore={isLoadingMore}
            forceSearchText={propertySearchTerm}
            onSearchChange={onPropertySearchChange}
          />
        </div>
      )}

      {activeScopeDetails?.options.includes("From Property") && (
        <div className={fieldClassName || "col-span-12 lg:col-span-2 relative z-[60]"}>
          <div className="block text-sm font-medium mb-1.5 text-slate-700">
            {t("filter.fromPropertyNo")} <span className="text-red-500 ml-0.5">*</span>
          </div>
          <SearchSelectPaginated
            id="from-property-select"
            key={`from-prop-${filterValues.wardId}`}
            options={fromPropertyOptions}
            value={filterValues.fromPropertyNo}
            onChange={(_, val) => handleFromPropertyChange(val)}
            onInputFocus={handlePropertyDropdownFocus}
            placeholder={loadingFromPropertyOptions ? t("loading.message") : t("filter.selectFromPropertyNo")}
            required
            disabled={isPropertyDropdownDisabled}
            isLoading={loadingFromPropertyOptions ?? loadingPropertyOptions}
            hasMore={fromHasMore ?? hasMore}
            onLoadMore={onFromLoadMore ?? onLoadMore}
            isLoadingMore={isFromLoadingMore ?? isLoadingMore}
            forceSearchText={fromPropertySearchTerm ?? propertySearchTerm}
            onSearchChange={onFromPropertySearchChange ?? onPropertySearchChange}
          />
        </div>
      )}

      {activeScopeDetails?.options.includes("To Property") && (
        <div className={fieldClassName || "col-span-12 lg:col-span-2 relative z-[60]"}>
          <div className="block text-sm font-medium mb-1.5 text-slate-700">
            {t("filter.toPropertyNo")} <span className="text-red-500 ml-0.5">*</span>
          </div>
          <SearchSelectPaginated
            id="to-property-select"
            key={`to-prop-${filterValues.fromPropertyNo}`}
            options={toPropertyOptions}
            value={filterValues.toPropertyNo}
            onChange={(_, val) => handleToPropertyChange(val)}
            onInputFocus={handlePropertyDropdownFocus}
            placeholder={loadingToPropertyOptions ? t("loading.message") : t("filter.selectToPropertyNo")}
            required
            disabled={isPropertyDropdownDisabled || !filterValues.fromPropertyNo}
            isLoading={loadingToPropertyOptions}
            hasMore={toHasMore}
            onLoadMore={onToLoadMore}
            isLoadingMore={isToLoadingMore}
            forceSearchText={toPropertySearchTerm}
            onSearchChange={onToPropertySearchChange}
          />
        </div>
      )}
    </>
  );
};

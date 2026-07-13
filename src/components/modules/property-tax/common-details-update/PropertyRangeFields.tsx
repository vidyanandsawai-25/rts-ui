/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { SearchSelect, ValidationMessage } from "@/components/common";

interface PropertyRangeFieldsProps {
  t: (key: string) => string;
  activeScopeDetails: any;
  filterValues: any;
  fromPropertyOptions: any[];
  toPropertyOptions: any[];
  handlePropertyDropdownFocus: () => void;
  handleFromPropertyChange: (val: string) => void;
  handleToPropertyChange: (val: string) => void;
  loadingPropertyOptions: boolean;
  isPropertyDropdownDisabled: boolean;
  filterSubmitted: boolean;
}

export const PropertyRangeFields = ({
  t,
  activeScopeDetails,
  filterValues,
  fromPropertyOptions,
  toPropertyOptions,
  handlePropertyDropdownFocus,
  handleFromPropertyChange,
  handleToPropertyChange,
  loadingPropertyOptions,
  isPropertyDropdownDisabled,
  filterSubmitted,
}: PropertyRangeFieldsProps) => {
  return (
    <>
      {activeScopeDetails?.options.includes("Property No") && (
        <div className="col-span-12 lg:col-span-2 relative z-[60]">
          <SearchSelect
            options={fromPropertyOptions}
            label={t("filter.propertyNo")} // Add translation
            value={filterValues.fromPropertyNo}
            onChange={(_, val) => handleFromPropertyChange(val)}
            onInputFocus={handlePropertyDropdownFocus}
            placeholder={loadingPropertyOptions ? t("loading.message") : t("filter.selectPropertyNo")}
            required
            disabled={isPropertyDropdownDisabled}
            isLoading={loadingPropertyOptions}
          />
          <ValidationMessage
            visible={filterSubmitted && !filterValues.fromPropertyNo}
            message={t("messages.propertyNoRequired")}
          />
        </div>
      )}

      {activeScopeDetails?.options.includes("From Property") && (
        <div className="col-span-12 lg:col-span-2 relative z-[60]">
          <SearchSelect
            options={fromPropertyOptions}
            label={t("filter.fromPropertyNo")}
            value={filterValues.fromPropertyNo}
            onChange={(_, val) => handleFromPropertyChange(val)}
            onInputFocus={handlePropertyDropdownFocus}
            placeholder={loadingPropertyOptions ? t("loading.message") : t("filter.selectFromPropertyNo")}
            required
            disabled={isPropertyDropdownDisabled}
            isLoading={loadingPropertyOptions}
          />
          <ValidationMessage
            visible={filterSubmitted && !filterValues.fromPropertyNo}
            message={t("messages.fromPropertyRequired")}
          />
        </div>
      )}

      {activeScopeDetails?.options.includes("To Property") && (
        <div className="col-span-12 lg:col-span-2 relative z-[60]">
          <SearchSelect
            options={toPropertyOptions}
            label={t("filter.toPropertyNo")}
            value={filterValues.toPropertyNo}
            onChange={(_, val) => handleToPropertyChange(val)}
            onInputFocus={handlePropertyDropdownFocus}
            placeholder={loadingPropertyOptions ? t("loading.message") : t("filter.selectToPropertyNo")}
            required
            disabled={isPropertyDropdownDisabled}
            isLoading={loadingPropertyOptions}
          />
          <ValidationMessage
            visible={filterSubmitted && !filterValues.toPropertyNo}
            message={t("messages.toPropertyRequired")}
          />
        </div>
      )}
    </>
  );
};

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
  fromPropertyOptions: any[];
  toPropertyOptions: any[];
  handlePropertyDropdownFocus: () => void;
  loadingPropertyOptions: boolean;
  isPropertyDropdownDisabled: boolean;
  filterSubmitted: boolean;
  loadingProperties: boolean;
  canShowProperties: boolean;
  handleShowProperties: () => void;
  handleFilterCancel: () => void;
  hasAnyFilterValue: boolean;
  handleFromPropertyChange: (val: string) => void;
  handleToPropertyChange: (val: string) => void;
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
  fromPropertyOptions,
  toPropertyOptions,
  handlePropertyDropdownFocus,
  handleFromPropertyChange,
  handleToPropertyChange,
  loadingPropertyOptions,
  isPropertyDropdownDisabled,
  filterSubmitted,
  loadingProperties,
  canShowProperties,
  handleShowProperties,
  handleFilterCancel,
  hasAnyFilterValue
}: PropertySelectionCriteriaProps) => {
  return (
    <div className="grid grid-cols-12 gap-4 items-start relative z-50">
      <div className="col-span-12 lg:col-span-2 relative z-[60]">
        <SearchSelect
          label={t("propertyCriteria.selectionCriteria")}
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
          <SearchSelect
            label={t("filter.zoneNumber")} // Add this translation if missing or use fallback
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
          <SearchSelect
            label={t("filter.wardNumber")}
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
          <SearchSelect
            options={propertyTypeOptions}
            label={t("filter.propertyType")} // Add translation
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
        fromPropertyOptions={fromPropertyOptions}
        toPropertyOptions={toPropertyOptions}
        handlePropertyDropdownFocus={handlePropertyDropdownFocus}
        handleFromPropertyChange={handleFromPropertyChange}
        handleToPropertyChange={handleToPropertyChange}
        loadingPropertyOptions={loadingPropertyOptions}
        isPropertyDropdownDisabled={isPropertyDropdownDisabled}
        filterSubmitted={filterSubmitted}
      />

      <div className="col-span-12 lg:col-span-2 flex gap-2 shrink-0 items-end mt-6">
        <SaveButton
          type="button"
          label={loadingProperties ? t("loading.message") : t("filter.show")}
          onClick={handleShowProperties}
          disabled={loadingProperties || !canShowProperties}
          className="px-4"
          size="sm"
        />
        <CancelButton
          type="button"
          label={t("filter.clear")}
          onClick={handleFilterCancel}
          className="px-4"
          size="sm"
          disabled={!hasAnyFilterValue}
        />
      </div>
    </div>
  );
};

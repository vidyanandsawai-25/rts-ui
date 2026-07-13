"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Badge } from "@/components/common";
import { PropertySelectionCriteria } from "./PropertySelectionCriteria";
import { EnabledFieldList } from "./EnabledFieldList";
import { PropertyPreviewGrid } from "./PropertyPreviewGrid";
import { BulkUpdateForm } from "./BulkUpdateForm";
import { cn } from "@/lib/utils/cn";

interface UpdateFieldsTabContentProps {
  t: (key: string) => string;
  updateData: any;
  isFieldListCollapsed: boolean;
  setIsFieldListCollapsed: (collapsed: boolean) => void;
  locale: string;
}

export const UpdateFieldsTabContent = (props: UpdateFieldsTabContentProps) => {
  const { updateData } = props;
  return (
    <div className="space-y-4">
      {/* Section 1: Property Selection Criteria */}
      <div className="border border-blue-200 rounded-xl bg-white overflow-visible">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F8FAFF]">
          <div>
            <h3 className="text-sm font-semibold text-[#1E3A8A]">
              {props.t("propertyCriteria.title")}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {props.t("propertyCriteria.subtitle")}
            </p>
          </div>
          <Badge variant="success" size="sm" className="bg-green-50 text-green-700 border-green-200">
            {props.t("propertyCriteria.generalUserAllowed")}
          </Badge>
        </div>

        <div className="p-4">
          <PropertySelectionCriteria
            t={props.t}
            selectedScopeId={updateData.selectedScopeId}
            handleScopeChange={updateData.handleScopeChange}
            scopeOptions={updateData.scopeOptions}
            loadingScopeOptions={updateData.loadingScopeOptions}
            activeScopeDetails={updateData.activeScopeDetails}
            filterValues={updateData.filterValues}
            setFilterValues={updateData.setFilterValues}
            handleZoneChange={updateData.handleZoneChange}
            zoneOptions={updateData.zoneOptions}
            handleWardChange={updateData.handleWardChange}
            wardOptions={updateData.wardOptions}
            propertyTypeOptions={updateData.propertyTypeOptions}
            fromPropertyOptions={updateData.fromPropertyOptions}
            toPropertyOptions={updateData.toPropertyOptions}
            handlePropertyDropdownFocus={updateData.handlePropertyDropdownFocus}
            handleFromPropertyChange={updateData.handleFromPropertyChange}
            handleToPropertyChange={updateData.handleToPropertyChange}
            loadingPropertyOptions={updateData.loadingPropertyOptions}
            isPropertyDropdownDisabled={!updateData.filterValues.wardId}
            filterSubmitted={updateData.filterSubmitted}
            loadingProperties={updateData.loadingProperties}
            canShowProperties={updateData.canShowProperties}
            handleShowProperties={updateData.handleShowProperties}
            handleFilterCancel={updateData.handleBack}
            hasAnyFilterValue={updateData.hasAnyFilterValue}
          />
        </div>
      </div>

      {/* Lower Section: Flex Layout */}
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-480px)] min-h-[500px]">
        {/* Left: Enabled Field List */}
        <EnabledFieldList
          t={props.t}
          isFieldListCollapsed={props.isFieldListCollapsed}
          setIsFieldListCollapsed={props.setIsFieldListCollapsed}
          filteredMenuItems={updateData.filteredMenuItems}
          selectedCode={updateData.selectedCode}
          handleMenuSelect={updateData.handleMenuSelect}
          locale={props.locale}
        />

        {/* Center: Property Preview Grid */}
        <div
          className={cn(
            "flex flex-col min-h-0 h-full overflow-hidden transition-all duration-300",
            props.isFieldListCollapsed ? "w-full lg:w-6/12" : "flex-1"
          )}
        >
          <PropertyPreviewGrid
            t={props.t}
            properties={updateData.properties}
            filteredProperties={updateData.filteredProperties}
            pagedProperties={updateData.pagedProperties}
            totalCount={updateData.totalCount}
            loading={updateData.loadingProperties}
            selectedPropertyIds={updateData.selectedPropertyIds}
            allSelected={updateData.allSelected}
            onSelectAll={updateData.handleSelectAll}
            onPropertySelect={updateData.handlePropertySelect}
            propertiesPage={updateData.propertiesPage}
            setPropertiesPage={updateData.setPropertiesPage}
            pageSize={updateData.propertiesPageSize}
            onPageSizeChange={updateData.handlePropertiesPageSizeChange}
            pageSizeOptions={updateData.pageSizeOptions}
            searchTerm={updateData.propertiesSearchTerm}
            onSearchChange={updateData.handlePropertiesSearch}
            selectedMenuItem={updateData.selectedMenuItem}
            fieldConfigs={updateData.fieldConfigs}
            paginationInfo={updateData.paginationInfo}
            wardId={updateData.filterValues.wardId}
            fromPropertyNo={updateData.filterValues.fromPropertyNo}
            toPropertyNo={updateData.filterValues.toPropertyNo}
          />
        </div>

        {/* Right: New Values Form */}
        <div
          className={cn(
            "flex flex-col min-h-0 h-full shrink-0 transition-all duration-300",
            props.isFieldListCollapsed ? "flex-1" : "w-full lg:w-2/12"
          )}
        >
          <BulkUpdateForm
            t={props.t}
            selectedMenuItem={updateData.selectedMenuItem}
            fieldConfigs={updateData.fieldConfigs}
            loadingConfigs={updateData.loadingConfigs}
            formValues={updateData.formValues}
            formSubmitted={updateData.formSubmitted}
            saving={updateData.saving}
            selectedCount={updateData.selectedPropertyIds.size}
            onFieldChange={updateData.handleFormValueChange}
            onUpdate={updateData.handleSubmitBulkUpdate}
            onClear={updateData.handleFormClear}
            showValidationStatus={false}
            matchedProperties={updateData.totalCount}
            selectedFieldsCount={updateData.selectedCode ? 1 : 0}
          />
        </div>
      </div>
    </div>
  );
};

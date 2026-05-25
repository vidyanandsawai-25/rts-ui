"use client";

import { RefreshCcw } from "lucide-react";
import { PageContainer } from "@/components/common";
import TableHeader from "@/components/common/TableHeader";
import { CommonDetailsUpdatePageProps } from "@/types/common-details-update/common-details-update.types";
import { useCommonDetailsUpdate } from "@/hooks/commonDetailsUpdate/useCommonDetailsUpdate";
import { CommonDetailsUpdateMenu } from "./CommonDetailsUpdateMenu";
import { PropertyFilter } from "./PropertyFilter";
import { PropertyPreviewGrid } from "./PropertyPreviewGrid";
import { BulkUpdateForm } from "./BulkUpdateForm";

export default function CommonDetailsUpdatePage(
  props: CommonDetailsUpdatePageProps
) {
  const {
    t,
    // Menu
    filteredMenuItems,
    selectedCode,
    selectedMenuItem,
    menuSearch,
    setMenuSearch,
    handleMenuSelect,
    // Field configs
    fieldConfigs,
    loadingConfigs,
    // Filter
    filterValues,
    setFilterValues,
    filterSubmitted,
    wardOptions,
    wingOptions,
    propertyOptions,
    handleWardChange,
    handlePropertyDropdownFocus,
    handleShowProperties,
    handleBack,
    loadingProperties,
    loadingPropertyOptions,
    canShowProperties,
    // Properties
    properties,
    filteredProperties,
    pagedProperties,
    propertiesPage,
    setPropertiesPage,
    propertiesPageSize,
    handlePropertiesPageSizeChange,
    propertiesSearchTerm,
    handlePropertiesSearch,
    pageSizeOptions,
    totalCount,
    // Selection
    selectedPropertyIds,
    allSelected,
    handleSelectAll,
    handlePropertySelect,
    // Form
    formValues,
    formSubmitted,
    saving,
    handleFormValueChange,
    handleFormClear,
    handleSubmitBulkUpdate,
    // Pagination info
    paginationInfo,
  } = useCommonDetailsUpdate(props);

  return (
    <PageContainer>
      <div className="space-y-3 h-full flex flex-col">
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon={RefreshCcw}
        />

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Left Panel – Menu */}
          <div className="w-80 shrink-0 overflow-hidden">
            <CommonDetailsUpdateMenu
              menuItems={filteredMenuItems}
              selectedCode={selectedCode}
              menuSearch={menuSearch}
              setMenuSearch={setMenuSearch}
              onSelect={handleMenuSelect}
              t={t}
            />
          </div>

          {/* Center Panel – Filter + Preview */}
          <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
            <PropertyFilter
              t={t}
              filterValues={filterValues}
              setFilterValues={setFilterValues}
              filterSubmitted={filterSubmitted}
              wardOptions={wardOptions}
              wingOptions={wingOptions}
              propertyOptions={propertyOptions}
              onWardChange={handleWardChange}
              onPropertyDropdownFocus={handlePropertyDropdownFocus}
              onShow={handleShowProperties}
              onBack={handleBack}
              loading={loadingProperties}
              loadingPropertyOptions={loadingPropertyOptions}
              canShowProperties={canShowProperties}
            />

            <PropertyPreviewGrid
              t={t}
              properties={properties}
              filteredProperties={filteredProperties}
              pagedProperties={pagedProperties}
              totalCount={totalCount}
              loading={loadingProperties}
              selectedPropertyIds={selectedPropertyIds}
              allSelected={allSelected}
              onSelectAll={handleSelectAll}
              onPropertySelect={handlePropertySelect}
              propertiesPage={propertiesPage}
              setPropertiesPage={setPropertiesPage}
              pageSize={propertiesPageSize}
              onPageSizeChange={handlePropertiesPageSizeChange}
              pageSizeOptions={pageSizeOptions}
              searchTerm={propertiesSearchTerm}
              onSearchChange={handlePropertiesSearch}
              selectedMenuItem={selectedMenuItem}
              fieldConfigs={fieldConfigs}
              paginationInfo={paginationInfo}
            />
          </div>

          {/* Right Panel – Bulk Update Form */}
          <div className="w-72 shrink-0 overflow-hidden">
            <BulkUpdateForm
              t={t}
              selectedMenuItem={selectedMenuItem}
              fieldConfigs={fieldConfigs}
              loadingConfigs={loadingConfigs}
              formValues={formValues}
              formSubmitted={formSubmitted}
              saving={saving}
              selectedCount={selectedPropertyIds.size}
              onFieldChange={handleFormValueChange}
              onUpdate={handleSubmitBulkUpdate}
              onClear={handleFormClear}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

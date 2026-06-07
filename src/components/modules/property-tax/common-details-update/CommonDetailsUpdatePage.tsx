"use client";

import { Database, ChevronRight } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  PageContainer, Badge, Tabs, Tab, TabList, TabPanel, TableHeader,
  SearchSelect, SaveButton, CancelButton, ValidationMessage,
} from "@/components/common";
import { CommonDetailsUpdatePageProps } from "@/types/common-details-update/common-details-update.types";
import { useCommonDetailsUpdate } from "@/hooks/commonDetailsUpdate/useCommonDetailsUpdate";
import { BulkUpdateForm } from "./BulkUpdateForm";
import { FieldRegistry } from "./FieldRegistry";
import { PropertyPreviewGrid } from "./PropertyPreviewGrid";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "next-intl";

export default function CommonDetailsUpdatePage(
  props: CommonDetailsUpdatePageProps
) {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Tab state from URL params for server-side rendering support
  const tabFromUrl = searchParams.get("tab") || "updateFields";

  const {
    t,
    // Menu
    filteredMenuItems,
    selectedCode,
    selectedMenuItem,
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
    totalCount,
    propertiesPage,
    setPropertiesPage,
    propertiesPageSize,
    handlePropertiesPageSizeChange,
    propertiesSearchTerm,
    handlePropertiesSearch,
    pageSizeOptions,
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
    // Pagination
    paginationInfo,
  } = useCommonDetailsUpdate(props);

  // Count of selected fields (menu items with checkbox selected)
  const selectedFieldsCount = selectedCode ? 1 : 0;

  // Handle tab change - update URL params for SSR
  const handleTabChange = (val: string | number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", String(val));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // From/To Property dropdowns are disabled until a ward is selected
  const isPropertyDropdownDisabled = !filterValues.wardId;

  // Wing dropdown is disabled until From and To Property are selected
  const isWingDropdownDisabled = !filterValues.fromPropertyNo || !filterValues.toPropertyNo;

  // Handle cancel/clear in property filter
  const handleFilterCancel = () => {
    handleBack();
  };

  return (
    <PageContainer>
      <div className="space-y-4 h-full flex flex-col">
        {/* TableHeader with Screen Objective inside */}
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon={Database}
          rightContent={
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg max-w-xs">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400" />
              <div>
                <p className="text-xs font-semibold text-amber-800">{t("screenObjective.title")}</p>
                <p className="text-[11px] text-amber-700 leading-tight">{t("screenObjective.description")}</p>
              </div>
            </div>
          }
        />

        {/* Tabs */}
        <Tabs
          value={tabFromUrl}
          onChange={handleTabChange}
          variant="pills"
          size="md"
          className="flex-1 flex flex-col min-h-0"
        >
          <TabList className="border-b border-gray-200 pb-0 mb-0">
            <Tab
              value="updateFields"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
                tabFromUrl === "updateFields"
                  ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                  : "bg-white text-gray-600 border-transparent hover:bg-gray-50"
              )}
            >
              {t("tabs.updateFields")}
            </Tab>
            <Tab
              value="fieldRegistry"
              icon={Database}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors",
                tabFromUrl === "fieldRegistry"
                  ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                  : "bg-white text-gray-600 border-transparent hover:bg-gray-50"
              )}
            >
              {t("tabs.fieldRegistry")}
            </Tab>
          </TabList>

          {/* Update Fields Tab */}
          <TabPanel value="updateFields" className="flex-1 min-h-0 overflow-auto">
            <div className="space-y-4">
              {/* Section 1: Property Selection Criteria */}
              <div className="border border-blue-200 rounded-xl bg-white overflow-visible">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F8FAFF]">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1E3A8A]">
                      {t("propertyCriteria.title")}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t("propertyCriteria.subtitle")}
                    </p>
                  </div>
                  <Badge variant="success" size="sm" className="bg-green-50 text-green-700 border-green-200">
                    {t("propertyCriteria.generalUserAllowed")}
                  </Badge>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap lg:flex-nowrap items-end gap-3 relative z-50">
                    <div className="w-56 shrink-0 relative z-[60]">
                      <SearchSelect
                        label={t("propertyCriteria.selectionCriteria")}
                        value="wardPropertyRange"
                        onChange={() => { }}
                        options={[{ label: t("propertyCriteria.wardPropertyRange"), value: "wardPropertyRange" }]}
                        disabled
                      />
                    </div>

                    <div className="flex-1 min-w-[120px] relative z-[60]">
                      <SearchSelect
                        label={t("filter.wardNumber")}
                        value={filterValues.wardId}
                        onChange={(_, val) => handleWardChange(val)}
                        options={wardOptions}
                        placeholder={t("filter.selectWard")}
                        required
                      />
                      <ValidationMessage
                        visible={filterSubmitted && !filterValues.wardId}
                        message={t("messages.wardRequired")}
                      />
                    </div>

                    <div className="flex-1 min-w-[140px] relative z-[60]">
                      <SearchSelect
                        options={propertyOptions}
                        label={t("filter.fromPropertyNo")}
                        value={filterValues.fromPropertyNo}
                        onChange={(_, val) =>
                          setFilterValues((prev) => ({
                            ...prev,
                            fromPropertyNo: val,
                          }))
                        }
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

                    <div className="flex-1 min-w-[140px] relative z-[60]">
                      <SearchSelect
                        options={propertyOptions}
                        label={t("filter.toPropertyNo")}
                        value={filterValues.toPropertyNo}
                        onChange={(_, val) =>
                          setFilterValues((prev) => ({
                            ...prev,
                            toPropertyNo: val,
                          }))
                        }
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

                    <div className="flex-1 min-w-[100px] relative z-[60]">
                      <SearchSelect
                        label={t("filter.wing")}
                        value={filterValues.wingId}
                        onChange={(_, val) =>
                          setFilterValues((prev) => ({ ...prev, wingId: val }))
                        }
                        options={wingOptions}
                        placeholder={t("filter.selectWing")}
                        required
                        disabled={isWingDropdownDisabled}
                      />
                      <ValidationMessage
                        visible={filterSubmitted && !filterValues.wingId}
                        message={t("messages.wingRequired")}
                      />
                    </div>

                    <div className="flex gap-2 shrink-0">
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
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Lower Section: 12-Column Layout */}
              <div className="grid grid-cols-12 gap-4 h-[calc(100vh-480px)] min-h-[500px]">
                {/* Left: Enabled Field List (col-4) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col min-h-0 border border-blue-200 rounded-xl bg-white overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-[#F8FAFF]">
                    <div>
                      <h3 className="text-sm font-semibold text-[#1E3A8A]">
                        {t("fieldList.title")}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t("fieldList.subtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <p className="text-sm font-medium text-gray-700">
                        {t("fieldList.enabledFieldList")}
                      </p>
                      <span className="text-sm text-gray-500">
                        {filteredMenuItems.length} {t("fieldList.available")}
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                      {filteredMenuItems.map((item) => {
                        const isSelected = item.updateCode === selectedCode;
                        const displayLabel = locale === "mr" ? item.updateNameMarathi : item.updateName;

                        return (
                          <button
                            key={item.updateCode}
                            type="button"
                            onClick={() => handleMenuSelect(item.updateCode)}
                            className={cn(
                              "w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-left",
                              isSelected
                                ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                                : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium",
                                isSelected ? "text-[#1E3A8A]" : "text-gray-700"
                              )}>
                                {displayLabel}
                              </p>
                              {item.description && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                              <ChevronRight className={cn(
                                "w-5 h-5 transition-colors",
                                isSelected ? "text-[#1E3A8A]" : "text-gray-300"
                              )} />
                            </div>
                          </button>
                        );
                      })}

                      {filteredMenuItems.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <p className="text-sm text-gray-500">
                            {t("form.noFields")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center: Property Preview Grid (col-6) */}
                <div className="col-span-12 lg:col-span-6 flex flex-col min-h-0 h-full">
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

                {/* Right: New Values Form (col-2) */}
                <div className="col-span-12 lg:col-span-2 flex flex-col min-h-0 h-full">
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
                    showValidationStatus={false}
                    matchedProperties={totalCount}
                    selectedFieldsCount={selectedFieldsCount}
                  />
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Field Registry Tab */}
          <TabPanel value="fieldRegistry" className="flex-1 min-h-0 overflow-auto">
            <FieldRegistry t={t} />
          </TabPanel>
        </Tabs>
      </div>
    </PageContainer>
  );
}

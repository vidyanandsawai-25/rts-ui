"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  PropertySearchFormProps,
  SearchValidationKey,
} from "@/types/property-search";
import {
  usePropertySearchFilters,
  usePropertySearchForm,
} from "@/hooks/search-property";
import { TopFilterRow } from "./form/TopFilterRow";
import { QuickSearchPanel } from "./form/QuickSearchPanel";
import { KycSearchPanel } from "./form/KycSearchPanel";
import { ValuesDuesPanel } from "./form/ValuesDuesPanel";
import { SearchTabs } from "./form/SearchTabs";
import { ActiveFiltersTags } from "./form/ActiveFiltersTags";

/**
 * SSR-driven Property Search form.
 *
 * - All option lists (`zoneOptions`, `wardOptions`, `propertyDescriptionOptions`,
 *   `lookupOptions`) are fetched server-side and passed as props.
 * - Zone/ward changes trigger URL updates instantly; Next.js re-runs the page queries.
 * - Local draft state lives in `usePropertySearchForm`; URL → SSR → props
 *   keeps the draft in sync.
 */
export function PropertySearchForm({
  initialCriteria,
  activeTab,
  selectedStatus = null,
  zoneOptions,
  wardOptions,
  propertyTypeOptions,
  workflowStageOptions,
  propertyDescriptionOptions,
  lookupOptions,
  onSearch,
  onReset,
  onTabChange,
  onZoneChange,
  onWardChange,
  disabled = false,
  searchPending = false,
}: PropertySearchFormProps): React.ReactElement {
  const tValidation = useTranslations("propertySearch.form.validation");

  const validationT = React.useCallback(
    (key: SearchValidationKey) => tValidation(key),
    [tValidation]
  );

  const {
    formState,
    validationError,
    validationRef,
    fieldErrors,
    isSubmitDisabled,
    setField,
    handleInputChange,
    handleInputBlur,
    handleSelectChange,
    handleZoneChange,
    handleWardChange,
    handleSubmit,
    handleReset,
    handleClearField,
  } = usePropertySearchForm({
    initialCriteria,
    activeTab,
    selectedStatus,
    onSearch,
    onReset,
    onZoneChange,
    onWardChange,
    validationT,
  });

  const liveWardOptions = wardOptions;
  const liveLookupOptions = lookupOptions;

  const { propertyNoToOptions } = usePropertySearchFilters({
    lookupOptions: liveLookupOptions,
    propertyNoFrom: formState.propertyNoFrom,
  });

  const activeFiltersTags = (
    <ActiveFiltersTags
      formState={formState}
      propertyTypeOptions={propertyTypeOptions}
      workflowStageOptions={workflowStageOptions}
      zoneOptions={zoneOptions}
      wardOptions={liveWardOptions}
      propertyDescriptionOptions={propertyDescriptionOptions}
      onClearField={handleClearField}
    />
  );


  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      <div data-filter-field>
        <TopFilterRow
          formState={formState}
          propertyTypeOptions={propertyTypeOptions}
          workflowStageOptions={workflowStageOptions}
          zoneOptions={zoneOptions}
          wardOptions={liveWardOptions}
          propertyDescriptionOptions={propertyDescriptionOptions}
          disabled={disabled}
          onSelectChange={handleSelectChange}
          onZoneChange={handleZoneChange}
          onWardChange={handleWardChange}
          onClearField={handleClearField}
        />
      </div>

      <SearchTabs
        activeTab={activeTab}
        validationError={validationError}
        validationRef={validationRef}
        onTabChange={onTabChange}
        activeFiltersTags={activeFiltersTags}
        quickPanel={
          <div data-filter-field>
            <QuickSearchPanel
              formState={formState}
              lookupOptions={liveLookupOptions}
              propertyNoToOptions={propertyNoToOptions}
              fieldErrors={fieldErrors}
              disabled={disabled}
              setField={setField}
              onFieldBlur={handleInputBlur}
              searchPending={searchPending}
              isSubmitDisabled={isSubmitDisabled}
              onReset={handleReset}
              onClearField={handleClearField}
            />
          </div>
        }
        kycPanel={
          <div data-filter-field>
            <KycSearchPanel
              formState={formState}
              fieldErrors={fieldErrors}
              disabled={disabled}
              onInputChange={handleInputChange}
              onInputBlur={handleInputBlur}
              searchPending={searchPending}
              isSubmitDisabled={isSubmitDisabled}
              onReset={handleReset}
              onClearField={handleClearField}
            />
          </div>
        }
        valuesDuesPanel={
          <div data-filter-field>
            <ValuesDuesPanel
              formState={formState}
              fieldErrors={fieldErrors}
              disabled={disabled}
              onSelectChange={handleSelectChange}
              onInputChange={handleInputChange}
              onInputBlur={handleInputBlur}
              searchPending={searchPending}
              isSubmitDisabled={isSubmitDisabled}
              onReset={handleReset}
              onClearField={handleClearField}
            />
          </div>
        }
      />
    </form>
  );
}

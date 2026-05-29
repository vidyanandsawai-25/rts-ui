"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type {
  PropertySearchFormProps,
  SearchValidationKey,
} from "@/types/property-search.types";
import {
  usePropertySearchDependentOptions,
  usePropertySearchFilters,
  usePropertySearchForm,
} from "@/hooks/property-search";
import { TopFilterRow } from "./form/TopFilterRow";
import { QuickSearchPanel } from "./form/QuickSearchPanel";
import { KycSearchPanel } from "./form/KycSearchPanel";
import { SearchTabs } from "./form/SearchTabs";

/**
 * SSR-driven Property Search form.
 *
 * - All option lists (`zoneOptions`, `wardOptions`, `propertyDescriptionOptions`,
 *   `lookupOptions`) are fetched server-side and passed as props.
 * - Zone/ward changes stay in local form state; dependent options load via
 *   `usePropertySearchDependentOptions` without refetching the results table.
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
  propertyDescriptionOptions,
  lookupOptions,
  onSearch,
  onReset,
  onTabChange,
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
  } = usePropertySearchForm({
    initialCriteria,
    activeTab,
    selectedStatus,
    onSearch,
    onReset,
    validationT,
  });

  const { wardOptions: liveWardOptions, lookupOptions: liveLookupOptions } =
    usePropertySearchDependentOptions({
      zoneId: formState.zoneId,
      wardId: formState.wardId,
      initialWardOptions: wardOptions,
      initialLookupOptions: lookupOptions,
    });

  const { propertyNoToOptions } = usePropertySearchFilters({
    lookupOptions: liveLookupOptions,
    propertyNoFrom: formState.propertyNoFrom,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5">
      <div data-filter-field>
        <TopFilterRow
          formState={formState}
          propertyTypeOptions={propertyTypeOptions}
          zoneOptions={zoneOptions}
          wardOptions={liveWardOptions}
          propertyDescriptionOptions={propertyDescriptionOptions}
          disabled={disabled}
          onSelectChange={handleSelectChange}
          onZoneChange={handleZoneChange}
          onWardChange={handleWardChange}
        />
      </div>

      <SearchTabs
        activeTab={activeTab}
        searchPending={searchPending}
        isSubmitDisabled={isSubmitDisabled}
        validationError={validationError}
        validationRef={validationRef}
        onTabChange={onTabChange}
        onReset={handleReset}
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
            />
          </div>
        }
      />
    </form>
  );
}

"use client";

import React, { useCallback, useState, useTransition } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageContainer, TableHeader, Card, CardContent } from "@/components/common";
import type {
  PropertySearchProps,
  PropertyStatus,
  SearchCriteria,
  SearchTab,
} from "@/types/property-search.types";
import { PropertyStats } from "./PropertyStats";
import { PropertySearchForm } from "./PropertySearchForm";
import { PropertySearchResults } from "./PropertySearchResults";
import { usePropertySearchNavigation } from "@/hooks/property-search";

/**
 * PropertySearch
 *
 * Top-level client component for Property Tax → Search Property.
 * Fully SSR-driven: all filters live in the URL search params. This
 * component is a thin orchestrator that translates user interactions
 * into URL updates and lets the server-rendered `page.tsx` re-fetch.
 */
export function PropertySearch({
  results,
  stats,
  zoneOptions,
  wardOptions,
  propertyTypeOptions,
  propertyDescriptionOptions,
  lookupOptions,
  selectedStatus,
  isSearchActive,
  activeTab: activeTabProp,
  criteria,
  searchError = null,
}: PropertySearchProps): React.ReactElement {
  const t = useTranslations("propertySearch");
  const [activeTab, setActiveTab] = useState<SearchTab>(activeTabProp);
  const [prevActiveTab, setPrevActiveTab] = useState<SearchTab>(activeTabProp);
  const [isPending, startTransition] = useTransition();
  const [awaitingResults, setAwaitingResults] = useState(false);
  const [statusClearedByTab, setStatusClearedByTab] = useState(false);

  if (activeTabProp !== prevActiveTab) {
    setPrevActiveTab(activeTabProp);
    setActiveTab(activeTabProp);
  }

  const displayedStatus =
    statusClearedByTab && selectedStatus ? null : selectedStatus;
  const resultsLoading = awaitingResults && isPending;

  const {
    updateSearchCriteria,
    resetSearch,
    updateStatus,
  } = usePropertySearchNavigation({ startTransition });

  const handleStatusFilter = useCallback(
    (status: PropertyStatus) => {
      setStatusClearedByTab(false);
      setAwaitingResults(true);
      if (displayedStatus === status) {
        updateStatus(null);
      } else {
        updateStatus(status);
      }
    },
    [displayedStatus, updateStatus]
  );

  const handleSearch = useCallback(
    (next: SearchCriteria, tab: SearchTab) => {
      setAwaitingResults(true);
      updateSearchCriteria(next, tab, displayedStatus);
    },
    [displayedStatus, updateSearchCriteria]
  );

  const handleReset = useCallback(() => {
    setAwaitingResults(true);
    resetSearch(activeTab);
  }, [activeTab, resetSearch]);

  const handleTabChange = useCallback(
    (tab: SearchTab) => {
      if (tab === activeTab) return;
      if (displayedStatus) {
        setStatusClearedByTab(true);
      }
      setActiveTab(tab);

      // Update URL client-side only (no Next.js transition/refresh to prevent API calls)
      const url = new URL(window.location.href);
      if (tab === "quick-search") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState(null, "", url.toString());
    },
    [activeTab, displayedStatus]
  );

  return (
    <PageContainer>
      <div className="w-full space-y-1.5 relative z-30">
        <TableHeader
          title={t("title")}
          subtitle={t("subtitle")}
          icon={SearchIcon}
          className="py-1.5 sm:py-2 px-3 sm:px-4 border-l-4 border-l-[#004c8c] [&>div>div:first-child>div:first-child]:border-[#004c8c]/20 [&>div>div:first-child>div:first-child]:bg-[#004c8c]/10 [&_svg]:text-[#004c8c]"
        />

        <Card
          variant="default"
          padding="none"
          className="rounded-lg shadow-sm border border-slate-200 overflow-visible shrink-0"
        >
          <CardContent className="p-2 space-y-2">
            <PropertyStats
              selectedStatus={displayedStatus}
              onStatusClick={handleStatusFilter}
              statsData={stats}
              disabled={isPending}
            />

            <div className="border-t border-slate-100 pt-2">
              <PropertySearchForm
                initialCriteria={criteria}
                activeTab={activeTab}
                selectedStatus={displayedStatus}
                zoneOptions={zoneOptions}
                wardOptions={wardOptions}
                propertyTypeOptions={propertyTypeOptions}
                propertyDescriptionOptions={propertyDescriptionOptions}
                lookupOptions={lookupOptions}
                onSearch={handleSearch}
                onReset={handleReset}
                onTabChange={handleTabChange}
                searchPending={isPending}
              />
            </div>
          </CardContent>
        </Card>

        <Card
          variant="default"
          padding="none"
          className="rounded-lg shadow-sm border border-slate-200 min-w-0"
        >
          <CardContent className="p-2">
            <PropertySearchResults
              selectedStatus={displayedStatus}
              isSearchActive={isSearchActive}
              results={results}
              loading={resultsLoading}
              searchError={searchError}
            />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

export default PropertySearch;

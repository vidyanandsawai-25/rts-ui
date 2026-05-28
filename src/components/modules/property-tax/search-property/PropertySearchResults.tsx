"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { MasterTable, ValidationMessage } from "@/components/common";
import type {
  PropertySearchResultsProps,
  SearchResult,
} from "@/types/property-search.types";
import { usePropertySearchResults } from "@/hooks/property-search";
import { buildPropertySearchColumns } from "./results/columns";
import { ResultsHeader } from "./results/ResultsHeader";
import { TABLE_TOTAL_WIDTH } from "./results/result-styles";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function PropertySearchResults({
  selectedStatus,
  isSearchActive,
  results,
  loading = false,
  searchError = null,
}: PropertySearchResultsProps): React.ReactElement {
  const t = useTranslations("propertySearch.results");
  const locale = useLocale();

  const {
    filteredData,
    paginatedData,
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = usePropertySearchResults({ results });

  const handleExportToExcel = React.useCallback(() => {
    if (filteredData.length === 0) {
      toast.error(t("noDataToExport"));
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Property Data");
    XLSX.writeFile(workbook, "Property_Search_Results.xlsx");
  }, [filteredData, t]);

  const columns = React.useMemo(
    () => buildPropertySearchColumns(t, locale),
    [t, locale]
  );

  return (
    <div className="space-y-2">
      <ResultsHeader
        selectedStatus={selectedStatus}
        isSearchActive={isSearchActive}
        totalCount={totalCount}
        exportDisabled={filteredData.length === 0 || loading}
        onExport={handleExportToExcel}
      />

      <ValidationMessage
        message={searchError ?? undefined}
        visible={Boolean(searchError)}
        type="error"
      />

      <div className="w-full min-w-0 overflow-x-auto">
        <div style={{ minWidth: TABLE_TOTAL_WIDTH }}>
          <MasterTable<SearchResult>
            columns={columns}
            data={paginatedData}
            loading={loading}
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            containerClassName="min-w-0"
            tableClassName="table-fixed w-full"
            maxBodyHeightClassName="max-h-[calc(100vh-280px)] overflow-y-auto overflow-x-hidden"
            emptyText={searchError ? t("searchFailed") : t("noResults")}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            paginationConfig={{ enabled: true, showPageSizeSelector: true }}
            getRowKey={(row) => row.id}
          />
        </div>
      </div>
    </div>
  );
}

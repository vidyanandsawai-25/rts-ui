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

    const excelData = filteredData.map((row) => {
      return {
        [t("columns.upicId")]: row.upicId || "-",
        [t("columns.zone")]: row.zone || "-",
        [t("columns.ward")]: row.ward || "-",
        [t("columns.propertyNo")]: row.propertyNo || "-",
        [t("columns.partitionNo")]: row.partitionNo || "-",
        [t("columns.oldPropertyNo")]: row.oldPropertyNo || "-",
        [t("columns.citySurveyNo")]: row.citySurveyNo || "-",
        [t("columns.plotNo")]: row.plotNo || "-",
        [t("columns.wingFlatNo")]: row.wingFlatNo || "-",
        [t("columns.category")]: row.category || "-",
        [t("columns.description")]: row.description || "-",
        [t("columns.mobile")]: row.mobile || "-",
        [t("columns.holderName")]: row.holderName || "-",
        [t("columns.occupierName")]: row.occupierName || "-",
        [t("columns.shopBuildingName")]: row.shopBuildingName || "-",
        [t("columns.societyName")]: row.societyName || "-",
        [t("columns.address")]: row.address || "-",
        [t("columns.rv")]: row.rv != null ? row.rv : "-",
        [t("columns.cv")]: row.cv != null ? row.cv : "-",
        [t("columns.totalTax")]: row.totalTax != null ? row.totalTax : "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Property Data");

    // Auto-fit column widths
    const maxLens = Object.keys(excelData[0]).map((key) => {
      let maxLen = key.length;
      for (const row of excelData) {
        const valStr = String((row as Record<string, unknown>)[key] ?? "");
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      }
      return { wch: maxLen + 2 };
    });
    worksheet["!cols"] = maxLens;

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
        containerClassName="w-full min-w-0"
        tableClassName="table-fixed w-max min-w-full"
        maxBodyHeightClassName="max-h-[calc(100vh-280px)]"
        emptyText={searchError ? t("searchFailed") : t("noResults")}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        paginationConfig={{ enabled: true, showPageSizeSelector: true }}
        getRowKey={(row) => row.id}
      />
    </div>
  );
}

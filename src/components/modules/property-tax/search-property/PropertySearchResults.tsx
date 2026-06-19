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
  zoneOptions,
  allWardOptions,
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
      const propVal = row.partitionNo ? `${row.propertyNo}-${row.partitionNo}` : row.propertyNo;
      const oldPropVal = row.oldPropertyNo ? ` (Old: ${row.oldPropertyNo})` : "";
      const rawHolder = row.holderName?.trim() || "";
      const isPlaceholderHolder = rawHolder.toLowerCase() === "the holder";
      const holder = isPlaceholderHolder ? "" : rawHolder;
      const holderMr = isPlaceholderHolder ? "" : (row.holderNameMarathi?.trim() || "");
      
      const ownerVal = holder ? `${holder}${holderMr ? ` (${holderMr})` : ""}` : "";
      const occupierVal = row.occupierName ? `${ownerVal ? "\n" : ""}[Occupier]: ${row.occupierName}${row.occupierNameMarathi ? ` (${row.occupierNameMarathi})` : ""}` : "";
      const finalOwnerOccupier = ownerVal || occupierVal ? `${ownerVal}${occupierVal}` : "-";

      return {
        [t("columns.upicId")]: row.upicId || "-",
        [t("columns.zoneWard")]: `${row.zone || "-"} / ${row.ward || "-"}`,
        [t("columns.propertyPartition")]: `${propVal || "-"}${oldPropVal}`,
        [t("columns.category")]: row.category || "-",
        [t("columns.societyName")]: row.societyName || "-",
        [t("columns.description")]: row.description || "-",
        [t("columns.ownerOccupier")]: finalOwnerOccupier,
        [t("columns.mobileAlternate")]: `${row.mobile || "-"}${row.alternateMobile ? `\n[Alt]: ${row.alternateMobile}` : ""}`,
        [t("columns.rv")]: row.rv != null ? row.rv : "-",
        [t("columns.totalTax")]: row.totalTax != null ? row.totalTax : "-",
        [t("columns.address")]: row.address || "-",
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
    () => buildPropertySearchColumns(t, locale, zoneOptions, allWardOptions),
    [t, locale, zoneOptions, allWardOptions]
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
        tableClassName="table-fixed w-full min-w-[1800px]"
        maxBodyHeightClassName="max-h-[calc(100vh-280px)]"
        emptyText={searchError ? t("searchFailed") : t("noResults")}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        paginationConfig={{ enabled: true, showPageSizeSelector: true }}
        getRowKey={(row) => row.id}
      />
    </div>
  );
}

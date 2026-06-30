"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { ValidationMessage } from "@/components/common";
import type {
  PropertySearchResultsProps,
} from "@/types/property-search";
import { usePropertySearchResults } from "@/hooks/search-property";
import { buildPropertySearchColumns } from "./results/columns";
import { ResultsHeader } from "./results/ResultsHeader";
import { PropertySearchTable } from "./results/PropertySearchTable";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

type PageToken = number | "dots";

function buildPagination(current: number, total: number): PageToken[] {
  const pages: PageToken[] = [];
  const window = 3;
  const start = Math.max(1, current - Math.floor(window / 2));
  const end = Math.min(total, start + window - 1);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("dots");
  }

  for (let i = start; i <= end; i++) pages.push(i);

  if (end < total) {
    if (end < total - 1) pages.push("dots");
    pages.push(total);
  }

  return pages;
}

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

  const pages = React.useMemo(() => {
    return buildPagination(pageNumber, Math.max(1, totalPages));
  }, [pageNumber, totalPages]);

  const handleExportToExcel = React.useCallback(() => {
    if (filteredData.length === 0) {
      toast.error(t("noDataToExport"));
      return;
    }

    const excelData = filteredData.map((row) => ({
      "UPIC ID": row.upicId ?? "",
      Zone: row.zoneName ?? "",
      Ward: row.wardName ?? "",
      "PROP-PART NO": row.partitionNo ? `${row.propertyNo}-${row.partitionNo}` : (row.propertyNo ?? ""),
      "Old Property No.": row.oldPropertyNo ?? "",
      Category: row.category ?? "",
      "Property Description": row.description ?? "",
      "Owner Name": row.holderName ?? "",
      "Occupier Name": row.occupierName ?? "",
      "Mobile No.": row.mobile ?? "",
      "Alternate Mobile No.": row.alternateMobile ?? "",
      "Rateable Value (RV)": row.rv ?? "",
      "Capital Value (CV)": row.cv ?? "",
      Address: row.address ?? "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Property Data");

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

      <PropertySearchTable
        columns={columns}
        data={paginatedData}
        loading={loading}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        searchError={searchError}
        pages={pages}
        PAGE_SIZE_OPTIONS={PAGE_SIZE_OPTIONS}
      />
    </div>
  );
}

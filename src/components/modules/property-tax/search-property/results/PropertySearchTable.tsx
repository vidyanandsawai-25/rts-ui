"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { fetchApartmentUnitListAction } from "@/app/[locale]/property-tax/search-property/action";
import { cn } from "@/lib/utils/cn";
import { WRAP_HEADER, WRAP_CELL } from "./result-styles";
import { ApartmentUnitsSubTable } from "./ApartmentUnitsSubTable";
import { PropertySearchPagination } from "./PropertySearchPagination";
import type { SearchResult } from "@/types/property-search";
import type { Column } from "@/components/common";

interface PropertySearchTableProps {
  columns: Column<SearchResult>[];
  data: SearchResult[];
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchError: string | null;
  pages: (number | "dots")[];
  PAGE_SIZE_OPTIONS: number[];
}

export function PropertySearchTable({
  columns,
  data,
  loading,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  searchError,
  pages,
  PAGE_SIZE_OPTIONS,
}: PropertySearchTableProps) {
  const t = useTranslations("propertySearch.results");
  const tCommon = useTranslations("common");

  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const [unitsData, setUnitsData] = React.useState<Record<number, SearchResult[]>>({});
  const [unitsLoading, setUnitsLoading] = React.useState<Record<number, boolean>>({});
  const [unitsError, setUnitsError] = React.useState<Record<number, string | null>>({});

  const isRowExpandable = React.useCallback((row: SearchResult) => {
    return (
      row.category?.toLowerCase() === "apartment" &&
      (!row.partitionNo || row.partitionNo.trim() === "")
    );
  }, []);

  const toggleRow = async (row: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    const rowKey = String(row.id);
    const wasExpanded = !!expandedRows[rowKey];
    const isExpanding = !wasExpanded;

    setExpandedRows((prev) => ({ ...prev, [rowKey]: isExpanding }));

    if (isExpanding && !unitsData[row.propertyId] && !unitsLoading[row.propertyId]) {
      setUnitsLoading((prev) => ({ ...prev, [row.propertyId]: true }));
      setUnitsError((prev) => ({ ...prev, [row.propertyId]: null }));
      try {
        const res = await fetchApartmentUnitListAction(row.propertyId);
        if (res.error) {
          setUnitsError((prev) => ({ ...prev, [row.propertyId]: res.error }));
        } else {
          setUnitsData((prev) => ({ ...prev, [row.propertyId]: res.items || [] }));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load apartment units";
        setUnitsError((prev) => ({ ...prev, [row.propertyId]: msg }));
      } finally {
        setUnitsLoading((prev) => ({ ...prev, [row.propertyId]: false }));
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <div className="border border-blue-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-280px)]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-20 bg-gradient-to-r from-[#E2EEFF] via-[#D6E8FF] to-[#E2EEFF] border-b border-blue-200 transition-colors duration-200 hover:from-[#D6E8FF] hover:via-[#CFE3FF] hover:to-[#D6E8FF]">
              <tr>
                <th className="w-10 px-2 py-3 text-center text-sm font-semibold text-[#1E3A8A] rounded-tl-lg" />
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    style={{ width: col.width }}
                    className={cn(
                      "px-2 py-3 text-sm font-semibold text-[#1E3A8A]",
                      col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left",
                      WRAP_HEADER,
                      col.headerClassName
                    )}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-10 text-center text-gray-500">
                    {tCommon("actions.loading")}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-10 text-center text-gray-500">
                    {searchError ? t("searchFailed") : t("noResults")}
                  </td>
                </tr>
              ) : (
                data.map((row, i) => {
                  const rowKey = String(row.id);
                  const expandable = isRowExpandable(row);
                  const isExpanded = !!expandedRows[rowKey];

                  return (
                    <React.Fragment key={rowKey}>
                      <tr className="border-b border-blue-100 hover:bg-blue-50/40">
                        <td className="w-10 px-2 py-2 text-center align-middle">
                          {expandable ? (
                            <button
                              type="button"
                              onClick={(e) => toggleRow(row, e)}
                              className="p-1 hover:bg-blue-50 rounded text-[#1E3A8A] flex items-center justify-center mx-auto transition-transform duration-200"
                              aria-label={isExpanded ? "Collapse row" : "Expand row"}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={cn(
                                  "w-3.5 h-3.5 transform transition-transform duration-200",
                                  isExpanded ? "rotate-90" : "rotate-0"
                                )}
                              >
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            </button>
                          ) : null}
                        </td>

                        {columns.map((col) => (
                          <td
                            key={String(col.key)}
                            className={cn(
                              "px-2 py-2 text-gray-700",
                              col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left",
                              WRAP_CELL,
                              col.cellClassName
                            )}
                          >
                            {col.render ? col.render(row[col.key], row, i) : String(row[col.key] ?? "-")}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/50 border-b border-blue-50 hover:bg-transparent">
                          <td colSpan={columns.length + 1} className="px-6 py-4 align-top">
                            <ApartmentUnitsSubTable
                              units={unitsData[row.propertyId] || []}
                              loading={!!unitsLoading[row.propertyId]}
                              error={unitsError[row.propertyId] || null}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data.length > 0 && (
          <PropertySearchPagination
            pageNumber={pageNumber}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pages={pages}
            PAGE_SIZE_OPTIONS={PAGE_SIZE_OPTIONS}
          />
        )}
      </div>
    </div>
  );
}

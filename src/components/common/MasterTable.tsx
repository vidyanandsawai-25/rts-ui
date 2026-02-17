"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { StatusBadge } from "./StatusBadge";
import { DeleteButton, EditButton, FirstPageButton, LastPageButton, NextPageButton, PageNumberButton, PrevPageButton } from "./ActionButtons";

function isPrimitive(val: unknown): val is string | number | boolean | null | undefined {
  return (
    typeof val === "string" ||
    typeof val === "number" ||
    typeof val === "boolean" ||
    val === null ||
    typeof val === "undefined"
  );
}

export interface Column<T extends Record<string, unknown> = Record<string, unknown>> {
  key: keyof T;
  label: string;
  width?: string;
  isStatus?: boolean;
  render?: (
    value: T[keyof T] | undefined,
    row: T,
    rowIndex: number
  ) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface MasterTableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;

  /**
   * The current page number (1-based index).
   */
  pageNumber?: number;

  /**
   * The number of items to display per page.
   */
  pageSize?: number;

  /**
   * The total number of items in the dataset.
   */
  totalCount?: number;

  /**
   * The total number of pages available.
   */
  totalPages?: number;

  /**
   * Callback triggered when the page number changes.
   * @param page The new page number.
   */
  onPageChange?: (page: number) => void;

  /**
   * Callback triggered when the page size changes.
   * @param size The new page size.
   *
   * Missing test coverage:
   * - Ensure the page size selector renders when `isPageSize` is true and `isPagination` is false.
   * - Ensure the page size selector renders when both `isPageSize` and `isPagination` are true.
   * - Verify `onPageSizeChange` is invoked when the user changes the page size.
   * - Test customization of the `pageSizeOptions` prop.
   */
  onPageSizeChange?: (size: number) => void;

  /**
   * Controls whether pagination is enabled.
   */
  isPagination?: boolean;

  /**
   * @deprecated Use `paginationConfig.showPageSizeSelector` instead.
   * This flag controls whether the page size selector dropdown is shown.
   */
  isPageSize?: boolean;

  /**
   * Options for the page size selector dropdown.
   * Example: [5, 10, 20, 50]
   */
  pageSizeOptions?: number[];

  /**
   * Configuration for pagination behavior.
   */
  paginationConfig?: {
    /**
     * Whether pagination is enabled.
     */
    enabled: boolean;

    /**
     * Whether the page size selector dropdown is shown.
     */
    showPageSizeSelector?: boolean;
  };

  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actionLabel?: string;

  getRowKey?: (row: T, index: number) => React.Key;
  maxBodyHeightClassName?: string;
  emptyText?: string;
  loadingText?: string;

  containerClassName?: string;
  tableClassName?: string;
  theadClassName?: string;
  rowClassName?: (row: T, index: number) => string;

  /* ===== HEADER ===== */
  headerTitle?: string;
  headerSubtitle?: string;

  headerExtra?: React.ReactNode;
  /* ===== FOOTER ===== */
  footerLeftContent?: React.ReactNode;
  footerRightContent?: React.ReactNode;
}

type PageToken = number | "dots";

/* =========================
   PAGINATION
========================= */

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

/* =========================
   MASTER TABLE
========================= */

export function MasterTable<T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  data,
  loading,
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isPagination,
  /**
   * @deprecated Use `paginationConfig.showPageSizeSelector` instead.
   * This flag controls whether the page size selector dropdown is shown.
   */
  isPageSize,
  /**
   * Configuration for pagination behavior.
   */
  paginationConfig,
  onEdit,
  onDelete,
  actionLabel,

  getRowKey,
  maxBodyHeightClassName = "max-h-[calc(100vh-260px)]",
  emptyText,
  loadingText,
  containerClassName,
  tableClassName,
  theadClassName,
  rowClassName,

  headerTitle,
  headerSubtitle,
  headerExtra,
  footerLeftContent,
  footerRightContent,
  pageSizeOptions = [5, 10, 20, 50],
}: MasterTableProps<T>) {
  const t = useTranslations("common");

  // Use translations for default values
  const actualActionLabel = actionLabel || t("table.columns.actions");
  const actualEmptyText = emptyText || t("messages.noData");
  const actualLoadingText = loadingText || t("actions.loading");

  const hasActions = !!(onEdit || onDelete);
  const hasHeader =
    !!headerTitle ||
    !!headerSubtitle ||
    !!headerExtra

  const hasFooter = !!(footerLeftContent || footerRightContent);

  const safePageNumber = typeof pageNumber === "number" ? pageNumber : 1;

  const start = !totalCount || !safePageNumber || !pageSize ? 0 : (safePageNumber - 1) * pageSize + 1;
  const end = !totalCount || !safePageNumber || !pageSize ? 0 : Math.min(safePageNumber * pageSize, totalCount);

  const pages = useMemo(
    () => (safePageNumber && totalPages) ? buildPagination(safePageNumber, Math.max(1, totalPages)) : [],
    [safePageNumber, totalPages]
  );

  // Define showPageSizeSelector based on paginationConfig or fallback to isPageSize
  const showPageSizeSelector = paginationConfig?.showPageSizeSelector ?? isPageSize;

  /* =========================
     TABLE
  ========================= */
  const TableContent = (
    <div className={cn("overflow-auto", maxBodyHeightClassName)}>
      <table className={cn("w-full text-sm", tableClassName)}>
        <thead
          className={cn(
            "sticky top-0 z-20",
            "bg-gradient-to-r from-[#E2EEFF] via-[#D6E8FF] to-[#E2EEFF]",
            "border-b border-blue-200",
            "transition-colors duration-200",
            "hover:from-[#D6E8FF] hover:via-[#CFE3FF] hover:to-[#D6E8FF]",

            theadClassName
          )}
        >
          <tr>
            {columns.map((col, index) => (
              <th
                key={String(col.key)}
                style={{ width: col.width }}
                className={cn(
                  "px-2 py-3 text-left text-sm font-semibold text-[#1E3A8A]",
                  index === 0 && "rounded-tl-lg",
                  !hasActions &&
                  index === columns.length - 1 &&
                  "rounded-tr-lg",
                  col.headerClassName
                )}
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-4 py-3 text-center text-sm font-semibold text-[#1E3A8A]">
                {actualActionLabel}
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="py-10 text-center text-gray-500"
              >
                {actualLoadingText}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (hasActions ? 1 : 0)}
                className="py-10 text-center text-gray-500"
              >
                {actualEmptyText}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={getRowKey ? getRowKey(row, i) : i}
                className={cn(
                  "border-b border-blue-100 hover:bg-blue-50/40",
                  rowClassName?.(row, i)
                )}
              >
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "px-2 py-2 text-gray-700",
                        col.cellClassName
                      )}
                    >
                      {col.render ? (
                        col.render(value, row, i)
                      ) : col.isStatus ? (
                        isPrimitive(value)
                          ? <StatusBadge value={value} />
                          : <span className="font-medium">-</span>
                      ) : (
                        <span className="font-medium">
                          {value === null || typeof value === "undefined"
                            ? "-"
                            : isPrimitive(value)
                              ? String(value)
                              : "-"}
                        </span>
                      )}
                    </td>
                  );
                })}

                {hasActions && (
                  <td className="px-2 py-2 text-center">
                    <div className="flex justify-center gap-3">
                      {onEdit && (
                        <EditButton
                          size="sm"
                          onClick={() => onEdit(row)}
                        />
                      )}
                      {onDelete && (
                        <DeleteButton
                          size="sm"
                          onClick={() => onDelete(row)}
                        />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-4", containerClassName)}>
      <div className="border border-blue-200 rounded-xl bg-white shadow-sm">

        {/* ================= HEADER ================= */}
        {hasHeader && (
          <div className="px-4 py-3 border-b rounded-t-xl border-blue-200 bg-[#F8FAFF]">
            {/* TITLE + SUBTITLE */}
            {(headerTitle || headerSubtitle) && (
              <div className="mb-3">
                {headerTitle && (
                  <h3 className="text-sm font-semibold text-[#1E3A8A]">
                    {headerTitle}
                  </h3>
                )}
                {headerSubtitle && (
                  <p className="text-xs text-gray-500">
                    {headerSubtitle}
                  </p>
                )}
              </div>
            )}

            {/* EXTRA HEADER (HORIZONTAL FILTER BAR) */}
            {headerExtra && (
              <div className="flex items-center gap-3 flex-wrap">
                {headerExtra}
              </div>
            )}
          </div>
        )}

        {TableContent}

        {/* ================= FOOTER ================= */}
        {hasFooter && (
          <div className="flex items-center justify-between px-4 py-3 border-t rounded-xl border-blue-200 bg-[#F8FAFF]">
            <div className="text-sm font-medium text-[#1E3A8A]">
              {footerLeftContent}
            </div>
            <div className="flex items-center gap-2">
              {footerRightContent}
            </div>
          </div>
        )}
      </div>

      {/* ================= PAGE SIZE ONLY ================= */}
      {!isPagination && isPageSize && pageSize && totalCount !== undefined && onPageSizeChange && (
        <div className="bg-[#F8FAFF] border border-[#DCEAFF] rounded-xl px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            {(() => {
              // Extracted page size selector logic to avoid duplication.
              // Consider creating a reusable PageSizeSelector component for better maintainability.
              const safePageSize = pageSize || 10;
              const startEntry = totalCount === 0 ? 0 : (safePageNumber - 1) * safePageSize + 1;
              const text = t("table.showingEntries", {
                start: startEntry,
                end: "DROPDOWN_PLACEHOLDER",
                total: totalCount || 0,
              });
              const parts = text.split("DROPDOWN_PLACEHOLDER");
              return (
                <>
                  {parts[0]}
                  <select
                    value={safePageSize}
                    onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                    disabled={!onPageSizeChange}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mx-1"
                  >
                    {pageSizeOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {parts[1]}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {isPagination &&
        typeof pageNumber === "number" &&
        typeof totalPages === "number" &&
        onPageChange && (
          <div className="bg-[#F8FAFF] border border-[#DCEAFF] rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
            {showPageSizeSelector ? (
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                {(() => {
                  const safePageSize = pageSize || 10;
                  const startEntry = totalCount === 0 ? 0 : (safePageNumber - 1) * safePageSize + 1;
                  const text = t("table.showingEntries", {
                    start: startEntry,
                    end: "DROPDOWN_PLACEHOLDER",
                    total: totalCount || 0,
                  });
                  const parts = text.split("DROPDOWN_PLACEHOLDER");
                  return (
                    <>
                      {parts[0]}
                      <select
                        value={safePageSize}
                        onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                        disabled={!onPageSizeChange}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mx-1"
                      >
                        {pageSizeOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {parts[1]}
                    </>
                  );
                })()}
              </div>
            ) : (
              <span className="text-sm text-[#6B7280]">
                {t("table.showingEntries", {
                  start,
                  end,
                  total: totalCount || 0,
                })}
              </span>
            )}

            <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
              <PrevPageButton
                disabled={safePageNumber <= 1}
                onClick={() => onPageChange(safePageNumber - 1)}
              />

              <span className="md:hidden text-sm font-semibold text-[#1E3A8A]">
                {t("table.page", {
                  current: safePageNumber,
                  total: totalPages,
                })}
              </span>

              <div className="hidden md:flex element-center gap-1">
                <FirstPageButton
                  disabled={safePageNumber === 1}
                  onClick={() => onPageChange(1)}
                />

                {pages.map((p, i) =>
                  p === "dots" ? (
                    <span key={`dots-${i}`} className="px-2 text-[#94A3B8]">
                      ...
                    </span>
                  ) : (
                    <PageNumberButton
                      key={`page-${p}-${i}`}
                      page={p as number}
                      active={safePageNumber === p}
                      onClick={() => onPageChange(p as number)}
                    />
                  ),
                )}

                <LastPageButton
                  disabled={safePageNumber === totalPages}
                  onClick={() => onPageChange(totalPages)}
                />
              </div>

              <NextPageButton
                disabled={safePageNumber >= totalPages}
                onClick={() => onPageChange(safePageNumber + 1)}
              />
            </div>
          </div>
        )}

        // Add standalone dropdown rendering logic
        {!isPagination && showPageSizeSelector && (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <select
              value={pageSize || 10}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mx-1"
            >
              {pageSizeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
    </div>
  );
}
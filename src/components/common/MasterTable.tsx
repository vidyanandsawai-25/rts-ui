"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { AddButton, EditButton, DeleteButton } from "./ActionButtons";
import { StatusBadge } from "./StatusBadge";
// ...existing code...



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

  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;

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

  // ===== FOOTER =====
  footerLeftContent?: React.ReactNode;
  footerRightContent?: React.ReactNode;

  /* ===== HEADER ===== */
  headerTitle?: string;
  headerSubtitle?: string;
  headerExtra?: React.ReactNode;
  /* ===== FOOTER ===== */
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
  onEdit,
  onDelete,
  actionLabel,

  getRowKey,
  maxBodyHeightClassName = "max-h-[calc(100vh-260px)]",
  emptyText,
  loadingText,

  // ...existing code...
  tableClassName,
  theadClassName,
  rowClassName,

  headerTitle,
  headerSubtitle,
  headerExtra,
  footerLeftContent,
  footerRightContent,
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

  const start = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount);

  const pages = useMemo(
    () => buildPagination(pageNumber, Math.max(1, totalPages)),
    [pageNumber, totalPages]
  );

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
                      index === 0 ,
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
                              <StatusBadge value={
                                value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
                                  ? value as string | number | boolean | null | undefined
                                  : String(value)
                              } />
                            ) : (
                              <span className="font-medium">
                                {value != null && value !== undefined ? String(value) : "-"}
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
    <div className="flex flex-col gap-4">
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

      {/* ================= PAGINATION ================= */}

      <div className="bg-[#F8FAFF] border border-[#DCEAFF] rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
        <span className="text-sm text-[#6B7280]">
          {t("table.showingEntries", { start, end, total: totalCount })}
        </span>

        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
            <AddButton
              size="sm"
              disabled={pageNumber <= 1}
              onClick={() => onPageChange(pageNumber - 1)}
              label="‹"
              className="h-9 w-9 px-0 border border-[#DCEAFF]"
            />

          <span className="md:hidden text-sm font-semibold text-[#1E3A8A]">
            {t("table.page", { current: pageNumber, total: totalPages })}
          </span>

          <div className="hidden md:flex items-center gap-1">
              <AddButton
                size="sm"
                disabled={pageNumber === 1}
                onClick={() => onPageChange(1)}
                label="«"
                className="h-9 w-9 px-0 border border-[#DCEAFF]"
              />


            {pages.map((p, i) =>
              p === "dots" ? (
                <span key={`dots-${i}`} className="px-2 text-[#94A3B8]">
                  ...
                </span>
              ) : (
                <AddButton
                  key={`page-${p}-${i}`}
                  size="sm"
                  label={String(p)}
                  onClick={() => onPageChange(p as number)}
                  className={cn(
                    "h-9 min-w-[36px] px-3 text-sm font-medium",
                    pageNumber === p
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-white border border-[#DCEAFF] text-[#1E3A8A] hover:bg-gray-50"
                  )}
                />
              )
            )}


              <AddButton
                size="sm"
                disabled={pageNumber === totalPages}
                onClick={() => onPageChange(totalPages)}
                label="»"
                className="h-9 w-9 px-0 border border-[#DCEAFF]"
              />
          </div>

            <AddButton
              size="sm"
              disabled={pageNumber >= totalPages}
              onClick={() => onPageChange(pageNumber + 1)}
              label="›"
              className="h-9 w-9 px-0 border border-[#DCEAFF]"
            />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./Button";
import { StatusBadge } from "./StatusBadge";
import { EditButton, DeleteButton } from "./ActionButtons";
export interface Column<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  key: string | number;
  label: string;
  width?: string;
  isStatus?: boolean;
  render?: (
    value: unknown,
    row: T,
    rowIndex: number
  ) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface MasterTableProps<
  T extends Record<string, unknown> = Record<string, unknown>
> {
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
}

type PageToken = number | "dots";


/* =========================
   HELPERS
========================= */
function buildPagination(current: number, total: number): PageToken[] {
  const windowSize = 3;
  const pages: PageToken[] = [];
  const seen = new Set<number | "dots">();

  const add = (p: PageToken) => {
    if (!seen.has(p)) {
      seen.add(p);
      pages.push(p);
    }
  };

  let start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);

  if (end - start < windowSize - 1) {
    start = Math.max(1, end - windowSize + 1);
  }

  // First page
  if (start > 1) {
    add(1);
    if (start > 2) add("dots");
  }

  // Window pages
  for (let i = start; i <= end; i++) {
    add(i);
  }

  // Last page
  if (end < total) {
    if (end < total - 1) add("dots");
    add(total);
  }

  return pages;
}


/* =========================
   REUSABLE STATUS BADGE
========================= */

/* =========================
   MASTER TABLE
========================= */
export function MasterTable<
  T extends Record<string, unknown> = Record<string, unknown>
>({
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
  actionLabel = "Actions",

  getRowKey,
  maxBodyHeightClassName = "max-h-[calc(100vh-260px)]",
  emptyText = "No records found",
  loadingText = "Loading...",

  containerClassName,
  tableClassName,
  theadClassName,
  rowClassName,
}: MasterTableProps<T>) {
  const hasActions = !!(onEdit || onDelete);

  const start = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end =
    totalCount === 0 ? 0 : Math.min(pageNumber * pageSize, totalCount);

  const pages = useMemo(
    () => buildPagination(pageNumber, Math.max(1, totalPages)),
    [pageNumber, totalPages]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* TABLE */}
      <div
        className={cn(
          "bg-white rounded-xl border border-blue-200 overflow-hidden",
          containerClassName
        )}
      >
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
                    key={col.key}
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
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[#1E3A8A] rounded-tr-lg">
                    {actionLabel}
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
                    {loadingText}
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasActions ? 1 : 0)}
                    className="py-10 text-center text-gray-500"
                  >
                    {emptyText}
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
                      const value = row[col.key as keyof T];
                      const statusValue = value as string | number | boolean | null | undefined;
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
                            <StatusBadge value={statusValue} />
                          ) : (
                            <span className="font-medium">
                              {String(value ?? "-")}
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
                              onClick={() => onEdit(row)}
                            />
                          )}
                          {onDelete && (
                            <DeleteButton
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
      </div>

      {/* RESPONSIVE PAGINATION */}
      <div className="bg-[#F8FAFF] border border-[#DCEAFF] rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
        <span className="text-sm text-[#6B7280]">
          Showing {start} to {end} of {totalCount} entries
        </span>

        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
          <Button
            variant="ghost"
            size="sm"
            disabled={pageNumber <= 1}
            onClick={() => onPageChange(pageNumber - 1)}
            className="h-9 w-9 px-0 border border-[#DCEAFF]"
          >
            ‹
          </Button>

          <span className="md:hidden text-sm font-semibold text-[#1E3A8A]">
            Page {pageNumber} of {totalPages}
          </span>

          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pageNumber === 1}
              onClick={() => onPageChange(1)}
              className="h-9 w-9 px-0 border border-[#DCEAFF]"
            >
              «
            </Button>


            {pages.map((p, i) =>
              p === "dots" ? (
                <span key={`dots-${i}`} className="px-2 text-[#94A3B8]">
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${p}-${i}`}
                  size="sm"
                  onClick={() => onPageChange(p)}
                  variant={pageNumber === p ? "primary" : "secondary"}
                  className={cn(
                    "h-6 min-w-6 px-3 text-sm font-medium bg-gray-100",
                    pageNumber === p
                      ? "bg-[#2563EB] text-white border-[#2563EB]"
                      : "bg-white border border-[#DCEAFF] text-[#1E3A8A] hover:bg-gray-100"
                  )}
                >
                  {String(p)}
                </Button>
              )
            )}


            <Button
              variant="ghost"
              size="sm"
              disabled={pageNumber === totalPages}
              onClick={() => onPageChange(totalPages)}
              className="h-9 w-9 px-0 border border-[#DCEAFF]"
            >
              »
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={pageNumber >= totalPages}
            onClick={() => onPageChange(pageNumber + 1)}
            className="h-9 w-9 px-0 border border-[#DCEAFF]"
          >
            ›
          </Button>
        </div>
      </div>
    </div>
  );
}

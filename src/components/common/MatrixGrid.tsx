
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Tooltip from "./Tooltip";
import { cn } from "@/lib/utils/cn";

/* ================= TYPES ================= */

export interface MatrixColumn {
  id: string;
  label: string | React.ReactNode;
  unit?: string;
  headerClassName?: string;
  tooltip?: string;
  width?: string;
}

export interface MatrixRow {
  id: string;
  cells: Record<string, string | number>;
  meta?: Record<string, React.ReactNode>;
}

interface MatrixGridProps {
  columns: MatrixColumn[];
  rows: MatrixRow[];
  metaColumns?: { id: string; label: string | React.ReactNode; width?: string }[];
 
  colorMap?: Record<string, string>;

  mode?: "view" | "edit";                 
  editableColumns?: string[];              
  onCellChange?: (                          
    rowId: string,
    columnId: string,
    value: number
  ) => void;
  onRowDelete?: (index: number) => void;
 
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
}

/* ================= COMPONENT ================= */

const MatrixGrid: React.FC<MatrixGridProps> = ({
  columns,
  rows,
  metaColumns = [],
  colorMap = {},

  mode = "view",
  editableColumns = [],
  onCellChange,
  onRowDelete,
}) => {
  const t = useTranslations('common.Grid');
  const isEditable = mode === "edit";

  /* 🔹 Separate rate columns WITHOUT hardcoding */
  const rateColumns = columns.filter(
    (col) => !metaColumns.some((meta) => meta.id === col.id)
  );

// Dynamic grid template columns
  const metaWidths = metaColumns.length > 0
    ? metaColumns.map((c, i) => c.width || (i === 0 ? "minmax(100px, 1fr)" : i === 1 ? "minmax(180px, 2fr)" : "minmax(100px, 1fr)")).join(" ")
    : "minmax(100px, 1fr) minmax(180px, 2fr)";
 
  const actionWidth = onRowDelete ? "minmax(80px, 0.5fr)" : "";
 
  const gridTemplateColumns = `
    ${metaWidths}
    repeat(${rateColumns.length}, minmax(120px, 1fr))
    ${actionWidth}
  `;


  return (
    <div className="w-full">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-1 md:px-2 py-1 md:py-2">
        <div
          style={{ minWidth: `${280 + rateColumns.length * 120 + (onRowDelete ? 80 : 0)}px`, width: "100%" }}
          className="bg-white rounded-lg md:rounded-2xl overflow-hidden shadow-lg"
        >
          {/* ================= HEADER ================= */}
          <div className="grid gap-0 bg-blue-50" style={{ gridTemplateColumns }}>
            {/* Meta headers */}
            {metaColumns.map((meta) => (
              <div
                key={meta.id}
                className="px-2 md:px-3 py-1.5 md:py-2 bg-blue-50 text-sm text-blue-700 font-semibold text-base flex items-center justify-center rounded-lg"
              >
                {meta.label}
              </div>
            ))}

            {/* Rate headers */}
            {rateColumns.map((col) => {
              const colorClass =
                colorMap[col.id?.toUpperCase()] || col.headerClassName || "";

              const headerCell = (
                <div
                  className={cn(
                    "px-2 md:px-3 py-1.5 md:py-2 font-bold text-xs md:text-sm rounded-lg md:rounded-xl text-center w-full flex flex-col items-center justify-center",
                    colorClass
                  )}
                >
                  <div>{col.label}</div>
                  {col.unit && (
                    <div className="text-[9px] md:text-[10px] mt-0.5 opacity-75">
                      ({col.unit})
                    </div>
                  )}
                </div>
              );

              return col.tooltip ? (
                <Tooltip key={col.id} content={col.tooltip} placement="top">
                  {headerCell}
                </Tooltip>
              ) : (
                <React.Fragment key={col.id}>{headerCell}</React.Fragment>
              );
            })}
 
            {/* Action Header */}
            {onRowDelete && (
                <div className="px-2 md:px-3 py-1.5 md:py-2 bg-blue-50 text-sm text-blue-700 font-semibold text-base flex items-center justify-center rounded-lg">
                    {t('action')}
                </div>
            )}
          </div>

          {/* ================= ROWS ================= */}
          <div className="space-y-0">
            {rows.map((row, rowIndex) => (
              <div
                key={row.id}
                className="grid gap-0 items-center"
                style={{ gridTemplateColumns }}
              >
                {/* Meta cells */}
                {metaColumns.map((meta) => (
                  <div key={meta.id} className="px-1 md:px-2 py-1.5 md:py-2">
                     <div className="px-2 md:px-3 py-1.5 md:py-2 bg-white text-blue-700 rounded-lg md:rounded-xl font-medium text-xs md:text-sm border border-gray-300 text-center"> 
                      {row.meta?.[meta.id]}
                     </div> 
                  </div>
                ))}

                {/* Rate cells */}
                {rateColumns.map((col) => {
                  const colorClass =
                    colorMap[col.id?.toUpperCase()] || "";

                  const rawValue = row.cells[col.id];
                  const value = Number(rawValue) || 0;

                  const canEdit =
                    isEditable &&
                    editableColumns.includes(col.id) &&
                    typeof onCellChange === "function";

                  return (
                    <div key={col.id} className="px-1 md:px-2 py-1.5 md:py-2">
                      {canEdit ? (
                        <input
                          type="number"
                          value={value === 0 ? "" : value}
                          onChange={(e) => {
                            let val = e.target.value === "" ? 0 : Number(e.target.value);
                            if (val < 0) val = 0;
                            onCellChange(row.id, col.id, val);
                          }}
                          placeholder="0"
                          className={cn(
                            "px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-center border border-gray-300 bg-white w-full outline-none focus:ring-2 focus:ring-blue-400",
                            colorClass
                          )}
                        />
                      ) : (
                        <div
                          className={cn(
                            "px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-center border border-gray-300 bg-white",
                            colorClass
                          )}
                        >
                          {t('currencySymbol')}{value.toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}
 
                {/* Action Cell */}
                {onRowDelete && (
                    <div className="px-1 md:px-2 py-1.5 md:py-2 flex justify-center gap-2">
                        <button
                        onClick={() => onRowDelete(rowIndex)}
                        className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrixGrid;





import React from "react";
import { Tooltip } from "./Tooltip";
import { cn } from "@/lib/utils/cn";
import { MatrixCellInput } from "./MatrixCellInput";
import { MatrixDeleteButton } from "./MatrixDeleteButton";

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

export interface MatrixGridProps {
  columns: MatrixColumn[];
  rows: MatrixRow[];
  metaColumns?: { id: string; label: string | React.ReactNode; width?: string }[];
  colorMap?: Record<string, string>;
  mode?: "view" | "edit";
  editableColumns?: string[];
  onCellChange?: (rowId: string, columnId: string, value: number) => void;
  onRowDelete?: (index: number) => void;
  translations: {
    action: string;
    currencySymbol: string;
    deleteRow: string;
  };
}

/* ================= HELPER FUNCTIONS ================= */

/**
 * Determine width of a meta column based on index or explicit width
 */
function getMetaWidth(
  column: NonNullable<MatrixGridProps["metaColumns"]>[number],
  index: number
): string {
  if (column.width) return column.width;

  switch (index) {
    case 0:
      return "minmax(100px, 1fr)";
    case 1:
      return "minmax(180px, 2fr)";
    default:
      return "minmax(100px, 1fr)";
  }
}

/**
 * Render meta column header
 */
function renderMetaHeader(
  meta: { id: string; label: string | React.ReactNode; width?: string }
): React.ReactElement {
  return (
    <div
      key={meta.id}
      role="columnheader"
      className="px-2 md:px-3 py-1.5 md:py-2 bg-blue-50 text-sm text-blue-700 font-semibold text-base flex items-center justify-center rounded-lg"
    >
      {meta.label}
    </div>
  );
}

/**
 * Render rate column header with optional tooltip
 */
function renderRateHeader(
  col: MatrixColumn,
  colorMap: Record<string, string>
): React.ReactElement {
  const colorClass: string =
    colorMap[col.id?.toUpperCase()] || col.headerClassName || "";

  const headerCell: React.ReactNode = (
    <div
      role="columnheader"
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
}

/**
 * Render meta cell content
 */
function renderMetaCell(
  meta: { id: string; label: string | React.ReactNode; width?: string },
  row: MatrixRow
): React.ReactElement {
  return (
    <div
      role="cell"
      key={meta.id}
      className="px-1 md:px-2 py-1.5 md:py-2"
    >
      <div className="px-2 md:px-3 py-1.5 md:py-2 bg-white text-blue-700 rounded-lg md:rounded-xl font-medium text-xs md:text-sm border border-gray-300 text-center">
        {row.meta?.[meta.id]}
      </div>
    </div>
  );
}

/**
 * Render rate cell (editable or view mode)
 */
function renderRateCell(
  col: MatrixColumn,
  row: MatrixRow,
  colorMap: Record<string, string>,
  isEditable: boolean,
  editableColumns: string[],
  translations: { currencySymbol: string },
  metaColumns: { id: string; label: string | React.ReactNode; width?: string }[],
  onCellChange?: (rowId: string, columnId: string, value: number) => void
): React.ReactElement {
  const colorClass: string = colorMap[col.id.toUpperCase()] || "";
  const rawValue = row.cells[col.id];
  const value: number = Number(rawValue) || 0;

  const canEdit: boolean =
    isEditable &&
    editableColumns.includes(col.id) &&
    typeof onCellChange === "function";

  return (
    <div
      role="cell"
      key={col.id}
      className="px-1 md:px-2 py-1.5 md:py-2"
    >
      {canEdit ? (
        <MatrixCellInput
          value={value}
          rowId={row.id}
          columnId={col.id}
          metaLabel={`${String(col.label)} for ${String(
            row.meta?.[metaColumns[0]?.id] ?? row.id
          )}`}
          colorClass={colorClass}
          onCellChange={onCellChange}
        />
      ) : (
        <div
          className={cn(
            "px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold text-xs md:text-sm text-center border border-gray-300 bg-white",
            colorClass
          )}
        >
          {translations.currencySymbol}
          {value.toFixed(2)}
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENT ================= */

export const MatrixGrid = ({
  columns,
  rows,
  metaColumns = [],
  colorMap = {},
  mode = "view",
  editableColumns = [],
  onCellChange,
  onRowDelete,
  translations,
}: MatrixGridProps): React.ReactElement => {
  const isEditable = mode === "edit";

  // Separate rate columns
  const rateColumns: MatrixColumn[] = columns.filter(
    (col) => !metaColumns.some((meta) => meta.id === col.id)
  );

  // Dynamic grid template columns
  const metaWidths: string =
    metaColumns.length > 0
      ? metaColumns.map((col, i): string => getMetaWidth(col, i)).join(" ")
      : "minmax(100px, 1fr) minmax(180px, 2fr)";

  const actionWidth: string = onRowDelete ? "minmax(80px, 0.5fr)" : "";

  const gridTemplateColumns: string = `
    ${metaWidths}
    repeat(${rateColumns.length}, minmax(120px, 1fr))
    ${actionWidth}
  `;

  const totalColumns: number =
    metaColumns.length + rateColumns.length + (onRowDelete ? 1 : 0);

  return (
    <div className="w-full">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-1 md:px-2 py-1 md:py-2">
        <div
          role="table"
          aria-label="Matrix grid"
          aria-colcount={totalColumns}
          style={{
            minWidth: `${280 + rateColumns.length * 120 + (onRowDelete ? 80 : 0)}px`,
            width: "100%",
          }}
          className="bg-white rounded-lg md:rounded-2xl overflow-hidden shadow-lg"
        >
          {/* ================= HEADER ================= */}
          <div
            role="row"
            className="grid gap-0 bg-blue-50"
            style={{ gridTemplateColumns }}
          >
            {/* Meta headers */}
            {metaColumns.map((meta): React.ReactElement => renderMetaHeader(meta))}

            {/* Rate headers */}
            {rateColumns.map((col): React.ReactElement => renderRateHeader(col, colorMap))}

            {/* Action header */}
            {onRowDelete && (
              <div
                role="columnheader"
                className="px-2 md:px-3 py-1.5 md:py-2 bg-blue-50 text-sm text-blue-700 font-semibold text-base flex items-center justify-center rounded-lg"
              >
                {translations.action}
              </div>
            )}
          </div>

          {/* ================= ROWS ================= */}
          <div role="rowgroup" className="space-y-0">
            {rows.map(
              (row, rowIndex) => (
                <div
                  role="row"
                  key={row.id}
                  className="grid gap-0 items-center"
                  style={{ gridTemplateColumns }}
                >
                  {/* Meta cells */}
                  {metaColumns.map((meta): React.ReactElement => renderMetaCell(meta, row))}

                  {/* Rate cells */}
                  {rateColumns.map((col): React.ReactElement =>
                    renderRateCell(
                      col,
                      row,
                      colorMap,
                      isEditable,
                      editableColumns,
                      translations,
                      metaColumns,
                      onCellChange
                    )
                  )}

                  {/* Action cell */}
                  {onRowDelete && (
                    <div
                      role="cell"
                      className="px-1 md:px-2 py-1.5 md:py-2 flex justify-center gap-2"
                    >
                      <MatrixDeleteButton
                        rowIndex={rowIndex}
                        onRowDelete={onRowDelete}
                        ariaLabel={translations.deleteRow}
                      />
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
MatrixGrid.displayName = 'MatrixGrid';
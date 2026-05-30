"use client";

import React from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SortableColumnHeader, Select, MatrixCellInput } from "@/components/common";
import { YEAR_REGEX } from "@/lib/utils/validation-rules";
import type { Column } from "@/components/common/MasterTable";
import type { FloorDataRow, DropdownOption, FloorQCSectionCopy } from "@/types/propertyEdit.types";

/* -------------------------------------------------------------------------- */
/*                           COMPACT INPUT COMPONENTS                          */
/* -------------------------------------------------------------------------- */

interface CompactSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  onOpen?: () => void; // Lazy load trigger
}

/**
 * Compact select dropdown using the common Select component
 * Ensures current value is always visible even before master data loads
 */
export const CompactSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled = false,
  onOpen,
}: CompactSelectProps) => {
  // Ensure current value is always in options array (prevents "Select" placeholder when value exists)
  const displayOptions = React.useMemo(() => {
    if (!value) return options;
    // Check if current value exists in options
    const valueExists = options.some(opt => opt.value === value);
    if (valueExists) return options;
    // Add current value as temporary option if not found (will be replaced when master data loads)
    return [{ value, label: value }, ...options];
  }, [value, options]);

  return (
    <Select
      value={value}
      onChange={(_e, val) => onChange(val)}
      onOpen={onOpen}
      options={displayOptions}
      placeholder={placeholder}
      disabled={disabled}
      selectSize="sm"
      className="min-w-[80px] text-[10px]"
    />
  );
};
CompactSelect.displayName = "CompactSelect";

/**
 * Year cell input using MatrixCellInput for numeric year values
 */
interface YearCellInputProps {
  value: string;
  rowId: string;
  columnId: string;
  onChange: (val: string) => void;
  error?: string;
}

export const YearCellInput = ({
  value,
  rowId,
  columnId,
  onChange,
  error,
}: YearCellInputProps) => {
  const numericValue = parseInt(value, 10) || 0;
  
  const handleCellChange = (_rowId: string, _columnId: string, newValue: number) => {
    onChange(newValue === 0 ? "" : String(newValue));
  };

  return (
    <div className="relative">
      <MatrixCellInput
        value={numericValue}
        rowId={rowId}
        columnId={columnId}
        onCellChange={handleCellChange}
        allowDecimals={false}
        maxValue={9999}
        className={cn(
          "h-6 w-full min-w-[60px] text-[10px]",
          error && "border-red-400"
        )}
      />
      {error && (
        <span className="absolute -bottom-3 left-0 text-[8px] text-red-500 whitespace-nowrap">
          {error}
        </span>
      )}
    </div>
  );
};
YearCellInput.displayName = "YearCellInput";

interface CompactCellInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
  error?: string;
}

/**
 * Generic compact text input for non-numeric fields
 */
export const CompactCellInput = ({
  value,
  onChange,
  placeholder = "Enter",
  maxLength,
  error,
}: CompactCellInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }
    onChange(newValue);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "h-6 w-full px-1 text-[10px] border rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition min-w-[60px]",
          error ? "border-red-400" : "border-gray-300"
        )}
      />
      {error && (
        <span className="absolute -bottom-3 left-0 text-[8px] text-red-500 whitespace-nowrap">
          {error}
        </span>
      )}
    </div>
  );
};
CompactCellInput.displayName = "CompactCellInput";

/* -------------------------------------------------------------------------- */
/*                           READ-ONLY CELL COMPONENT                          */
/* -------------------------------------------------------------------------- */

interface ReadOnlyCellProps {
  value: string;
}

const ReadOnlyCell = ({ value }: ReadOnlyCellProps) => (
  <div className="bg-gray-100 rounded border border-gray-300 px-1 py-0.5 text-[10px] text-center min-w-[60px]">
    {value || "-"}
  </div>
);
ReadOnlyCell.displayName = "ReadOnlyCell";

/* -------------------------------------------------------------------------- */
/*                           COLUMN BUILDER FUNCTIONS                          */
/* -------------------------------------------------------------------------- */

interface ColumnBuilderConfig {
  floorOptions: DropdownOption[];
  conTypeOptions: DropdownOption[];
  useTypeOptions: DropdownOption[];
  getSubTypeOptions: (typeOfUseId: string) => DropdownOption[];
  updateFloorRow: (id: string, field: keyof FloorDataRow, value: string) => void;
  onOpenRoomSubmission: (row: FloorDataRow) => void;
  onFloorDropdownOpen?: () => void; // Lazy load floors
  onConTypeDropdownOpen?: () => void; // Lazy load construction types
  onUseTypeDropdownOpen?: () => void; // Lazy load use types
  copy: FloorQCSectionCopy;
}

/**
 * Builds the common columns shared across rateable and capital views
 */
export function buildCommonColumns(config: ColumnBuilderConfig): Column<FloorDataRow>[] {
  const {
    floorOptions,
    conTypeOptions,
    useTypeOptions,
    getSubTypeOptions,
    updateFloorRow,
    onOpenRoomSubmission,
    onFloorDropdownOpen,
    onConTypeDropdownOpen,
    onUseTypeDropdownOpen,
    copy,
  } = config;

  return [
    {
      key: "floorId",
      label: (<SortableColumnHeader label={copy.columns.floor} sortable={false} />) as unknown as string,
      cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => (
        <CompactSelect
          value={row.floorId}
          onChange={(v) => updateFloorRow(row.id, "floorId", v)}
          options={floorOptions}
          onOpen={onFloorDropdownOpen}
        />
      ),
    },
    {
      key: "conYear",
      label: (<SortableColumnHeader label={copy.columns.conYear} sortable={false} />) as unknown as string,
      cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => (
        <YearCellInput
          value={row.conYear}
          rowId={row.id}
          columnId="conYear"
          onChange={(v) => updateFloorRow(row.id, "conYear", v)}
          error={row.conYear && !YEAR_REGEX.test(row.conYear) ? copy.validation.invalidYear : undefined}
        />
      ),
    },
    {
      key: "asstYear",
      label: (<SortableColumnHeader label={copy.columns.asstYear} sortable={false} />) as unknown as string,
      cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => (
        <YearCellInput
          value={row.asstYear}
          rowId={row.id}
          columnId="asstYear"
          onChange={(v) => updateFloorRow(row.id, "asstYear", v)}
          error={row.asstYear && !YEAR_REGEX.test(row.asstYear) ? copy.validation.invalidYear : undefined}
        />
      ),
    },
    {
      key: "constructionTypeId",
      label: (<SortableColumnHeader label={copy.columns.conType} sortable={false} />) as unknown as string,
      cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => (
        <CompactSelect
          value={row.constructionTypeId}
          onChange={(v) => updateFloorRow(row.id, "constructionTypeId", v)}
          options={conTypeOptions}
          onOpen={onConTypeDropdownOpen}
        />
      ),
    },
    {
      key: "typeOfUseId",
      label: (<SortableColumnHeader label={copy.columns.use} sortable={false} />) as unknown as string,
      cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => (
        <CompactSelect
          value={row.typeOfUseId}
          onChange={(v) => updateFloorRow(row.id, "typeOfUseId", v)}
          options={useTypeOptions}
          onOpen={onUseTypeDropdownOpen}
        />
      ),
    },
    {
      key: "subTypeOfUseId",
      label: (<SortableColumnHeader label={copy.columns.subTypeOfUse} sortable={false} />) as unknown as string,
      cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => (
        <CompactSelect
          value={row.subTypeOfUseId}
          onChange={(v) => updateFloorRow(row.id, "subTypeOfUseId", v)}
          options={getSubTypeOptions(row.typeOfUseId)}
          disabled={!row.typeOfUseId}
        />
      ),
    },
    {
      key: "noOfRooms",
      label: (<SortableColumnHeader label={copy.columns.noOfRooms} sortable={false} />) as unknown as string,
      cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => <ReadOnlyCell value={String(row.noOfRooms || "")} />,
    },
    {
      key: "area",
      label: (<SortableColumnHeader label={copy.columns.area} sortable={false} />) as unknown as string,
      cellClassName: "px-0.5 py-0.5",
      render: (_v, row) => (
        <div className="flex items-center gap-1">
          <div className="bg-gray-100 rounded border border-gray-300 px-1 py-0.5 text-[10px] text-center min-w-[50px] flex-1">
            {row.area || "-"}
          </div>
          <button
            type="button"
            onClick={() => onOpenRoomSubmission(row)}
            disabled={!row.pdnId}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition",
              row.pdnId
                ? "text-blue-600 hover:bg-blue-100 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            )}
            title={row.pdnId ? copy.tooltips.viewRoomDetails : copy.tooltips.noDetailId}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];
}

/**
 * Builds rateable method columns (read-only display)
 */
export function buildRateableColumns(copy: FloorQCSectionCopy): Column<FloorDataRow>[] {
  return [
    { key: "rentMY", label: (<SortableColumnHeader label={copy.columns.rentMY} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rentMY} /> },
    { key: "rateMY", label: (<SortableColumnHeader label={copy.columns.rateMY} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rateMY} /> },
    { key: "rentalValue", label: (<SortableColumnHeader label={copy.columns.rentalValue} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rentalValue} /> },
    { key: "depreciation", label: (<SortableColumnHeader label={copy.columns.depreciation} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.depreciation} /> },
    { key: "alv", label: (<SortableColumnHeader label={copy.columns.alv} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.alv} /> },
    { key: "mr", label: (<SortableColumnHeader label={copy.columns.mr} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.mr} /> },
    { key: "rv", label: (<SortableColumnHeader label={copy.columns.rv} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rv} /> },
  ];
}

/**
 * Builds capital method columns (read-only display)
 */
export function buildCapitalColumns(copy: FloorQCSectionCopy): Column<FloorDataRow>[] {
  return [
    { key: "sdrr", label: (<SortableColumnHeader label={copy.columns.sdrr} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.sdrr} /> },
    { key: "baseValue", label: (<SortableColumnHeader label={copy.columns.baseValue} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.baseValue} /> },
    { key: "floorFactor", label: (<SortableColumnHeader label={copy.columns.floorFactor} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.floorFactor} /> },
    { key: "ageFactor", label: (<SortableColumnHeader label={copy.columns.ageFactor} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.ageFactor} /> },
    { key: "ntbFactor", label: (<SortableColumnHeader label={copy.columns.ntbFactor} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.ntbFactor} /> },
    { key: "useFactor", label: (<SortableColumnHeader label={copy.columns.useFactor} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.useFactor} /> },
    { key: "capitalValue", label: (<SortableColumnHeader label={copy.columns.capitalValue} sortable={false} />) as unknown as string, cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.capitalValue} /> },
  ];
}

/**
 * Builds all columns based on the current view mode
 */
export function buildFloorQCColumns(
  config: ColumnBuilderConfig,
  subTab: string,
  dualMethodTab: "rateable" | "capital"
): Column<FloorDataRow>[] {
  const commonColumns = buildCommonColumns(config);
  const rateableColumns = buildRateableColumns(config.copy);
  const capitalColumns = buildCapitalColumns(config.copy);

  if (subTab === "capital") {
    return [...commonColumns, ...capitalColumns];
  } else if (subTab === "dual-method") {
    return dualMethodTab === "capital"
      ? [...commonColumns, ...capitalColumns]
      : [...commonColumns, ...rateableColumns];
  }
  return [...commonColumns, ...rateableColumns];
}

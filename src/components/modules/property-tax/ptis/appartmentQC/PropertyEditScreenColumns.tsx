"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Column } from "@/components/common/MasterTable";
import { ArrowUpDown, Eye } from "lucide-react";
import { YEAR_REGEX } from "@/lib/utils/validation-rules";
import { cn } from "@/lib/utils/cn";
import { DrawerFloorDataRow, DrawerDropdownOption } from "@/hooks/apartmentQc/propertyEditScreenDrawer.types";
import { Button, Tooltip } from "@/components/common";

// ─── Compact Select (Table Cell) ────────────────────────────────────────────

interface CompactSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: DrawerDropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  onDropdownClick?: () => void;
  isLoading?: boolean;
}

export const CompactSelect = ({
  value, onChange, options, placeholder = "Select", disabled = false, onDropdownClick, isLoading = false,
}: CompactSelectProps) => {
  // Ensure current value is always in options to display correctly
  const displayOptions = useMemo(() => {
    if (!value) return options;
    // Check if current value exists in options
    const valueExists = options.some(opt => opt.value === value);
    if (valueExists) return options;
    // Add current value as temporary option if not found (will be replaced when master data loads)
    return [{ value, label: value }, ...options];
  }, [value, options]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      onClick={onDropdownClick && !isLoading ? onDropdownClick : undefined}
      className="h-6 px-1 text-[10px] border border-gray-300 rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition w-full min-w-[80px] cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
    >
      <option value="">{isLoading ? "Loading..." : placeholder}</option>
      {displayOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
    </select>
  );
};

// ─── Compact Cell Input ─────────────────────────────────────────────────────

interface CompactCellInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  maxLength?: number;
  pattern?: RegExp;
  error?: string;
}

export const CompactCellInput = ({ value, onChange, placeholder = "Enter", maxLength, pattern, error }: CompactCellInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (pattern === YEAR_REGEX) newValue = newValue.replace(/\D/g, "");
    if (maxLength && newValue.length > maxLength) newValue = newValue.slice(0, maxLength);
    onChange(newValue);
  };
  return (
    <div className="flex flex-col">
      <input type="text" value={value} onChange={handleChange} placeholder={placeholder} maxLength={maxLength} className={`h-6 px-1 text-[10px] border rounded bg-white hover:border-blue-400 focus:border-blue-500 focus:outline-none transition w-full min-w-[60px] ${error ? "border-red-500" : "border-gray-300"}`} />
      {error && <span className="text-[8px] text-red-500">{error}</span>}
    </div>
  );
};

// ─── Read-Only Cell ─────────────────────────────────────────────────────────

export const ReadOnlyCell = ({ value }: { value: string }) => (
  <div className="bg-gray-100 rounded border border-gray-300 px-1 py-0.5 text-[10px] text-center min-w-[60px]">{value || "-"}</div>
);

// ─── Column Header ──────────────────────────────────────────────────────────

// const makeHeader = (label: string) => (
//   <span className="text-[10px] font-semibold text-gray-900">{label}</span>
// ) as unknown as string;

const makeHeader = (
  label: string,
  tooltip: string
) => (
  <Tooltip
    content={
      <div className="text-xs max-w-xs whitespace-normal break-words">
        {tooltip}
      </div>
    }
    placement="top"
  >
    <div>
     
      <span className="text-[10px] font-semibold text-gray-900">{label}</span>
    
    </div>
  </Tooltip>
) as unknown as string;

const makeFloorQcHeader = (
  columnKey: string,
  t: ReturnType<typeof useTranslations>
) =>
  makeHeader(
    t(`floorQC.columns.${columnKey}`),
    t(`floorQC.toolTipFloorQC.tooltips.${columnKey}`)
  );

// ─── Column Builder Props ───────────────────────────────────────────────────

interface ColumnBuilderProps {
  floorOptions: DrawerDropdownOption[];
  conTypeOptions: DrawerDropdownOption[];
  useTypeOptions: DrawerDropdownOption[];
  getSubTypeOptions: (typeOfUseId: string) => DrawerDropdownOption[];
  isLoadingFloors: boolean;
  isLoadingConTypes: boolean;
  isLoadingUseTypes: boolean;
  handleFloorDropdownClick: () => void;
  handleConTypeDropdownClick: () => void;
  handleUseTypeDropdownClick: () => void;
  updateRow: (id: string, field: keyof DrawerFloorDataRow, value: string) => void;
  onOpenRoomSubmission: (row: DrawerFloorDataRow) => void;
}

// ─── Build Common Columns ───────────────────────────────────────────────────

export function useDrawerCommonColumns(props: ColumnBuilderProps): Column<DrawerFloorDataRow>[] {
  const { floorOptions, conTypeOptions, useTypeOptions, getSubTypeOptions, isLoadingFloors, isLoadingConTypes, isLoadingUseTypes, handleFloorDropdownClick, handleConTypeDropdownClick, handleUseTypeDropdownClick, updateRow, onOpenRoomSubmission } = props;
  const t = useTranslations("appartmentQC");
  return useMemo(() => [
    { key: "floorId", label: makeFloorQcHeader("floor", t),align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactSelect value={row.floorId} onChange={(v) => updateRow(row.id, "floorId", v)} options={floorOptions} onDropdownClick={handleFloorDropdownClick} isLoading={isLoadingFloors} /> },
    { key: "conYear", label: makeFloorQcHeader("conYear", t),width : "70px",align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.conYear} onChange={(v) => updateRow(row.id, "conYear", v)} placeholder="Year" maxLength={4} pattern={YEAR_REGEX} error={row.conYear && !YEAR_REGEX.test(row.conYear) ? t("floorQC.validation.invalidYear") : undefined} /> },
    { key: "asstYear", label: makeFloorQcHeader("asstYear", t),width : "70px",align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.asstYear} onChange={(v) => updateRow(row.id, "asstYear", v)} placeholder="Year" maxLength={4} pattern={YEAR_REGEX} error={row.asstYear && !YEAR_REGEX.test(row.asstYear) ? t("floorQC.validation.invalidYear") : undefined} /> },
    { key: "constructionTypeId", label: makeFloorQcHeader("conType", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactSelect value={row.constructionTypeId} onChange={(v) => updateRow(row.id, "constructionTypeId", v)} options={conTypeOptions} onDropdownClick={handleConTypeDropdownClick} isLoading={isLoadingConTypes} /> },
    { key: "typeOfUseId", label: makeFloorQcHeader("use", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactSelect value={row.typeOfUseId} onChange={(v) => updateRow(row.id, "typeOfUseId", v)} options={useTypeOptions} onDropdownClick={handleUseTypeDropdownClick} isLoading={isLoadingUseTypes} /> },
    {
      key: "subTypeOfUseId", label: makeFloorQcHeader("subTypeOfUse", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => {
        const opts = getSubTypeOptions(row.typeOfUseId);
        return <CompactSelect value={row.subTypeOfUseId} onChange={(v) => updateRow(row.id, "subTypeOfUseId", v)} options={opts} disabled={!row.typeOfUseId || opts.length === 0} isLoading={isLoadingUseTypes} />;
      }
    },
    { key: "noOfRooms", label: makeFloorQcHeader("noOfRooms", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={String(row.noOfRooms || "")} /> },
    {
      key: "area", label: makeFloorQcHeader("area", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => (
        <div className="flex items-center gap-1">
          <ReadOnlyCell value={row.area} />
          <button type="button" onClick={() => onOpenRoomSubmission(row)} disabled={!row.pdnId} className={cn("h-6 w-6 flex items-center justify-center rounded transition", row.pdnId ? "text-blue-600 hover:bg-blue-100 cursor-pointer" : "text-gray-300 cursor-not-allowed")} title={row.pdnId ? t("floorQC.tooltips.viewRoomDetails") : t("floorQC.tooltips.noDetailId")}>
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ], [floorOptions, conTypeOptions, useTypeOptions, getSubTypeOptions, isLoadingFloors, isLoadingConTypes, isLoadingUseTypes, handleFloorDropdownClick, handleConTypeDropdownClick, handleUseTypeDropdownClick, updateRow, onOpenRoomSubmission, t]);
}

// ─── Rateable Columns ───────────────────────────────────────────────────────

export function useDrawerRateableColumns(): Column<DrawerFloorDataRow>[] {
  const t = useTranslations("appartmentQC");
  return useMemo(() => [
    { key: "rentMY", label: makeFloorQcHeader("rentMY", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rentMY} /> },
    { key: "rateMY", label: makeFloorQcHeader("rateMY", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rateMY} /> },
    { key: "rentalValue", label: makeFloorQcHeader("rentalValue", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rentalValue} /> },
    { key: "depreciation", label: makeFloorQcHeader("depreciation", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.depreciation} /> },
    { key: "alv", label: makeFloorQcHeader("alv", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.alv} /> },
    { key: "mr", label: makeFloorQcHeader("mr", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.mr} /> },
    { key: "rv", label: makeFloorQcHeader("rv", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rv} /> },
  ], [t]);
}

// ─── Capital Columns ────────────────────────────────────────────────────────

export function useDrawerCapitalColumns(): Column<DrawerFloorDataRow>[] {
  const t = useTranslations("appartmentQC");
  return useMemo(() => [
    { key: "sdrr", label: makeFloorQcHeader("sdrr", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.sdrr} /> },
    { key: "baseValue", label: makeFloorQcHeader("baseValue", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.baseValue} /> },
    { key: "floorFactor", label: makeFloorQcHeader("floorFactor", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.floorFactor} /> },
    { key: "ageFactor", label: makeFloorQcHeader("ageFactor", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.ageFactor} /> },
    { key: "ntbFactor", label: makeFloorQcHeader("ntbFactor", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.ntbFactor} /> },
    { key: "useFactor", label: makeFloorQcHeader("useFactor", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.useFactor} /> },
    { key: "capitalValue", label: makeFloorQcHeader("capitalValue", t), align:"center", cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.capitalValue} /> },
  ], [t]);
}

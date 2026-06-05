"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/common";
import { Column } from "@/components/common/MasterTable";
import { ArrowUpDown, Eye } from "lucide-react";
import { YEAR_REGEX } from "@/lib/utils/validation-rules";
import { cn } from "@/lib/utils/cn";
import { DrawerFloorDataRow, DrawerDropdownOption } from "@/hooks/apartmentQc/propertyEditScreenDrawer.types";

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

const makeHeader = (label: string) => (
  <Button type="button" variant="secondary" size="xs" icon={ArrowUpDown} iconPosition="right" className="w-full h-5 flex items-center justify-center gap-0.5 rounded border border-gray-300 bg-gray-100 text-[10px] font-semibold text-gray-900 hover:bg-gray-200">
    <span className="truncate">{label}</span>
  </Button>
) as unknown as string;

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
    { key: "floorId", label: makeHeader(t("floorQC.columns.floor")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactSelect value={row.floorId} onChange={(v) => updateRow(row.id, "floorId", v)} options={floorOptions} onDropdownClick={handleFloorDropdownClick} isLoading={isLoadingFloors} /> },
    { key: "conYear", label: makeHeader(t("floorQC.columns.conYear")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.conYear} onChange={(v) => updateRow(row.id, "conYear", v)} placeholder="Year" maxLength={4} pattern={YEAR_REGEX} error={row.conYear && !YEAR_REGEX.test(row.conYear) ? t("floorQC.validation.invalidYear") : undefined} /> },
    { key: "asstYear", label: makeHeader(t("floorQC.columns.asstYear")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactCellInput value={row.asstYear} onChange={(v) => updateRow(row.id, "asstYear", v)} placeholder="Year" maxLength={4} pattern={YEAR_REGEX} error={row.asstYear && !YEAR_REGEX.test(row.asstYear) ? t("floorQC.validation.invalidYear") : undefined} /> },
    { key: "constructionTypeId", label: makeHeader(t("floorQC.columns.conType")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactSelect value={row.constructionTypeId} onChange={(v) => updateRow(row.id, "constructionTypeId", v)} options={conTypeOptions} onDropdownClick={handleConTypeDropdownClick} isLoading={isLoadingConTypes} /> },
    { key: "typeOfUseId", label: makeHeader(t("floorQC.columns.use")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <CompactSelect value={row.typeOfUseId} onChange={(v) => updateRow(row.id, "typeOfUseId", v)} options={useTypeOptions} onDropdownClick={handleUseTypeDropdownClick} isLoading={isLoadingUseTypes} /> },
    { key: "subTypeOfUseId", label: makeHeader(t("floorQC.columns.subTypeOfUse")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => {
      const opts = getSubTypeOptions(row.typeOfUseId);
      return <CompactSelect value={row.subTypeOfUseId} onChange={(v) => updateRow(row.id, "subTypeOfUseId", v)} options={opts} disabled={!row.typeOfUseId || opts.length === 0} isLoading={isLoadingUseTypes} />;
    } },
    { key: "noOfRooms", label: makeHeader(t("floorQC.columns.noOfRooms")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={String(row.noOfRooms || "")} /> },
    { key: "area", label: makeHeader(t("floorQC.columns.area")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => (
      <div className="flex items-center gap-1">
        <ReadOnlyCell value={row.area} />
        <button type="button" onClick={() => onOpenRoomSubmission(row)} disabled={!row.pdnId} className={cn("h-6 w-6 flex items-center justify-center rounded transition", row.pdnId ? "text-blue-600 hover:bg-blue-100 cursor-pointer" : "text-gray-300 cursor-not-allowed")} title={row.pdnId ? t("floorQC.tooltips.viewRoomDetails") : t("floorQC.tooltips.noDetailId")}>
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    ) },
  ], [floorOptions, conTypeOptions, useTypeOptions, getSubTypeOptions, isLoadingFloors, isLoadingConTypes, isLoadingUseTypes, handleFloorDropdownClick, handleConTypeDropdownClick, handleUseTypeDropdownClick, updateRow, onOpenRoomSubmission, t]);
}

// ─── Rateable Columns ───────────────────────────────────────────────────────

export function useDrawerRateableColumns(): Column<DrawerFloorDataRow>[] {
  const t = useTranslations("appartmentQC");
  return useMemo(() => [
    { key: "rentMY", label: makeHeader(t("floorQC.columns.rentMY")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rentMY} /> },
    { key: "rateMY", label: makeHeader(t("floorQC.columns.rateMY")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rateMY} /> },
    { key: "rentalValue", label: makeHeader(t("floorQC.columns.rentalValue")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rentalValue} /> },
    { key: "depreciation", label: makeHeader(t("floorQC.columns.depreciation")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.depreciation} /> },
    { key: "alv", label: makeHeader(t("floorQC.columns.alv")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.alv} /> },
    { key: "mr", label: makeHeader(t("floorQC.columns.mr")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.mr} /> },
    { key: "rv", label: makeHeader(t("floorQC.columns.rv")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.rv} /> },
  ], [t]);
}

// ─── Capital Columns ────────────────────────────────────────────────────────

export function useDrawerCapitalColumns(): Column<DrawerFloorDataRow>[] {
  const t = useTranslations("appartmentQC");
  return useMemo(() => [
    { key: "sdrr", label: makeHeader(t("floorQC.columns.sdrr")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.sdrr} /> },
    { key: "baseValue", label: makeHeader(t("floorQC.columns.baseValue")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.baseValue} /> },
    { key: "floorFactor", label: makeHeader(t("floorQC.columns.floorFactor")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.floorFactor} /> },
    { key: "ageFactor", label: makeHeader(t("floorQC.columns.ageFactor")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.ageFactor} /> },
    { key: "ntbFactor", label: makeHeader(t("floorQC.columns.ntbFactor")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.ntbFactor} /> },
    { key: "useFactor", label: makeHeader(t("floorQC.columns.useFactor")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.useFactor} /> },
    { key: "capitalValue", label: makeHeader(t("floorQC.columns.capitalValue")), cellClassName: "px-0.5 py-0.5", render: (_v, row) => <ReadOnlyCell value={row.capitalValue} /> },
  ], [t]);
}

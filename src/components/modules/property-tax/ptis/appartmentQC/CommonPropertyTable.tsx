"use client";

import { useMemo, useCallback, useState } from "react";
import type { MouseEventHandler } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { SearchInput } from "@/components/common";
import { ArrowDown, ArrowUp, ArrowUpDown, ExternalLink } from "lucide-react";
import { useTableAutoScroll } from "@/hooks/apartmentQc/useTableAutoScroll";
import { ColumnFilterDropdown, type FilterField } from "./ColumnFilterDropdown";
import { Tooltip } from "@/components/common/Tooltip";
import { logger } from "@/lib/utils/logger";
import { TEXT_SANITIZE } from "@/lib/utils/validation";
import { ExportIconButton, EyeIconButton } from "@/components/common/ActionButtons";
import { Button } from "@/components/common/ActionButton";

type ColumnWithTooltip<T extends Record<string, unknown>> = Column<T> & { headerTooltip?: boolean | string };

// Map column keys to filter fields
const FILTERABLE_COLUMNS: Record<string, FilterField> = {
  'wing': 'wing',
  'flatOrShopNo': 'flatOrShopNo',
  'propertyTypeName': 'propertyType',
  'apartmentType': 'apartmentType',
};

const SORT_COLUMN_KEYS: Record<string, string> = {
  propertyNo: "PropertyNo",
  oldPropertyNo: "OldPropertyNo",
  oldConstArea: "oldConstructionArea",
  carpetArea: "carpetASqFt",
  builtupArea: "builtupASqFt",
  newRV: "newTaxTotalRV",
  cv: "newTaxTotalCV",
  totalTax: "newTaxTotal",
};

interface FilterOption {
  value: string;
  label: string;
}

type SortDirection = "asc" | "desc" | null;

function ApartmentSortButton({
  label,
  sortDirection,
  onClick,
  ariaLabel,
}: {
  label: string;
  sortDirection: SortDirection;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel: string;
}) {
  const Icon = sortDirection === "asc" ? ArrowUp : sortDirection === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <Button
      type="button"
      variant="secondary"
      size="xs"
      icon={Icon}
      iconPosition="right"
      onClick={onClick}
      aria-label={ariaLabel}
      className="h-6 flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-gray-100 text-[11px] font-semibold text-gray-900 hover:bg-gray-200 pr-1.5"
    >
      <span className="truncate">{label}</span>
    </Button>
  );
}

type CommonPropertyTableProps<T extends Record<string, unknown>> = {
  columns: Column<T>[];
  data: T[];
  title: string;
  activeTab: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRowClick: (row: T) => void;
  loading?: boolean;
  isAutoScrolling: boolean;
  onToggleAutoScroll: () => void;
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  _applyTypeColors?: boolean;
  // Filter props
  activeFilters?: Record<FilterField, string[]>;
  onFilterChange?: (field: FilterField, values: string[]) => void;
  onFetchFilterOptions?: (field: FilterField) => Promise<FilterOption[]>;
  sortBy?: string;
  sortOrder?: string;
  onSort?: (columnKey: string) => void;
  // Excel export props
  wardId?: string;
  propertyNo?: string;
};

function CommonPropertyTable<T extends Record<string, unknown>>({
  columns, data, title, activeTab, searchQuery, onSearchChange, onRowClick,
  loading = false, isAutoScrolling, onToggleAutoScroll, pageNumber = 1, pageSize = 10,
  totalCount, totalPages, onPageChange, onPageSizeChange,
  activeFilters = {} as Record<FilterField, string[]>,
  onFilterChange,
  onFetchFilterOptions,
  sortBy,
  sortOrder,
  onSort,
  wardId,
  propertyNo,
}: CommonPropertyTableProps<T>) {
  const t = useTranslations("appartmentQC");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  useTableAutoScroll(isAutoScrolling);

  // Excel export state
  const [isExporting, setIsExporting] = useState(false);

  // Excel export handler - uses secure server-side API route
  const handleExcelExport = useCallback(async () => {
    if (!wardId || !propertyNo) {
      logger.warn('[CommonPropertyTable] Cannot export: missing wardId or propertyNo');
      toast.error(t("export.missingParams") || "Missing ward ID or property number");
      return;
    }

    setIsExporting(true);

    // Show loading toast
    const loadingToastId = toast.loading(t("export.downloading") || "Downloading Excel file...");

    try {
      // Build the secure API route URL (auth is handled server-side via cookies)
      const params = new URLSearchParams();
      params.append('WardId', String(wardId));
      params.append('PropertyNo', propertyNo);
      const exportUrl = `/${locale}/property-tax/ptis/appartmentQC/export-excel?${params.toString()}`;

      // Fetch the Excel file from secure API route
      const response = await fetch(exportUrl, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || `Failed to export Excel: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `apartment-qc-${propertyNo}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success(t("export.success") || "Excel file downloaded successfully!");
    } catch (error) {
      logger.error('[CommonPropertyTable] Excel export failed', { error: error as Error });
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error(t("export.error") || "Failed to download Excel file");
    } finally {
      setIsExporting(false);
    }
  }, [wardId, propertyNo, t, locale]);

  const styledColumns: Column<T>[] = useMemo(() =>
    columns.map((col) => {
      const filterField = FILTERABLE_COLUMNS[col.key as string];
      const sortColumnKey = SORT_COLUMN_KEYS[col.key as string] ?? String(col.key);
      const columnLabel = String(col.label);
      const sortDirection: SortDirection = sortBy === sortColumnKey && (sortOrder === "asc" || sortOrder === "desc") ? sortOrder : null;
      const isFilterable = !!filterField && !!onFilterChange && !!onFetchFilterOptions;
      const hasActiveFilter = filterField && activeFilters[filterField]?.length > 0;

      // Create the sort button element
      const sortButton = (
        <ApartmentSortButton
          label={columnLabel}
          sortDirection={sortDirection}
          onClick={onSort ? () => onSort(sortColumnKey) : undefined}
          ariaLabel={`${tCommon("table.sort.by")} ${columnLabel}`}
        />
      );

      // Wrap with tooltip if headerTooltip is provided
      const colWithTooltip = col as ColumnWithTooltip<T>;
      const headerContent = colWithTooltip.headerTooltip ? (
        <Tooltip
          content={<div className="max-w-xs text-xs whitespace-normal">{typeof colWithTooltip.headerTooltip === 'string' ? colWithTooltip.headerTooltip : columnLabel}</div>}
          placement="top"
        >
          <span className="cursor-help">{sortButton}</span>
        </Tooltip>
      ) : sortButton;

      return {
        ...col,
        label: (
          <div className="flex items-center gap-1 w-full justify-center">
            {/* Column name with sort icon and filter icon integrated */}
            <div className="relative inline-flex items-center gap-1">
              {headerContent}
              {/* Funnel icon positioned to the right of the button */}
              {isFilterable && (
                <ColumnFilterDropdown
                  field={filterField}
                  selectedValues={activeFilters[filterField] || []}
                  onFilterChange={onFilterChange}
                  onFetchOptions={onFetchFilterOptions}
                  isActive={hasActiveFilter}
                />
              )}
            </div>
          </div>
        ) as unknown as string,
        cellClassName: "px-1 py-1 whitespace-nowrap",
        headerClassName: "!px-1.5 !py-1 border-l !border-gray-400/50",
        render: (value: unknown, row: T, rowIndex: number) => {
          // Enhanced cell design with improved font and border colors
          if (col.render) {
            return (
              <div className="group relative bg-white border border-gray-300 hover:border-blue-500 rounded px-1 py-0.5 text-xs text-center transition-colors duration-200">
                {col.render(value as T[keyof T] | undefined, row, rowIndex)}
              </div>
            );
          }
          const displayValue = value === null || value === undefined || value === "" ? "-" : String(value);
          return (
            <div className="group relative bg-white border border-gray-300 hover:border-blue-500 rounded px-1 py-0.5 text-xs text-center transition-colors duration-200">
              <span className="text-gray-800 font-medium group-hover:text-blue-700 group-hover:underline transition-colors duration-200">
                {displayValue}
              </span>
              <ExternalLink className="inline-block w-3 h-3 ml-1 text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-200" />
            </div>
          );
        },
      };
    }), [columns, activeFilters, onFilterChange, onFetchFilterOptions, onSort, sortBy, sortOrder, tCommon]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(row => Object.values(row).some(val => val?.toString().toLowerCase().includes(query)));
  }, [data, searchQuery]);

  const handleSearchInputChange = useCallback((value: string) => {
    const sanitized = value.replace(TEXT_SANITIZE, "");
    onSearchChange(sanitized);
  }, [onSearchChange]);

  const localizedTabLabel = useMemo(() => {
    if (activeTab === "rateable") return t("apartmentTabs.rateable");
    if (activeTab === "capital") return t("apartmentTabs.capital");
    if (activeTab === "dual-method") return t("apartmentTabs.dual");
    return activeTab;
  }, [activeTab, t]);

  return (
    <div className="mb-2">
      <MasterTable
        columns={styledColumns} data={filteredData} loading={loading} height="xs"
        paginationConfig={{ enabled: true, showPageSizeSelector: true }}
        pageNumber={pageNumber} pageSize={pageSize} totalCount={totalCount ?? filteredData.length}
        totalPages={totalPages ?? Math.ceil(filteredData.length / pageSize)}
        onPageChange={onPageChange} onPageSizeChange={onPageSizeChange}
        onRowClick={(row, _index) => onRowClick(row)}
        headerExtra={
          <div className="flex items-center justify-between w-full gap-4">
            <div className="flex gap-2 items-center">
              <h3 className="text-sm font-semibold text-[#1E3A8A]">{title}</h3>
              <span className="text-[#6B7280]">-</span>
              <p className="text-sm text-[#6B7280]">{t("apartmentTabs.showingData", { tab: localizedTabLabel })}</p>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput value={searchQuery} onChange={handleSearchInputChange} placeholder={tCommon("searchPlaceholder")} className="w-80 mb-0" />
              <ExportIconButton
                onClick={handleExcelExport}
                isExporting={isExporting}
                disabled={isExporting || !wardId || !propertyNo}
                title={t("actions.exportExcel") || "Export to Excel"}
              />
              <EyeIconButton
                onClick={onToggleAutoScroll}
                isAutoScrolling={isAutoScrolling}
                startTitle={t("actions.startAutoScroll")}
                stopTitle={t("actions.stopAutoScroll")}
              />
            </div>
          </div>
        }
        tableClassName="text-xs w-max min-w-full"
        theadClassName="bg-[#d9e3ec] text-black h-0 sticky top-0 z-20 [&_th]:whitespace-nowrap"
      />
    </div>
  );
}

export default CommonPropertyTable;
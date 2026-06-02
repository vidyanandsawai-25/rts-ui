"use client";

import { useMemo, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { Button, SearchInput } from "@/components/common";
import { ArrowUpDown, Eye, EyeOff, ExternalLink, FileSpreadsheet, Loader2 } from "lucide-react";
import { useTableAutoScroll } from "@/hooks/apartmentQc/useTableAutoScroll";
import { ColumnFilterDropdown, type FilterField } from "./ColumnFilterDropdown";
import { getExcelExportConfigAction } from "@/app/[locale]/property-tax/ptis/appartmentQC/action";
import { logger } from "@/lib/utils/logger";

// Map column keys to filter fields
const FILTERABLE_COLUMNS: Record<string, FilterField> = {
  'wing': 'wing',
  'flatOrShopNo': 'flatOrShopNo',
  'propertyTypeName': 'propertyType',
  'apartmentType': 'apartmentType',
};

interface FilterOption {
  value: string;
  label: string;
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
  applyTypeColors?: boolean;
  // Filter props
  activeFilters?: Record<FilterField, string[]>;
  onFilterChange?: (field: FilterField, values: string[]) => void;
  onFetchFilterOptions?: (field: FilterField) => Promise<FilterOption[]>;
  // Excel export props
  wardId?: string;
  propertyNo?: string;
};

function CommonPropertyTable<T extends Record<string, unknown>>({
  columns, data, title, activeTab, searchQuery, onSearchChange, onRowClick,
  loading = false, isAutoScrolling, onToggleAutoScroll, pageNumber = 1, pageSize = 10,
  totalCount, totalPages, onPageChange, onPageSizeChange, applyTypeColors = false,
  activeFilters = {} as Record<FilterField, string[]>,
  onFilterChange,
  onFetchFilterOptions,
  wardId,
  propertyNo,
}: CommonPropertyTableProps<T>) {
  const t = useTranslations("appartmentQC");
  const tCommon = useTranslations("common");
  useTableAutoScroll(isAutoScrolling);
  
  // Excel export state
  const [isExporting, setIsExporting] = useState(false);

  // Excel export handler
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
      const configResult = await getExcelExportConfigAction();
      if (!configResult.success) {
        throw new Error('error' in configResult ? configResult.error : 'Failed to get export configuration');
      }
      if (!configResult.data) {
        throw new Error('No export configuration data returned');
      }
      
      const { baseUrl, authToken } = configResult.data;
      
      // Build the export URL
      const params = new URLSearchParams();
      params.append('WardId', String(wardId));
      params.append('PropertyNo', propertyNo);
      const endpoint = `${baseUrl}/ApartmentQC/export-excel?${params.toString()}`;
      
      // Fetch the Excel file
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to export Excel: ${response.statusText}`);
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
  }, [wardId, propertyNo, t]);

  const getCellColorClass = useCallback((type: string | undefined) => {
    if (!applyTypeColors) return 'bg-white border-gray-300 hover:border-blue-400 text-blue-700';
    if (type === 'C') return 'bg-rose-50 border-rose-300 hover:border-rose-400 text-rose-700';
    if (type === 'R') return 'bg-indigo-100 border-indigo-300 hover:border-indigo-400 text-indigo-700';
    if (type === 'N') return 'bg-sky-100 border-sky-300 hover:border-sky-400 text-sky-700';
    if (type === 'I') return 'bg-cyan-100 border-cyan-300 hover:border-cyan-400 text-cyan-700';
    return 'bg-white border-gray-300 hover:border-blue-400 text-blue-700';
  }, [applyTypeColors]);

  const styledColumns: Column<T>[] = useMemo(() => 
    columns.map((col) => {
      const filterField = FILTERABLE_COLUMNS[col.key as string];
      const isFilterable = !!filterField && !!onFilterChange && !!onFetchFilterOptions;
      const hasActiveFilter = filterField && activeFilters[filterField]?.length > 0;
      
      return {
        ...col,
        label: (
          <div className="flex items-center gap-1 w-full justify-center">
            {/* Column name with sort icon and filter icon integrated */}
            <div className="relative inline-flex items-center gap-1">
              <Button 
                type="button" 
                variant="secondary" 
                size="xs" 
                icon={ArrowUpDown} 
                iconPosition="right" 
                className="h-6 flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-gray-100 text-[11px] font-semibold text-gray-900 hover:bg-gray-200 pr-1.5"
              >
                <span className="truncate">{col.label as string}</span>
              </Button>
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
          const colorClass = getCellColorClass(String(row.type || ''));
          if (col.render) {
            return (
              <div className={`group relative ${colorClass} rounded border px-1 py-0.5 text-xs text-center transition`}>
                {col.render(value as T[keyof T] | undefined, row, rowIndex)}
              </div>
            );
          }
          const displayValue = value === null || value === undefined || value === "" ? "-" : String(value);
          return (
            <div className={`group relative ${colorClass} rounded border px-1 py-0.5 text-xs text-center transition hover:border-blue-400`}>
              <span className="group-hover:underline">{displayValue}</span>
              <ExternalLink className="inline-block w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          );
        },
      };
    }), [columns, getCellColorClass, activeFilters, onFilterChange, onFetchFilterOptions]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(row => Object.values(row).some(val => val?.toString().toLowerCase().includes(query)));
  }, [data, searchQuery]);

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
              <p className="text-sm text-[#6B7280]">{t("apartmentTabs.showingData", { tab: activeTab })}</p>
            </div>
            <div className="flex items-center gap-2">
              <SearchInput value={searchQuery} onChange={onSearchChange} placeholder={tCommon("searchPlaceholder")} className="w-80 mb-0" />
              {/* Excel Export Button */}
              <button
                onClick={handleExcelExport}
                type="button"
                disabled={isExporting || !wardId || !propertyNo}
                className={`p-2 rounded-md border transition-all duration-200 flex items-center justify-center min-w-[36px] h-[36px] ${
                  isExporting
                    ? 'bg-green-100 text-green-600 border-green-300 cursor-wait'
                    : 'bg-white text-green-600 border-gray-300 hover:border-green-500 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
                title={t("actions.exportExcel") || "Export to Excel"}
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              </button>
              {/* Auto-scroll toggle */}
              <button
                onClick={onToggleAutoScroll} type="button"
                className={`p-2 rounded-md border transition-all duration-200 flex items-center justify-center min-w-[36px] h-[36px] ${isAutoScrolling ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md animate-pulse' : 'bg-white text-gray-500 border-gray-300 hover:border-[#1E3A8A] hover:text-[#1E3A8A] hover:bg-gray-50'}`}
                title={isAutoScrolling ? t("actions.stopAutoScroll") : t("actions.startAutoScroll")}
              >
                {isAutoScrolling ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
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

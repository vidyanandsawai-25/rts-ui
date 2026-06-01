"use client";

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { Button, SearchInput } from "@/components/common";
import { ArrowUpDown, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useTableAutoScroll } from "@/hooks/apartmentQc/useTableAutoScroll";

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
};

function CommonPropertyTable<T extends Record<string, unknown>>({
  columns, data, title, activeTab, searchQuery, onSearchChange, onRowClick,
  loading = false, isAutoScrolling, onToggleAutoScroll, pageNumber = 1, pageSize = 10,
  totalCount, totalPages, onPageChange, onPageSizeChange, applyTypeColors = false,
}: CommonPropertyTableProps<T>) {
  const t = useTranslations("appartmentQC");
  const tCommon = useTranslations("common");
  useTableAutoScroll(isAutoScrolling);

  const getCellColorClass = useCallback((type: string | undefined) => {
    if (!applyTypeColors) return 'bg-white border-gray-300 hover:border-blue-400 text-blue-700';
    if (type === 'C') return 'bg-rose-50 border-rose-300 hover:border-rose-400 text-rose-700';
    if (type === 'R') return 'bg-indigo-100 border-indigo-300 hover:border-indigo-400 text-indigo-700';
    if (type === 'N') return 'bg-sky-100 border-sky-300 hover:border-sky-400 text-sky-700';
    if (type === 'I') return 'bg-cyan-100 border-cyan-300 hover:border-cyan-400 text-cyan-700';
    return 'bg-white border-gray-300 hover:border-blue-400 text-blue-700';
  }, [applyTypeColors]);

  const styledColumns: Column<T>[] = useMemo(() => 
    columns.map((col) => ({
      ...col,
      label: (
        <Button type="button" variant="secondary" size="xs" icon={ArrowUpDown} iconPosition="right" className="w-full h-6 flex items-center justify-center gap-1 rounded-md border border-gray-300 bg-gray-100 text-[11px] font-semibold text-gray-900 hover:bg-gray-200">
          <span className="truncate">{col.label as string}</span>
        </Button>
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
    })), [columns, getCellColorClass]);

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

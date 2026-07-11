"use client";

import { Eye, Download } from "lucide-react";
import { Badge, Card, CardHeader, MasterTable, SearchInput, Button } from "@/components/common";
import { PropertyPreviewRow, BulkUpdateMaster, BulkUpdateFieldConfig } from "@/types/common-details-update/common-details-update.types";
import { getPreviewColumns } from "./CommonDetailsUpdateColumns";
import { Column } from "@/components/common/MasterTable";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";
import { exportExcelAction } from "@/app/[locale]/property-tax/common-details-update/actions";

interface PaginationInfo {
  start: number;
  end: number;
  total: number;
}

interface PropertyPreviewGridProps {
  t: (key: string) => string;
  properties: PropertyPreviewRow[];
  filteredProperties: PropertyPreviewRow[];
  pagedProperties: PropertyPreviewRow[];
  totalCount: number;
  loading: boolean;
  selectedPropertyIds: Set<number>;
  allSelected: boolean;
  onSelectAll: () => void;
  onPropertySelect: (id: number, checked: boolean) => void;
  propertiesPage: number;
  setPropertiesPage: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions: number[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedMenuItem: BulkUpdateMaster | undefined;
  fieldConfigs: BulkUpdateFieldConfig[];
  paginationInfo?: PaginationInfo;
  wardId?: string;
  fromPropertyNo?: string;
  toPropertyNo?: string;
}

export const PropertyPreviewGrid = ({
  t,
  properties,
  pagedProperties,
  totalCount,
  loading,
  selectedPropertyIds,
  allSelected,
  onSelectAll,
  onPropertySelect,
  propertiesPage,
  setPropertiesPage,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  searchTerm,
  onSearchChange,
  selectedMenuItem,
  fieldConfigs,
  wardId,
  fromPropertyNo,
  toPropertyNo,
}: PropertyPreviewGridProps) => {
  const tCommon = useTranslations("common");
  const [downloading, setDownloading] = useState(false);
  const baseColumns = getPreviewColumns(t, fieldConfigs);

  // Create columns with selection checkbox
  const columns: Column<PropertyPreviewRow>[] = [
    {
      key: "id" as keyof PropertyPreviewRow,
      label: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => onSelectAll()}
          aria-label={tCommon("table.selectAll")}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
      ),
      width: "40px",
      render: (_value, row) => (
        <input
          type="checkbox"
          checked={selectedPropertyIds.has(row.id)}
          onChange={(e) => onPropertySelect(row.id, e.target.checked)}
          aria-label={tCommon("table.selectRow", { id: row.propertyNo })}
          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
        />
      ),
    },
    ...baseColumns,
  ];

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleDownloadExcel = async () => {
    if (!wardId || !selectedMenuItem?.updateCode) {
      toast.error("Missing Ward ID or Enabled Field selection");
      return;
    }

    setDownloading(true);
    const loadingToastId = toast.loading("Downloading Excel file...");

    try {
      const res = await exportExcelAction(wardId, selectedMenuItem.updateCode, fromPropertyNo || undefined, toPropertyNo || undefined);
      if (!res.success) {
        throw new Error(res.error || "Excel export failed");
      }

      const byteCharacters = atob(res.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedMenuItem.updateCode}_${wardId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss(loadingToastId);
      toast.success("Excel file downloaded successfully!");
    } catch (error) {
      logger.error("PropertyPreviewGrid: Excel export failed", { error: error as Error });
      toast.dismiss(loadingToastId);
      toast.error(error instanceof Error ? error.message : "Excel export failed");
    } finally {
      setDownloading(false);
    }
  };

  // Empty state when no menu item selected
  if (!selectedMenuItem) {
    return (
      <Card
        variant="default"
        padding="none"
      // className="border border-blue-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden"
      >
        <CardHeader className="flex items-center justify-between px-4 py-3 border-b bg-[#F8FAFF] rounded-t-xl mb-0 shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-[#1E3A8A]">
              {t("preview.title")}
            </span>
          </div>
        </CardHeader>
        <div className="flex flex-col items-center justify-center h-full py-16 text-center">
          <div className="w-10 h-10 mb-2 rounded-full bg-blue-50 flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            {t("preview.selectFilters")}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <MasterTable<PropertyPreviewRow>
        columns={columns}
        data={pagedProperties}
        loading={loading}
        pageNumber={propertiesPage}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={setPropertiesPage}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
        paginationConfig={{ enabled: true, showPageSizeSelector: true }}
        getRowKey={(row) => String(row.id)}
        containerClassName="h-full flex flex-col min-h-0 [&>div]:flex [&>div]:flex-col [&>div]:min-h-0 [&>div]:h-full"
        maxBodyHeightClassName="flex-1 min-h-0"
        emptyText={t("preview.noProperties")}
        loadingText={t("preview.loading")}
        rowClassName={(row) =>
          selectedPropertyIds.has(row.id) ? "bg-blue-50" : ""
        }
        headerTitle={t("preview.title")}
        headerExtra={
          <div className="flex items-center gap-3 ml-auto">
            {properties.length > 0 && (
              <Badge
                variant="default"
                size="md"
                className="w-40 mb-0"
                title={`${totalCount} ${t("preview.propertiesLoaded")}`}
              >
                {totalCount} {t("preview.propertiesLoaded")}
              </Badge>
            )}
            <Button
              variant="primary"
              size="xs"
              icon={Download}
              onClick={handleDownloadExcel}
              disabled={!wardId || downloading}
              isLoading={downloading}
            >
              {t("buttons.downloadExcel")}
            </Button>
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={t("preview.searchPlaceholder")}
              className="w-60 mb-0"
            />
          </div>
        }
      />
    </div>
  );
};


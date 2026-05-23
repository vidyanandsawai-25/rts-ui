"use client";

import { Eye } from "lucide-react";
import { Badge, Card, CardHeader, MasterTable, SearchInput, Select } from "@/components/common";
import { Checkbox } from "@/components/common/checkbox";
import { PropertyPreviewRow, BulkUpdateMaster, BulkUpdateFieldConfig } from "@/types/common-details-update/common-details-update.types";
import { getPreviewColumns } from "./CommonDetailsUpdateColumns";
import { Column } from "@/components/common/MasterTable";
import { useTranslations } from "next-intl";

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
}

export const PropertyPreviewGrid = ({
  t,
  properties,
  filteredProperties,
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
  paginationInfo,
}: PropertyPreviewGridProps) => {
  const tCommon = useTranslations("common");
  const baseColumns = getPreviewColumns(t, fieldConfigs);
  
  // Create columns with selection checkbox
  const columns: Column<PropertyPreviewRow>[] = [
    {
      key: "id" as keyof PropertyPreviewRow,
      label: (
        <Checkbox
          checked={allSelected}
          onCheckedChange={() => onSelectAll()}
          aria-label={tCommon("table.selectAll")}
        />
      ),
      width: "40px",
      render: (_value, row) => (
        <Checkbox
          checked={selectedPropertyIds.has(row.id)}
          onCheckedChange={(checked) => onPropertySelect(row.id, Boolean(checked))}
          aria-label={tCommon("table.selectRow", { id: row.propertyNo })}
        />
      ),
    },
    ...baseColumns,
  ];

  const totalPages = Math.ceil(filteredProperties.length / pageSize);

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
        totalCount={filteredProperties.length}
        totalPages={totalPages}
        onPageChange={setPropertiesPage}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
        paginationConfig={{ enabled: totalPages > 1, showPageSizeSelector: false }}
        getRowKey={(row) => String(row.id)}
        height="lg"
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
                title={`${totalCount} ${t("preview.propertiesLoaded")}`}
              >
                {totalCount} {t("preview.propertiesLoaded")}
              </Badge>
            )}
            <SearchInput
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={t("preview.searchPlaceholder")}
              className="w-60 mb-0"
            />
            
          </div>
        }
        footerLeftContent={
          paginationInfo && paginationInfo.total > 0 ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {tCommon("table.showing")} {paginationInfo.start} {tCommon("table.to")} {paginationInfo.end} {tCommon("table.of")} {paginationInfo.total} {tCommon("table.entries")}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{tCommon("table.rowsPerPage")}:</span>
                <Select
                  value={String(pageSize)}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  options={pageSizeOptions.map((opt) => ({
                    value: String(opt),
                    label: String(opt),
                  }))}
                  className="w-20"
                />
              </div>
            </div>
          ) : undefined
        }
      />
    </div>
  );
};

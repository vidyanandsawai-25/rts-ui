"use client";

import { Building2, Trash2 } from "lucide-react";
import { Button, ConfirmProvider, MasterTable } from "@/components/common";
import type { Column } from "@/components/common";
import type { DirectPropertyDeleteRow } from "@/types/zoneMaster.types";
import { useDirectPropertyDelete } from "./hooks/useDirectPropertyDelete";
import { buildDirectPropertyDeleteColumns } from "./directPropertyDeleteColumns";

interface DirectPropertyDeleteSectionProps {
  propertyId: string;
  wardNo?: string | null;
  propertyNo?: string | null;
  partitionNo?: string | null;
  categoryName?: string | null;
  subRows?: DirectPropertyDeleteRow[];
  onSubRowDeleted?: () => void;
  onDeleted: () => void;
  t: (key: string, params?: Record<string, string | number | Date>) => string;
}

function DirectPropertyDeleteSectionInner({
  propertyId,
  wardNo,
  propertyNo,
  partitionNo,
  categoryName,
  subRows,
  onSubRowDeleted,
  onDeleted,
  t,
}: DirectPropertyDeleteSectionProps) {
  const hasSubRows = !!subRows && subRows.length > 0;

  const mainRow: DirectPropertyDeleteRow = {
    propertyId,
    wardNo: wardNo || "",
    propertyNo: propertyNo || "",
    partitionNo: partitionNo || "",
    categoryName: categoryName || "",
  };

  const tableData = hasSubRows ? subRows : [mainRow];

  const {
    isDeleting,
    selectedRows,
    allSelected,
    someSelected,
    toggleSelectAll,
    toggleRow,
    handleBulkDelete,
    createDeleteHandler,
  } = useDirectPropertyDelete({ tableData, hasSubRows, onSubRowDeleted, onDeleted, t });

  const columns = buildDirectPropertyDeleteColumns({
    allSelected,
    someSelected,
    selectedRows,
    isDeleting,
    hasSubRows,
    onSubRowDeleted,
    onDeleted,
    toggleSelectAll,
    toggleRow,
    createDeleteHandler,
    tableData,
    t,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-blue-600" />
        <h4 className="text-sm font-semibold text-gray-700">
          {t("createProperty.property")}
        </h4>
      </div>

      <MasterTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        data={tableData as unknown as Record<string, unknown>[]}
        loading={isDeleting}
        emptyText={t("createProperty.noPropertiesFound")}
        height="xs"
        paginationConfig={{ enabled: false }}
      />

      {selectedRows.size > 0 && (
        <div className="flex justify-end pt-2">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleBulkDelete}
            isLoading={isDeleting}
            disabled={isDeleting}
          >
            {t("createProperty.deleteSelectedCount", { count: selectedRows.size })}
          </Button>
        </div>
      )}
    </div>
  );
}

export function DirectPropertyDeleteSection(
  props: DirectPropertyDeleteSectionProps
) {
  return (
    <ConfirmProvider>
      <DirectPropertyDeleteSectionInner {...props} />
    </ConfirmProvider>
  );
}

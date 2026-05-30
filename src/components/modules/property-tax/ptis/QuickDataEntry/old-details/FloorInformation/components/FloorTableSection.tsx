"use client"

import { useCallback } from "react";
import { DeleteButton, EditButton, MasterTable, useConfirm } from "@/components/common";
import type { FloorTableRow } from "@/types/OldDetails/property-old-details.types";
import { getFloorInformationColumns } from "../FloorInformationColumns";
import { FloorTableSectionProps } from "@/types/OldDetails/property-old-floor-info.types";
import { formatNumberPair } from "@/lib/utils/format";

/**
 * FloorTableSection Component
 * Displays the list of existing floor details in a table format
 * Handles edit and delete actions for floor records
 */
export function FloorTableSection({
  t,
  tCommon,
  existingFloorDetails,
  totalCount,
  pageNumber,
  pageSize,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: FloorTableSectionProps) {
  const { confirm } = useConfirm();

  const handleDeleteClick = useCallback((row: FloorTableRow) => {
    confirm({
      variant: "delete",
      title: tCommon("messages.confirmDelete"),
      meta: { id: row.id, name: row.floor },
      onConfirm: async () => {
        await onDelete(row.id);
      }
    });
  }, [confirm, tCommon, onDelete]);

  const transformedData: FloorTableRow[] = existingFloorDetails.map(f => ({
    id: f.id,
    originalRow: f,
    floor: f.floorDescription,
    subFloor: f.subFloorDescription,
    conYr: f.oldConstructionYear,
    assessmentYr: f.oldAssessmentYear || '',
    conTyp: f.constructionTypeDescription,
    use: f.typeOfUseDescription,
    subUse: f.subTypeOfUseDescription,
    carpetAreaSqFt: f.oldCarpetAreaSqFeet,
    carpetAreaSqM: f.oldCarpetAreaSqMeter,
    carpetAreaCombined: formatNumberPair(
      f.oldCarpetAreaSqFeet != null ? Number(f.oldCarpetAreaSqFeet) : null,
      f.oldCarpetAreaSqMeter != null ? Number(f.oldCarpetAreaSqMeter) : null
    ),
    builtupAreaCombined: formatNumberPair(
      f.oldBuiltupAreaSqFeet != null ? Number(f.oldBuiltupAreaSqFeet) : null,
      f.oldBuiltupAreaSqMeter != null ? Number(f.oldBuiltupAreaSqMeter) : null
    ),
  }));

  return (
    <div className="rounded-lg bg-white shadow-sm mb-6 border border-blue-200 [&_th]:whitespace-nowrap [&_th:last-child]:text-white! [&_th:last-child]:text-xs [&_th:last-child]:border-l [&_th:last-child]:border-white/30">
      <MasterTable
        data={transformedData}
        columns={getFloorInformationColumns(t)}
        emptyText={t('floor.noFloorData')}
        maxBodyHeightClassName="max-h-[400px]" //max-h-[400px]
        theadClassName="sticky top-0 z-20 bg-[#2D3E8A] text-white border-b border-blue-300"
        rowClassName={() => "hover:bg-blue-50/50 transition-colors"}       
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={(size) => onPageSizeChange(String(size))}
        paginationConfig={{
          enabled: true,
          showPageSizeSelector: true,
        }}
        getRowKey={(row) => row.id}
        renderActions={useCallback((row: FloorTableRow) => (
          <div className="flex items-center gap-2 whitespace-nowrap">
            <EditButton onClick={() => onEdit(row.originalRow)} />
            <DeleteButton onClick={() => handleDeleteClick(row)} />
          </div>
        ), [onEdit, handleDeleteClick])}
      />
    </div>
  );
}

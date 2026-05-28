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
  onEdit,
  onDelete
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
    <div className="rounded-lg overflow-x-auto bg-white shadow-sm mb-6 border border-blue-200 [&_th:last-child]:text-white! [&_th:last-child]:text-xs [&_th:last-child]:border-l [&_th:last-child]:border-white/30">
      <MasterTable
        columns={getFloorInformationColumns(t)}
        data={transformedData}
        totalCount={existingFloorDetails.length}
        getRowKey={(row: FloorTableRow) => String(row.id || "")}
        maxBodyHeightClassName="max-h-[350px]"
        theadClassName="sticky top-0 z-20 bg-[#2D3E8A] text-white border-b border-blue-300"
        rowClassName={() => "hover:bg-blue-50/50 transition-colors"}
        tableClassName="min-w-max"
        actionLabel={t('floor.actions').toUpperCase()}
        renderActions={useCallback((row: FloorTableRow) => (
          <div className="flex items-center gap-2 whitespace-nowrap ">
            <EditButton onClick={() => onEdit(row.originalRow)} />
            <DeleteButton onClick={() => handleDeleteClick(row)} />
          </div>
        ), [onEdit, handleDeleteClick])}
      />
    </div>
  );
}

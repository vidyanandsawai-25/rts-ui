"use client"

import { useCallback } from "react";
import { DeleteButton, EditButton, MasterTable, useConfirm } from "@/components/common";
import type { FloorTableRow } from "@/types/OldDetails/property-old-details.types";
import { getFloorInformationColumns } from "../FloorInformationColumns";
import { FloorTableSectionProps } from "@/types/OldDetails/property-old-floor-info.types";

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
    builtupAreaSqFt: f.oldBuiltupAreaSqFeet || '',
  }));

  return (
    <div className="rounded-lg overflow-x-auto bg-white shadow-sm mb-6 border border-blue-200 [&_thead]:bg-none! [&_thead]:bg-[#2D3E8A]! [&_th]:text-white! [&_th]:whitespace-nowrap! [&_th]:font-semibold!">
      <MasterTable
        columns={getFloorInformationColumns(t)}
        data={transformedData}
        totalCount={existingFloorDetails.length}
        getRowKey={(row: FloorTableRow) => String(row.id || "")}
        maxBodyHeightClassName="max-h-[350px]"
        theadClassName="sticky top-0 z-20 bg-[#2D3E8A] text-white"
        rowClassName={() => "hover:bg-blue-50/50 transition-colors"}
        tableClassName="min-w-max"
        
        actionLabel={t('floor.actions')}
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

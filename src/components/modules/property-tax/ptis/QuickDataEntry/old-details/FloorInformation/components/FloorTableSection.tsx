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
    <div className="border border-blue-100 rounded-xl overflow-hidden bg-gray-50/30 mb-10">
      <MasterTable
        columns={getFloorInformationColumns(t)}
        data={transformedData}
        totalCount={existingFloorDetails.length}
        getRowKey={(row: FloorTableRow) => String(row.id || "")}
        maxBodyHeightClassName="max-h-[400px]"
        theadClassName="bg-blue-50 text-blue-900 border-b border-blue-100"
        rowClassName={() => "hover:bg-blue-50/50 transition-colors"}
        actionLabel={t('floor.actions')}
        renderActions={useCallback((row: FloorTableRow) => (
          <div className="flex items-center gap-2">
            <EditButton onClick={() => onEdit(row.originalRow)} />
            <DeleteButton onClick={() => handleDeleteClick(row)} />
          </div>
        ), [onEdit, handleDeleteClick])}
      />
    </div>
  );
}

"use client"

import { useCallback } from "react";
import { DeleteButton, EditButton, FloorDetailsTable, useConfirm } from "@/components/common";
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

  const columns = getFloorInformationColumns(t);
  
  // Update the actions column render function
  const columnsWithActions = columns.map(col => {
    if (col.key === 'actions') {
      return {
        ...col,
        render: (row: FloorTableRow) => (
          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
            <EditButton onClick={() => onEdit(row.originalRow)} />
            <DeleteButton onClick={() => handleDeleteClick(row)} />
          </div>
        ),
      };
    }
    return col;
  });

  return (
    <div className="mt-6">
      <FloorDetailsTable
        data={transformedData}
        columns={columnsWithActions}
        emptyMessage={t('floor.noFloorData')}
        showExpandColumn={false}
        showBorder={true}
        striped={true}
        hoverable={true}
        containerClassName="max-h-[400px] overflow-y-auto"
      />
    </div>
  );
}

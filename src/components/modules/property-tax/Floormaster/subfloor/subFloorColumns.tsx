import React from "react";
import type { Column } from "@/components/common/MasterTable";
import type { SubFloor } from "@/types/floor.types";
import { SortAscButton, SortDescButton, SortDefaultButton } from "@/components/common/ActionButtons";

/**
 * Renders a sortable column header with sort icon
 */
function SortableHeader({
  label,
  columnKey,
  sortBy,
  sortOrder,
  onSort,
  tCommon,
}: {
  label: string;
  columnKey: string;
  sortBy?: string;
  sortOrder?: string;
  onSort: (key: string) => void;
  tCommon: (key: string) => string;
}): React.ReactElement {
  const isActive = sortBy === columnKey;
  const isAsc = isActive && sortOrder === "asc";
  const isDesc = isActive && sortOrder === "desc";

  const renderSortButton = () => {
    if (isAsc) {
      return (
        <SortAscButton
          onClick={() => onSort(columnKey)}
          aria-label={`${tCommon("table.sort.verb")} ${label} ${tCommon("table.sort.ascending")}`}
        />
      );
    }
    if (isDesc) {
      return (
        <SortDescButton
          onClick={() => onSort(columnKey)}
          aria-label={`${tCommon("table.sort.verb")} ${label} ${tCommon("table.sort.descending")}`}
        />
      );
    }
    return (
      <SortDefaultButton
        onClick={() => onSort(columnKey)}
        aria-label={`${tCommon("table.sort.by")} ${label}`}
      />
    );
  };

  return (
    <div className="flex items-center gap-1 justify-center w-full">
      <span>{label}</span>
      {renderSortButton()}
    </div>
  );
}

export const subFloorColumns = (
  t: (key: string) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void
): Column<SubFloor>[] => {
  // Sortable columns (all columns sortable in UI)
  const sortableColumns = ["subFloorCode", "description", "isActive"];

  const createSortableLabel = (label: string, key: string) => {
    if (onSort && sortableColumns.includes(key)) {
      return (
        <SortableHeader
          label={label}
          columnKey={key}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          tCommon={tCommon}
        />
      );
    }
    return label;
  };

  return [
    {
      key: "subFloorCode",
      label: createSortableLabel(t("table.columns.subFloorCode"), "subFloorCode"),
      width: "15%",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "description",
      label: createSortableLabel(t("table.columns.descriptionRegional"), "description"),
      width: "25%",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "isActive",
      label: createSortableLabel(t("table.columns.status"), "isActive"),
      width: "15%",
      isStatus: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
  ];
};

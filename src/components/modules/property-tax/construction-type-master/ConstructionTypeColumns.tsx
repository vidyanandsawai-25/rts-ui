import React from "react";
import type { Column } from "@/components/common/MasterTable";
import type { ConstructionType } from "@/types/construction.types";
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
}: {
  label: string;
  columnKey: string;
  sortBy?: string;
  sortOrder?: string;
  onSort: (key: string) => void;
}): React.ReactElement {
  const isActive = sortBy === columnKey;
  const isAsc = isActive && sortOrder === "asc";
  const isDesc = isActive && sortOrder === "desc";

  const renderSortButton = () => {
    if (isAsc) {
      return (
        <SortAscButton
          onClick={() => onSort(columnKey)}
          aria-label={`Sort ${label} ascending`}
        />
      );
    }
    if (isDesc) {
      return (
        <SortDescButton
          onClick={() => onSort(columnKey)}
          aria-label={`Sort ${label} descending`}
        />
      );
    }
    return (
      <SortDefaultButton
        onClick={() => onSort(columnKey)}
        aria-label={`Sort by ${label}`}
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

/**
 * Returns the table column configuration for Construction Type Master
 * @param t - Translation function from useTranslations("construction.constructionType")
 * @param sortBy - Current sort column
 * @param sortOrder - Current sort order (asc/desc)
 * @param onSort - Callback when column header is clicked for sorting
 * @returns Array of column definitions
 */
export function getConstructionTypeColumns(
  t: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void
): Column<ConstructionType>[] {
  // Only constructionCode and description are sortable (API limitation)
  const sortableColumns = ["constructionCode", "description"];

  const createSortableLabel = (label: string, key: string) => {
    if (onSort && sortableColumns.includes(key)) {
      return (
        <SortableHeader
          label={label}
          columnKey={key}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        />
      );
    }
    return label;
  };

  return [
    {
      key: "constructionCode",
      label: createSortableLabel(t("list.table.constructionCode"), "constructionCode"),
      width: "15%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "description",
      label: createSortableLabel(t("list.table.description"), "description"),
      width: "35%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "searchSequence",
      label: createSortableLabel(t("list.table.searchSequence"), "searchSequence"),
      width: "15%",
      render: (value) => (typeof value === "number" ? value : ""),
    },
    {
      key: "isActive",
      label: createSortableLabel(t("list.table.status"), "isActive"),
      width: "20%",
      isStatus: true,
    },
  ];
}
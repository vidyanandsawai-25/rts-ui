import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { Column } from "@/components/common/MasterTable";
import type { ConstructionType } from "@/types/construction.types";

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

  return (
    <button
      type="button"
      onClick={() => onSort(columnKey)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer w-full justify-center"
      aria-label={`Sort by ${label}`}
    >
      <span>{label}</span>
      {isAsc && <ArrowUp className="h-4 w-4 text-blue-600" />}
      {isDesc && <ArrowDown className="h-4 w-4 text-blue-600" />}
      {!isActive && <ArrowUpDown className="h-4 w-4 text-gray-400" />}
    </button>
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
import React from "react";
import type { Column } from "@/components/common/MasterTable";
import type { AssetGrievanceCategory } from "@/types/asset-masters/asset-grievance-category.types";
import { SortAscButton, SortDescButton, SortDefaultButton } from "@/components/common/ActionButtons";

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

export function getAssetGrievanceCategoryColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void
): Column<AssetGrievanceCategory>[] {
  const sortableColumns = ["categoryName", "resolutionSlaDays"];

  const createSortableLabel = (label: string, key: string) => {
    if (onSort && sortableColumns.includes(key)) {
      return (
        <SortableHeader
          label={label}
          columnKey={key}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          tCommon={(k) => tCommon(k)}
        />
      );
    }
    return label;
  };

  return [
    {
      key: "categoryName",
      label: createSortableLabel(t("list.headers.name"), "categoryName"),
      width: "35%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "resolutionSlaDays",
      label: createSortableLabel(t("list.headers.sla"), "resolutionSlaDays"),
      width: "20%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (value != null ? `${String(value)} ${t("list.days")}` : "-"),
    },
    {
      key: "description",
      label: t("list.headers.description"),
      width: "35%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : "-"),
    },
    {
      key: "isActive",
      label: t("list.headers.status"),
      width: "10%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      isStatus: true,
    },
  ];
}

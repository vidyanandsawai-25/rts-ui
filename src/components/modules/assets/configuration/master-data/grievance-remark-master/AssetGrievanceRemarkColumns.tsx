import React from "react";
import type { Column } from "@/components/common/MasterTable";
import type { AssetGrievanceRemark } from "@/types/asset-masters/asset-grievance-remark.types";
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

export function getAssetGrievanceRemarkColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void
): Column<AssetGrievanceRemark>[] {
  // NOTE: "grievanceCategoryName" is mapped to "grievanceCategoryId" for sorting.
  // The "description" and "isActive" columns are present in the table but are marked
  // as non-sortable because the backend API does not support sorting on these fields.
  const sortableColumns: Record<string, string> = {
    remark: "remark",
    grievanceCategoryName: "grievanceCategoryId",
  };

  const createSortableLabel = (label: string, key: string) => {
    const apiSortKey = sortableColumns[key];
    if (onSort && apiSortKey) {
      return (
        <SortableHeader
          label={label}
          columnKey={apiSortKey}
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
      key: "grievanceCategoryName",
      label: createSortableLabel(t("table.columns.remarkType"), "grievanceCategoryName"),
      width: "25%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : "-"),
    },
    {
      key: "remark",
      label: createSortableLabel(t("table.columns.remark"), "remark"),
      width: "35%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "description",
      label: t("form.description") || "Description",
      width: "30%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : "-"),
    },
    {
      key: "isActive",
      label: t("table.columns.status"),
      width: "10%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      isStatus: true,
    },
  ];
}

"use client";

import React from "react";
import { Badge } from "@/components/common/Badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SortAscButton, SortDescButton, SortDefaultButton } from "@/components/common/ActionButtons";
import type { Column } from "@/components/common/MasterTable";
import type { MasterDataRecord } from "@/types/asset-masters/master-data.types";

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
  /** Returns the localized verb phrase, e.g. "Sort ascending" / "Sort by" */
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
    <div className="flex items-center gap-1 justify-start w-full">
      <span>{label}</span>
      {renderSortButton()}
    </div>
  );
}

export function getAssetTypeColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (field: string) => void
): Column<MasterDataRecord>[] {
  const sortableColumns = ["typeCode", "typeName", "description"];

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
      key: "id",
      width: "15%",
      label: createSortableLabel(t("labels.code"), "typeCode"),
      render: (_, r) => (
        <Badge variant="secondary" size="sm">
          {String((r as Record<string, unknown>).code || (r as Record<string, unknown>).typeCode || "")}
        </Badge>
      ),
    },
    {
      key: "name",
      width: "28%",
      label: createSortableLabel(t("labels.name"), "typeName"),
      render: (_, r) => (
        <div className="font-semibold text-sm text-slate-800">{r.name}</div>
      ),
    },
    {
      key: "description",
      width: "37%",
      label: createSortableLabel(t("labels.description"), "description"),
      render: (_, r) => (
        <div className="text-xs text-slate-600 line-clamp-2">
          {r.description || "-"}
        </div>
      ),
    },
    {
      key: "status",
      width: "15%",
      label: t("labels.status"),
      isStatus: true,
      render: (_, r) => <StatusBadge value={r.status} />,
    },
  ];
}

import React from "react";
import type { Column } from "@/components/common/MasterTable";
import type { AssetFieldDefinition } from "@/types/asset-masters/asset-field-definition.types";
import { SortAscButton, SortDescButton, SortDefaultButton, ViewButton } from "@/components/common/ActionButtons";
import { StatusBadge } from "@/components/common/StatusBadge";

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

export function getAssetFieldDefinitionColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void,
  onViewOptions?: (row: AssetFieldDefinition) => void
): Column<AssetFieldDefinition>[] {
  const sortableColumns = ["fieldCode", "fieldName"];

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
      key: "fieldCode",
      label: createSortableLabel(t("list.table.fieldCode"), "fieldCode"),
      width: "15%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "fieldName",
      label: createSortableLabel(t("list.table.fieldName"), "fieldName"),
      width: "15%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "fieldLabel",
      label: t("list.table.fieldLabel"),
      width: "15%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "fieldType",
      label: t("list.table.fieldType"),
      width: "10%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "fieldGroup",
      label: t("list.table.fieldGroup"),
      width: "15%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (typeof value === "string" && value ? value : "-"),
    },
    {
      key: "displayOrder",
      label: t("list.table.displayOrder"),
      width: "10%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (value != null ? String(value) : "-"),
    },
    {
      key: "isRequired",
      label: t("list.table.isRequired"),
      width: "10%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (value) => (
        <StatusBadge
          value={Boolean(value)}
          activeLabel={t("yes")}
          inactiveLabel={t("no")}
        />
      ),
    },
    {
      key: "viewOptions",
      label: t("list.table.viewOptions") || "View Options",
      width: "10%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      render: (_value, row) => {
        const isOptionType = ["radio", "checkbox", "select"].includes(row.fieldType);
        const hasOptions = Boolean(row.optionsJson && row.optionsJson.trim() !== "");
        if (isOptionType && hasOptions) {
          return (
            <ViewButton
              aria-label={t("list.table.viewOptions") || "View Options"}
              onClick={() => onViewOptions?.(row)}
            />
          );
        }
        return "-";
      },
    },
    {
      key: "isActive",
      label: t("list.table.status"),
      width: "10%",
      align: "center",
      headerClassName: "break-words [word-break:break-word]",
      cellClassName: "break-words [word-break:break-word]",
      isStatus: true,
    },
  ];
}

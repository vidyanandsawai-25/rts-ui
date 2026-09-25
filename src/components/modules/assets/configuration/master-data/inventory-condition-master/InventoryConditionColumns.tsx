import React from "react";
import type { Column } from "@/components/common/MasterTable";
import type { InventoryCondition } from "@/types/asset-masters/inventory-condition.types";
import { SortAscButton, SortDescButton, SortDefaultButton } from "@/components/common/ActionButtons";

function SortableHeader({
  label,
  columnKey,
  sortBy,
  sortOrder,
  onSort,
  tCommon,
  justify = "start",
}: {
  label: string;
  columnKey: string;
  sortBy?: string;
  sortOrder?: string;
  onSort: (key: string) => void;
  tCommon?: (key: string) => string;
  justify?: "start" | "center" | "end";
}): React.ReactElement {
  const isActive = sortBy === columnKey;
  const isAsc = isActive && sortOrder === "asc";
  const isDesc = isActive && sortOrder === "desc";

  const renderSortButton = () => {
    if (isAsc) {
      return (
        <SortAscButton
          onClick={() => onSort(columnKey)}
          aria-label={tCommon ? `${tCommon("table.sort.verb")} ${label} ${tCommon("table.sort.ascending")}` : `Sort ${label} ascending`}
        />
      );
    }
    if (isDesc) {
      return (
        <SortDescButton
          onClick={() => onSort(columnKey)}
          aria-label={tCommon ? `${tCommon("table.sort.verb")} ${label} ${tCommon("table.sort.descending")}` : `Sort ${label} descending`}
        />
      );
    }
    return (
      <SortDefaultButton
        onClick={() => onSort(columnKey)}
        aria-label={tCommon ? `${tCommon("table.sort.by")} ${label}` : `Sort by ${label}`}
      />
    );
  };

  const justifyClass = justify === "center" ? "justify-center" : justify === "end" ? "justify-end" : "justify-start";

  return (
    <div className={`flex items-center gap-1 ${justifyClass} w-full`}>
      <span>{label}</span>
      {renderSortButton()}
    </div>
  );
}

export function getInventoryConditionColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void
): Column<InventoryCondition>[] {
  const sortableColumns = ["conditionName"];

  const createSortableLabel = (label: string, key: string, justify: "start" | "center" | "end" = "start") => {
    if (onSort && sortableColumns.includes(key)) {
      return (
        <SortableHeader
          label={label}
          columnKey={key}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          tCommon={(k) => tCommon(k)}
          justify={justify}
        />
      );
    }
    return label;
  };

  return [
    {
      key: "conditionCategory",
      label: t("configuration.masterData.form.labels.conditionType"),
      width: "18%",
      render: (value, row) => {
        const catType = (value || row.conditionType || "-") as string;
        return <div className="text-sm font-medium text-slate-700">{catType}</div>;
      },
    },
    {
      key: "conditionName",
      label: createSortableLabel(t("configuration.masterData.form.labels.name"), "conditionName"),
      width: "22%",
      render: (value) => <div className="font-semibold text-sm text-slate-800 break-all whitespace-normal">{typeof value === "string" ? value : ""}</div>,
    },
    {
      key: "conditionFactor",
      label: t("configuration.masterData.form.labels.conditionFactor"),
      width: "12%",
      render: (value) => (
        <div className="text-sm text-slate-600 font-medium">
          {value !== undefined && value !== null && value !== "" ? String(value) : "-"}
        </div>
      ),
    },
    {
      key: "displayOrder",
      label: t("configuration.masterData.form.labels.displayOrder"),
      width: "12%",
      render: (value) => (
        <div className="text-sm text-slate-600">
          {value !== undefined && value !== null && value !== "" ? String(value) : "-"}
        </div>
      ),
    },
    {
      key: "description",
      label: t("configuration.masterData.form.labels.description"),
      width: "26%",
      render: (value) => (
        <div className="text-sm text-slate-600 line-clamp-2 break-all whitespace-normal">
          {typeof value === "string" ? value : "-"}
        </div>
      ),
    },
    {
      key: "isActive",
      label: t("configuration.masterData.form.labels.status"),
      width: "10%",
      isStatus: true,
    },
  ];
}

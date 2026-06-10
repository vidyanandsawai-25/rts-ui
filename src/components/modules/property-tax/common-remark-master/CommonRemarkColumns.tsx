import React from "react";
import type { Column } from "@/components/common/MasterTable";
import type { CommonRemark } from "@/types/common-remark-master/common-remark.types";
import { SortAscButton, SortDescButton, SortDefaultButton } from "@/components/common";

interface SortableHeaderProps {
  label: string;
  columnKey: string;
  sortBy?: string;
  sortOrder?: string;
  onSort: (key: string) => void;
  tCommon: (key: string) => string;
}

function SortableHeader({
  label,
  columnKey,
  sortBy,
  sortOrder,
  onSort,
  tCommon,
}: SortableHeaderProps): React.ReactElement {
  const isActive = sortBy === columnKey;
  const isAsc = isActive && sortOrder === "asc";
  const isDesc = isActive && sortOrder === "desc";

  const renderSortButton = () => {
    if (isAsc) {
      return (
        <SortAscButton
          onClick={() => onSort(columnKey)}
          aria-label={`${tCommon("table.sort.verb") || "Sort"} ${label} ${tCommon("table.sort.ascending") || "ascending"}`}
        />
      );
    }
    if (isDesc) {
      return (
        <SortDescButton
          onClick={() => onSort(columnKey)}
          aria-label={`${tCommon("table.sort.verb") || "Sort"} ${label} ${tCommon("table.sort.descending") || "descending"}`}
        />
      );
    }
    return (
      <SortDefaultButton
        onClick={() => onSort(columnKey)}
        aria-label={`${tCommon("table.sort.by") || "Sort by"} ${label}`}
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

export function getCommonRemarkColumns(
  t: (key: string, values?: Record<string, string | number>) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void
): Column<CommonRemark>[] {
  const getBadgeColorClass = (type: string, id?: number) => {
    const staticColors: Record<string, string> = {
      Survey: "bg-[#E3F0FB] text-[#1565C0] border-[#BFDBF5]",
      Recovery: "bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]",
      Notice: "bg-[#F3E8FF] text-[#6A1B9A] border-[#D1C4E9]",
      "Mobile Remark": "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]",
    };

    if (staticColors[type]) {
      return staticColors[type];
    }

    const colorStyles = [
      "bg-[#E3F0FB] text-[#1565C0] border-[#BFDBF5]", // Blue
      "bg-[#FFF3E0] text-[#E65100] border-[#FFCC80]", // Orange
      "bg-[#F3E8FF] text-[#6A1B9A] border-[#D1C4E9]", // Purple
      "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]", // Green
      "bg-[#FFECEF] text-[#C62828] border-[#FFCDD2]", // Red
      "bg-[#E0F7FA] text-[#00838F] border-[#B2EBF2]", // Cyan
      "bg-[#FCE4EC] text-[#AD1457] border-[#F8BBD0]", // Pink
      "bg-[#FFFDE7] text-[#F57F17] border-[#FFF9C4]", // Yellow
    ];

    if (id && Number.isFinite(id) && id > 0) {
      return colorStyles[id % colorStyles.length];
    }

    let hash = 0;
    for (let i = 0; i < type.length; i++) {
      hash = type.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorStyles.length;
    return colorStyles[index];
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return dateStr;
      }
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const createSortableLabel = (label: string, key: string) => {
    if (onSort) {
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
      key: "remarkType",
      label: createSortableLabel(t("table.columns.remarkType"), "remarkType"),
      width: "20%",
      render: (value, row) => {
        const type = String(value);
        const colorClass = getBadgeColorClass(type, row?.remarkTypeId ? Number(row.remarkTypeId) : undefined);
        return (
          <span className={`inline-block px-2 py-0.5 text-xs font-semibold border rounded-sm ${colorClass}`}>
            {type}
          </span>
        );
      },
    },
    {
      key: "remark",
      label: createSortableLabel(t("table.columns.remark"), "remark"),
      width: "45%",
      render: (value) => (
        <span className="text-gray-800 font-medium line-clamp-2" title={String(value)}>
          {String(value)}
        </span>
      ),
    },
    {
      key: "status",
      label: t("table.columns.status"),
      width: "15%",
      isStatus: true,
    },
    {
      key: "createdDate",
      label: createSortableLabel(t("table.columns.createdDate"), "createdDate"),
      width: "20%",
      render: (value) => (
        <span className="text-gray-500 text-sm">
          {value ? formatDate(String(value)) : "-"}
        </span>
      ),
    },
  ];
}

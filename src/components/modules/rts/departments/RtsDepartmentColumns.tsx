import { ArrowUpDown } from "lucide-react";
import { RtsDepartmentApiItem } from "@/types/rts/departments.types";
import { StatusBadge } from "@/components/common";

export const getRtsDepartmentColumns = (
  t: any,
  tCommon: any,
  _sortBy?: string,
  _sortOrder?: string,
  onSort?: (col: string) => void
) => [
  {
    key: "departmentName",
    label: (
      <button
        onClick={() => onSort?.("departmentName")}
        className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span>{t("list.table.departmentName") || "Department Name (English)"}</span>
        <ArrowUpDown size={14} className="text-slate-400" />
      </button>
    ),
    render: (row: RtsDepartmentApiItem) => (
      <span className="font-semibold text-slate-900">{row.departmentName}</span>
    ),
  },
  {
    key: "departmentNameLocal",
    label: (
      <span className="font-bold text-slate-800">
        {t("list.table.departmentNameLocal") || "Local Name"}
      </span>
    ),
    render: (row: RtsDepartmentApiItem) => (
      <span className="text-slate-600">{row.departmentNameLocal || "-"}</span>
    ),
  },
  {
    key: "departmentIcon",
    label: (
      <span className="font-bold text-slate-800">
        {t("list.table.departmentIcon") || "Icon"}
      </span>
    ),
    render: (row: RtsDepartmentApiItem) => (
      <span className="font-mono text-xs text-slate-500">{row.departmentIcon || "-"}</span>
    ),
  },
  {
    key: "displayOrder",
    label: (
      <button
        onClick={() => onSort?.("displayOrder")}
        className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span>{t("list.table.displayOrder") || "Order"}</span>
        <ArrowUpDown size={14} className="text-slate-400" />
      </button>
    ),
    render: (row: RtsDepartmentApiItem) => (
      <span className="text-slate-600 font-mono">{row.displayOrder}</span>
    ),
  },
  {
    key: "isActive",
    label: <span className="font-bold text-slate-800">{tCommon("table.columns.status")}</span>,
    render: (row: RtsDepartmentApiItem) => (
      <StatusBadge
        value={row.isActive}
        activeLabel={tCommon("status.active")}
        inactiveLabel={tCommon("status.inactive")}
      />
    ),
  },
];

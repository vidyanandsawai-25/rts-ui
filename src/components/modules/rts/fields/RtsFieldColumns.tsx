import { ArrowUpDown } from "lucide-react";
import { RtsFieldDefinitionApiItem } from "@/types/rts/field-definition.types";
import { StatusBadge } from "@/components/common";

export const getRtsFieldColumns = (
  t: any,
  tCommon: any,
  _sortBy?: string,
  _sortOrder?: string,
  onSort?: (col: string) => void
) => [
  {
    key: "fieldLabel",
    label: (
      <button
        onClick={() => onSort?.("fieldLabel")}
        className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span>{t("list.table.fieldLabel") || "Field Label (English)"}</span>
        <ArrowUpDown size={14} className="text-slate-400" />
      </button>
    ),
    render: (row: RtsFieldDefinitionApiItem) => (
      <div className="space-y-0.5">
        <div className="font-semibold text-slate-950">{row.fieldLabel}</div>
        <div className="text-[10px] text-slate-400 font-mono font-bold">{row.fieldCode}</div>
      </div>
    ),
  },
  {
    key: "fieldLabelLocal",
    label: (
      <span className="font-bold text-slate-800">
        {t("list.table.fieldLabelLocal") || "Local Label"}
      </span>
    ),
    render: (row: RtsFieldDefinitionApiItem) => (
      <span className="text-slate-700">{row.fieldLabelLocal || "-"}</span>
    ),
  },
  {
    key: "fieldType",
    label: <span className="font-bold text-slate-800">Type</span>,
    render: (row: RtsFieldDefinitionApiItem) => (
      <span className="text-slate-500 font-mono text-xs capitalize bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
        {row.fieldType}
      </span>
    ),
  },
  {
    key: "fieldGroup",
    label: <span className="font-bold text-slate-800">Section Group</span>,
    render: (row: RtsFieldDefinitionApiItem) => (
      <span className="text-slate-600 text-xs font-semibold">{row.fieldGroup || "General"}</span>
    ),
  },
  {
    key: "isRequired",
    label: <span className="font-bold text-slate-800">Mandatory</span>,
    render: (row: RtsFieldDefinitionApiItem) => (
      <span
        className={`text-xs font-bold ${
          row.isRequired ? "text-red-600 bg-red-50 border-red-100" : "text-slate-500 bg-slate-50 border-slate-200"
        } px-2 py-0.5 rounded border`}
      >
        {row.isRequired ? "Required" : "Optional"}
      </span>
    ),
  },
  {
    key: "displayOrder",
    label: <span className="font-bold text-slate-800">Order</span>,
    render: (row: RtsFieldDefinitionApiItem) => (
      <span className="text-slate-600 font-mono text-xs">{row.displayOrder}</span>
    ),
  },
  {
    key: "isActive",
    label: <span className="font-bold text-slate-800">{tCommon("table.columns.status")}</span>,
    render: (row: RtsFieldDefinitionApiItem) => (
      <StatusBadge
        value={row.isActive}
        activeLabel={tCommon("status.active")}
        inactiveLabel={tCommon("status.inactive")}
      />
    ),
  },
];

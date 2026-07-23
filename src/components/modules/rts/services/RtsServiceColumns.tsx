import { ArrowUpDown } from "lucide-react";
import { RtsServiceApiItem } from "@/types/rts/service.types";
import { StatusBadge } from "@/components/common";

export const getRtsServiceColumns = (
  t: any,
  tCommon: any,
  _sortBy?: string,
  _sortOrder?: string,
  onSort?: (col: string) => void
) => [
  {
    key: "serviceName",
    label: (
      <button
        onClick={() => onSort?.("serviceName")}
        className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span>{t("list.table.serviceName") || "Service Name (English)"}</span>
        <ArrowUpDown size={14} className="text-slate-400" />
      </button>
    ),
    render: (row: RtsServiceApiItem) => (
      <div className="space-y-0.5">
        <div className="font-semibold text-slate-950">{row.serviceName}</div>
        <div className="text-[10px] text-slate-400 font-medium">/{row.serviceUrl || "-"}</div>
      </div>
    ),
  },
  {
    key: "serviceNameLocal",
    label: (
      <span className="font-bold text-slate-800">
        {t("list.table.serviceNameLocal") || "Local Name"}
      </span>
    ),
    render: (row: RtsServiceApiItem) => (
      <span className="text-slate-700">{row.serviceNameLocal || "-"}</span>
    ),
  },
  {
    key: "sla",
    label: (
      <button
        onClick={() => onSort?.("sla")}
        className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-900 cursor-pointer"
      >
        <span>SLA (Days)</span>
        <ArrowUpDown size={14} className="text-slate-400" />
      </button>
    ),
    render: (row: RtsServiceApiItem) => (
      <span className="text-slate-700 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
        {row.sla} Days
      </span>
    ),
  },
  {
    key: "fees",
    label: <span className="font-bold text-slate-800">Fees (₹)</span>,
    render: (row: RtsServiceApiItem) => (
      <span className="text-slate-700 font-mono text-xs">
        {row.isFeesRequired ? `₹${row.fees}` : "Free"}
      </span>
    ),
  },
  {
    key: "displayOrder",
    label: <span className="font-bold text-slate-800">Order</span>,
    render: (row: RtsServiceApiItem) => (
      <span className="text-slate-500 font-mono text-xs">{row.displayOrder}</span>
    ),
  },
  {
    key: "isActive",
    label: <span className="font-bold text-slate-800">{tCommon("table.columns.status")}</span>,
    render: (row: RtsServiceApiItem) => (
      <StatusBadge
        value={row.isActive}
        activeLabel={tCommon("status.active")}
        inactiveLabel={tCommon("status.inactive")}
      />
    ),
  },
];

"use client";

import type { Column } from "@/components/common/MasterTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { ChargeHead } from "@/types/waterBill/chargeHeads.types";

export function getChargeHeadColumns(
  t?: (key: string) => string,
  tCommon?: (key: string) => string
): Column<ChargeHead>[] {
  return [
    {
      key: "code",
      label: t ? t("table.code") : "Code",
      cellClassName: "font-semibold text-blue-900 whitespace-nowrap",
    },
    {
      key: "name",
      label: t ? t("table.name") : "Name",
      cellClassName: "font-medium text-slate-800 whitespace-nowrap",
    },
    {
      key: "chargeType",
      label: t ? t("table.chargeType") : "Charge Type",
      cellClassName: "text-slate-700 whitespace-nowrap",
    },
    {
      key: "isTax",
      label: t ? t("table.tax") : "Tax",
      align: "center",
      render: (val) => (
        <StatusBadge
          value={val ? (tCommon ? tCommon("yes") : "Yes") : (tCommon ? tCommon("no") : "No")}
          variant="status"
          className={val ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}
        />
      ),
    },
    {
      key: "isPenalty",
      label: t ? t("table.penalty") : "Penalty",
      align: "center",
      render: (val) => (
        <StatusBadge
          value={val ? (tCommon ? tCommon("yes") : "Yes") : (tCommon ? tCommon("no") : "No")}
          variant="status"
          className={val ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-slate-100 text-slate-600 border-slate-200"}
        />
      ),
    },
    {
      key: "isRefundable",
      label: t ? t("table.refundable") : "Refundable",
      align: "center",
      render: (val) => (
        <StatusBadge
          value={val ? (tCommon ? tCommon("yes") : "Yes") : (tCommon ? tCommon("no") : "No")}
          variant="status"
          className={val ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200"}
        />
      ),
    },
    {
      key: "isActive",
      label: t ? t("table.active") : "Active",
      align: "center",
      isStatus: true,
    },
  ];
}

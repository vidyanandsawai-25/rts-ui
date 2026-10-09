"use client";

import type { Column } from "@/components/common/MasterTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { ChargeHead } from "@/types/water-bill/chargeHeads.types";

export function getChargeHeadColumns(
  t?: (key: string) => string,
  tCommon?: (key: string) => string
): Column<ChargeHead>[] {
  return [
    {
      key: "chargeHeadCode",
      label: t ? t("table.code") : "Charge Head Code",
      cellClassName: "font-semibold text-blue-900 whitespace-nowrap",
    },
    {
      key: "chargeHeadName",
      label: t ? t("table.name") : "Name",
      cellClassName: "font-medium text-slate-800 whitespace-nowrap",
    },
    {
      key: "description",
      label: t ? t("table.description") : "Description",
      cellClassName: "text-slate-600",
      render: (val) => (typeof val === "string" && val ? val : "—"),
    },
    {
      key: "chargeType",
      label: t ? t("table.chargeType") : "Charge Type",
      cellClassName: "text-slate-700 whitespace-nowrap",
    },
    {
      key: "isRefundable",
      label: t ? t("table.refundable") : "Refundable",
      align: "center",
      render: (val) => (
        <StatusBadge
          value={Boolean(val)}
          activeLabel={tCommon ? tCommon("yes") : "Yes"}
          inactiveLabel={tCommon ? tCommon("no") : "No"}
          variant="status"
          className={val ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200"}
        />
      ),
    },
    {
      key: "isRegularPay",
      label: t ? t("table.regularPay") : "Regular Pay",
      align: "center",
      render: (val) => (
        <StatusBadge
          value={Boolean(val)}
          activeLabel={tCommon ? tCommon("yes") : "Yes"}
          inactiveLabel={tCommon ? tCommon("no") : "No"}
          variant="status"
          className={val ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-100 text-slate-600 border-slate-200"}
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

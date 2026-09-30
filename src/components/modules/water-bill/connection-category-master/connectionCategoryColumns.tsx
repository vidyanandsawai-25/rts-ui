import type { Column } from "@/components/common/MasterTable";
import { Badge } from "@/components/common/Badge";
import type { ConnectionCategory } from "@/types/waterBill/connectionCategoryMaster.types";

export function getConnectionCategoryColumns(
  t: (key: string) => string
): Column<ConnectionCategory>[] {
  return [
    {
      key: "connectionCategoryCode",
      label: t("table.connectionCategoryCode") || "Category Type Code",
      width: "15%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center font-medium",
    },
    {
      key: "connectionCategory",
      label: t("table.connectionCategory") || "Connection Category",
      width: "18%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "billingFrequency",
      label: t("table.billingFrequency") || "Billing Frequency",
      width: "14%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "isMetered",
      label: t("table.isMetered") || "Metered Type",
      width: "12%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (_val, row) => (
        <Badge
          variant={row.isMetered ? "success" : "secondary"}
          size="sm"
          dot
        >
          {row.isMetered
            ? t("table.metered") || "Metered"
            : t("table.unmetered") || "Non-Metered"}
        </Badge>
      ),
    },
    {
      key: "billingMethod",
      label: t("table.billingMethod") || "Billing Method",
      width: "13%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "description",
      label: t("table.description") || "Description",
      width: "18%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (val) => val ? String(val) : "_",
    },
    {
      key: "isActive",
      label: t("table.statusName") || "Status",
      width: "10%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
      isStatus: true,
    },
  ];
}

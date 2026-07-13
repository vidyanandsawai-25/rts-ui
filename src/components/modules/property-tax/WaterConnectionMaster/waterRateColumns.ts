import type { Column } from "@/components/common/MasterTable";
import type { WaterRate } from "@/types/water-connection.types";

export function getWaterRateColumns(
  t: (key: string) => string
): Column<WaterRate>[] {
  return [
    {
      key: "connectionTypeName",
      label: t("table.connectionTypeName"),
      width: "25%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "connectionSizeDisplay",
      label: t("table.connectionSizeDisplay"),
      width: "20%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "yearCode",
      label: t("table.yearCode"),
      width: "20%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "yearlyRate",
      label: t("table.yearlyRate"),
      width: "20%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    },
    {
      key: "isActive",
      label: t("table.status"),
      width: "15%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
      isStatus: true,
    },
  ];
}

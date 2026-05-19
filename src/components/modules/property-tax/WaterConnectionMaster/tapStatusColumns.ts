import type { Column } from "@/components/common/MasterTable";
import type { TapStatus } from "@/types/water-connection.types";

export function getTapStatusColumns(
  t: (key: string) => string
): Column<TapStatus>[] {
  return [
    {
      key: "statusCode",
      label: t("table.statusCode"),
      width: "25%",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "statusName",
      label: t("table.statusName"),
      width: "45%",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "isActive",
      label: t("table.status"),
      width: "30%",
      isStatus: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
  ];
}

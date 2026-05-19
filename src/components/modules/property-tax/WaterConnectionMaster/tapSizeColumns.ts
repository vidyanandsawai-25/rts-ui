import type { Column } from "@/components/common/MasterTable";
import type { TapSize } from "@/types/water-connection.types";

export function getTapSizeColumns(
  t: (key: string) => string
): Column<TapSize>[] {
  return [
    {
      key: "sizeCode",
      label: t("table.sizeCode"),
      width: "25%",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "sizeName",
      label: t("table.sizeName"),
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

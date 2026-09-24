import type { Column } from "@/components/common/MasterTable";
import type { TapSize } from "@/types/waterBill/tapSizeMaster.types";
import { formatNominalSize } from "@/lib/api/waterBill/tapSizeMaster.utils";

export function getTapSizeColumns(
  t: (key: string) => string
): Column<TapSize>[] {
  return [
    {
      key: "tapSizeCode",
      label: t("table.tapSizeCode") || "Tap Size Code",
      width: "15%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center font-medium",
    },
    {
      key: "tapSize",
      label: t("table.tapSize"),
      width: "25%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "nominalSizeValue",
      label: t("table.nominalSizeValue"),
      width: "20%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (val) => <span className="font-medium">{formatNominalSize(val)}</span>,
    },
    {
      key: "sizeUnit",
      label: t("table.sizeUnit"),
      width: "20%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "isActive",
      label: t("table.statusName"),
      width: "20%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
      isStatus: true,
    },
  ];
}

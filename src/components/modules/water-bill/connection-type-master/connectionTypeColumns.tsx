import type { Column } from "@/components/common/MasterTable";
import type { ConnectionType } from "@/types/waterBill/connectionTypeMaster.types";

export function getConnectionTypeColumns(
  t: (key: string) => string
): Column<ConnectionType>[] {
  return [
    {
      key: "connectionTypeCode",
      label: t("table.connectionTypeCode") || "Connection Type Code",
      width: "20%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center font-medium",
    },
    {
      key: "connectionType",
      label: t("table.connectionType"),
      width: "25%",
      align: "center",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "description",
      label: t("table.description"),
      width: "35%",
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

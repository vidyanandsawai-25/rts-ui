import type { Column } from "@/components/common/MasterTable";
import type { SubFloor } from "@/types/floor.types";

export const subFloorColumns = (
  t: (key: string) => string
): Column<SubFloor>[] => [
  {
    key: "subFloorCode",
    label: t("table.columns.subFloorCode"),
    width: "15%",
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    key: "description",
    label: t("table.columns.descriptionRegional"),
    width: "25%",
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
  {
    key: "isActive",
    label: t("table.columns.status"),
    width: "15%",
    isStatus: true,
    headerClassName: "text-center",
    cellClassName: "text-center",
  },
];

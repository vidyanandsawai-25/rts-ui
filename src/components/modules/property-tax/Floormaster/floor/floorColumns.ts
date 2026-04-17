import type { Column } from "@/components/common/MasterTable";
import type { Floor } from "@/types/floor.types";

export const floorColumns = (
  t: (key: string) => string
): Column<Floor>[] => [
    {
      key: "floorCode",
      label: t("table.columns.floorCode"),
      width: "15%",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "description",
      label: t("table.columns.descriptionRegional"),
      width: "30%",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "sequenceNo",
      label: t("table.columns.sequenceNo"),
      width: "15%",
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
    {
      key: "isActive",
      label: t("table.columns.status"),
      width: "20%",
      isStatus: true,
      headerClassName: "text-center",
      cellClassName: "text-center",
    },
  ];
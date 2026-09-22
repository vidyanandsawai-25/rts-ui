import type { Column } from "@/components/common/MasterTable";
import type { GeographyType } from "@/types/geographyType.types";

/**
 * Returns the table column configuration for Geography Type Master.
 * Note: the API does not support server-side sorting, so no sort controls are rendered.
 */
export function getGeographyTypeColumns(
  t: (key: string, values?: Record<string, string | number | Date>) => string
): Column<GeographyType>[] {
  return [
    {
      key: "geographyTypeCode",
      label: t("list.table.geographyTypeCode"),
      width: "25%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "geographyType",
      label: t("list.table.geographyType"),
      width: "30%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "levelNo",
      label: t("list.table.levelNo"),
      width: "20%",
      render: (value) => (typeof value === "number" ? value : ""),
    },
    {
      key: "isActive",
      label: t("list.table.status"),
      width: "25%",
      isStatus: true,
    },
  ];
}

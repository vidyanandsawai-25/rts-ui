import type { Column } from "@/components/common/MasterTable";
import type { GeographyUnit } from "@/types/geographyUnit.types";

/**
 * Returns the table column configuration for Geography Unit Master.
 * Note: the API does not support server-side sorting, so no sort controls are rendered.
 */
export function getGeographyUnitColumns(
  t: (key: string, values?: Record<string, string | number | Date>) => string
): Column<GeographyUnit>[] {
  return [
    {
      key: "geographyUnitCode",
      label: t("list.table.unitCode"),
      width: "18%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "geographyUnitName",
      label: t("list.table.unitName"),
      width: "20%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "geographyTypeName",
      label: t("list.table.geographyType"),
      width: "18%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "parentGeographyUnitName",
      label: t("list.table.parentUnit"),
      width: "18%",
      render: (value) => (typeof value === "string" ? value : "—"),
    },
    {
      key: "isActive",
      label: t("list.table.status"),
      width: "18%",
      isStatus: true,
    },
  ];
}

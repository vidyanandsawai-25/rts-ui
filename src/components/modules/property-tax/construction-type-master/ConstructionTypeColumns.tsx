import type { Column } from "@/components/common/MasterTable";
import type { ConstructionType } from "@/types/construction.types";

/**
 * Returns the table column configuration for Construction Type Master
 * @param t - Translation function from useTranslations("construction.constructionType")
 * @returns Array of column definitions
 */
export function getConstructionTypeColumns(
  t: (key: string) => string
): Column<ConstructionType>[] {
  return [
    {
      key: "constructionCode",
      label: t("list.table.constructionCode"),
      width: "15%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "description",
      label: t("list.table.description"),
      width: "35%",
      render: (value) => (typeof value === "string" ? value : ""),
    },
    {
      key: "searchSequence",
      label: t("list.table.searchSequence"),
      width: "15%",
      render: (value) => (typeof value === "number" ? value : ""),
    },
    {
      key: "isActive",
      label: t("list.table.status"),
      width: "20%",
      isStatus: true,
    },
  ];
}
import type { Column } from "@/components/common/MasterTable";
import type { AssessmentYearRange } from "@/types/assessment-year-range.types";

/**
 * Returns the table column configuration for Assessment Year Range Master.
 * Generic function that works for both RV and CV.
 */
export function getAssessmentYearRangeColumns<T extends AssessmentYearRange>(
  t: (key: string) => string
): Column<T>[] {
  return [
    {
      key: "fromYear",
      label: t("list.table.fromYear"),
      width: "25%",
      render: (_, row: T) => row.fromYear,
    },
    {
      key: "toYear",
      label: t("list.table.toYear"),
      width: "25%",
      render: (_, row: T) => row.toYear,
    },
    {
      key: "isActive",
      label: t("list.table.status"),
      width: "25%",
      isStatus: true,
    },
  ];
}

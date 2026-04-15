import { Column } from "@/components/common/MasterTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { AssessmentYearCV } from "@/types/assessmentYearMaster.types";

/**
 * Column definitions for Assessment Year Master (Capital Value)
 * Separated for reusability, scalability, and cleaner page structure.
 */
export const getAssessmentYearCVColumns = (
  t: (key: string) => string
): Column<AssessmentYearCV>[] => [
  {
    key: "fromYear",
    label: t("fromYear"),
    width: "30%",
  },
  {
    key: "toYear",
    label: t("toYear"),
    width: "30%",
  },
  {
    key: "isActive",
    label: t("activeStatus"),
    width: "20%",
    render: (_: unknown, row: AssessmentYearCV) => (
      <div className="flex justify-start">
        <StatusBadge value={row.isActive} />
      </div>
    ),
  },
];
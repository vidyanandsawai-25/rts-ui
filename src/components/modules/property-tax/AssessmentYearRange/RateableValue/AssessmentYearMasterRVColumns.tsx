import { Column } from "@/components/common/MasterTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { AssessmentYearRV } from "@/types/assessmentYearMaster.types";

/**
 * Column definitions for Assessment Year Master (Rateable Value)
 * Separated for reusability, scalability, and cleaner page structure.
 */
export const getAssessmentYearRVColumns = (
  t: (key: string) => string
): Column<AssessmentYearRV>[] => [
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
    render: (value: unknown) => (
      <div className="flex justify-start">
        <StatusBadge value={value as string | number | boolean | null | undefined} />
      </div>
    ),
  },
];

import type { Column } from "@/components/common/MasterTable";
import type { PolicyConfiguration } from "@/types/policy-configuration.types";

/**
 * Returns the table column configuration for Policy Configuration Master
 * @param t - Translation function from useTranslations("policyConfiguration")
 * @returns Array of column definitions
 */
export function getPolicyConfigurationColumns(
  t: (key: string) => string
): Column<PolicyConfiguration>[] {
  return [
    {
      key: "policyCode",
      label: t("list.table.policyCode"),
      width: "10%",
      render: (value) => (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 font-mono border border-indigo-300 rounded-md">
          {String(value)}
        </span>
      ),
    },
    {
      key: "category",
      label: t("list.table.category"),
      width: "10%",
      render: (value) => (
        <span className="font-medium text-gray-800">{String(value)}</span>
      ),
    },
    {
      key: "displayName",
      label: t("list.table.displayName"),
      width: "15%",
      render: (value) => <span className="font-medium text-gray-900">{String(value)}</span>,
    },
    {
      key: "description",
      label: t("list.table.description"),
      width: "20%",
      render: (value) => (
        <span className="text-gray-600 line-clamp-2" title={value ? String(value) : undefined}>
          {value ? String(value) : "-"}
        </span>
      ),
    },
    {
      key: "dataType",
      label: t("list.table.dataType"),
      width: "10%",
      render: (value) => (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded">
          {String(value)}
        </span>
      ),
    },
    {
      key: "policyValue",
      label: t("list.table.policyValue"),
      width: "10%",
      render: (value) => <span className="font-bold text-gray-800">{String(value)}</span>,
    },
    {
      key: "defaultValue",
      label: t("list.table.defaultValue"),
      width: "10%",
      render: (value) => <span className="text-gray-800">{String(value)}</span>,
    },
    {
      key: "unit",
      label: t("list.table.unit"),
      width: "10%",
      render: (value) => <span className="text-gray-700">{value ? String(value) : "-"}</span>,
    },
    {
      key: "status",
      label: t("list.table.status"),
      width: "5%",
      isStatus: true,
    },
  ];
}


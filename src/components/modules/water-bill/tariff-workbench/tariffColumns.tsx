import type { Column } from "@/components/common/MasterTable";
import type { TariffWorkbench } from "@/types/waterBill/tariffWorkbench.types";
import { SortAscButton, SortDescButton, SortDefaultButton } from "@/components/common/ActionButtons";
import { DateUtils } from "@/lib/utils/date-helpers";

function SortableHeader({
  label,
  columnKey,
  sortBy,
  sortOrder,
  onSort,
  tCommon,
}: {
  label: string;
  columnKey: string;
  sortBy?: string;
  sortOrder?: string;
  onSort: (key: string) => void;
  tCommon: (key: string) => string;
}) {
  const isActive = sortBy === columnKey;
  const isAsc = isActive && sortOrder === "asc";
  const isDesc = isActive && sortOrder === "desc";

  return (
    <div className="flex items-center gap-1 justify-start w-full">
      <span>{label}</span>
      {isAsc ? (
        <SortAscButton
          onClick={() => onSort(columnKey)}
          aria-label={`${tCommon("table.sort.verb")} ${label} ${tCommon("table.sort.ascending")}`}
        />
      ) : isDesc ? (
        <SortDescButton
          onClick={() => onSort(columnKey)}
          aria-label={`${tCommon("table.sort.verb")} ${label} ${tCommon("table.sort.descending")}`}
        />
      ) : (
        <SortDefaultButton
          onClick={() => onSort(columnKey)}
          aria-label={`${tCommon("table.sort.by")} ${label}`}
        />
      )}
    </div>
  );
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr || typeof dateStr !== "string" || !dateStr.trim()) return "-";
  const formatted = DateUtils.formatToDDMMYYYY(dateStr);
  return formatted || "-";
};

export function getTariffColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void
): Column<TariffWorkbench>[] {
  const sortableColumns = ["tariffCode", "tariffName", "billingMethod", "effectiveFrom"];

  const createSortableLabel = (label: string, key: string) => {
    if (onSort && sortableColumns.includes(key)) {
      return (
        <SortableHeader
          label={label}
          columnKey={key}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
          tCommon={tCommon}
        />
      );
    }
    return label;
  };

  return [
    {
      key: "tariffCode",
      label: createSortableLabel(t("table.tariffCode"), "tariffCode"),
      width: "12%",
      render: (value) => (
        <span className="font-semibold text-blue-900 font-mono text-xs">
          {typeof value === "string" ? value : "-"}
        </span>
      ),
    },
    {
      key: "tariffName",
      label: createSortableLabel(t("table.tariffName"), "tariffName"),
      width: "16%",
      render: (value) => (typeof value === "string" ? value : "-"),
    },
    {
      key: "financialYearCode",
      label: t("table.financialYear"),
      width: "10%",
      render: (value) => (
        <span>{typeof value === "string" && value.trim() ? value : "-"}</span>
      ),
    },
    {
      key: "connectionTypeName",
      label: t("table.connectionType"),
      width: "11%",
      render: (value) => (
        <span>{typeof value === "string" && value ? value : "-"}</span>
      ),
    },
    {
      key: "connectionCategoryName",
      label: t("table.connectionCategory"),
      width: "12%",
      render: (value) => (
        <span>{typeof value === "string" && value ? value : "-"}</span>
      ),
    },
    {
      key: "billingMethod",
      label: createSortableLabel(t("table.billingMethod"), "billingMethod"),
      width: "10%",
      render: (value) => {
        if (typeof value !== "string" || !value.trim()) return "-";
        const lower = value.trim().toLowerCase();
        let res = value;
        if (lower === "metered") res = t("form.billingMethod.metered");
        else if (lower === "flat") res = t("form.billingMethod.flat");
        else if (lower === "slab") res = t("form.billingMethod.slab");
        else if (lower === "flat rate" || lower === "flatrate") res = t("form.billingMethod.flatRate");
        else if (lower === "slab metered" || lower === "slabmetered") res = t("form.billingMethod.slabMetered");
        else if (lower === "annual") res = t("form.billingMethod.annual");
        if (!res || res.includes("billingMethod")) return value;
        return res;
      },
    },
    {
      key: "effectiveFrom",
      label: createSortableLabel(t("table.effectiveFrom"), "effectiveFrom"),
      width: "10%",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "effectiveTo",
      label: t("table.effectiveTo"),
      width: "10%",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "versionNo",
      label: t("table.versionNo"),
      width: "6%",
      render: (value) => (typeof value === "number" && Number.isFinite(value) && value > 0 ? `v${value}` : "-"),
    },
    {
      key: "status",
      label: t("table.statusHeader"),
      width: "8%",
      render: (value) => {
        if (typeof value !== "string" || !value) return "-";
        const label =
          value === "Draft"
            ? t("form.status.draft")
            : value === "Published"
            ? t("form.status.published")
            : value;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
            value === "Published"
              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
              : value === "Draft"
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-slate-100 text-slate-800 border-slate-200"
          }`}>
            {label}
          </span>
        );
      },
    },
    {
      key: "isActive",
      label: t("table.isActive"),
      width: "7%",
      isStatus: true,
    },
  ];
}

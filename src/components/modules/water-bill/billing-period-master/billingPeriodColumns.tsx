import type { Column } from "@/components/common/MasterTable";
import type { BillingPeriodMaster } from "@/types/waterBill/billingPeriodMaster.types";
import { SortAscButton, SortDescButton, SortDefaultButton } from "@/components/common/ActionButtons";

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
    <div
      className="inline-flex items-center gap-0.5 justify-start cursor-pointer select-none group"
      onClick={() => onSort(columnKey)}
    >
      <span>{label}</span>
      {isAsc ? (
        <SortAscButton
          onClick={(e) => {
            e.stopPropagation();
            onSort(columnKey);
          }}
          aria-label={`${tCommon("table.sort.verb")} ${label} ${tCommon("table.sort.ascending")}`}
          className="!h-auto !w-auto !p-0 !px-0.5 !py-0 !min-w-0"
        />
      ) : isDesc ? (
        <SortDescButton
          onClick={(e) => {
            e.stopPropagation();
            onSort(columnKey);
          }}
          aria-label={`${tCommon("table.sort.verb")} ${label} ${tCommon("table.sort.descending")}`}
          className="!h-auto !w-auto !p-0 !px-0.5 !py-0 !min-w-0"
        />
      ) : (
        <SortDefaultButton
          onClick={(e) => {
            e.stopPropagation();
            onSort(columnKey);
          }}
          aria-label={`${tCommon("table.sort.by")} ${label}`}
          className="!h-auto !w-auto !p-0 !px-0.5 !py-0 !min-w-0 text-slate-400 group-hover:text-blue-600"
        />
      )}
    </div>
  );
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  try {
    return dateStr.split("T")[0];
  } catch {
    return dateStr;
  }
};

export function getBillingPeriodColumns(
  t: (key: string) => string,
  tCommon: (key: string) => string,
  sortBy?: string,
  sortOrder?: string,
  onSort?: (key: string) => void
): Column<BillingPeriodMaster>[] {
  const sortableColumns = [
    "financialYear",
    "billingFrequency",
    "periodFromDate",
    "periodToDate",
    "billGenerationDate",
    "dueDate",
    "graceDays",
    "currentPenaltyStartDate",
    "currentPenaltyEndDate",
    "pendingPenaltyStartDate",
    "pendingPenaltyEndDate",
    "isReadingApprovalRequired",
    "sequenceNo",
  ];

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
      key: "financialYear",
      align: "center",
      label: createSortableLabel(t("table.financialYear"), "financialYear"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => (typeof value === "string" && value.trim() ? value : "—"),
    },
    {
      key: "billingFrequency",
      align: "center",
      label: createSortableLabel(t("table.billingFrequency"), "billingFrequency"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => (typeof value === "string" && value.trim() ? value : "—"),
    },
    {
      key: "periodFromDate",
      align: "center",
      label: createSortableLabel(t("table.periodFrom"), "periodFromDate"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "periodToDate",
      align: "center",
      label: createSortableLabel(t("table.periodTo"), "periodToDate"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "billGenerationDate",
      align: "center",
      label: createSortableLabel(t("table.billGenerationDate"), "billGenerationDate"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "dueDate",
      align: "center",
      label: createSortableLabel(t("table.dueDate"), "dueDate"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "graceDays",
      align: "center",
      label: createSortableLabel(t("table.graceDays"), "graceDays"),
      width: "90px",
      headerClassName: "whitespace-nowrap min-w-[90px]",
      cellClassName: "whitespace-nowrap min-w-[90px]",
      render: (value) => (value !== undefined && value !== null ? String(value) : "0"),
    },
    
    {
      key: "currentPenaltyStartDate",
      align: "center",
      label: createSortableLabel(t("table.currentPenaltyStartDate"), "currentPenaltyStartDate"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "currentPenaltyEndDate",
      align: "center",
      label: createSortableLabel(t("table.currentPenaltyEndDate"), "currentPenaltyEndDate"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "pendingPenaltyStartDate",
      align: "center",
      label: createSortableLabel(t("table.pendingPenaltyStartDate"), "pendingPenaltyStartDate"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "pendingPenaltyEndDate",
      align: "center",
      label: createSortableLabel(t("table.pendingPenaltyEndDate"), "pendingPenaltyEndDate"),
      width: "110px",
      headerClassName: "whitespace-nowrap min-w-[110px]",
      cellClassName: "whitespace-nowrap min-w-[110px]",
      render: (value) => formatDate(typeof value === "string" ? value : undefined),
    },
    {
      key: "isReadingApprovalRequired",
      align: "center",
      label: createSortableLabel(t("table.isReadingApprovalRequired"), "isReadingApprovalRequired"),
      width: "90px",
      headerClassName: "whitespace-nowrap min-w-[90px]",
      cellClassName: "whitespace-nowrap min-w-[90px]",
      render: (value) => (value ? t("table.yes") : t("table.no")),
    },
    {
      key: "sequenceNo",
      align: "center",
      label: createSortableLabel(t("table.sequenceNo"), "sequenceNo"),
      width: "90px",
      headerClassName: "whitespace-nowrap min-w-[90px]",
      cellClassName: "whitespace-nowrap min-w-[90px]",
      render: (value) => (value !== undefined && value !== null ? String(value) : "—"),
    },
    {
      key: "isActive",
      align: "center",
      label: t("table.status"),
      width: "100px",
      headerClassName: "whitespace-nowrap min-w-[100px]",
      cellClassName: "whitespace-nowrap min-w-[100px]",
      isStatus: true,
    },
  ];
}

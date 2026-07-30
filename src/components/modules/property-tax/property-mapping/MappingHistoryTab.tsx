import { useTranslations } from "next-intl";
import { MasterTable, Column } from "@/components/common/MasterTable";
import { AuditHistory } from "@/types/property-mapping";

interface AuditTrailProps {
  historyList: AuditHistory[];
}

export function AuditTrail({ historyList }: AuditTrailProps) {
  const t = useTranslations("propertyMapping");

  const columns: Column<AuditHistory>[] = [
    {
      key: "time",
      label: t("historyTab.columns.timestamp"),
      render: (val) => <span className="font-mono text-[11.5px]">{String(val)}</span>,
    },
    {
      key: "action",
      label: t("historyTab.columns.action"),
      render: (val) => (
        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border uppercase ${
          val === "Mapped"
            ? "bg-emerald-50 text-emerald-700 border-emerald-150"
            : "bg-slate-100 text-slate-650 border-slate-200"
        }`}>
          {String(val)}
        </span>
      ),
    },
    {
      key: "newPropNo",
      label: t("historyTab.columns.newPropertyNo"),
      render: (val) => <span className="font-bold text-blue-700">{String(val)}</span>,
    },
    {
      key: "oldPropNos",
      label: t("historyTab.columns.linkedLegacyRecords"),
      render: (val) => <span className="font-mono">{(val as string[])?.join(", ") || t("historyTab.naValue")}</span>,
    },
    {
      key: "user",
      label: t("historyTab.columns.officer"),
    },
    {
      key: "reason",
      label: t("historyTab.columns.auditRemarks"),
      cellClassName: "text-slate-500 font-semibold",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
      <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3">
        {t("historyTab.title")}
      </h3>
      <MasterTable
        columns={columns}
        data={historyList}
        emptyText={t("historyTab.emptyText")}
        getRowKey={(row) => row.id}
        paginationConfig={{ enabled: false }}
      />
    </div>
  );
}

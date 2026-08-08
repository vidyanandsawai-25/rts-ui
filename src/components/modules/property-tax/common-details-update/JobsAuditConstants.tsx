/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Column } from "@/components/common";
import { UpdateHistoryItem } from "@/types/common-details-update/common-details-update.types";
import { format } from "date-fns";
import { Eye } from "lucide-react";

export const getJobsAuditColumns = (t: any, onViewClick: (row: UpdateHistoryItem) => void): Column<UpdateHistoryItem>[] => [
  {
    key: "propertyNo",
    label: t("jobsAudit.columns.propertyNo"),
    headerClassName: "whitespace-nowrap",
    width: "150px",
    render: (_, row) => (
      <div className="flex flex-col">
        <span className="font-bold text-slate-800 text-sm whitespace-nowrap">
          {`${row.wardNo || ''}${row.propertyNo ? `-${row.propertyNo}` : ''}${row.partitionNo ? `-${row.partitionNo}` : ''}`}
        </span>
      </div>
    )
  },
  {
    key: "updatedDate",
    label: t("jobsAudit.columns.date"),
    headerClassName: "whitespace-nowrap",
    width: "120px",
    render: (_, row) => {
      try {
        const dateObj = new Date(row.updatedDate);
        return (
          <div className="flex flex-col">
            <span className="text-sm text-slate-700 whitespace-nowrap">{format(dateObj, "dd MMM yyyy")}</span>
            <span className="text-xs text-slate-500 whitespace-nowrap">{format(dateObj, "hh:mm a")}</span>
          </div>
        );
      } catch (e) {
        return <span className="text-sm text-slate-700 whitespace-nowrap">{row.updatedDate}</span>;
      }
    }
  },
  {
    key: "updatedColumns",
    label: t("jobsAudit.columns.updatedColumns"),
    headerClassName: "whitespace-nowrap",
    render: (_, row) => <span className="text-sm text-slate-700">{row.updatedColumns}</span>
  },
  {
    key: "username",
    label: t("jobsAudit.columns.username"),
    headerClassName: "whitespace-nowrap",
    render: (_, row) => <span className="text-sm text-slate-700 font-medium">{row.username}</span>
  },
  {
    key: "remarks",
    label: t("jobsAudit.columns.remarks"),
    headerClassName: "whitespace-nowrap",
    width: "220px",
    render: (_, row) => <span className="text-sm text-slate-700 block leading-tight">{row.remarks || "-"}</span>
  },
  {
    key: "ipAddress",
    label: t("jobsAudit.columns.ipAddress"),
    headerClassName: "whitespace-nowrap",
    width: "120px",
    render: (_, row) => <span className="text-sm text-slate-700 block leading-tight">{row.ipAddress}</span>
  },
  {
    key: "action",
    label: t("jobsAudit.columns.action"),
    headerClassName: "whitespace-nowrap",
    align: "center",
    render: (_, row) => (
      <button 
        onClick={() => onViewClick(row)}
        className="flex items-center gap-1.5 px-3 py-1.5 mx-auto border border-slate-300 rounded-md text-slate-700 text-sm hover:bg-slate-50 transition-colors shadow-sm bg-white"
      >
        <Eye className="w-4 h-4 text-slate-500" />
        {t("jobsAudit.columns.view")}
      </button>
    )
  }
];

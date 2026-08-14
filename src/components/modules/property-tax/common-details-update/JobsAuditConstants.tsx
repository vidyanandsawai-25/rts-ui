/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Column, TruncatedText } from "@/components/common";
import { UpdateHistoryItem } from "@/types/common-details-update/common-details-update.types";
import { format } from "date-fns";
import { Eye } from "lucide-react";

export const getJobsAuditColumns = (t: any, onViewClick: (row: UpdateHistoryItem) => void): Column<UpdateHistoryItem>[] => [
  {
    key: "createdDate",
    label: t("jobsAudit.columns.date"),
    headerClassName: "whitespace-nowrap",
    width: "80px",
    render: (_, row) => {
      try {
        const dateObj = new Date(row.createdDate);
        return (
          <div className="flex flex-col">
            <span className="text-sm text-slate-700 whitespace-nowrap">{format(dateObj, "dd MMM yyyy")}</span>
            <span className="text-xs text-slate-500 whitespace-nowrap">{format(dateObj, "hh:mm a")}</span>
          </div>
        );
      } catch (e) {
        return <span className="text-sm text-slate-700 whitespace-nowrap">{row.createdDate}</span>;
      }
    }
  },
  {
    key: "activityType",
    label: t("jobsAudit.columns.activityType"),
    headerClassName: "whitespace-nowrap",
    width: "80px",
    render: (_, row) => <TruncatedText  text={row.activityType} className="text-sm text-slate-700 block truncate" />
  },
  {
    key: "updateName",
    label: t("jobsAudit.columns.updateName"),
    headerClassName: "whitespace-nowrap",
    width: "100px",
    render: (_, row) => <TruncatedText  text={row.updateName} className="text-sm text-slate-700 block truncate" />
  },
  {
    key: "records",
    label: t("jobsAudit.columns.records"),
    headerClassName: "whitespace-nowrap",
    width: "70px",
    render: (_, row) => <span className="text-sm text-slate-700">{row.records}</span>
  },
  {
    key: "doneBy",
    label: t("jobsAudit.columns.doneBy"),
    headerClassName: "whitespace-nowrap",
    width: "100px",
    render: (_, row) => <TruncatedText  text={row.doneBy} className="text-sm text-slate-700 font-medium block truncate" />
  },
  {
    key: "startTime",
    label: t("jobsAudit.columns.startTime"),
    headerClassName: "whitespace-nowrap",
    width: "50px",
    render: (_, row) => {
      try {
        return <span className="text-sm text-slate-700 whitespace-nowrap">{format(new Date(row.startTime), "hh:mm:ss a")}</span>;
      } catch (e) {
        return <span className="text-sm text-slate-700 whitespace-nowrap">{row.startTime}</span>;
      }
    }
  },
  {
    key: "endTime",
    label: t("jobsAudit.columns.endTime"),
    headerClassName: "whitespace-nowrap",
    width: "50px",
    render: (_, row) => {
      try {
        return <span className="text-sm text-slate-700 whitespace-nowrap">{format(new Date(row.endTime), "hh:mm:ss a")}</span>;
      } catch (e) {
        return <span className="text-sm text-slate-700 whitespace-nowrap">{row.endTime}</span>;
      }
    }
  },
  {
    key: "duration",
    label: t("jobsAudit.columns.duration"),
    headerClassName: "whitespace-nowrap",
    width: "50px",
    render: (_, row) => <span className="text-sm text-slate-700">{row.duration}</span>
  },
  {
    key: "activityStatus",
    label: t("jobsAudit.columns.status"),
    headerClassName: "whitespace-nowrap",
    width: "60px",
    render: (_, row) => <TruncatedText  text={row.activityStatus} className="text-sm text-slate-700 block truncate" />
  },
  {
    key: "remarks",
    label: t("jobsAudit.columns.remarks"),
    headerClassName: "whitespace-nowrap",
    width: "220px",
    render: (_, row) => <TruncatedText maxLength={40} text={row.remarks || row.activityRemark} className="text-sm text-slate-700 block leading-tight truncate" />
  },
  {
    key: "ipAddress",
    label: t("jobsAudit.columns.ipAddress"),
    headerClassName: "whitespace-nowrap",
    width: "120px",
    render: (_, row) => <TruncatedText  text={row.ipAddress} className="text-sm text-slate-700 block leading-tight truncate" />
  },
  {
    key: "action",
    label: t("jobsAudit.columns.action"),
    headerClassName: "whitespace-nowrap",
    align: "center",
    width: "100px",
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

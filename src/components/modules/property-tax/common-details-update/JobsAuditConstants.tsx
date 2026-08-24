/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { Column, TruncatedText, ViewButton } from "@/components/common";
import { UpdateHistoryItem } from "@/types/common-details-update/common-details-update.types";
import { format } from "date-fns";

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
      if (!row.startTime) return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
      const str = String(row.startTime).trim();
      if (str === "" || str.startsWith("0001") || str === "null" || str === "undefined") {
        return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
      }
      try {
        const dateObj = new Date(str);
        if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 2000) {
          return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
        }
        return <span className="text-sm text-slate-700 whitespace-nowrap">{format(dateObj, "hh:mm:ss a")}</span>;
      } catch (e) {
        return <span className="text-sm text-slate-700 whitespace-nowrap">{str || "-"}</span>;
      }
    }
  },
  {
    key: "endTime",
    label: t("jobsAudit.columns.endTime"),
    headerClassName: "whitespace-nowrap",
    width: "50px",
    render: (_, row) => {
      const isFailed = row.activityStatus?.toLowerCase() === "failed";
      if (isFailed || !row.endTime) return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
      const str = String(row.endTime).trim();
      if (str === "" || str.startsWith("0001") || str.startsWith("1970") || str === "null" || str === "undefined") {
        return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
      }
      try {
        const dateObj = new Date(str);
        if (isNaN(dateObj.getTime()) || dateObj.getFullYear() < 2000) {
          return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
        }
        return <span className="text-sm text-slate-700 whitespace-nowrap">{format(dateObj, "hh:mm:ss a")}</span>;
      } catch (e) {
        return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
      }
    }
  },
  {
    key: "duration",
    label: t("jobsAudit.columns.duration"),
    headerClassName: "whitespace-nowrap",
    width: "50px",
    render: (_, row) => {
      const isFailed = row.activityStatus?.toLowerCase() === "failed";
      if (isFailed) {
        return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
      }

      let sec: number | null = null;
      if (row.duration !== null && row.duration !== undefined) {
        const parsed = Number(row.duration);
        if (!isNaN(parsed) && parsed >= 0) {
          sec = parsed;
        }
      }

      // Fallback: Calculate from endTime and startTime if duration is not directly provided or 0
      if ((sec === null || sec === 0) && row.startTime && row.endTime) {
        try {
          const start = new Date(row.startTime).getTime();
          const end = new Date(row.endTime).getTime();
          if (!isNaN(start) && !isNaN(end) && end >= start) {
            sec = Math.round((end - start) / 1000);
          }
        } catch (_e) {
          // ignore calculation error
        }
      }

      if (sec === null || sec < 0) {
        return <span className="text-sm text-slate-700 whitespace-nowrap">-</span>;
      }

      let formatted = "0s";
      if (sec === 0) {
        formatted = "0s";
      } else if (sec < 60) {
        formatted = `${sec}s`;
      } else {
        const mins = Math.floor(sec / 60);
        const remainingSec = sec % 60;
        if (mins < 60) {
          formatted = remainingSec > 0 ? `${mins}m ${remainingSec}s` : `${mins}m`;
        } else {
          const hrs = Math.floor(mins / 60);
          const remainingMins = mins % 60;
          formatted = remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
        }
      }

      return <span className="text-sm text-slate-700 whitespace-nowrap">{formatted}</span>;
    }
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
      <ViewButton
        onClick={() => onViewClick(row)}
        className="flex items-center gap-1.5 px-3 py-1.5 mx-auto border border-slate-300 rounded-md text-slate-700 text-sm hover:bg-slate-50 transition-colors shadow-sm bg-white"
      >
        {t("jobsAudit.columns.view")}
      </ViewButton>
    )
  }
];

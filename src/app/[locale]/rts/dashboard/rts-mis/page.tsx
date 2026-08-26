import RtsMisDashboard from "@/components/modules/rts/dashboard/RtsMisDashboard";
import type { RtsMisDashboardModuleName } from "@/types/rts/rtsmisdashboard.types";
import { getRtsMisDepartmentServicesAction } from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;
type ApplicationSource = "rts" | "aaple-sarkar" | "offline";
type MisStatusFilter = "Pending" | "Approved" | "Rejected" | "Overdue";

function getFirstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getPageNumber(value: string | undefined): number {
  const pageNumber = Number(value);
  return Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
}

function getApplicationSource(value: string | undefined): ApplicationSource {
  switch (value?.trim().toLowerCase()) {
    case "aaple-sarkar":
    case "aaplesarkar":
      return "aaple-sarkar";
    case "offline":
      return "offline";
    default:
      return "rts";
  }
}

function getStatusFilter(value: string | undefined): MisStatusFilter | "" {
  switch (value?.trim().toLowerCase()) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "overdue":
      return "Overdue";
    default:
      return "";
  }
}

function getDate(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "";

  const [year, month, day] = trimmed.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return parsedDate.getUTCFullYear() === year
    && parsedDate.getUTCMonth() === month - 1
    && parsedDate.getUTCDate() === day
    ? trimmed
    : "";
}

function getModuleName(source: ApplicationSource): RtsMisDashboardModuleName {
  if (source === "aaple-sarkar") return "AapleSarkar";
  if (source === "offline") return "Offline";
  return "RTS";
}

export default async function RtsMISDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const applicationSource = getApplicationSource(getFirstValue(query.AppliSource));
  const pageNumber = getPageNumber(getFirstValue(query.PageNumber));
  const status = getStatusFilter(getFirstValue(query.Status) ?? getFirstValue(query.status));
  const fromDate = getDate(getFirstValue(query.FromDate));
  const requestedToDate = getDate(getFirstValue(query.ToDate));
  const toDate = fromDate && requestedToDate && requestedToDate < fromDate
    ? ""
    : requestedToDate;
  const moduleName = getModuleName(applicationSource);

  // The action defaults provide the backend's required valid department pair.
  const defaultDashboardData = await getRtsMisDepartmentServicesAction(
    undefined,
    undefined,
    moduleName,
    fromDate,
    toDate
  );
  const misDashboardData = defaultDashboardData;

  return (
    <div className="w-full">
      <RtsMisDashboard
        misDashboardData={misDashboardData}
        getDepartmentServices={getRtsMisDepartmentServicesAction}
        filters={{
          applicationSource,
          pageNumber,
          status,
          fromDate,
          toDate,
        }}
      />
    </div>
  );
}

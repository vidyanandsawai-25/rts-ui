import RtsMisDashboard from "@/components/modules/rts/dashboard/RtsMisDashboard";
import type { RtsMisDashboardModuleName } from "@/types/rts/rtsmisdashboard.types";
import { getRtsMisDepartmentServicesAction } from "./actions";

type SearchParams = Record<string, string | string[] | undefined>;
type ApplicationSource = "rts" | "aaple-sarkar" | "offline";
type PieChartView = "department" | "service";

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
  const chart: PieChartView = getFirstValue(query.Chart)?.trim().toLowerCase() === "service"
    ? "service"
    : "department";
  const moduleName = getModuleName(applicationSource);

  // The action defaults provide the backend's required valid department pair.
  const defaultDashboardData = await getRtsMisDepartmentServicesAction(
    undefined,
    undefined,
    moduleName
  );
  const misDashboardData = defaultDashboardData;

  return (
    <div className="w-full">
      <RtsMisDashboard
        misDashboardData={misDashboardData}
        getDepartmentServices={getRtsMisDepartmentServicesAction}
        filters={{
          applicationSource,
          chart,
          pageNumber,
        }}
      />
    </div>
  );
}

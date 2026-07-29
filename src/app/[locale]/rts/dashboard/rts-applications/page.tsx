import RtsApplicationDashboard from "@/components/modules/rts/dashboard/RtsApplicationDashboard";
import {
  getRtsApplicationFilterOptionsAction,
  getRtsApplicationsDashboardAction,
} from "./actions";

export default async function RtsApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const [dashboardData, filterOptions] = await Promise.all([
    getRtsApplicationsDashboardAction(),
    getRtsApplicationFilterOptionsAction(),
  ]);

  return (
    <div className="w-full">
      <RtsApplicationDashboard
        kpis={dashboardData.kpis}
        rows={dashboardData.rows}
        locale={locale}
        error={dashboardData.error}
        departments={filterOptions.departments}
        services={filterOptions.services}
      />
    </div>
  );
}

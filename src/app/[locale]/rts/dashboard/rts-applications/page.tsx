import RtsApplicationDashboard from "@/components/modules/rts/dashboard/RtsApplicationDashboard";
import { getRtsApplicationsDashboardAction } from "./actions";

export default async function RtsApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const dashboardData = await getRtsApplicationsDashboardAction();

  return (
    <div className="w-full">
      <RtsApplicationDashboard
        kpis={dashboardData.kpis}
        rows={dashboardData.rows}
        locale={locale}
      />
    </div>
  );
}

import { getRtsApplicationsAction, getRtsMastersAction } from "./actions";
import RtsApplicationsDashboard from "@/components/modules/rts/dashboard/RtsApplicationsDashboard";

export default async function RtsApplicationsDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Load a large list of applications to display in the SLA tracking dashboard
  const [inboxResult, masters] = await Promise.all([
    getRtsApplicationsAction(1, 100, "", "All", "All", "All", "All", "All"),
    getRtsMastersAction()
  ]);

  return (
    <div className="w-full">
      <RtsApplicationsDashboard
        data={inboxResult.items}
        masters={masters}
        locale={locale}
      />
    </div>
  );
}

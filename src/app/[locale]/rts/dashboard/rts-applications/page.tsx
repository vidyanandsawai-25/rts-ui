import { getRtsApplicationsAction, getRtsMastersAction } from "../../actions";
import RtsApplicationDashboard from "@/components/modules/rts/dashboard/RtsApplicationDashboard";

export default async function RtsApplicationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Load a large list of applications to display in the SLA tracking dashboard
  const [inboxResult, masters] = await Promise.all([
    getRtsApplicationsAction(1, 100, "", "All", "All", "All", "All", "All"),
    getRtsMastersAction()
  ]);

  return (
    <div className="w-full">
      <RtsApplicationDashboard
        data={inboxResult.items}
        masters={masters}
        locale={locale}
      />
    </div>
  );
}

import { getCmsApplicationsAction, getCmsMastersAction } from "../../actions";
import CmsMulyamapan from "@/components/modules/rts/dashboard/RtsApplicationDashboard";

export default async function CmsMulyamapanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Load a large list of applications to display in the SLA tracking dashboard
  const [inboxResult, masters] = await Promise.all([
    getCmsApplicationsAction(1, 100, "", "All", "All", "All", "All", "All"),
    getCmsMastersAction()
  ]);

  return (
    <div className="w-full">
      <CmsMulyamapan
        data={inboxResult.items}
        masters={masters}
        locale={locale}
      />
    </div>
  );
}

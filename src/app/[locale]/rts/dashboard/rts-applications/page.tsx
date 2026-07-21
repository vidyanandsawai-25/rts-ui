import { getCmsApplicationsAction, getCmsMastersAction } from "../../actions";
import CmsMulyamapan from "@/components/modules/rts/dashboard/RtsApplicationDashboard";
import { getRtsApplicationServicesAction } from "./actions";

export default async function CmsMulyamapanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // Load a large list of applications to display in the SLA tracking dashboard
  const [inboxResult, masters, services] = await Promise.all([
    getCmsApplicationsAction(1, 100, "", "All", "All", "All", "All", "All"),
    getCmsMastersAction(),
    getRtsApplicationServicesAction(),
  ]);

  return (
    <div className="w-full">
      <CmsMulyamapan
        data={inboxResult.items}
        masters={masters}
        services={services}
        locale={locale}
      />
    </div>
  );
}

import RtsMISDashboard from "@/components/modules/rts/dashboard/RtsMISDashboard";
import { getCmsMisDashboardAction } from "./actions";

export default async function CmsDashboardPage() {
  const misDashboardData = await getCmsMisDashboardAction();

  return (
    <div className="w-full">
      <RtsMISDashboard misDashboardData={misDashboardData} />
    </div>
  );
}

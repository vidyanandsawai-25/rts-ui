import RtsMisDashboard from "@/components/modules/rts/dashboard/RtsMisDashboard";
import { getRtsMisDashboardAction } from "./actions";

export default async function RtsMISDashboardPage() {
  const misDashboardData = await getRtsMisDashboardAction();

  return (
    <div className="w-full">
      <RtsMisDashboard misDashboardData={misDashboardData} />
    </div>
  );
}

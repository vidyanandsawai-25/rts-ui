import { getRtsMisDashboardAction } from "./actions";
import RtsMisDashboard from "@/components/modules/rts/dashboard/RtsMISDashboard";

export default async function RtsMisDashboardPage() {
  const misDashboardData = await getRtsMisDashboardAction();

  return (
    <div className="w-full">
      <RtsMisDashboard misDashboardData={misDashboardData} />
    </div>
  );
}

import { getCmsMisDashboardAction } from "./actions";
import CmsDashboard from "@/components/modules/rts/dashboard/RtsMisDashboard";

export default async function CmsDashboardPage() {
  const misDashboardData = await getCmsMisDashboardAction();

  return (
    <div className="w-full">
      <CmsDashboard misDashboardData={misDashboardData} />
    </div>
  );
}

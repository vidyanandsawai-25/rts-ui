import { getCmsMisDashboardAction } from "./actions";
import CmsDashboard from "@/components/modules/cms/CmsMISDashboard";

export default async function CmsDashboardPage() {
  const misDashboardData = await getCmsMisDashboardAction();

  return (
    <div className="w-full">
      <CmsDashboard misDashboardData={misDashboardData} />
    </div>
  );
}

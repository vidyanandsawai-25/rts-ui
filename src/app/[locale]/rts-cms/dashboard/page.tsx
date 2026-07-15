import { getCmsMisDashboardAction } from "./actions";
import CmsDashboard from "@/components/modules/cms/CmsDashboard";
import { departments } from "@/lib/mock/rts/departments";

export default async function CmsDashboardPage() {
  const misDashboardData = await getCmsMisDashboardAction();

  return (
    <div className="w-full">
      <CmsDashboard misDashboardData={misDashboardData} rtsDepartments={departments} />
    </div>
  );
}

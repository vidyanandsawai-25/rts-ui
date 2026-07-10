import { getCmsDashboardStatsAction } from "../actions";
import CmsDashboard from "@/components/modules/cms/CmsDashboard";
import { departments } from "@/lib/mock/rts/departments";

export default async function CmsDashboardPage() {
  const stats = await getCmsDashboardStatsAction();

  return (
    <div className="w-full">
      <CmsDashboard stats={stats} rtsDepartments={departments} applications={stats.applications} />
    </div>
  );
}

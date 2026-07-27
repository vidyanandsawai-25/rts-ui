import RtsMisDashboard from "@/components/modules/rts/dashboard/RtsMisDashboard";
import { getRtsMisDepartmentServicesAction } from "./actions";

export default async function RtsMISDashboardPage() {
  const misDashboardData = await getRtsMisDepartmentServicesAction(1, "Property Tax", "RTS");

  return (
    <div className="w-full">
      <RtsMisDashboard
        misDashboardData={misDashboardData}
        getDepartmentServices={getRtsMisDepartmentServicesAction}
      />
    </div>
  );
}

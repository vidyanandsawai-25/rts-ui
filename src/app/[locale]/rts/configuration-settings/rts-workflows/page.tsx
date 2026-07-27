import RtsWorkflowConfig from "@/components/modules/rts/configuration-settings/RtsWorkflowsConfig";
import { getRtsWorkflowMastersAction } from "./actions";

export default async function RtsWorkflowPage() {
  const { services, employeeTypes } = await getRtsWorkflowMastersAction();

  return (
    <div className="w-full">
      <RtsWorkflowConfig services={services} employeeTypes={employeeTypes} />
    </div>
  );
}

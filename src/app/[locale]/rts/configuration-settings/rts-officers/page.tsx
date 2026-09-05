import RtsServiceOfficerConfig from "@/components/modules/rts/configuration-settings/RtsServiceOfficerConfig";
import {
  getRtsOfficerAllocationsDataAction,
  saveRtsOfficerAllocationAction,
  updateRtsOfficerAllocationAction,
} from "./actions";

export default async function RtsOfficersPage() {
  const { allocations, services, zones } = await getRtsOfficerAllocationsDataAction();

  return (
    <RtsServiceOfficerConfig
      initialAllocations={allocations}
      services={services}
      zones={zones}
      saveAllocation={saveRtsOfficerAllocationAction}
      updateAllocation={updateRtsOfficerAllocationAction}
    />
  );
}

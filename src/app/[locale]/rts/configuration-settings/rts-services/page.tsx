import RtsServiceConfig from "@/components/modules/rts/configuration-settings/RtsServiceConfig";
import {
  deleteRtsServiceConfigAction,
  getRtsServiceConfigData,
  saveRtsServiceConfigAction,
  updateRtsServiceConfigAction,
} from "./actions";

export default async function RtsServicePage() {
  const { departments, services } = await getRtsServiceConfigData();

  return (
    <RtsServiceConfig
      departments={departments}
      services={services}
      saveService={saveRtsServiceConfigAction}
      updateService={updateRtsServiceConfigAction}
      deleteService={deleteRtsServiceConfigAction}
    />
  );
}

import RtsServiceConfig from "@/components/modules/rts/configuration-settings/RtsServiceConfig";

import {
  getRtsMastersAction,
  saveRtsServiceAction,
  updateRtsServiceAction,
  deleteRtsServiceAction,
} from "@/app/[locale]/rts/actions";

export default async function RtsServicePage() {
  const { departments, services } = await getRtsMastersAction();

  return (
    <RtsServiceConfig
      departments={departments}
      services={services}
      saveService={saveRtsServiceAction}
      updateService={updateRtsServiceAction}
      deleteService={deleteRtsServiceAction}
    />
  );
}
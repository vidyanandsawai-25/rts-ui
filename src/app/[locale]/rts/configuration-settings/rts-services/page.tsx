import RtsServiceConfig from "@/components/modules/rts/configuration-settings/RtsServiceConfig";

import {
  getCmsMastersAction,
  saveCmsServiceAction,
  updateCmsServiceAction,
  deleteCmsServiceAction,
} from "@/app/[locale]/rts/actions";

export default async function RtsServicePage() {
  const { departments, services } = await getCmsMastersAction();

  return (
    <RtsServiceConfig
      departments={departments}
      services={services}
      saveService={saveCmsServiceAction}
      updateService={updateCmsServiceAction}
      deleteService={deleteCmsServiceAction}
    />
  );
}
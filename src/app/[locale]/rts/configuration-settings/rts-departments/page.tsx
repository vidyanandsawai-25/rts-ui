
import RtsDepartmentConfig from "@/components/modules/rts/configuration-settings/RtsDepartmentConfig";

import {
  getRtsMastersAction,
  saveRtsDepartmentAction,
  updateRtsDepartmentAction,
  deleteRtsDepartmentAction,
} from "@/app/[locale]/rts/actions";

export default async function RtsDepartmentPage() {
  const { departments } = await getRtsMastersAction();

  return (
    <RtsDepartmentConfig
      departments={departments}
      saveDepartment={saveRtsDepartmentAction}
      updateDepartment={updateRtsDepartmentAction}
      deleteDepartment={deleteRtsDepartmentAction}
    />
  );
}
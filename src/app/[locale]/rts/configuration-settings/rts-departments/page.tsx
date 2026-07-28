
import RtsDepartmentConfig from "@/components/modules/rts/configuration-settings/RtsDepartmentConfig";
import {
  deleteRtsDepartmentConfigAction,
  getRtsDepartmentConfigData,
  saveRtsDepartmentConfigAction,
  updateRtsDepartmentConfigAction,
} from "./actions";

export default async function RtsDepartmentPage() {
  const { departments } = await getRtsDepartmentConfigData();

  return (
    <RtsDepartmentConfig
      departments={departments}
      saveDepartment={saveRtsDepartmentConfigAction}
      updateDepartment={updateRtsDepartmentConfigAction}
      deleteDepartment={deleteRtsDepartmentConfigAction}
    />
  );
}


import RtsDepartmentConfig from "@/components/modules/rts/configuration-settings/RtsDepartmentConfig";

import {
  getCmsMastersAction,
  saveCmsDepartmentAction,
  updateCmsDepartmentAction,
  deleteCmsDepartmentAction,
} from "@/app/[locale]/rts/actions";

export default async function RtsDepartmentPage() {
  const { departments } = await getCmsMastersAction();

  return (
    <RtsDepartmentConfig
      departments={departments}
      saveDepartment={saveCmsDepartmentAction}
      updateDepartment={updateCmsDepartmentAction}
      deleteDepartment={deleteCmsDepartmentAction}
    />
  );
}
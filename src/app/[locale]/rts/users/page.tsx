import { getCmsUsersAction, getCmsMastersAction } from "../actions";
import CmsUserMgmt from "@/components/modules/rts/configuration-settings/RtsUserMgmt";

export default async function CmsUsersPage() {
  const [officers, masters] = await Promise.all([
    getCmsUsersAction(),
    getCmsMastersAction()
  ]);

  return (
    <div className="w-full">
      <CmsUserMgmt officers={officers} departments={masters.departments} />
    </div>
  );
}

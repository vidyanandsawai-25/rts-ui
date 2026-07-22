import { getRtsUsersAction, getRtsMastersAction } from "../actions";
import RtsUserMgmt from "@/components/modules/rts/configuration-settings/RtsUserMgmt";

export default async function RtsUsersPage() {
  const [officers, masters] = await Promise.all([
    getRtsUsersAction(),
    getRtsMastersAction()
  ]);

  return (
    <div className="w-full">
      <RtsUserMgmt officers={officers} departments={masters.departments} />
    </div>
  );
}

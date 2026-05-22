export const dynamic = 'force-dynamic';
import { ScreenForm } from '@/components/modules/configuration-settings/screenAccess/components/ScreenForm';
import { getScreenGroupsAction, getModulesAction } from '../../action';
import { getMasterDataPageSize } from '@/lib/api/configuration-settings/screenAccess/screen-access.services';

export default async function AddScreenPage() {
  const groupsRes = await getScreenGroupsAction(1, getMasterDataPageSize(), undefined, undefined);
  const modulesRes = await getModulesAction();

  return <ScreenForm groups={groupsRes.data?.items || []} modules={modulesRes.data || []} />;
}

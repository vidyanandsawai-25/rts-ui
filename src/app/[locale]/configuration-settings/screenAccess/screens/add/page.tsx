export const dynamic = 'force-dynamic';
import { ScreenForm } from '@/components/modules/configuration-settings/screenAccess/components/ScreenForm';
import { getScreenGroupsAction, getDepartmentsAction, getModulesAction } from '../../action';
import { getMasterDataPageSize } from '@/lib/api/configuration-settings/screenAccess/screen-access.services';

export default async function AddScreenPage() {
  const [groupsRes, deptsRes, modulesRes] = await Promise.all([
    getScreenGroupsAction(1, getMasterDataPageSize(), undefined, undefined), // Get all groups for the dropdown
    getDepartmentsAction(),
    getModulesAction(),
  ]);

  return (
    <ScreenForm
      groups={groupsRes.data?.items || []}
      departments={deptsRes.data || []}
      modules={modulesRes.data || []}
    />
  );
}

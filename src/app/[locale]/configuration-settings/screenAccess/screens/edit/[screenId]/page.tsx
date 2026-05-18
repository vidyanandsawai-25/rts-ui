export const dynamic = 'force-dynamic';

import { ScreenForm } from '@/components/modules/configuration-settings/screenAccess/components/ScreenForm';
import {
  getScreenGroupsAction,
  getDepartmentsAction,
  getScreenByIdAction,
  getModulesAction,
} from '../../../action';
import { getMasterDataPageSize } from '@/lib/api/configuration-settings/screenAccess/screen-access.services';

import { notFound } from 'next/navigation';

interface EditScreenPageProps {
  params: Promise<{ screenId: string }>;
}

export default async function EditScreenPage({ params }: EditScreenPageProps) {
  const { screenId } = await params;
  const id = parseInt(screenId, 10);

  if (isNaN(id)) return notFound();

  const [screenRes, groupsRes, deptsRes, modulesRes] = await Promise.all([
    getScreenByIdAction(id),
    getScreenGroupsAction(1, getMasterDataPageSize(), undefined, undefined),
    getDepartmentsAction(),
    getModulesAction(),
  ]);

  if (!screenRes.success || !screenRes.data) {
    return notFound();
  }

  return (
    <ScreenForm
      initialData={screenRes.data}
      isEdit={true}
      groups={groupsRes.data?.items || []}
      departments={deptsRes.data || []}
      modules={modulesRes.data || []}
    />
  );
}

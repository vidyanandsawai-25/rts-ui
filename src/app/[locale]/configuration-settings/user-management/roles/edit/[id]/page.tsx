import { getRoleByIdAction } from '../../../actions';
import { notFound } from 'next/navigation';
import { RoleFormWrapper } from '../../add/RoleFormWrapper';

export const dynamic = 'force-dynamic';

interface EditRolePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params;

  const roleRes = await getRoleByIdAction(id);

  if (!roleRes.success || !roleRes.data) {
    return notFound();
  }

  return <RoleFormWrapper initialData={roleRes.data} isEdit={true} />;
}

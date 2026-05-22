'use client';

import { RoleForm } from '@/components/modules/configuration-settings/user-management/components/RoleForm';
import { useRoleForm } from '@/hooks/configuration-settings/user-management/useRoleForm';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/user-management';

interface RoleFormWrapperProps {
  initialData?: Role;
  isEdit?: boolean;
}

export function RoleFormWrapper({ initialData, isEdit }: RoleFormWrapperProps) {
  const router = useRouter();
  const { roleFormData, setRoleFormData, handleRoleSubmit, isSubmitting, errors } = useRoleForm(() => {
    router.back();
    router.refresh();
  }, initialData);

  return (
    <RoleForm
      isOpen={true}
      onClose={() => router.back()}
      editingRole={isEdit ? initialData || null : null}
      formData={roleFormData}
      setFormData={setRoleFormData}
      onSubmit={handleRoleSubmit}
      isSubmitting={isSubmitting}
      errors={errors}
    />
  );
}

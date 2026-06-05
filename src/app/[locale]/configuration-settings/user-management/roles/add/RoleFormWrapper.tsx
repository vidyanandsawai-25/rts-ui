'use client';

import { RoleForm } from '@/components/modules/configuration-settings/user-management/components/RoleForm';
import { useRoleForm } from '@/hooks/configuration-settings/user-management/useRoleForm';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/user-management';
import { useConfirm } from '@/components/common/ConfirmProvider';
import { useTranslations } from 'next-intl';

interface RoleFormWrapperProps {
  initialData?: Role;
  isEdit?: boolean;
}

export function RoleFormWrapper({ initialData, isEdit }: RoleFormWrapperProps) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const tCommon = useTranslations('common');

  const { roleFormData, setRoleFormData, handleRoleSubmit, isSubmitting, errors } = useRoleForm(
    () => {
      router.back();
      router.refresh();
    },
    initialData
  );

  const hasChanges = () => {
    const base = initialData
      ? {
          name: initialData.name || '',
          isActive: !!initialData.isActive,
        }
      : {
          name: '',
          isActive: true,
        };

    return (
      roleFormData.name.trim() !== base.name.trim() ||
      Boolean(roleFormData.isActive) !== Boolean(base.isActive)
    );
  };

  const handleCancel = () => {
    if (hasChanges()) {
      confirm({
        variant: 'warning',
        title: tCommon('confirm.warning.title') || 'Warning',
        description: tCommon('messages.unsavedChanges') || 'You have unsaved changes',
        confirmText: tCommon('confirm.warning.confirm') || 'Proceed',
        cancelText: tCommon('confirm.cancel') || 'Cancel',
        onConfirm: () => {
          router.back();
        },
      });
    } else {
      router.back();
    }
  };

  return (
    <RoleForm
      isOpen={true}
      onClose={handleCancel}
      editingRole={isEdit ? initialData || null : null}
      formData={roleFormData}
      setFormData={setRoleFormData}
      onSubmit={handleRoleSubmit}
      isSubmitting={isSubmitting}
      errors={errors}
    />
  );
}

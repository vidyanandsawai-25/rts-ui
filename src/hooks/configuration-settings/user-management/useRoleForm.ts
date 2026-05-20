'use client';

import { useState } from 'react';
import { Role } from '@/types/user-management';
import {
  createUserRoleAction,
  updateUserRoleAction,
} from '@/app/[locale]/configuration-settings/user-management/actions.mutations';
import { userManagementValidations } from '@/lib/utils/user-management-validation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useRoleForm(onSuccess: (role: Role) => void, initialData?: Role) {
  const t = useTranslations('userManagement');
  const [editingRole, setEditingRole] = useState<Role | null>(initialData || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roleFormData, setRoleFormData] = useState({
    name: initialData?.name || '',
    isActive: initialData ? !!initialData.isActive : true,
  });

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      isActive: true,
    });
    setEditingRole(null);
    setErrors({});
  };

  const handleRoleEdit = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      isActive: !!role.isActive,
    });
    setErrors({});
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const validationErrors = userManagementValidations.validateRole(roleFormData, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error(Object.values(validationErrors)[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRole) {
        const updatedRole: Role = {
          ...editingRole,
          ...roleFormData,
        };
        const res = await updateUserRoleAction(updatedRole);
        if (res.success) {
          onSuccess(updatedRole);
          toast.success(t('messages.roleUpdateSuccess'));
          resetRoleForm();
        } else {
          setErrors(res.validationErrors || {});
          toast.error(res.message || t('messages.roleUpdateError'));
        }
      } else {
        const res = await createUserRoleAction(roleFormData);
        if (res.success && res.data) {
          onSuccess(res.data);
          toast.success(t('messages.roleCreateSuccess'));
          resetRoleForm();
        } else {
          setErrors(res.validationErrors || {});
          toast.error(res.message || t('messages.roleCreateError'));
        }
      }
    } catch (error) {
      console.error('Error during role submission:', error);
      toast.error(t('messages.unknownError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    roleFormData,
    setRoleFormData,
    editingRole,
    handleRoleEdit,
    handleRoleSubmit,
    resetRoleForm,
    isSubmitting,
    errors,
  };
}

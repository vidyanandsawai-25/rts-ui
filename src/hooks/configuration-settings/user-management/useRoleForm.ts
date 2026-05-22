'use client';

import { useState } from 'react';
import { Role } from '@/types/user-management';
import {
  createUserRoleAction,
  updateUserRoleAction,
} from '@/app/[locale]/configuration-settings/user-management/actions.mutations';
import { getUserRolesAction } from '@/app/[locale]/configuration-settings/user-management/actions';
import { userManagementValidations } from '@/lib/utils/user-management-validation';
import { toast } from 'sonner';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
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
      // Fetch latest roles to verify duplicate names
      const rolesRes = await getUserRolesAction();
      if (rolesRes.success && rolesRes.data) {
        const roleNameNormalized = roleFormData.name.trim().toLowerCase();
        const isDuplicate = rolesRes.data.some((role) => {
          if (
            editingRole &&
            (String(role.id) === String(editingRole.id) ||
              Number(role.userRoleId) === Number(editingRole.userRoleId))
          ) {
            return false;
          }
          return role.name.trim().toLowerCase() === roleNameNormalized;
        });

        if (isDuplicate) {
          const duplicateMsg = t('form.errors.duplicateRoleName') || 'Role already exists';
          setErrors({ name: duplicateMsg });
          toast.error(duplicateMsg);
          setIsSubmitting(false);
          return;
        }
      }

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
          let errorMsg = res.message || t('messages.roleUpdateError');
          if (res.message) {
            if (res.message.startsWith('messages.') || res.message.startsWith('errors.')) {
              errorMsg = t(res.message);
            } else {
              errorMsg = getCleanErrorMessage(res.message);
            }
          }
          toast.error(errorMsg);
        }
      } else {
        const res = await createUserRoleAction(roleFormData);
        if (res.success && res.data) {
          onSuccess(res.data);
          toast.success(t('messages.roleCreateSuccess'));
          resetRoleForm();
        } else {
          setErrors(res.validationErrors || {});
          let errorMsg = res.message || t('messages.roleCreateError');
          if (res.message) {
            if (res.message.startsWith('messages.') || res.message.startsWith('errors.')) {
              errorMsg = t(res.message);
            } else {
              errorMsg = getCleanErrorMessage(res.message);
            }
          }
          toast.error(errorMsg);
        }
      }
    } catch (error) {
      console.error('Error during role submission:', error);
      toast.error(getCleanErrorMessage(error, t('messages.unknownError')));
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

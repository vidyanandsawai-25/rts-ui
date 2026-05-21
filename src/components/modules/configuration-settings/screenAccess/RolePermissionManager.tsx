'use client';

import { useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RolePermissionHeader } from './components/RolePermissionHeader';
import { getAccessLevelConfig } from './constants';

import {
  ScreenMasterData,
  DepartmentMasterData,
  ModuleMasterData,
  RoleMasterData,
  ScreenAccessPermissionData,
} from '@/types/screen-access.types';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
import { updateScreenAccessAction } from '@/app/[locale]/configuration-settings/screenAccess/action.mutations';

import { toast } from 'sonner';
import { PermissionAccordion } from './components/PermissionAccordion';
import {
  usePermissionHierarchy,
  type DisplayDomain,
  type DisplayScreen,
} from '@/hooks/configuration-settings/screenAccess/usePermissionHierarchy';
import { usePermissionDeltas } from '@/hooks/configuration-settings/screenAccess/usePermissionDeltas';
import { useLoading } from '@/hooks/useLoading';

interface RolePermissionManagerProps {
  screens: ScreenMasterData[];
  departments: DepartmentMasterData[];
  modules: ModuleMasterData[];
  roles: RoleMasterData[];
  initialRoleAccess: ScreenAccessPermissionData[];
}

export function RolePermissionManager({
  screens,
  departments,
  modules,
  roles,
  initialRoleAccess,
}: RolePermissionManagerProps) {
  const t = useTranslations('screenAccess');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const { isLoading: isSaving, startLoading, stopLoading } = useLoading();

  const roleIdFromQuery = searchParams.get('roleId');
  const selectedRole = useMemo(() => {
    if (roleIdFromQuery && roles.some((r) => String(r.roleMasterId) === roleIdFromQuery)) {
      return roleIdFromQuery;
    }
    return roles.length > 0 ? String(roles[0].roleMasterId) : '';
  }, [roleIdFromQuery, roles]);

  const accessLevelConfig = useMemo(() => getAccessLevelConfig(t), [t]);

  const { hierarchy } = usePermissionHierarchy({ screens, departments, modules, t });

  const { mapPermissions, deltas, roleAccess, pendingCount, updateAccess, resetDeltas } =
    usePermissionDeltas(initialRoleAccess);

  const handleSave = async () => {
    if (pendingCount === 0) return;

    startLoading();
    try {
      const changes: ScreenAccessPermissionData[] = [];

      Object.entries(deltas).forEach(([screenId, level]) => {
        changes.push({
          id: mapPermissions.ids[screenId],
          roleId: parseInt(selectedRole, 10),
          screenId: parseInt(screenId, 10),
          accessLevel: level,
        });
      });

      const res = await updateScreenAccessAction(changes);
      if (res.success) {
        toast.success(t('accessControl.messages.updateSuccess'));
        resetDeltas();
        startTransition(() => {
          router.refresh();
        });
      } else {
        let errorMsg = res.message || t('accessControl.messages.updateError');
        if (res.message) {
          if (
            res.message.startsWith('messages.') ||
            res.message.startsWith('errors.') ||
            res.message.includes('updateError')
          ) {
            errorMsg = t(res.message);
          } else {
            errorMsg = getCleanErrorMessage(res.message);
          }
        }
        toast.error(errorMsg);
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (_error) {
      toast.error(getCleanErrorMessage(_error, t('accessControl.messages.updateError')));
      startTransition(() => {
        router.refresh();
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      <RolePermissionHeader
        selectedRole={selectedRole}
        roles={roles}
        pendingCount={pendingCount}
        isSaving={isSaving}
        onSave={handleSave}
        onCancel={resetDeltas}
        onRoleChange={(val) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('roleId', val);
          startTransition(() => router.push(`?${params.toString()}`, { scroll: false }));
        }}
        translations={{
          selectRole: t('accessControl.filters.selectRole'),
          pendingChanges: t('accessControl.status.pendingChanges', { count: pendingCount }),
          saveChanges: t('accessControl.buttons.saveChanges'),
          cancelChanges: t('accessControl.buttons.cancelChanges'),
        }}
      />

      <div className="flex-1 overflow-y-auto px-1">
        {roles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
            <p className="text-lg font-semibold">{t('accessControl.roles.noRolesFound')}</p>
          </div>
        ) : hierarchy.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
            <p className="text-lg font-semibold">{t('accessControl.messages.noScreensFound')}</p>
          </div>
        ) : (
          <PermissionAccordion
            hierarchy={hierarchy}
            roleAccess={roleAccess}
            accessLevelConfig={accessLevelConfig}
            onUpdate={updateAccess}
            onBulkDomain={(screens, level) => screens.forEach((s) => updateAccess(s.id, level))}
            onBulkDept={(dept, level) =>
              dept.domains.forEach((d: DisplayDomain) =>
                d.screens.forEach((s: DisplayScreen) => updateAccess(s.id, level))
              )
            }
          />
        )}
      </div>
    </div>
  );
}

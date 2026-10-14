'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  deleteAccessRecord,
  getAccessGroups,
  getAccessLookups,
  getAccessPage,
  getAccessScreens,
  saveAccessRecord,
} from '@/lib/api/rts/rts-access-management.service';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
import type {
  AccessGroup,
  AccessQuery,
  AccessResult,
  AccessScreen,
  AccessSearchParams,
  PermissionFlags,
  RolePermission,
} from '@/types/rts/access-management.types';

function accessQuery(params: AccessSearchParams, tabs: string[]): AccessQuery {
  const one = (key: string) => (typeof params[key] === 'string' ? params[key] : '');
  const positive = (key: string) => {
    const value = Number(one(key));
    return Number.isSafeInteger(value) && value > 0 ? value : undefined;
  };
  const permissionStatus = one('permissionStatus');
  const permissionType = one('permissionType');
  return {
    page: positive('page') ?? 1,
    pageSize: Math.min(positive('pageSize') ?? 10, 100),
    search: one('search').trim().slice(0, 200),
    tab: tabs.includes(one('tab')) ? one('tab') : tabs[0],
    departmentId: positive('departmentId'),
    roleId: positive('roleId'),
    groupId: positive('groupId'),
    screenId: positive('screenId'),
    permissionStatus:
      permissionStatus === 'active' || permissionStatus === 'inactive'
        ? permissionStatus
        : undefined,
    permissionType: ['view', 'edit', 'delete', 'full', 'none'].includes(permissionType)
      ? (permissionType as AccessQuery['permissionType'])
      : undefined,
  };
}

async function auditUserId(): Promise<number> {
  const userId = getUserIdFromCookies(await cookies());
  if (!userId) throw new Error('Sign in again to complete this change.');
  return userId;
}

function revalidateMasters() {
  revalidatePath('/[locale]/rts/configuration-settings/rts-user', 'page');
  revalidatePath('/[locale]/rts/configuration-settings/rts-screen', 'page');
  revalidatePath('/[locale]/configuration-settings/user-management', 'layout');
  revalidatePath('/[locale]/configuration-settings/screenAccess', 'layout');
}

async function runAction<T>(
  operation: () => Promise<T>,
  mutation = false
): Promise<AccessResult<T>> {
  try {
    const data = await operation();
    if (mutation) revalidateMasters();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: getCleanErrorMessage(error, 'Unable to complete this request.'),
    };
  }
}

export async function getRtsScreenMasterAction(params: AccessSearchParams) {
  return runAction(async () => {
    const query = accessQuery(params, ['groups', 'screens', 'access']);
    const [lookups, groups] = await Promise.all([getAccessLookups(), getAccessGroups()]);
    const permissionFlags = {
      CanView: query.permissionType === 'view' ? true : undefined,
      CanEdit: query.permissionType === 'edit' ? true : undefined,
      CanDelete: query.permissionType === 'delete' ? true : undefined,
      HaveFullAccess: query.permissionType === 'full' ? true : undefined,
      HaveNoAccess: query.permissionType === 'none' ? true : undefined,
    };
    const [groupPage, screens, permissionPage, allScreens] = await Promise.all([
      query.tab === 'groups'
        ? getAccessPage<AccessGroup>('groups', {
            PageNumber: query.page,
            PageSize: query.pageSize,
            SearchTerm: query.search,
          })
        : null,
      query.tab === 'screens'
        ? getAccessPage<AccessScreen>('screens', {
            PageNumber: query.page,
            PageSize: query.pageSize,
            SearchTerm: query.search,
            ScreenGroupId: query.groupId,
            DepartmentId: query.departmentId,
          })
        : null,
      query.tab === 'access'
        ? getAccessPage<RolePermission>('permissions', {
            PageNumber: query.page,
            PageSize: 10,
            SearchTerm: query.search,
            UserRoleId: query.roleId,
            ScreenId: query.screenId,
            IsActive:
              query.permissionStatus === 'active'
                ? true
                : query.permissionStatus === 'inactive'
                  ? false
                  : undefined,
            ...permissionFlags,
          })
        : null,
      query.tab === 'access' ? getAccessScreens() : [],
    ]);
    return {
      query,
      lookups,
      groups,
      groupPage,
      screens,
      permissionPage,
      allScreens,
    };
  });
}

export async function saveRtsScreenGroupAction(
  id: number | undefined,
  draft: Omit<AccessGroup, 'id'>
) {
  return runAction(async () => {
    const audit = await auditUserId();
    await saveAccessRecord('groups', id, {
      ...draft,
      ...(id ? { updatedBy: audit } : { createdBy: audit }),
    });
  }, true);
}

export async function saveRtsScreenAction(id: number | undefined, draft: Omit<AccessScreen, 'id'>) {
  return runAction(async () => {
    const audit = await auditUserId();
    await saveAccessRecord('screens', id, {
      ...draft,
      ...(id ? { updatedBy: audit } : { createdBy: audit }),
    });
  }, true);
}

export async function saveRtsRoleScreenAccessAction(
  id: number | undefined,
  roleId: number,
  screenId: number,
  flags: PermissionFlags,
  isActive = true
) {
  return runAction(async () => {
    const audit = await auditUserId();
    await saveAccessRecord('permissions', id, {
      userRoleId: roleId,
      screenId,
      ...flags,
      isActive,
      ...(id ? { updatedBy: audit } : { createdBy: audit }),
    });
  }, true);
}

export async function deleteRtsRoleScreenAccessAction(id: number) {
  return runAction(async () => {
    await deleteAccessRecord('permissions', id, await auditUserId());
  }, true);
}

export async function deleteRtsScreenMasterAction(entity: 'groups' | 'screens', id: number) {
  return runAction(async () => {
    await deleteAccessRecord(entity, id, await auditUserId());
  }, true);
}

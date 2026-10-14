'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  deleteAccessRecord,
  getAccessLookups,
  getAccessPage,
  getAccessRecord,
  saveAccessRecord,
  setAccessUserActive,
} from '@/lib/api/rts/rts-access-management.service';
import { getUserIdFromCookies } from '@/lib/utils/auth-session';
import { getCleanErrorMessage } from '@/lib/utils/backend-error-detection';
import type {
  AccessQuery,
  AccessResult,
  AccessRole,
  AccessSearchParams,
  AccessUser,
  UserDraft,
} from '@/types/rts/access-management.types';

function accessQuery(params: AccessSearchParams, tabs: string[]): AccessQuery {
  const one = (key: string) => (typeof params[key] === 'string' ? params[key] : '');
  const positive = (key: string) => {
    const value = Number(one(key));
    return Number.isSafeInteger(value) && value > 0 ? value : undefined;
  };
  return {
    page: positive('page') ?? 1,
    pageSize: Math.min(positive('pageSize') ?? 10, 100),
    search: one('search').trim().slice(0, 200),
    tab: tabs.includes(one('tab')) ? one('tab') : tabs[0],
    departmentId: positive('departmentId'),
    moduleId: positive('moduleId'),
    roleId: positive('roleId'),
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

function userPayload(draft: UserDraft) {
  return {
    userName: draft.userName,
    firstName: draft.firstName,
    middleName: draft.middleName,
    lastName: draft.lastName,
    userCode: draft.userCode,
    email: draft.email || null,
    mobileNo: draft.mobileNo,
    alternateMobileNo: draft.alternateMobileNo,
    address: draft.address,
    remark: draft.remark,
    language: draft.language,
    employeeTypeID: draft.employeeTypeID,
    departments: draft.departmentIds.map((departmentId) => ({ departmentId, isActive: true })),
    moduleAccess: draft.modules.map((allocation) => ({ ...allocation, isActive: true })),
    roleAllocations: draft.roles.map((allocation) => ({ ...allocation, isActive: true })),
  };
}

export async function getRtsUserMasterAction(params: AccessSearchParams) {
  return runAction(async () => {
    const query = accessQuery(params, ['users', 'roles']);
    const [lookups, users, roles] = await Promise.all([
      getAccessLookups(),
      query.tab === 'users'
        ? getAccessPage<AccessUser>('users', {
            PageNumber: query.page,
            PageSize: query.pageSize,
            SearchTerm: query.search,
            DepartmentId: query.departmentId,
            ModuleId: query.moduleId,
            UserRoleId: query.roleId,
          })
        : null,
      query.tab === 'roles'
        ? getAccessPage<AccessRole>('roles', {
            PageNumber: query.page,
            PageSize: query.pageSize,
            UserRoleName: query.search,
            DepartmentId: query.departmentId,
          })
        : null,
    ]);
    return { query, lookups, users, roles };
  });
}

export async function getRtsUserAction(id: number) {
  return runAction(() => getAccessRecord<AccessUser>('users', id));
}

export async function saveRtsUserAction(id: number | undefined, draft: UserDraft) {
  return runAction(async () => {
    const audit = await auditUserId();
    const current = id === undefined ? undefined : await getAccessRecord<AccessUser>('users', id);
    await saveAccessRecord('users', id, {
      ...userPayload(draft),
      // Preserve lock state; lock and unlock use their dedicated backend command.
      isActive: current?.isActive ?? true,
      ...(id ? { updatedBy: audit } : { createdBy: audit }),
    });
  }, true);
}

export async function saveRtsRoleAction(
  id: number | undefined,
  name: string,
  departmentId: number,
  isActive: boolean
) {
  return runAction(async () => {
    const audit = await auditUserId();
    await saveAccessRecord('roles', id, {
      userRoleName: name,
      departmentId,
      isActive,
      ...(id ? { updatedBy: audit } : { createdBy: audit }),
    });
  }, true);
}

export async function changeRtsUserStatusAction(id: number, active: boolean) {
  return runAction(async () => {
    await setAccessUserActive(id, active, await auditUserId());
  }, true);
}

export async function deleteRtsUserMasterAction(entity: 'users' | 'roles', id: number) {
  return runAction(async () => {
    await deleteAccessRecord(entity, id, await auditUserId());
  }, true);
}

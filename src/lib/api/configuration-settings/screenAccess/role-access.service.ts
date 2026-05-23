import { apiClient } from '@/services/api.service';
import type {
  RoleMasterData,
  ScreenAccessPermissionData,
  ScreenMasterData,
} from '@/types/screen-access.types';
import type { PagedResponse } from '@/types/common.types';
import { ApiError } from '@/lib/utils/api';
import { getMasterDataPageSize } from './screen-access.services'; // still used by getPermissionsByRole

function normalizePermission(item: Record<string, unknown>): ScreenAccessPermissionData {
  let accessLevel: 'no-access' | 'view' | 'edit' | 'delete' | 'full' = 'no-access';
  if (item.haveNoAccess || item.HaveNoAccess) accessLevel = 'no-access';
  else if (item.haveFullAccess || item.HaveFullAccess) accessLevel = 'full';
  else if (item.canDelete || item.CanDelete) accessLevel = 'delete';
  else if (item.canEdit || item.CanEdit) accessLevel = 'edit';
  else if (item.canView || item.CanView) accessLevel = 'view';

  return {
    id: Number(item.roleWiseScreenAccessId ?? item.RoleWiseScreenAccessId ?? item.id ?? item.Id),
    roleId: Number(item.userRoleId ?? item.UserRoleId ?? item.roleId ?? item.RoleId),
    screenId: Number(item.screenId ?? item.ScreenId),
    accessLevel,
    createdBy:
      item.createdBy != null
        ? Number(item.createdBy)
        : item.CreatedBy != null
          ? Number(item.CreatedBy)
          : undefined,
    updatedBy:
      item.updatedBy != null
        ? Number(item.updatedBy)
        : item.UpdatedBy != null
          ? Number(item.updatedBy)
          : undefined,
  };
}

export async function getRoles(): Promise<RoleMasterData[]> {
  // Fetch from /UserRole which contains userRoleName (e.g. "Admin", "sudo").
  // /RoleWiseScreenAccessMaster only has userRoleId with no name field,
  // causing the dropdown to show "Role 1" instead of the actual role name.
  const url = `/UserRole?PageSize=1000&IsActive=true`;
  const response = await apiClient.get<PagedResponse<unknown>>(url);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to fetch roles',
      'Get roles failed'
    );
  }

  const items = (response.data?.items ?? []) as Record<string, unknown>[];

  return items
    .filter((item) => {
      const isActive =
        item.isActive !== undefined
          ? Boolean(item.isActive)
          : item.IsActive !== undefined
            ? Boolean(item.IsActive)
            : true;
      return isActive;
    })
    .map((item) => {
      const id = Number(item.id ?? item.Id ?? item.userRoleId ?? item.UserRoleId);
      const name = String(
        item.userRoleName ?? item.UserRoleName ?? item.roleName ?? item.RoleName ?? `Role ${id}`
      );
      return {
        roleMasterId: id,
        roleCode: String(item.roleCode ?? item.RoleCode ?? `ROLE_${id}`),
        roleName: name,
        isActive: true,
      } satisfies RoleMasterData;
    })
    .filter((r) => r.roleMasterId > 0);
}

export async function getPermissionsByRole(roleId: number): Promise<ScreenAccessPermissionData[]> {
  const url = `/RoleWiseScreenAccessMaster?UserRoleId=${roleId}&PageSize=${getMasterDataPageSize()}`;
  const response = await apiClient.get<PagedResponse<unknown>>(url);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      'accessControl.messages.updateError',
      'Get permissions failed'
    );
  }

  const items = (response.data?.items ?? []) as Record<string, unknown>[];
  return items.map(normalizePermission);
}

export async function getScreenAccessWithAllScreens({
  roleId,
  preFetchedScreens,
}: {
  roleId: number;
  preFetchedScreens: ScreenMasterData[];
}): Promise<ScreenAccessPermissionData[]> {
  const permissions = await getPermissionsByRole(roleId);
  const permissionMap = new Map<number, ScreenAccessPermissionData>();
  permissions.forEach((p) => {
    if (p.screenId) permissionMap.set(p.screenId, p);
  });

  return preFetchedScreens.map((screen) => {
    const existing = permissionMap.get(screen.screenMasterId || 0);
    return (
      existing || {
        roleId,
        screenId: screen.screenMasterId || 0,
        accessLevel: 'no-access',
      }
    );
  });
}

export async function updateScreenAccess(
  data: ScreenAccessPermissionData[],
  updatedBy?: number
): Promise<void> {
  const baseUrl = `/RoleWiseScreenAccessMaster`;
  const CHUNK_SIZE = 10;

  try {
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);

      await Promise.all(
        chunk.map(async (item) => {
          const { accessLevel } = item;
          const payload: Record<string, unknown> = {
            userRoleId: item.roleId,
            screenId: item.screenId,
            canView: ['view', 'edit', 'delete', 'full'].includes(accessLevel),
            canEdit: ['edit', 'delete', 'full'].includes(accessLevel),
            canDelete: ['delete', 'full'].includes(accessLevel),
            haveFullAccess: accessLevel === 'full',
            haveNoAccess: accessLevel === 'no-access',
            isActive: true,
          };

          if (typeof item.id === 'number' && item.id > 0) {
            payload.roleWiseScreenAccessId = item.id;
            if (item.createdBy !== undefined && item.createdBy !== null)
              payload.createdBy = item.createdBy;
            if (updatedBy !== undefined && updatedBy !== null) payload.updatedBy = updatedBy;

            const url = `${baseUrl}/${item.id}`;
            const res = await apiClient.put(url, payload);
            if (!res.success) throw new Error('accessControl.messages.updateError');
          } else {
            if (updatedBy !== undefined && updatedBy !== null) payload.createdBy = updatedBy;
            const res = await apiClient.post(baseUrl, payload);
            if (!res.success) throw new Error('accessControl.messages.updateError');
          }
        })
      );
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'accessControl.messages.updateError';
    throw new Error(message);
  }
}


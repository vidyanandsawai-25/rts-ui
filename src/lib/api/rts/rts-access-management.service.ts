import 'server-only';
import { apiClient } from '@/services/api.service';
import type { ApiResponse } from '@/types/common.types';
import type {
  AccessDepartment,
  AccessGroup,
  AccessLookups,
  AccessModule,
  AccessRole,
  AccessScreen,
  MasterPage,
} from '@/types/rts/access-management.types';

// ScreenMaster is the entity joined by UserScreenAccessService; /Screen is a different catalog.
export const accessEndpoints = {
  users: '/users',
  roles: '/UserRole',
  groups: '/ScreenGroupMaster',
  screens: '/ScreenMaster',
  permissions: '/RoleWiseScreenAccessMaster',
} as const;
export type AccessEntity = keyof typeof accessEndpoints;
type Query = Record<string, string | number | boolean | undefined>;
function endpoint(entity: AccessEntity, query: Query = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query))
    if (value !== undefined && value !== '') params.set(key, String(value));
  return `${accessEndpoints[entity]}?${params}`;
}
function result<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === undefined)
    throw new Error(response.error || response.message || 'Unable to load master data.');
  return response.data;
}


export async function getAccessPage<T>(entity: AccessEntity, query: Query): Promise<MasterPage<T>> {
  const page = result(
    await apiClient.get<MasterPage<T>>(endpoint(entity, query), { cache: 'no-store' })
  );
  if (!Array.isArray(page.items) || !Number.isFinite(page.totalCount))
    throw new Error('The master API returned an invalid page.');
  return page;
}


export async function getAccessRecord<T>(entity: AccessEntity, id: number): Promise<T> {
  return result(await apiClient.get<T>(`${accessEndpoints[entity]}/${id}`, { cache: 'no-store' }));
}


export async function getAccessLookups(): Promise<AccessLookups> {
  const [departments, modules, roles] = await Promise.all([
    apiClient.get<MasterPage<AccessDepartment>>('/DepartmentMaster?PageSize=-1', {
      cache: 'no-store',
    }),
    apiClient.get<MasterPage<AccessModule>>('/ModuleMaster?PageSize=-1', { cache: 'no-store' }),
    getAccessPage<AccessRole>('roles', { PageSize: -1 }),
  ]);
  const departmentPage = result(departments);
  const modulePage = result(modules);
  if (!Array.isArray(departmentPage.items) || !Array.isArray(modulePage.items))
    throw new Error('Invalid department/module lookup response.');
  // Fail visibly if an API ceiling would silently omit allocated masters during editing.
  for (const page of [departmentPage, modulePage, roles])
    if (page.items.length < page.totalCount)
      throw new Error('Master lookup was truncated. Complete allocations could not be loaded.');
  return { departments: departmentPage.items, modules: modulePage.items, roles: roles.items };
}



export async function getAccessGroups(): Promise<AccessGroup[]> {
  const page = await getAccessPage<AccessGroup>('groups', { PageSize: -1 });
  if (page.items.length < page.totalCount) throw new Error('Screen group lookup was truncated.');
  return page.items;
}


export async function getAccessScreens(): Promise<AccessScreen[]> {
  const page = await getAccessPage<AccessScreen>('screens', { PageSize: -1 });
  if (page.items.length < page.totalCount) throw new Error('Screen lookup was truncated.');
  return page.items;
}


export async function saveAccessRecord(
  entity: AccessEntity,
  id: number | undefined,
  payload: object
): Promise<void> {
  const response = id
    ? await apiClient.put(`${accessEndpoints[entity]}/${id}`, payload)
    : await apiClient.post(accessEndpoints[entity], payload);
  if (!response.success)
    throw new Error(response.error || response.message || 'The record could not be saved.');
}


export async function deleteAccessRecord(
  entity: AccessEntity,
  id: number,
  auditUserId: number
): Promise<void> {
  const response = await apiClient.delete(
    `${accessEndpoints[entity]}/${id}`,
    entity === 'users' ? { body: JSON.stringify({ updatedBy: auditUserId }) } : undefined
  );
  if (!response.success) throw new Error(response.error || 'The record could not be deleted.');
}
export async function setAccessUserActive(
  id: number,
  active: boolean,
  auditUserId: number
): Promise<void> {
  const response = await apiClient.put(`/users/${id}/${active ? 'unlock' : 'lock'}`, {
    updatedBy: auditUserId,
  });
  if (!response.success) throw new Error(response.error || 'Account status could not be changed.');
}

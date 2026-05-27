import { apiClient } from '@/services/api.service';
import type { ScreenMasterData } from '@/types/screen-access.types';
import type { PagedResponse } from '@/types/common.types';
import { ApiError } from '@/lib/utils/api';
import { logError } from '@/lib/utils/logger';
import { DEFAULT_SCREEN_ICON } from '@/lib/constants/screen-access.constants';
import { getModules } from './master-data.service';
import { getTranslations } from 'next-intl/server';

export function normalizeScreen(data: Record<string, unknown>): ScreenMasterData {
  const screenMasterId = Number(
    data.screenMasterId ??
      data.screenId ??
      data.ScreenMasterId ??
      data.ScreenId ??
      data.id ??
      data.Id
  );

  const moduleId = Number(
    data.moduleMasterId ?? data.ModuleMasterId ?? data.moduleId ?? data.ModuleId ?? 0
  );

  const departmentMasterId = Number(
    data.departmentMasterId ??
      data.DepartmentMasterId ??
      data.departmentId ??
      data.DepartmentId ??
      0
  );

  const isGarbled = (str: string) => !str || /\?{2,}/.test(str);
  const screenNameStr = String(data.screenName ?? '');
  const screenNameLocalStr = String(data.screenNameLocal ?? data.screenName ?? '');

  return {
    screenMasterId: screenMasterId > 0 ? screenMasterId : undefined,
    screenGroupId: Number(
      data.screenGroupId ?? data.ScreenGroupId ?? data.groupId ?? data.GroupId ?? 0
    ),
    screenGroupName: String(data.screenGroupName ?? ''),
    moduleId: moduleId > 0 ? moduleId : null,
    moduleName: data.moduleName != null ? String(data.moduleName) : null,
    screenCode: String(data.screenCode ?? ''),
    screenName: !isGarbled(screenNameStr)
      ? screenNameStr
      : !isGarbled(screenNameLocalStr)
        ? screenNameLocalStr
        : screenNameStr,
    screenNameLocal: screenNameLocalStr,
    screenIcon: String(data.screenIcon ?? ''),
    routePath: String(data.routePath ?? ''),
    isMenu: Boolean(data.isMenu),
    isAuthenticationRequired: Boolean(data.isAuthenticationRequired),
    isActive: Boolean(data.isActive),
    displayOrder: Number(data.displayOrder ?? data.DisplayOrder ?? 0),
    description: String(data.description ?? ''),
    departmentMasterId: departmentMasterId > 0 ? departmentMasterId : null,
    createdDate: data.createdDate != null ? String(data.createdDate) : null,
    updatedDate: data.updatedDate != null ? String(data.updatedDate) : null,
    createdBy: data.createdBy != null ? Number(data.createdBy) : null,
    updatedBy: data.updatedBy != null ? Number(data.updatedBy) : null,
  };
}

export async function getScreens(
  params: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    screenGroupId?: number;
    isActive?: boolean;
  } = {}
): Promise<PagedResponse<ScreenMasterData>> {
  const queryParams = new URLSearchParams();
  if (params.pageNumber !== undefined)
    queryParams.append('PageNumber', params.pageNumber.toString());
  if (params.pageSize !== undefined) queryParams.append('PageSize', params.pageSize.toString());
  if (params.searchTerm) queryParams.append('SearchTerm', params.searchTerm);
  if (params.isActive !== undefined) queryParams.append('IsActive', params.isActive.toString());
  if (params.screenGroupId !== undefined)
    queryParams.append('ScreenGroupId', params.screenGroupId.toString());

  const response = await apiClient.get<PagedResponse<unknown>>(
    `/ScreenMaster?${queryParams.toString()}`
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'errors.apiConnection.fetchScreensFailed',
      'Get screens failed'
    );
  }
  if (!response.data) {
    throw new ApiError(
      500,
      'errors.apiConnection.noDataReceived',
      'errors.apiConnection.invalidResponseFormat'
    );
  }
  const items = (response.data.items ?? []) as Record<string, unknown>[];
  const normalizedItems = items.map(normalizeScreen);

  return { ...response.data, items: normalizedItems };
}

export async function getScreenById(id: number): Promise<ScreenMasterData> {
  const response = await apiClient.get<unknown>(`/ScreenMaster/${encodeURIComponent(String(id))}`);

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'errors.apiConnection.fetchScreenFailed',
      `Get screen ${id} failed`
    );
  }

  if (!response.data) {
    throw new ApiError(500, 'errors.apiConnection.unexpectedFormat', 'Data validation failed');
  }

  return normalizeScreen(response.data as Record<string, unknown>);
}

export async function createScreen(
  data: Partial<ScreenMasterData>,
  userId?: number
): Promise<void> {
  let validModuleId = data.moduleId;
  if (!validModuleId && data.departmentMasterId) {
    try {
      const allModules = await getModules();
      const firstMod = allModules.find((m) => m.departmentMasterId === data.departmentMasterId);
      if (firstMod) validModuleId = firstMod.moduleId;
    } catch (e) {
      const t = await getTranslations('screenAccess');
      logError(t('screenManagement.screens.messages.fetchModulesError'), {
        error: e instanceof Error ? e : undefined,
      });
    }
  }

  const payload = {
    isMenu: true,
    isAuthenticationRequired: true,
    isActive: true,
    screenIcon: DEFAULT_SCREEN_ICON,
    ...data,
    moduleId: validModuleId ?? 0,
    moduleMasterId: validModuleId ?? 0,
    departmentMasterId: data.departmentMasterId ?? 0,
    departmentId: data.departmentMasterId ?? 0,
    displayOrder: Number(data.displayOrder ?? 0),
    screenNameLocal: data.screenNameLocal || data.screenName,
    createdBy: userId,
  };

  const response = await apiClient.post<unknown>('/ScreenMaster', payload);
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      'screenManagement.screens.messages.createError',
      'Create screen failed'
    );
  }
}

export async function updateScreen(
  id: number,
  data: Partial<ScreenMasterData>,
  userId?: number
): Promise<void> {
  let validModuleId = data.moduleId;
  if (!validModuleId && data.departmentMasterId) {
    try {
      const allModules = await getModules();
      const firstMod = allModules.find((m) => m.departmentMasterId === data.departmentMasterId);
      if (firstMod) validModuleId = firstMod.moduleId;
    } catch (e) {
      const t = await getTranslations('screenAccess');
      logError(t('screenManagement.screens.messages.fetchModulesError'), {
        error: e instanceof Error ? e : undefined,
      });
    }
  }

  const payload = {
    ...data,
    screenMasterId: id,
    screenId: id,
    id: id,
    moduleId: validModuleId ?? 0,
    moduleMasterId: validModuleId ?? 0,
    departmentMasterId: data.departmentMasterId ?? 0,
    departmentId: data.departmentMasterId ?? 0,
    displayOrder: Number(data.displayOrder ?? 0),
    screenNameLocal: data.screenName || data.screenNameLocal,
    isActive: data.isActive,
    IsActive: data.isActive,
    isStatus: data.isActive,
    status: data.isActive ? 'Active' : 'Inactive',
    Status: data.isActive ? 'Active' : 'Inactive',
    isMenu: data.isMenu,
    IsMenu: data.isMenu,
    updatedBy: userId,
  };

  const response = await apiClient.put<unknown>(
    `/ScreenMaster/${encodeURIComponent(String(id))}`,
    payload
  );
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      'screenManagement.screens.messages.updateError',
      'Update screen failed'
    );
  }
}

export async function deleteScreen(id: number): Promise<string> {
  const response = await apiClient.delete<Record<string, unknown>>(
    `/ScreenMaster/${encodeURIComponent(String(id))}`
  );
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      'screenManagement.screens.messages.deleteError',
      'Delete screen failed'
    );
  }
  return String(response.data?.message || '');
}

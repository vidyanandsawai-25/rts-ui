import { apiClient } from '@/services/api.service';
import type { ScreenGroupMasterData } from '@/types/screen-access.types';
import type { PagedResponse } from '@/types/common.types';
import { ApiError } from '@/lib/utils/api';
import { DEFAULT_GROUP_ICON } from '@/lib/constants/screen-access.constants';

export function normalizeScreenGroup(data: Record<string, unknown>): ScreenGroupMasterData {
  const id = Number(
    data.screenGroupId ??
      data.ScreenGroupId ??
      data.groupId ??
      data.GroupId ??
      data.id ??
      data.Id ??
      0
  );
  return {
    screenGroupId: id,
    screenGroupName: String(data.screenGroupName ?? data.groupName ?? data.name ?? ''),
    screenGroupCode: String(data.screenGroupCode ?? data.groupCode ?? data.code ?? ''),
    screenGroupIcon: String(data.screenGroupIcon ?? data.icon ?? ''),
    displayOrder: Number(data.displayOrder ?? data.DisplayOrder ?? 0),
    isActive: Boolean(data.isActive),
    description: String(data.description ?? ''),
    createdDate: data.createdDate != null ? String(data.createdDate) : null,
    updatedDate: data.updatedDate != null ? String(data.updatedDate) : null,
    createdBy: data.createdBy != null ? Number(data.createdBy) : null,
    updatedBy: data.updatedBy != null ? Number(data.updatedBy) : null,
  };
}

export async function getScreenGroups(
  params: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    isActive?: boolean;
  } = {}
): Promise<PagedResponse<ScreenGroupMasterData>> {
  const queryParams = new URLSearchParams();
  if (params.pageNumber !== undefined)
    queryParams.append('PageNumber', params.pageNumber.toString());
  if (params.pageSize !== undefined) queryParams.append('PageSize', params.pageSize.toString());
  if (params.searchTerm) queryParams.append('SearchTerm', params.searchTerm);
  if (params.isActive !== undefined) queryParams.append('IsActive', params.isActive.toString());

  const response = await apiClient.get<PagedResponse<unknown>>(
    `/ScreenGroupMaster?${queryParams.toString()}`
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to fetch screen groups',
      'Get screen groups failed'
    );
  }

  if (!response.data) {
    throw new ApiError(500, 'No data received from server', 'Invalid response format');
  }

  const items = (response.data.items ?? []) as Record<string, unknown>[];
  const normalizedItems = items.map(normalizeScreenGroup);

  return { ...response.data, items: normalizedItems };
}

export async function getScreenGroupById(id: number): Promise<ScreenGroupMasterData> {
  const response = await apiClient.get<unknown>(
    `/ScreenGroupMaster/${encodeURIComponent(String(id))}`
  );

  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to fetch screen group',
      `Get screen group ${id} failed`
    );
  }

  if (!response.data) {
    throw new ApiError(
      500,
      'Unexpected data format received from server',
      'Data validation failed'
    );
  }

  return normalizeScreenGroup(response.data as Record<string, unknown>);
}

export async function createScreenGroup(
  data: Partial<ScreenGroupMasterData>,
  userId?: number
): Promise<void> {
  const payload = {
    isActive: true,
    screenGroupIcon: DEFAULT_GROUP_ICON,
    ...data,
    displayOrder: Number(data.displayOrder ?? 0),
    createdBy: userId,
  };

  const response = await apiClient.post<unknown>('/ScreenGroupMaster', payload);
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to create screen group',
      'Create screen group failed'
    );
  }
}

export async function updateScreenGroup(
  id: number,
  data: Partial<ScreenGroupMasterData>,
  userId?: number
): Promise<void> {
  const payload: Partial<ScreenGroupMasterData> = {
    ...data,
    screenGroupId: id,
    updatedBy: userId,
  };

  if (data.displayOrder !== undefined) {
    payload.displayOrder = Number(data.displayOrder);
  }

  const response = await apiClient.put<unknown>(
    `/ScreenGroupMaster/${encodeURIComponent(String(id))}`,
    payload
  );
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to update screen group',
      'Update screen group failed'
    );
  }
}

export async function deleteScreenGroup(id: number): Promise<string> {
  const response = await apiClient.delete<Record<string, unknown>>(
    `/ScreenGroupMaster/${encodeURIComponent(String(id))}`
  );
  if (!response.success) {
    throw new ApiError(
      response.statusCode ?? 500,
      response.error || 'Failed to delete screen group',
      'Delete screen group failed'
    );
  }
  return String(response.data?.message || '');
}

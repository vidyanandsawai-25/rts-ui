import { apiClient } from '@/services/api.service';
import type { UserScreenAccess } from '@/types/user-screen-access.types';
import type { ApiResponse } from '@/types/common.types';

function authHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

class UserScreenAccessService {
  /**
   * Menu/screens for a specific user (preferred for sidebar).
   * GET /api/UserScreenAccess/user/{userId}
   */
  async getScreensForUser(userId: number, token?: string): Promise<ApiResponse<UserScreenAccess[]>> {
    return apiClient.get<UserScreenAccess[]>(`/UserScreenAccess/user/${userId}`, {
      headers: authHeaders(token),
    });
  }

  /** Legacy: screens by role id */
  async getRoleScreens(roleId: number, token?: string): Promise<ApiResponse<UserScreenAccess[]>> {
    return apiClient.get<UserScreenAccess[]>(`/UserScreenAccess/role/${roleId}`, {
      headers: authHeaders(token),
    });
  }
}

export const userScreenAccessService = new UserScreenAccessService();

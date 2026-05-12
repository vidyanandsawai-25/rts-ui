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
    // Fetching screens for user...


    const response = await apiClient.get<unknown>(`/users/access?UserId=${userId}`, {
      headers: authHeaders(token),
    });

    if (response.success && response.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = response.data as any;
      const screens = Array.isArray(data) ? data : (data.items || data.data || data.result || []);
      
      // Found screens...


      return {
        ...response,
        data: screens as UserScreenAccess[]
      };
    }

    // Failed to fetch screens...


    return response as ApiResponse<UserScreenAccess[]>;
  }

  /** Legacy: screens by role id */
  async getRoleScreens(roleId: number, token?: string): Promise<ApiResponse<UserScreenAccess[]>> {
    return apiClient.get<UserScreenAccess[]>(`/UserScreenAccess/role/${roleId}`, {
      headers: authHeaders(token),
    });
  }
}

export const userScreenAccessService = new UserScreenAccessService();

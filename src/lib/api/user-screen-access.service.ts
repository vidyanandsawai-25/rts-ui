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
    if (process.env.NODE_ENV === 'development') {
      console.log(`[UserScreenAccessService] Fetching screens for userId: ${userId}`);
    }

    const response = await apiClient.get<unknown>(`/UserScreenAccess/user/${userId}`, {
      headers: authHeaders(token),
    });

    if (response.success && response.data) {
      const data = response.data;
      const screens = Array.isArray(data) ? data : (data.items || data.data || data.result || []);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[UserScreenAccessService] Found ${screens.length} screens for userId: ${userId}`);
      }

      return {
        ...response,
        data: screens as UserScreenAccess[]
      };
    }

    if (process.env.NODE_ENV === 'development' && !response.success) {
      console.error(`[UserScreenAccessService] Failed to fetch screens: ${response.error} (Status: ${response.statusCode})`);
    }

    return response;
  }

  /** Legacy: screens by role id */
  async getRoleScreens(roleId: number, token?: string): Promise<ApiResponse<UserScreenAccess[]>> {
    return apiClient.get<UserScreenAccess[]>(`/UserScreenAccess/role/${roleId}`, {
      headers: authHeaders(token),
    });
  }
}

export const userScreenAccessService = new UserScreenAccessService();

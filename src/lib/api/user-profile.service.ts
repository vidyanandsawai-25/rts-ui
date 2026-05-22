import { apiClient } from '@/services/api.service';
import type { UserProfile } from '@/types/home/user-profile.types';
import type { ApiResponse } from '@/types/common.types';

/**
 * User Profile Service
 * Handles API calls related to user profile data
 */
class UserProfileService {
  /**
   * Fetches user profile by user ID
   * GET /api/users/{userId}
   */
  async getUserProfile(userId: number, token?: string): Promise<ApiResponse<UserProfile>> {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return apiClient.get<UserProfile>(`/users/${userId}`, { headers });
  }
}

export const userProfileService = new UserProfileService();

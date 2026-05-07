import { apiClient } from '@/services/api.service';
import type { UserProfile } from '@/types/user-profile.types';
import type { ApiResponse } from '@/types/common.types';

/**
 * Helper function to create authorization headers
 */
function authHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/**
 * User Profile Service
 * Handles fetching user profile data from the /api/users/{id} endpoint
 */
class UserProfileService {
  /**
   * Get user profile by user ID
   * GET /api/users/{userId}
   * @param userId - The user ID to fetch profile for
   * @param token - Optional auth token
   * @returns User profile data including departments, module access, and role allocations
   */
  async getUserProfile(userId: number, token?: string): Promise<ApiResponse<UserProfile>> {
    const response = await apiClient.get<UserProfile>(`/users/${userId}`, {
      headers: authHeaders(token),
    });

    return response;
  }

  /**
   * Get display-ready formatted values from user profile
   * Transforms raw API response into UI-friendly format
   */
  formatProfileForDisplay(profile: UserProfile): {
    fullName: string;
    email: string;
    roles: string[];
    departments: string[];
    modules: string[];
    userId: string;
    userCode: string;
    mobileNo: string;
    address: string;
    language: string;
    primaryRole: string;
    primaryDepartment: string;
  } {
    const fullName = [profile.firstName, profile.middleName, profile.lastName]
      .filter(Boolean)
      .join(' ');

    // Extract unique roles
    const roles = [...new Set(
      profile.roleAllocations
        .filter(r => r.isActive)
        .map(r => r.userRoleName)
    )];

    // Extract unique departments
    const departments = [...new Set(
      profile.departments
        .filter(d => d.isActive)
        .map(d => d.departmentName)
    )];

    // Extract unique modules
    const modules = [...new Set(
      profile.moduleAccess
        .filter(m => m.isActive)
        .map(m => m.moduleName)
    )];

    return {
      fullName,
      email: profile.email,
      roles,
      departments,
      modules,
      userId: profile.id.toString(),
      userCode: profile.userCode,
      mobileNo: profile.mobileNo,
      address: profile.address,
      language: profile.language,
      primaryRole: roles[0] || 'User',
      primaryDepartment: departments[0] || '',
    };
  }
}

export const userProfileService = new UserProfileService();

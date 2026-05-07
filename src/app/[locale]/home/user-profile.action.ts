'use server';

import { userProfileService } from '@/lib/api/user-profile.service';
import type { UserProfile } from '@/types/user-profile.types';
import type { ApiResponse } from '@/types/common.types';

/**
 * Server action to fetch user profile by ID
 * @param userId - The user ID to fetch
 * @returns User profile data or error
 */
export async function getUserProfileAction(userId: number): Promise<ApiResponse<UserProfile>> {
  try {
    const response = await userProfileService.getUserProfile(userId);
    return response;
  } catch (error) {
    console.error('getUserProfileAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user profile',
    };
  }
}

/**
 * Server action to get formatted display values for user profile
 * @param userId - The user ID to fetch
 * @returns Formatted profile data for display
 */
export async function getUserProfileDisplayAction(userId: number): Promise<{
  success: boolean;
  data?: {
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
  };
  error?: string;
}> {
  try {
    const response = await userProfileService.getUserProfile(userId);
    
    if (response.success && response.data) {
      const displayData = userProfileService.formatProfileForDisplay(response.data);
      return {
        success: true,
        data: displayData,
      };
    }
    
    return {
      success: false,
      error: response.error || 'Failed to fetch user profile',
    };
  } catch (error) {
    console.error('getUserProfileDisplayAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user profile',
    };
  }
}

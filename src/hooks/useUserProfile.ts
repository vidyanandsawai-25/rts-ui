'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserProfileDisplayAction } from '@/app/[locale]/home/user-profile.action';

/**
 * User profile display data structure
 */
interface UserProfileDisplayData {
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
}

/**
 * Hook return type
 */
interface UseUserProfileReturn {
  profile: UserProfileDisplayData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage user profile data
 * Uses server action to fetch from /api/users/{id}
 * 
 * @param userId - The user ID to fetch profile for
 * @returns Profile data, loading state, error, and refetch function
 */
export function useUserProfile(userId: number | null): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfileDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getUserProfileDisplayAction(userId);
      
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Failed to fetch user profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

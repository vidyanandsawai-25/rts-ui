'use server';

import { cookies } from "next/headers";
import { getUserProfileCached } from "@/lib/api/user-profile-cache";
import { Service } from "@/types/home/home.types";
import { getDepartmentConfig, getDepartmentRoute } from "@/config/home-services.config";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import type { UserDepartment, UserProfileDisplayValues } from "@/types/home/user-profile.types";

/**
 * Response type for listServices
 */
export interface ListServicesResponse {
    services: Service[];
    error?: string;
}

/**
 * Maps user department from API to UI Service interface
 */
function mapDepartmentToService(
    department: UserDepartment,
    locale: string
): Service | null {
    const config = getDepartmentConfig(department.departmentName);
    
    if (!config) {
        return null;
    }

    return {
        id: department.departmentId,
        name: department.departmentName,
        title: department.departmentName,
        subtext: `Access ${department.departmentName} services`,
        icon: department.departmentName,
        link: getDepartmentRoute(department.departmentName, locale),
    };
}

/**
 * Fetches user departments from User Profile API and returns as services
 * Only shows departments the user has active access to
 */
export async function listServices(locale: string): Promise<ListServicesResponse> {
    try {
        const cookieStore = await cookies();
        const userId = getUserIdFromCookies(cookieStore);
        
        if (!userId) {
            return { services: [], error: "User not authenticated" };
        }
        
        const response = await getUserProfileCached(userId);
        
        if (!response.success || !response.data) {
            return { services: [], error: response.error || "Failed to load user profile" };
        }
        
        // Get active departments only
        const activeDepartments = response.data.departments?.filter(d => d.isActive) ?? [];
        
        if (activeDepartments.length === 0) {
            return { services: [] };
        }

        // Remove duplicates based on departmentId
        const uniqueDepartments = activeDepartments.reduce((acc, current) => {
            const exists = acc.find(d => d.departmentId === current.departmentId);
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, [] as UserDepartment[]);

        // Map departments to services, filtering out any that don't have config
        const services = uniqueDepartments
            .map(dept => mapDepartmentToService(dept, locale))
            .filter((service): service is Service => service !== null);

        return { services };
    } catch (_error) {
        return { 
            services: [], 
            error: "Failed to load services. Please try refreshing the page." 
        };
    }
}

/**
 * Server action to get formatted display values for user profile
 * Used by UserProfilePopup component
 */
export async function getUserProfileDisplayAction(): Promise<{
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
        const cookieStore = await cookies();
        const userId = getUserIdFromCookies(cookieStore);
        if (!userId) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }
        // Use cached fetch for deduplication
        const response = await getUserProfileCached(userId);
        if (!response.success || !response.data) {
            return {
                success: false,
                error: response.error || 'Failed to fetch user profile',
            };
        }
        const profile = response.data;
        // Format profile for display
        const fullName = [profile.firstName, profile.middleName, profile.lastName]
            .filter(Boolean)
            .join(' ');
        const roles = [...new Set(
            profile.roleAllocations
                .filter(r => r.isActive)
                .map(r => r.userRoleName)
        )];
        const departments = [...new Set(
            profile.departments
                .filter(d => d.isActive)
                .map(d => d.departmentName)
        )];
        const modules = [...new Set(
            profile.moduleAccess
                .filter(m => m.isActive)
                .map(m => m.moduleName)
        )];
        return {
            success: true,
            data: {
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
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch user profile',
        };
    }
}

/**
 * Server-side function to get user profile for SSR
 * Reads userId from cookies and fetches profile data
 * Called from page.tsx server component
 */
export async function getUserProfileSSR(): Promise<{ 
    data: UserProfileDisplayValues | null; 
    error?: string;
}> {
    try {
        const cookieStore = await cookies();
        const userId = getUserIdFromCookies(cookieStore);
        
        if (!userId) {
            return { data: null, error: "User not authenticated" };
        }
        
        const response = await getUserProfileCached(userId);
        
        if (!response.success || !response.data) {
            return { 
                data: null, 
                error: response.error || "Failed to fetch user profile" 
            };
        }

        const profile = response.data;
        
        const fullName = [profile.firstName, profile.middleName, profile.lastName]
            .filter(Boolean)
            .join(' ');

        const roles = [...new Set(
            profile.roleAllocations
                .filter(r => r.isActive)
                .map(r => r.userRoleName)
        )];

        const departments = [...new Set(
            profile.departments
                .filter(d => d.isActive)
                .map(d => d.departmentName)
        )];

        const modules = [...new Set(
            profile.moduleAccess
                .filter(m => m.isActive)
                .map(m => m.moduleName)
        )];

        const data: UserProfileDisplayValues = {
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

        return { data };
    } catch (error) {
        return { 
            data: null, 
            error: error instanceof Error ? error.message : "Failed to synchronize profile details" 
        };
    }
}

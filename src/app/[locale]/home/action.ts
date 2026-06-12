'use server';

import { cookies } from "next/headers";
import { getUserProfileCached } from "@/lib/api/user-profile-cache";
import { Service } from "@/types/home/home.types";
import { getUserIdFromCookies } from "@/lib/utils/cookie";
import type { UserDepartment, UserProfileDisplayValues } from "@/types/home/user-profile.types";
import type { Department } from "@/types/departmentActivation.types";
import { departmentActivationService } from "@/lib/api/configuration-settings/department-activation/departmentActivation.service";

/**
 * Response type for listServices
 */
export interface ListServicesResponse {
    services: Service[];
    error?: string;
}

/**
 * Analyzes department name to determine the correct Lucide icon
 */
function getIconByDepartmentName(departmentName: string): string {
    const lowerName = departmentName.toLowerCase().trim();

    if (lowerName.includes('property')) return 'Home';
    if (lowerName.includes('water')) return 'Droplet';
    if (lowerName.includes('trade') || lowerName.includes('license') || lowerName.includes('bajar')) return 'ShoppingCart';
    if (lowerName.includes('birth') || lowerName.includes('death')) return 'FileText';
    if (lowerName.includes('garbage') || lowerName.includes('trash') || lowerName.includes('waste')) return 'Trash2';
    if (lowerName.includes('building') || lowerName.includes('permission')) return 'Building2';
    if (lowerName.includes('grievance') || lowerName.includes('complain')) return 'Megaphone';
    if (lowerName.includes('rts')) return 'Timer';
    if (lowerName.includes('asset')) return 'Landmark';
    if (lowerName.includes('fire') || lowerName.includes('noc')) return 'Flame';

    return 'LayoutGrid';
}

/**
 * Maps user department from API to UI Service interface
 */
function mapDepartmentToService(
    department: UserDepartment,
    iconName: string,
    locale: string
): Service {
    const name = department.departmentName;
    const lowerName = name.toLowerCase().trim();

    // Dynamically slugify the route segment using department name
    const routeSegment = lowerName.replace(/[&\s]+/g, '-').replace(/-+/g, '-');

    return {
        id: department.departmentId,
        name: department.departmentName,
        title: department.departmentName,
        subtext: `Access ${department.departmentName} services`,
        icon: iconName || getIconByDepartmentName(department.departmentName),
        link: `/${locale}/${routeSegment}`,
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

        // Fetch both user profile and globally active departments list in parallel
        const [profileResponse, departmentsResponse] = await Promise.all([
            getUserProfileCached(userId),
            departmentActivationService.getDepartments(1, 1000).catch(() => ({ success: false, data: [] }))
        ]);

        if (!profileResponse.success || !profileResponse.data) {
            return { services: [], error: profileResponse.error || "Failed to load user profile" };
        }

        // Map globally active department IDs to their respective Department objects for quick lookup
        const activeDeptsMap = new Map<number, Department>();
        let hasGlobalDepartments = false;

        if (departmentsResponse.success && departmentsResponse.data && departmentsResponse.data.length > 0) {
            hasGlobalDepartments = true;
            departmentsResponse.data.forEach(dept => {
                if (dept.isActive) {
                    activeDeptsMap.set(dept.departmentId, dept);
                }
            });
        }

        // Get active departments only: active user allocation AND globally active department
        const activeDepartments = profileResponse.data.departments?.filter(d => {
            const isUserAllocationActive = d.isActive;
            const isGlobalDeptActive = !hasGlobalDepartments || activeDeptsMap.has(d.departmentId);
            return isUserAllocationActive && isGlobalDeptActive;
        }) ?? [];

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

        // Map departments to services using dynamic icon resolved from global list
        const services = uniqueDepartments
            .map(dept => {
                const globalDept = activeDeptsMap.get(dept.departmentId);
                const iconName = globalDept?.departmentIcon || '';
                return mapDepartmentToService(dept, iconName, locale);
            });

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

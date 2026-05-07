'use server';

import { Service } from "@/types/home/home.types";
import { getIconNameForModule, getRouteForModule } from "@/config/home-services.config";
import { getUserProfileAction } from "./user-profile.action";
import { cookies } from "next/headers";
import { getUserIdFromCookies } from "@/lib/utils/cookie";

/**
 * Response type for listServices including error state
 */
export interface ListServicesResponse {
    services: Service[];
    error?: string;
}

/**
 * Maps module access item from user profile API to the UI Service interface
 */
function mapModuleAccessToService(
    moduleAccess: {
        moduleId: number;
        moduleName: string;
        moduleNameLocal: string;
        departmentId: number;
        departmentName: string;
    },
    locale: string
): Service {
    const code = moduleAccess.moduleName.toLowerCase();
    return {
        id: moduleAccess.moduleId,
        name: moduleAccess.moduleName,
        title: moduleAccess.departmentName,
        subtext: `Access ${moduleAccess.moduleName} services and manage your applications.`,
        icon: getIconNameForModule(code),
        link: getRouteForModule(code, locale),
    };
}

/**
 * Fetches home services data from the User Profile API (moduleAccess)
 * Returns both services and potential error message for UI feedback
 */
export async function listServices(locale: string): Promise<ListServicesResponse> {
    try {
        const cookieStore = await cookies();
        const userId = getUserIdFromCookies(cookieStore);
        
        if (!userId) {
            console.warn("listServices: No user ID found in cookies");
            return { services: [], error: "User not authenticated" };
        }
        
        const response = await getUserProfileAction(userId);
        
        if (!response.success || !response.data) {
            console.warn("listServices: Failed to fetch user profile");
            return { services: [], error: response.error || "Failed to load user profile" };
        }
        
        const moduleAccess = response.data.moduleAccess?.filter(m => m.isActive) ?? [];
        
        if (moduleAccess.length === 0) {
            console.warn("listServices: No modules returned from user profile");
            return { services: [] };
        }

        // Remove duplicates based on moduleId
        const uniqueModules = moduleAccess.reduce((acc, current) => {
            const exists = acc.find(item => item.moduleId === current.moduleId);
            if (!exists) {
                acc.push(current);
            }
            return acc;
        }, [] as typeof moduleAccess);

        return { services: uniqueModules.map(m => mapModuleAccessToService(m, locale)) };
    } catch (error) {
        console.error("listServices API Failure:", {
            message: error instanceof Error ? error.message : "Unknown error",
        });
        
        return { 
            services: [], 
            error: "Failed to load services. Please try refreshing the page." 
        };
    }
}

// NOTE: getDashboardStats removed - implement actual API call when stats endpoint is available
// export async function getDashboardStats(): Promise<DashboardStats> { ... }

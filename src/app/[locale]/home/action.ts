'use server';

import { Service } from "@/types/home/home.types";
import { getModuleMaster } from "@/lib/api/home/module-master.service";
import { ModuleMaster } from "@/types/home/module-master.types";
import { getIconNameForModule, getRouteForModule } from "@/config/home-services.config";

/**
 * Response type for listServices including error state
 */
export interface ListServicesResponse {
    services: Service[];
    error?: string;
}

/**
 * Maps ModuleMaster API item to the UI Service interface
 * 
 * NOTE: Stats are intentionally omitted until the stats API endpoint is available.
 * When stats API is implemented, uncomment the stats property and populate with real data.
 * See: JIRA-XXXX for stats API implementation ticket
 */
function mapModuleToService(module: ModuleMaster, locale: string): Service {
    const code = module.moduleCode.toLowerCase();
    return {
        id: module.id,
        name: module.moduleName,
        title: module.departmentName,
        subtext: module.moduleDescription || `Access ${module.moduleName} services and manage your applications.`,
        icon: getIconNameForModule(code),
        link: getRouteForModule(code, locale),
        // Stats intentionally omitted - will be populated when stats API is available
        // stats: await fetchModuleStats(module.moduleCode),
    };
}

/**
 * Fetches home services data from the ModuleMaster API
 * Returns both services and potential error message for UI feedback
 */
export async function listServices(locale: string): Promise<ListServicesResponse> {
    try {
        const response = await getModuleMaster();
        const modules = response.items ?? [];
        
        if (modules.length === 0) {
            console.warn("listServices: No modules returned from API");
            return { services: [] };
        }

        return { services: modules.map(m => mapModuleToService(m, locale)) };
    } catch (error) {
        // Detailed logging to help identify the root cause of the API error
        let status: unknown = undefined;
        let context: unknown = undefined;
        if (typeof error === "object" && error !== null && "statusCode" in error) {
            status = (error as { statusCode?: unknown }).statusCode;
        }
        if (typeof error === "object" && error !== null && "contextMessage" in error) {
            context = (error as { contextMessage?: unknown }).contextMessage;
        }
        console.error("listServices API Failure:", {
            message: error instanceof Error ? error.message : "Unknown error",
            status,
            context
        });
        
        // Return empty array with error message to allow Home screen to render
        // while notifying the UI about the failure
        return { 
            services: [], 
            error: "Failed to load services. Please try refreshing the page." 
        };
    }
}

// NOTE: getDashboardStats removed - implement actual API call when stats endpoint is available
// export async function getDashboardStats(): Promise<DashboardStats> { ... }

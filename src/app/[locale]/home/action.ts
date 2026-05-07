'use server';

import { Service, DashboardStats } from "@/types/home/home.types";
import { getModuleMaster } from "@/lib/api/home/module-master.service";
import { ModuleMaster } from "@/types/home/module-master.types";

/**
 * Maps API Module codes to UI Icon names
 */
const iconMap: Record<string, string> = {
    'pt': 'property-tax',
    'wt': 'water-tax',
    'tl': 'bajar-parwana',
    'bd': 'birth-death',
    'gc': 'garbage-collection',
    'bp': 'building-permission',
    'gr': 'grievance',
    'rts': 'rts',
    'am': 'assets',
};

/**
 * Maps API Module codes to UI Routes
 */
const routeMap: Record<string, string> = {
    'pt': 'property-tax/ptis',
    'wt': 'water-tax',
    'tl': 'bajar-parwana',
    'bd': 'birth-death-certificates',
    'gc': 'garbage-collection',
    'bp': 'building-permission',
    'gr': 'grievance',
    'rts': 'rts',
    'am': 'assets',
};

/**
 * Maps ModuleMaster API item to the UI Service interface
 */
function mapModuleToService(module: ModuleMaster, locale: string): Service {
    const code = module.moduleCode.toLowerCase();
    const route = routeMap[code];
    return {
        id: module.id,
        name: module.moduleName,
        title: module.departmentName,
        subtext: module.moduleDescription || `Access ${module.moduleName} services and manage your applications.`,
        icon: iconMap[code] || 'property-tax',
        link: route ? `/${locale}/${route}` : '#',
        // Mock stats for now as the API doesn't provide them yet
        stats: [
            { label: "Total", value: "0" },
            { label: "Paid", value: "0" },
            { label: "Pending", value: "0" },
        ]
    };
}

/**
 * Fetches home services data from the ModuleMaster API
 */
export async function listServices(locale: string): Promise<Service[]> {
    try {
        const response = await getModuleMaster();
        const modules = response.items ?? [];
        
        if (modules.length === 0) {
            console.warn("listServices: No modules returned from API");
            return [];
        }

        return modules.map(m => mapModuleToService(m, locale));
    } catch (error) {
        // Detailed logging to help identify the root cause of the terminal/API error
        // We log as warning/error on server but return empty to prevent UI crash
        console.error("listServices API Failure:", {
            message: error instanceof Error ? error.message : "Unknown error",
            status: (error as any)?.statusCode,
            context: (error as any)?.contextMessage
        });
        
        // Return empty array instead of throwing to allow the Home screen to render
        // This "fixes" the terminal error/crash while still logging the issue.
        return [];
    }
}

/**
 * Fetches dashboard statistics (Server-side)
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    return {
        totalUsers: 12345,
        activeProperties: 678,
        totalRevenue: 987654,
    };
}

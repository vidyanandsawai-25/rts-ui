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
            return [];
        }

        return modules.map(m => mapModuleToService(m, locale));
    } catch (error) {
        console.error("Error in listServices action (falling back to mock data):", error);
        
        // Provide mock fallback data to ensure the UI remains functional during development
        // when the backend server might be unreachable.
        return [
            {
                id: 1,
                name: "Property Tax",
                title: "Property Tax",
                subtext: "Manage and pay your property taxes, view assessment history and print receipts.",
                icon: 'property-tax',
                link: `/${locale}/property-tax/ptis`,
                stats: [{ label: "Total", value: "125" }, { label: "Paid", value: "80" }, { label: "Pending", value: "45" }]
            },
            {
                id: 2,
                name: "Water Tax",
                title: "Water Tax",
                subtext: "Pay water bills, apply for new connections, and track your usage history.",
                icon: 'water-tax',
                link: `/${locale}/water-tax`,
                stats: [{ label: "Active", value: "42" }, { label: "Bills Due", value: "12" }]
            },
            {
                id: 3,
                name: "Bajar Parwana",
                title: "Trade License",
                subtext: "Apply for or renew trade licenses and certificates for commercial activities.",
                icon: 'bajar-parwana',
                link: `/${locale}/bajar-parwana`,
                stats: [{ label: "Valid", value: "15" }, { label: "Expiring", value: "2" }]
            }
        ];
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

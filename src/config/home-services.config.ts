/**
 * Home Services Configuration
 * Maps department names from API to icons and routes.
 */

import {
    Home,
    Droplet,
    ShoppingCart,
    FileText,
    Trash2,
    Building2,
    Megaphone,
    Timer,
    Landmark
} from "lucide-react";
import type { LucideIcon } from 'lucide-react';

/**
 * Department configuration for UI display
 */
interface DepartmentConfig {
    id?: number;
    code: string;
    route: string;
    icon: LucideIcon;
    iconClassName: string;
}

/**
 * Maps department names (lowercase) to UI config
 */
const DEPARTMENT_CONFIG: Record<string, DepartmentConfig> = {
    'property tax': {
        id: 1,
        code: 'pt',
        route: 'property-tax/search-property',
        icon: Home,
        iconClassName: 'w-8 h-8 text-gray-700',
    },
    'water tax': {
        id: 4,
        code: 'wt',
        route: 'water-tax',
        icon: Droplet,
        iconClassName: 'w-8 h-8 text-blue-500 fill-blue-500',
    },
    'trade license': {
        id: 2,
        code: 'tl',
        route: 'bajar-parwana',
        icon: ShoppingCart,
        iconClassName: 'w-8 h-8 text-orange-600',
    },
    'birth & death': {
        id: 5,
        code: 'bd',
        route: 'birth-death-certificates',
        icon: FileText,
        iconClassName: 'w-8 h-8 text-amber-700',
    },
    'garbage collection': {
        id: 6,
        code: 'gc',
        route: 'garbage-collection',
        icon: Trash2,
        iconClassName: 'w-8 h-8 text-green-700',
    },
    'building permission': {
        id: 7,
        code: 'bp',
        route: 'building-permission',
        icon: Building2,
        iconClassName: 'w-8 h-8 text-purple-700',
    },
    'grievance': {
        id: 8,
        code: 'gr',
        route: 'grievance',
        icon: Megaphone,
        iconClassName: 'w-8 h-8 text-red-600',
    },
    'rts': {
        id: 9,
        code: 'rts',
        route: 'rts',
        icon: Timer,
        iconClassName: 'w-8 h-8 text-indigo-600',
    },
    'asset management': {
        id: 3,
        code: 'am',
        route: 'assets',
        icon: Landmark,
        iconClassName: 'w-8 h-8 text-teal-700',
    },
};

/**
 * Default icon for unknown departments
 */
export const DEFAULT_SERVICE_ICON = { icon: Home, className: 'w-8 h-8 text-gray-700' };

/**
 * Get config by department ID or Name
 */
export function getDepartmentConfig(idOrName: number | string): DepartmentConfig | undefined {
    if (typeof idOrName === 'number') {
        const found = Object.values(DEPARTMENT_CONFIG).find(config => config.id === idOrName);
        if (found) return found;
    }
    
    const nameKey = String(idOrName).toLowerCase().trim();
    return DEPARTMENT_CONFIG[nameKey];
}

/**
 * Get route for a department
 */
export function getDepartmentRoute(idOrName: number | string, locale: string): string {
    const config = getDepartmentConfig(idOrName);
    return config ? `/${locale}/${config.route}` : '#';
}

/**
 * Get icon for a department
 */
export function getDepartmentIcon(idOrName: number | string): { icon: LucideIcon; className: string } {
    const config = getDepartmentConfig(idOrName);
    return config 
        ? { icon: config.icon, className: config.iconClassName }
        : DEFAULT_SERVICE_ICON;
}

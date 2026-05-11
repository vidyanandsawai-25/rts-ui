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
        code: 'pt',
        route: 'property-tax/ptis',
        icon: Home,
        iconClassName: 'w-8 h-8 text-gray-700',
    },
    'water tax': {
        code: 'wt',
        route: 'water-tax',
        icon: Droplet,
        iconClassName: 'w-8 h-8 text-blue-500 fill-blue-500',
    },
    'trade license': {
        code: 'tl',
        route: 'bajar-parwana',
        icon: ShoppingCart,
        iconClassName: 'w-8 h-8 text-orange-600',
    },
    'birth & death': {
        code: 'bd',
        route: 'birth-death-certificates',
        icon: FileText,
        iconClassName: 'w-8 h-8 text-amber-700',
    },
    'garbage collection': {
        code: 'gc',
        route: 'garbage-collection',
        icon: Trash2,
        iconClassName: 'w-8 h-8 text-green-700',
    },
    'building permission': {
        code: 'bp',
        route: 'building-permission',
        icon: Building2,
        iconClassName: 'w-8 h-8 text-purple-700',
    },
    'grievance': {
        code: 'gr',
        route: 'grievance',
        icon: Megaphone,
        iconClassName: 'w-8 h-8 text-red-600',
    },
    'rts': {
        code: 'rts',
        route: 'rts',
        icon: Timer,
        iconClassName: 'w-8 h-8 text-indigo-600',
    },
    'asset management': {
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
 * Get config by department name from API
 */
export function getDepartmentConfig(departmentName: string): DepartmentConfig | undefined {
    return DEPARTMENT_CONFIG[departmentName.toLowerCase().trim()];
}

/**
 * Get route for a department
 */
export function getDepartmentRoute(departmentName: string, locale: string): string {
    const config = getDepartmentConfig(departmentName);
    return config ? `/${locale}/${config.route}` : '#';
}

/**
 * Get icon for a department
 */
export function getDepartmentIcon(departmentName: string): { icon: LucideIcon; className: string } {
    const config = getDepartmentConfig(departmentName);
    return config 
        ? { icon: config.icon, className: config.iconClassName }
        : DEFAULT_SERVICE_ICON;
}

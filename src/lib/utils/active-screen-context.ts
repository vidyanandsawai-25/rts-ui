import { locales } from '@/i18n/config';
import type { UserScreenAccess } from '@/types/user-screen-access.types';

export interface ActiveScreenContext {
  departmentName: string;
  moduleName: string;
}

function normalizePath(path: string): string {
  const pathOnly = path.split(/[?#]/, 1)[0] ?? '';
  const segments = pathOnly.split('/').filter(Boolean);

  if (segments[0] && locales.includes(segments[0] as (typeof locales)[number])) {
    segments.shift();
  }

  return `/${segments.join('/')}`.toLowerCase().replace(/\/+$/, '') || '/';
}

/**
 * Resolves the department/module owning the current route from the same
 * user-screen access data that drives navigation and permissions.
 */
export function resolveActiveScreenContext(
  screens: UserScreenAccess[] | undefined,
  pathname: string
): ActiveScreenContext | null {
  if (!screens?.length) return null;

  const currentPath = normalizePath(pathname);
  const matchingScreen = screens
    .filter((screen) => {
      if (!screen.routePath) return false;
      const screenPath = normalizePath(screen.routePath);
      return currentPath === screenPath || currentPath.startsWith(`${screenPath}/`);
    })
    .sort(
      (first, second) =>
        normalizePath(second.routePath).length - normalizePath(first.routePath).length
    )[0];

  if (!matchingScreen) return null;

  const departmentName = matchingScreen.departmentName?.trim();
  const moduleName = matchingScreen.moduleName?.trim();
  if (!departmentName && !moduleName) return null;

  return {
    departmentName: departmentName || moduleName,
    moduleName: moduleName || departmentName,
  };
}

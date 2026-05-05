import type { UserScreenAccess } from '@/types/user-screen-access.types';
import type { MenuItem } from '@/types/menu.types';

/**
 * Converts UserScreenAccess[] to MenuItem[] for sidebar rendering.
 */
export function buildSidebarTreeFromUserScreens(screens: UserScreenAccess[]): MenuItem[] {
  // Only include menu items the user can view and are marked as menu
  const menuScreens = screens.filter(s => (s.isMenu === true || s.isMenu === 1) && s.canView && !s.haveNoAccess);

  // Group by module (if present)
  const modulesMap = new Map<number, MenuItem>();
  const standalone: MenuItem[] = [];

  for (const screen of menuScreens) {
    if (screen.moduleId && screen.moduleName) {
      if (!modulesMap.has(screen.moduleId)) {
        modulesMap.set(screen.moduleId, {
          name: screen.moduleName,
          nameHi: screen.moduleName, // No local name for module, fallback
          iconName: screen.screenIcon || 'LayoutGrid',
          href: '#',
          subItems: [],
        });
      }
      modulesMap.get(screen.moduleId)!.subItems!.push({
        name: screen.screenName,
        href: screen.routePath || '#',
      });
    } else {
      standalone.push({
        name: screen.screenName,
        nameHi: screen.screenNameLocal || screen.screenName,
        iconName: screen.screenIcon || 'LayoutGrid',
        href: screen.routePath || '#',
        subItems: [],
      });
    }
  }

  // Combine modules and standalone screens
  return [
    ...Array.from(modulesMap.values()),
    ...standalone,
  ];
}

import type { UserScreenAccess } from '@/types/user-screen-access.types';
import type { MenuItem } from '@/types/menu.types';

/**
 * Converts UserScreenAccess[] to MenuItem[] for sidebar rendering.
 */
export function buildSidebarTreeFromUserScreens(screens: UserScreenAccess[]): MenuItem[] {
  // Only include menu items the user can view and are marked as menu
  const menuScreens = screens.filter(s => (s.isMenu === true || s.isMenu === 1) && s.canView && !s.haveNoAccess);

  // Group by screenGroupName (if present)
  const groupsMap = new Map<string, MenuItem>();
  const standalone: MenuItem[] = [];

  for (const screen of menuScreens) {
    const groupName = screen.screenGroupName?.trim();
    
    if (groupName) {
      if (!groupsMap.has(groupName)) {
        groupsMap.set(groupName, {
          name: groupName,
          nameHi: groupName, // No local name for group, fallback
          iconName: screen.screenIcon || 'LayoutGrid',
          href: '#',
          subItems: [],
        });
      }
      groupsMap.get(groupName)!.subItems!.push({
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

  // Combine standalone screens first, then groups
  return [
    ...standalone,
    ...Array.from(groupsMap.values()),
  ];
}

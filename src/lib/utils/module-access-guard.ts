import type { ModuleMasterData } from '@/types/screen-access.types';
import type { UserScreenAccess } from '@/types/user-screen-access.types';
import { parseBoolean } from '@/lib/utils/type-guards';

export function getModuleMasterId(module: ModuleMasterData): number {
  return Number(module.moduleMasterId ?? module.moduleId ?? 0);
}

export function buildActiveModuleIdSet(modules: ModuleMasterData[]): Set<number> {
  const activeIds = new Set<number>();

  modules.forEach((module) => {
    const id = getModuleMasterId(module);
    if (id <= 0) return;

    const isActive =
      module.isActive === undefined || module.isActive === null
        ? true
        : parseBoolean(module.isActive);

    if (isActive) {
      activeIds.add(id);
    }
  });

  return activeIds;
}

/**
 * Applies ULB-level module activation to runtime screen access.
 * Role permissions are preserved in the database; inactive modules only
 * suspend effective access until the module is activated again.
 */
export function applyModuleActivationGate(
  screens: UserScreenAccess[],
  activeModuleIds: Set<number>
): UserScreenAccess[] {
  return screens.map((screen) => {
    const moduleId = Number(screen.moduleId ?? 0);
    if (moduleId <= 0 || activeModuleIds.has(moduleId)) {
      return screen;
    }

    return {
      ...screen,
      canView: false,
      canEdit: false,
      canDelete: false,
      haveFullAccess: false,
      haveNoAccess: true,
    };
  });
}

export function isModuleActive(
  moduleId: string | number | undefined,
  activeModuleIds: Set<number>
): boolean {
  const id = Number(moduleId ?? 0);
  if (id <= 0) return true;
  return activeModuleIds.has(id);
}

'use client';

import { useMemo } from 'react';
import { Database, LucideIcon } from 'lucide-react';
import {
  ScreenMasterData,
  DepartmentMasterData,
  ModuleMasterData,
} from '@/types/screen-access.types';

interface HierarchyContext {
  moduleLookup: Map<number, ModuleMasterData>;
  modulesByDept: Map<number, ModuleMasterData[]>;
  screensByModule: Map<number, ScreenMasterData[]>;
  screensByDeptGeneral: Map<number, ScreenMasterData[]>;
}

const prepareLookupMaps = (
  modules: ModuleMasterData[],
  screens: ScreenMasterData[]
): HierarchyContext => {
  const moduleLookup = new Map<number, ModuleMasterData>();
  const modulesByDept = new Map<number, ModuleMasterData[]>();
  const screensByModule = new Map<number, ScreenMasterData[]>();
  const screensByDeptGeneral = new Map<number, ScreenMasterData[]>();

  modules.forEach((mod) => {
    const canonicalModId =
      mod.moduleMasterId && mod.moduleMasterId > 0 ? mod.moduleMasterId : mod.moduleId;
    if (canonicalModId) moduleLookup.set(canonicalModId, mod);

    const canonicalDeptId =
      mod.departmentMasterId && mod.departmentMasterId > 0
        ? mod.departmentMasterId
        : mod.departmentId;
    if (canonicalDeptId) {
      const current = modulesByDept.get(canonicalDeptId) || [];
      current.push(mod);
      modulesByDept.set(canonicalDeptId, current);
    }
  });

  screens.forEach((screen) => {
    const parentModule = screen.moduleId ? moduleLookup.get(screen.moduleId) : null;
    if (parentModule) {
      const canonicalModId =
        parentModule.moduleMasterId && parentModule.moduleMasterId > 0
          ? parentModule.moduleMasterId
          : screen.moduleId!;
      const current = screensByModule.get(canonicalModId) || [];
      current.push(screen);
      screensByModule.set(canonicalModId, current);
    } else if (screen.departmentMasterId) {
      const current = screensByDeptGeneral.get(screen.departmentMasterId) || [];
      current.push(screen);
      screensByDeptGeneral.set(screen.departmentMasterId, current);
    }
  });

  return { moduleLookup, modulesByDept, screensByModule, screensByDeptGeneral };
};

export interface DisplayScreen {
  id: string;
  name: string;
}

export interface DisplayDomain {
  id: string;
  name: string;
  screens: DisplayScreen[];
  isModuleActive: boolean;
}

export interface DisplayDepartment {
  id: string;
  name: string;
  icon: LucideIcon;
  domains: DisplayDomain[];
}

interface UsePermissionHierarchyProps {
  screens: ScreenMasterData[];
  departments: DepartmentMasterData[];
  modules: ModuleMasterData[];
  t: (key: string) => string;
}

export function usePermissionHierarchy({
  screens,
  departments,
  modules,
  t,
}: UsePermissionHierarchyProps) {
  const hierarchy: DisplayDepartment[] = useMemo(() => {
    const validScreens = screens.filter((s) => s.screenMasterId);
    const assignedScreenIds = new Set<string>();

    const { modulesByDept, screensByModule, screensByDeptGeneral } = prepareLookupMaps(
      modules,
      validScreens
    );

    const deptHierarchy = departments
      .map((dept) => {
        const canonicalDeptId =
          dept.departmentMasterId && dept.departmentMasterId > 0
            ? dept.departmentMasterId
            : dept.departmentId;
        if (!canonicalDeptId) return null;

        const deptModules = modulesByDept.get(canonicalDeptId) || [];
        const domains: DisplayDomain[] = deptModules
          .map((mod) => {
            const canonicalModId =
              mod.moduleMasterId && mod.moduleMasterId > 0 ? mod.moduleMasterId : mod.moduleId;
            if (!canonicalModId) return null;

            const modScreens = screensByModule.get(canonicalModId) || [];
            modScreens.forEach((s) => assignedScreenIds.add(String(s.screenMasterId)));

            return {
              id: String(canonicalModId),
              name: mod.moduleName,
              isModuleActive: mod.isActive !== false,
              screens: modScreens.map((s) => ({
                id: String(s.screenMasterId),
                name: s.screenName,
              })),
            };
          })
          .filter((d): d is DisplayDomain => d !== null);

        const directScreens = screensByDeptGeneral.get(canonicalDeptId) || [];
        directScreens.forEach((s) => assignedScreenIds.add(String(s.screenMasterId)));

        if (directScreens.length > 0) {
          domains.push({
            id: `dept-${canonicalDeptId}-general`,
            name: t('accessControl.domains.general'),
            isModuleActive: true,
            screens: directScreens.map((s) => ({
              id: String(s.screenMasterId),
              name: s.screenName,
            })),
          });
        }

        return {
          id: String(canonicalDeptId),
          name: dept.departmentName,
          icon: Database,
          domains: domains.filter((d) => d.screens.length > 0),
        };
      })
      .filter((d): d is DisplayDepartment => d !== null);

    // Identify Orphans
    const orphanedScreens = validScreens.filter(
      (s) => !assignedScreenIds.has(String(s.screenMasterId))
    );

    if (orphanedScreens.length > 0) {
      deptHierarchy.push({
        id: 'system-unassigned',
        name: t('accessControl.filters.systemDepartment'),
        icon: Database,
        domains: [
          {
            id: 'system-general',
            name: t('accessControl.domains.general'),
            isModuleActive: true,
            screens: orphanedScreens.map((s) => ({
              id: String(s.screenMasterId),
              name: s.screenName,
            })),
          },
        ],
      });
    }

    return deptHierarchy.filter((d) => d.domains.length > 0);
  }, [departments, modules, screens, t]);

  return { hierarchy };
}

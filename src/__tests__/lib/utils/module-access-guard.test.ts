import { describe, it, expect } from 'vitest';
import {
  applyModuleActivationGate,
  buildActiveModuleIdSet,
  isModuleActive,
} from '@/lib/utils/module-access-guard';
import type { UserScreenAccess } from '@/types/user-screen-access.types';

const baseScreen: UserScreenAccess = {
  departmentId: 1,
  departmentName: 'Property Tax',
  moduleId: 10,
  moduleName: 'Property Tax Module',
  userId: 1,
  userRoleId: 1,
  screenCode: 'BANK_MASTER',
  screenName: 'Bank Master',
  screenNameLocal: '',
  screenIcon: 'bank',
  routePath: '/bank-master',
  isMenu: true,
  canView: true,
  canEdit: true,
  canDelete: false,
  haveFullAccess: false,
  haveNoAccess: false,
};

describe('module-access-guard', () => {
  it('buildActiveModuleIdSet includes only active modules', () => {
    const activeIds = buildActiveModuleIdSet([
      { moduleMasterId: 1, moduleName: 'Active', isActive: true },
      { moduleMasterId: 2, moduleName: 'Inactive', isActive: false },
    ]);

    expect(activeIds.has(1)).toBe(true);
    expect(activeIds.has(2)).toBe(false);
  });

  it('applyModuleActivationGate suspends access for inactive modules', () => {
    const activeIds = buildActiveModuleIdSet([
      { moduleMasterId: 10, moduleName: 'Active', isActive: true },
    ]);

    const [gated] = applyModuleActivationGate([baseScreen], activeIds);

    expect(gated.canView).toBe(true);
    expect(gated.haveNoAccess).toBe(false);

    const inactiveIds = buildActiveModuleIdSet([
      { moduleMasterId: 10, moduleName: 'Inactive', isActive: false },
    ]);
    const [blocked] = applyModuleActivationGate([baseScreen], inactiveIds);

    expect(blocked.canView).toBe(false);
    expect(blocked.canEdit).toBe(false);
    expect(blocked.haveFullAccess).toBe(false);
    expect(blocked.haveNoAccess).toBe(true);
  });

  it('isModuleActive treats missing module id as active', () => {
    const activeIds = new Set<number>([1]);
    expect(isModuleActive(undefined, activeIds)).toBe(true);
    expect(isModuleActive(1, activeIds)).toBe(true);
    expect(isModuleActive(2, activeIds)).toBe(false);
  });
});

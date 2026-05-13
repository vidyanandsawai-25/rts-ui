import { describe, it, expect, vi } from 'vitest';
import './test-setup';
import { render, screen } from '@testing-library/react';
import { revalidatePath } from 'next/cache';

import { createConfigCategoryAction } from '@/app/[locale]/configuration-settings/config-master/actions/category';
import { createConfigKeyAction } from '@/app/[locale]/configuration-settings/config-master/actions/key';
import { createConfigValueAction } from '@/app/[locale]/configuration-settings/config-master/actions/value';
import { ConfigurationMaster } from '@/components/modules/configuration-settings/config-master/ConfigurationMaster';
import { configMasterService } from '@/lib/api/configMaster.service';
import { moduleMasterService } from '@/lib/api/moduleMaster.service';
import * as departmentMasterService from '@/lib/api/configuration-settings/department-master/departmentMaster.service';
import { mockVerifySession } from './test-setup';
import type { ConfigCategory, ConfigItem } from '@/types/configMaster.types';

vi.mock('@/components/modules/configuration-settings/config-master/ConfigurationMasterHeader', () => ({
  ConfigurationMasterHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock('@/components/modules/configuration-settings/config-master/ConfigurationMasterContent', () => ({
  ConfigurationMasterContent: ({
    displayItems,
  }: {
    displayItems: ConfigItem[];
  }) => <div>{`items:${displayItems.length}`}</div>,
}));

vi.mock('@/components/modules/configuration-settings/config-master/ConfigModalsController', () => ({
  ConfigModalsController: () => null,
}));

vi.mock('@/lib/api/configMaster.service', () => ({
  configMasterService: {
    createConfigCategory: vi.fn(),
    createConfigKey: vi.fn(),
    createConfigValue: vi.fn(),
    getAllConfigValuesFull: vi.fn(),
    getAllCategories: vi.fn(),
    getItemsByCategory: vi.fn(),
  }
}));

vi.mock('@/lib/api/moduleMaster.service', () => ({
  moduleMasterService: { getModuleMasters: vi.fn() }
}));

vi.mock('@/lib/api/configuration-settings/department-master/departmentMaster.service', () => ({
  getAllDepartmentMasters: vi.fn(),
  getDepartmentMasters: vi.fn(),
  getDepartmentMastersPaged: vi.fn(),
}));

describe('Configuration Master PR Smoke Tests', () => {
  it('creates category action successfully', async () => {
    mockVerifySession.mockResolvedValue(1);
    vi.mocked(configMasterService.createConfigCategory).mockResolvedValue({ success: true });
    const fd = new FormData();
    fd.append('categoryCode', 'SYS');
    fd.append('categoryName', 'System');
    fd.append('displayOrder', '1');
    fd.append('isActive', 'true');

    const res = await createConfigCategoryAction(fd);
    expect(res.success).toBe(true);
    expect(revalidatePath).toHaveBeenCalled();
  });

  it('creates config key action successfully', async () => {
    mockVerifySession.mockResolvedValue(1);
    vi.mocked(configMasterService.createConfigKey).mockResolvedValue({ success: true });
    const fd = new FormData();
    fd.append('categoryId', '1');
    fd.append('configCode', 'CFG_A');
    fd.append('configName', 'Config A');
    fd.append('description', 'Desc');
    fd.append('dataType', 'string');
    fd.append('controlType', 'text');
    fd.append('defaultValue', 'x');
    fd.append('isActive', 'true');

    const res = await createConfigKeyAction(fd);
    expect(res.success).toBe(true);
  });

  it('creates config value action successfully', async () => {
    mockVerifySession.mockResolvedValue(1);
    vi.mocked(configMasterService.createConfigValue).mockResolvedValue({ success: true });
    const fd = new FormData();
    fd.append('configKeyId', '1');
    fd.append('departmentId', '');
    fd.append('moduleId', '');
    fd.append('value', 'on');
    fd.append('isEnabled', 'true');

    const res = await createConfigValueAction(fd);
    expect(res.success).toBe(true);
  });

  it('renders ConfigurationMaster server component', async () => {
    const categories: ConfigCategory[] = [{
      id: '1',
      code: 'SYS',
      name: 'System',
      displayOrder: 1,
      isActive: true,
      color: 'rose',
      icon: 'Shield',
      count: 1,
      total: 1,
    }];
    const items: ConfigItem[] = [{
      id: '1',
      configKeyId: 1,
      configValueId: 0,
      categoryId: 1,
      name: 'A',
      configCode: 'A',
      description: '',
      value: '',
      defaultValue: '',
      isEnabled: true,
      category: '1',
      type: 'text',
      controlType: 'text',
      dataType: 'string',
      stats: { deptOverrides: 0, userOverrides: 0, totalDepts: 0, totalUsers: 0 },
      hasTag: false,
    }];

    const ui = await ConfigurationMaster({
      categories,
      initialItems: items,
      departmentData: null,
      categoryId: '1',
      search: '',
      locale: 'en',
      role: null,
    });
    render(ui);
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('items:1')).toBeInTheDocument();
  });

  it('service mocks are callable', async () => {
    vi.mocked(moduleMasterService.getModuleMasters).mockResolvedValue({ success: true, data: [] });
    vi.mocked(departmentMasterService.getAllDepartmentMasters).mockResolvedValue({ success: true, data: [] });
    expect((await moduleMasterService.getModuleMasters()).success).toBe(true);
    expect((await departmentMasterService.getAllDepartmentMasters()).success).toBe(true);
  });
});

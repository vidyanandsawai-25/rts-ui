import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDepartmentConfig } from '@/hooks/useDepartmentConfig';

const saveAction = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('next-intl', () => ({ useTranslations: () => (k: string) => k }));
vi.mock('@/components/common', () => ({ useToast: () => ({ success: toastSuccess, error: toastError }) }));
vi.mock('@/app/[locale]/configuration-settings/config-master/actions', () => ({
  saveDepartmentConfigurationAction: (...args: unknown[]) => saveAction(...args),
}));

const initial = [
  {
    id: 1,
    name: 'Dept',
    code: 'D1',
    isEnabled: false,
    value: '',
    configValueId: 0,
    submoduleCount: 1,
    submodules: [{ id: 2, title: 'Sub', code: 'S', desc: '', isEnabled: false, value: '', configValueId: 0 }],
  },
] as never;

describe('useDepartmentConfig', () => {
  beforeEach(() => vi.clearAllMocks());

  it('toggles department and submodule', () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useDepartmentConfig(initial, 1, onSuccess, 'DEF'));

    act(() => {
      result.current.handleToggleDept(1);
      result.current.handleToggleSubmodule(1, 2);
    });

    expect(result.current.departments[0].isEnabled).toBe(true);
    expect(result.current.departments[0].submodules[0].isEnabled).toBe(true);
  });

  it('saves updates successfully', async () => {
    const onSuccess = vi.fn();
    saveAction.mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDepartmentConfig(initial, 1, onSuccess, 'DEF'));

    act(() => result.current.handleToggleDept(1));

    await act(async () => {
      await result.current.handleSaveAll();
    });

    expect(saveAction).toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('handles save failure', async () => {
    const onSuccess = vi.fn();
    saveAction.mockResolvedValue({ success: false, error: 'bad' });
    const { result } = renderHook(() => useDepartmentConfig(initial, 1, onSuccess, 'DEF'));

    act(() => result.current.handleToggleDept(1));

    await act(async () => {
      await result.current.handleSaveAll();
    });

    expect(toastError).toHaveBeenCalled();
  });
});

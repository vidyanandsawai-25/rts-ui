import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useModuleForm } from '@/hooks/configuration-settings/module-master/useModuleForm';
import * as actions from '@/app/[locale]/configuration-settings/module-master/actions';
import { toast } from 'sonner';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => '/en/configuration-settings/module-master',
  useSearchParams: () => new URLSearchParams(''),
}));

vi.mock('@/app/[locale]/configuration-settings/module-master/actions', () => ({
  createModuleMasterAction: vi.fn(),
  updateModuleMasterAction: vi.fn(),
  getModuleMastersSummaryAction: vi.fn(),
}));

describe('useModuleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(actions.createModuleMasterAction).mockReset();
    vi.mocked(actions.updateModuleMasterAction).mockReset();
    vi.mocked(actions.getModuleMastersSummaryAction).mockReset();
    vi.mocked(actions.createModuleMasterAction).mockResolvedValue({ success: true });
    vi.mocked(actions.updateModuleMasterAction).mockResolvedValue({ success: true });
    vi.mocked(actions.getModuleMastersSummaryAction).mockResolvedValue({ success: true, data: [] });
    mockPush.mockReset();
    mockRefresh.mockReset();
    vi.mocked(toast.success).mockReset();
    vi.mocked(toast.error).mockReset();
  });

  it('submits successfully for creation when fields are valid', async () => {
    const { result } = renderHook(() => useModuleForm({ id: null }));

    act(() => {
      const eChange = {
        target: { name: 'moduleCode', value: 'MOD001' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(eChange);

      const eChangeName = {
        target: { name: 'moduleName', value: 'Billing' },
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(eChangeName);

      const eSelect = {} as React.ChangeEvent<HTMLSelectElement>;
      result.current.handleSelectChange(eSelect, '5');
    });

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(actions.createModuleMasterAction).toHaveBeenCalledWith({
      departmentId: 5,
      moduleCode: 'MOD001',
      moduleName: 'Billing',
      moduleNameLocal: '',
      moduleIcon: '',
      moduleLabel: '',
      moduleDescription: '',
      isActive: true,
    });
    expect(toast.success).toHaveBeenCalledWith('messages.createSuccess');
  });

  it('prevents submission and alerts error when inputs are invalid', async () => {
    const { result } = renderHook(() => useModuleForm({ id: null }));

    const mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(actions.createModuleMasterAction).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('messages.validationError');
  });

  it('triggers router push when canceled', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useModuleForm({ id: null }));

    act(() => {
      result.current.handleCancel();
    });

    expect(result.current.open).toBe(false);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/configuration-settings/module-master')
    );
    vi.useRealTimers();
  });
});

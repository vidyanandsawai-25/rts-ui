/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFloorFormApi } from '@/hooks/ptis/QuickDataEntry/Olddetails/useFloorFormApi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { 
  saveOldFloorDetailsAction, 
  updateOldFloorDetailsAction,
  deleteOldFloorDetailsAction 
} from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/floor-information/action';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    refresh: vi.fn(),
  })),
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/OldDetails/floor-information/action', () => ({
  saveOldFloorDetailsAction: vi.fn(),
  updateOldFloorDetailsAction: vi.fn(),
  deleteOldFloorDetailsAction: vi.fn(),
}));

vi.mock('@/components/common', () => ({
  useConfirm: vi.fn(() => ({
    confirm: vi.fn(({ onConfirm }) => onConfirm()),
  })),
}));

describe('useFloorFormApi', () => {
  const mockRefresh = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ refresh: mockRefresh } as unknown as ReturnType<typeof useRouter>);
  });

  it('should call saveOldFloorDetailsAction when no ID is provided', async () => {
    (saveOldFloorDetailsAction as any).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFloorFormApi(123, 'en'));

    await act(async () => {
      await result.current.handleSave({ oldFloorId: '1' } as any, mockOnSuccess);
    });

    expect(saveOldFloorDetailsAction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should call updateOldFloorDetailsAction when ID is provided', async () => {
    (updateOldFloorDetailsAction as any).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFloorFormApi(123, 'en'));

    await act(async () => {
      await result.current.handleSave({ id: 1, oldFloorId: '1' } as any, mockOnSuccess);
    });

    expect(updateOldFloorDetailsAction).toHaveBeenCalled();
  });

  it('should call deleteOldFloorDetailsAction', async () => {
    (deleteOldFloorDetailsAction as any).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useFloorFormApi(123, 'en'));

    await act(async () => {
      await result.current.handleDelete(1);
    });

    expect(deleteOldFloorDetailsAction).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });
});

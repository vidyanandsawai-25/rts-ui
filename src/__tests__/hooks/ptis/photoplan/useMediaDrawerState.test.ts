import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaDrawerState } from '@/hooks/ptis/photoplan/useMediaDrawerState';

const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  useSearchParams: () => new URLSearchParams('drawer=photo-plan&photoCategoryIndex=1'),
  usePathname: () => '/en/property-tax/ptis',
}));

describe('useMediaDrawerState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('syncs isDrawerOpen and drawerInitialCategoryIndex from URL searchParams', () => {
    const { result } = renderHook(() => useMediaDrawerState());

    expect(result.current.isDrawerOpen).toBe(true);
    expect(result.current.drawerInitialCategoryIndex).toBe(1);
  });

  it('replaces updated URL when openDrawer is called', () => {
    const { result } = renderHook(() => useMediaDrawerState());

    act(() => {
      result.current.openDrawer(2);
    });

    expect(mockReplace).toHaveBeenCalled();
  });
});

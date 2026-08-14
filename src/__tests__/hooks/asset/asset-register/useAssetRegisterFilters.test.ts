import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryTransition } from '@/hooks/useQueryTransition';
import { useAssetRegisterFilters } from '@/hooks/asset/asset-register/useAssetRegisterFilters';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: vi.fn(),
}));

vi.mock('@/hooks/useQueryTransition', () => ({
  useQueryTransition: vi.fn(),
}));

describe('useAssetRegisterFilters', () => {
  const push = vi.fn();
  const updateQueries = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push } as never);
    vi.mocked(usePathname).mockReturnValue('/en/assets/municipal-Asset/asset-register/15');
    vi.mocked(useSearchParams).mockReturnValue({
      toString: () => 'AssetTypeId=4&page=3&foo=bar',
    } as never);
    vi.mocked(useDebounce).mockImplementation((value) => value);
    vi.mocked(useQueryTransition).mockReturnValue({ updateQueries } as never);
  });

  it('normalizes invalid search field to all', () => {
    const { result } = renderHook(() =>
      useAssetRegisterFilters({
        search: '',
        searchField: 'invalid-field',
        assetNo: '',
      })
    );

    expect(result.current.searchField).toBe('all');
  });

  it('sanitizes search input and updates search query', async () => {
    const { result } = renderHook(() =>
      useAssetRegisterFilters({
        search: '',
        searchField: 'all',
        assetNo: '',
      })
    );

    act(() => {
      result.current.handleSearchChange('abc   -   def');
    });

    expect(result.current.searchValue).toBe('abc-def');

    await waitFor(() => {
      expect(updateQueries).toHaveBeenCalledWith({ search: 'abc-def', page: '1' });
    });
  });

  it('updates query for search field and category route change', () => {
    const { result } = renderHook(() =>
      useAssetRegisterFilters({
        search: '',
        searchField: 'assetName',
        assetNo: '',
      })
    );

    act(() => {
      result.current.handleSearchFieldChange('all');
    });

    expect(updateQueries).toHaveBeenCalledWith({ searchField: null, page: '1' });

    act(() => {
      result.current.handleAssetCategoryChange('22');
    });

    expect(push).toHaveBeenCalledWith('/en/assets/municipal-Asset/asset-register/22?foo=bar', { scroll: false });
  });

  it('clears advanced filters when panel is closed', () => {
    const { result } = renderHook(() =>
      useAssetRegisterFilters({
        search: '',
        searchField: 'all',
        assetNo: 'AX-1',
      })
    );

    act(() => {
      result.current.handleFiltersPanelToggle();
    });

    expect(result.current.showFiltersPanel).toBe(true);

    act(() => {
      result.current.handleFiltersPanelToggle();
    });

    expect(result.current.showFiltersPanel).toBe(false);
    expect(result.current.assetNoSearch).toBe('');
    expect(updateQueries).toHaveBeenCalledWith({ ZoneId: null, WardId: null, AssetNo: null, page: '1' });
  });
});

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AssetRegisterRow } from '@/types/asset/asset-register/municipal-asset-register.types';
import { useAssetPhotoPanel, useAssetSubunitExpansion } from '@/hooks/asset/asset-register/useAssetRegisterInteractions';
import { fetchGroupedAssetPhotosAction, fetchSubUnitsByAsset } from '@/app/[locale]/assets/municipal-Asset/asset-register/[categoryId]/action';
import { mapExpandedSubUnitItems, mapGroupedAssetPhotosToPanelPhotos } from '@/components/modules/assets/municipal-Asset/asset-register/registerMappers';

vi.mock('@/app/[locale]/assets/municipal-Asset/asset-register/[categoryId]/action', () => ({
  fetchGroupedAssetPhotosAction: vi.fn(),
  fetchSubUnitsByAsset: vi.fn(),
}));

vi.mock('@/components/modules/assets/municipal-Asset/asset-register/registerMappers', () => ({
  mapExpandedSubUnitItems: vi.fn(),
  mapGroupedAssetPhotosToPanelPhotos: vi.fn(),
}));

describe('useAssetRegisterInteractions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads photos and opens panel when hidden', async () => {
    const togglePanel = vi.fn();
    vi.mocked(fetchGroupedAssetPhotosAction).mockResolvedValue({ success: true, data: {} } as never);
    vi.mocked(mapGroupedAssetPhotosToPanelPhotos).mockReturnValue([
      {
        propertyPhotoId: 1,
        propertyId: 99,
        photoTypeId: 2,
        photoTypeCode: 'FRONT',
        photoTypeName: 'Front',
      },
    ]);

    const { result } = renderHook(() =>
      useAssetPhotoPanel({
        isPanelVisible: false,
        togglePanel,
      })
    );

    await act(async () => {
      await result.current.openImagePanelByAssetId(99);
    });

    expect(togglePanel).toHaveBeenCalledTimes(1);
    expect(fetchGroupedAssetPhotosAction).toHaveBeenCalledWith(99);
    expect(result.current.panelPhotos).toHaveLength(1);
    expect(result.current.isPhotosLoading).toBe(false);
  });

  it('clears photos when panel is toggled closed', async () => {
    const togglePanel = vi.fn();
    const onClosed = vi.fn();

    vi.mocked(fetchGroupedAssetPhotosAction).mockResolvedValue({ success: true, data: {} } as never);
    vi.mocked(mapGroupedAssetPhotosToPanelPhotos).mockReturnValue([
      {
        propertyPhotoId: 2,
        propertyId: 77,
        photoTypeId: 3,
        photoTypeCode: 'SIDE',
        photoTypeName: 'Side',
      },
    ]);

    const { result } = renderHook(() =>
      useAssetPhotoPanel({
        isPanelVisible: true,
        togglePanel,
      })
    );

    await act(async () => {
      await result.current.openImagePanelByAssetId(77);
    });

    act(() => {
      result.current.handlePanelToggle(onClosed);
    });

    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(togglePanel).toHaveBeenCalledTimes(1);
    expect(result.current.panelPhotos).toEqual([]);
  });

  it('expands and collapses subunit rows with query callback', async () => {
    const row = { id: 10 } as AssetRegisterRow;
    const onToggleQuery = vi.fn();

    vi.mocked(fetchSubUnitsByAsset).mockResolvedValue({ success: true, items: [{ id: 1 }] } as never);
    vi.mocked(mapExpandedSubUnitItems).mockReturnValue([{ id: 1, isSubUnit: true, parentId: 10 }] as never);

    const { result } = renderHook(() => useAssetSubunitExpansion());

    await act(async () => {
      await result.current.handleToggleExpand(row, onToggleQuery);
    });

    expect(onToggleQuery).toHaveBeenCalledWith(10);
    expect(fetchSubUnitsByAsset).toHaveBeenCalledWith(10);
    expect(result.current.openSubunitRows[10]).toBe(true);
    expect(result.current.loadingSubunits[10]).toBe(false);

    await act(async () => {
      await result.current.handleToggleExpand(row, onToggleQuery);
    });

    expect(onToggleQuery).toHaveBeenLastCalledWith(null);
    expect(result.current.openSubunitRows[10]).toBe(false);
    expect(fetchSubUnitsByAsset).toHaveBeenCalledTimes(1);

    // Open it again to verify that caching is disabled and it calls the API again
    await act(async () => {
      await result.current.handleToggleExpand(row, onToggleQuery);
    });

    expect(onToggleQuery).toHaveBeenLastCalledWith(10);
    expect(result.current.openSubunitRows[10]).toBe(true);
    expect(fetchSubUnitsByAsset).toHaveBeenCalledTimes(2);
  });
});

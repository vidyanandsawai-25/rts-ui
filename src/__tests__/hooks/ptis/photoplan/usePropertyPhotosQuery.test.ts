import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  usePropertyPhotosQuery,
  propertyMediaCache,
  isCacheValid,
  evictOldestCacheEntry,
  areSlotsEqual,
  arePhotosEqual,
} from '@/hooks/ptis/photoplan/usePropertyPhotosQuery';
import * as mediaFetchActions from '@/app/[locale]/property-tax/ptis/media-fetch.action';

vi.mock('@/app/[locale]/property-tax/ptis/media-fetch.action', () => ({
  getPhotoSlotsAction: vi.fn(),
  getPropertyPhotosAction: vi.fn(),
}));

describe('usePropertyPhotosQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    propertyMediaCache.clear();
  });

  it('manages property media caching and LRU eviction', () => {
    expect(isCacheValid(99)).toBe(false);

    propertyMediaCache.set(99, {
      photoSlots: [],
      photos: [],
      timestamp: Date.now(),
    });

    expect(isCacheValid(99)).toBe(true);

    for (let i = 1; i <= 12; i++) {
      propertyMediaCache.set(i, { photoSlots: [], photos: [], timestamp: Date.now() + i });
    }

    evictOldestCacheEntry();
    expect(propertyMediaCache.size).toBe(12);
  });

  it('compares slots and photos equality helpers correctly', () => {
    const slotsA = [{ photoTypeId: 1, photoTypeCode: 'P', photoTypeName: 'Prop', hasPhoto: true, photoCount: 1, propertyPhotoId: 10, viewUrl: '/url' }];
    const slotsB = [{ photoTypeId: 1, photoTypeCode: 'P', photoTypeName: 'Prop', hasPhoto: true, photoCount: 1, propertyPhotoId: 10, viewUrl: '/url' }];
    const photosA = [{ propertyPhotoId: 1, propertyId: 42, photoTypeId: 1, photoTypeCode: 'P', photoTypeName: 'Prop', viewUrl: '/v', downloadUrl: '/d', documentGuid: 'g1', displayOrder: 1, remarks: 'r', fileName: 'f.png', mimeType: 'image/png' }];

    expect(areSlotsEqual(slotsA, slotsB)).toBe(true);
    expect(arePhotosEqual(photosA, photosA)).toBe(true);
  });

  it('supports refetching photo slots and photos manually', async () => {
    vi.mocked(mediaFetchActions.getPhotoSlotsAction).mockResolvedValue({
      success: true,
      data: [{ photoTypeId: 1, photoTypeCode: 'PROP', photoTypeName: 'Property Photo', hasPhoto: true, photoCount: 1 }],
    } as unknown as Awaited<ReturnType<typeof mediaFetchActions.getPhotoSlotsAction>>);

    vi.mocked(mediaFetchActions.getPropertyPhotosAction).mockResolvedValue({
      success: true,
      data: [{ propertyPhotoId: 101, photoTypeId: 1, documentGuid: 'guid-101' }],
    } as unknown as Awaited<ReturnType<typeof mediaFetchActions.getPropertyPhotosAction>>);

    const { result } = renderHook(() => usePropertyPhotosQuery(42, false, false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mediaFetchActions.getPhotoSlotsAction).toHaveBeenCalledWith(42);
    expect(mediaFetchActions.getPropertyPhotosAction).toHaveBeenCalledWith(42);
    expect(result.current.photoSlots).toHaveLength(1);
    expect(result.current.photos).toHaveLength(1);
  });
});

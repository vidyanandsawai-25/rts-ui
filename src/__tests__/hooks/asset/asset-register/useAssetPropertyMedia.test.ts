import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePropertyMedia } from '@/hooks/asset/asset-register/useAssetPropertyMedia';
import type { PropertyPhotoDto } from '@/types/asset/asset-register/media.types';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// ──────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────
const ASSET_PHOTO: PropertyPhotoDto = {
  propertyPhotoId: 1,
  propertyId: 101,
  photoTypeId: 10,
  photoTypeCode: 'ASSET_PHOTO',
  photoTypeName: 'Asset Photo',
  displayOrder: 1,
  documentGuid: 'guid-asset-001',
  viewUrl: undefined,
};

const PHOTO_PLAN: PropertyPhotoDto = {
  propertyPhotoId: 2,
  propertyId: 101,
  photoTypeId: 11,
  photoTypeCode: 'PHOTO_PLAN',
  photoTypeName: 'Photo Plan',
  displayOrder: 2,
  documentGuid: undefined,
  viewUrl: '/view/photo-plan-001',
};


describe('useAssetPropertyMedia', () => {
  it('returns null for propertyPhoto when no photos provided', () => {
    const { result } = renderHook(() => usePropertyMedia({ initialPhotos: [] }));
    expect(result.current.propertyPhoto).toBeNull();
  });

  it('returns null for photoPlanPhoto when no photos provided', () => {
    const { result } = renderHook(() => usePropertyMedia({ initialPhotos: [] }));
    expect(result.current.photoPlanPhoto).toBeNull();
  });

  it('identifies ASSET_PHOTO by photoTypeCode', () => {
    const { result } = renderHook(() =>
      usePropertyMedia({ initialPhotos: [ASSET_PHOTO] })
    );
    expect(result.current.propertyPhoto).not.toBeNull();
    expect(result.current.propertyPhoto?.src).toContain('guid-asset-001');
  });

  it('identifies PHOTO_PLAN by photoTypeCode', () => {
    const { result } = renderHook(() =>
      usePropertyMedia({ initialPhotos: [PHOTO_PLAN] })
    );
    expect(result.current.photoPlanPhoto).not.toBeNull();
    expect(result.current.photoPlanPhoto?.src).toBe('/view/photo-plan-001');
  });

  it('prefers documentGuid url over viewUrl for asset photo', () => {
    const { result } = renderHook(() =>
      usePropertyMedia({ initialPhotos: [ASSET_PHOTO] })
    );
    // documentGuid should produce a resolved URL via getViewDocumentUrl
    expect(result.current.propertyPhoto?.src).toContain('guid-asset-001');
  });

  it('falls back to viewUrl when no documentGuid on photo plan', () => {
    const { result } = renderHook(() =>
      usePropertyMedia({ initialPhotos: [PHOTO_PLAN] })
    );
    expect(result.current.photoPlanPhoto?.src).toBe('/view/photo-plan-001');
  });

  it('returns default empty initialPhotos when none provided', () => {
    const { result } = renderHook(() => usePropertyMedia({}));
    expect(result.current.propertyPhoto).toBeNull();
    expect(result.current.photoPlanPhoto).toBeNull();
  });

  it('exposes handleImageHover, handleImageLeave, cancelImageLeave as functions', () => {
    const { result } = renderHook(() => usePropertyMedia({ initialPhotos: [] }));
    expect(typeof result.current.handleImageHover).toBe('function');
    expect(typeof result.current.handleImageLeave).toBe('function');
    expect(typeof result.current.cancelImageLeave).toBe('function');
  });

  it('hoverPreview starts as null', () => {
    const { result } = renderHook(() => usePropertyMedia({ initialPhotos: [] }));
    expect(result.current.hoverPreview).toBeNull();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}));

import { renderHook, act } from '@testing-library/react';
import { usePropertyMedia } from '@/hooks/ptis/photoplan/usePropertyMedia';

describe('usePropertyMedia', () => {
  const mockInitialSlots = [
    {
      photoTypeId: 1,
      photoTypeCode: 'PROPERTY_PHOTO',
      photoTypeName: 'Property Photo',
      hasPhoto: true,
      photoCount: 1,
      viewUrl: '/documents/1/view',
    },
    {
      photoTypeId: 2,
      photoTypeCode: 'PHOTO_PLAN',
      photoTypeName: 'Photo Plan',
      hasPhoto: false,
      photoCount: 0,
    },
  ];

  const mockInitialPhotos = [
    {
      propertyPhotoId: 101,
      propertyId: 42,
      photoTypeId: 1,
      photoTypeCode: 'PROPERTY_PHOTO',
      photoTypeName: 'Property Photo',
      viewUrl: '/documents/1/view',
      downloadUrl: '/documents/1/download',
      documentGuid: 'guid-101',
      displayOrder: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with mapped categories based on initial slots and photos', () => {
    const { result } = renderHook(() =>
      usePropertyMedia({
        initialPhotoSlots: mockInitialSlots,
        initialPhotos: mockInitialPhotos,
        propertyId: 42,
      })
    );

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.categories).toBeDefined();
    expect(result.current.showMoreImages).toBe(false);
  });

  it('updates photos list on handleCategoriesChange call', () => {
    const onPhotosChange = vi.fn();
    const onPhotoSlotsChange = vi.fn();

    const { result } = renderHook(() =>
      usePropertyMedia({
        initialPhotoSlots: mockInitialSlots,
        initialPhotos: mockInitialPhotos,
        propertyId: 42,
        onPhotosChange,
        onPhotoSlotsChange,
      })
    );

    const updatedCategories = [
      {
        photoTypeId: 1,
        photoTypeCode: 'PROPERTY_PHOTO',
        photoTypeName: 'Property Photo',
        photoCount: 1,
        images: [
          {
            src: '/documents/1/view',
            title: 'Updated Photo 1',
            propertyPhotoId: 101,
            photoTypeId: 1,
            photoTypeCode: 'PROPERTY_PHOTO',
            hasPhoto: true,
            displayOrder: 1,
          },
        ],
      },
    ];

    act(() => {
      result.current.handleCategoriesChange(
        updatedCategories as unknown as Parameters<typeof result.current.handleCategoriesChange>[0]
      );
    });

    expect(onPhotosChange).toHaveBeenCalled();
    expect(onPhotoSlotsChange).toHaveBeenCalled();
  });

  it('excludes PHOTO_PLAN category when isMainProperty is true', () => {
    const { result } = renderHook(() =>
      usePropertyMedia({
        initialPhotoSlots: mockInitialSlots,
        initialPhotos: mockInitialPhotos,
        propertyId: 42,
        isMainProperty: true,
      })
    );

    const hasPhotoPlan = result.current.categories.some(
      (c) => c.photoTypeCode?.toUpperCase() === 'PHOTO_PLAN' || c.photoTypeName?.toLowerCase().includes('photo plan')
    );
    expect(hasPhotoPlan).toBe(false);
    expect(result.current.photoPlanCategory).toBeUndefined();
  });

  it('includes PHOTO_PLAN category when isMainProperty is false', () => {
    const { result } = renderHook(() =>
      usePropertyMedia({
        initialPhotoSlots: mockInitialSlots,
        initialPhotos: mockInitialPhotos,
        propertyId: 42,
        isMainProperty: false,
      })
    );

    const hasPhotoPlan = result.current.categories.some(
      (c) => c.photoTypeCode?.toUpperCase() === 'PHOTO_PLAN' || c.photoTypeName?.toLowerCase().includes('photo plan')
    );
    expect(hasPhotoPlan).toBe(true);
    expect(result.current.photoPlanCategory).toBeDefined();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePhotoPlanMutations } from '@/hooks/ptis/photoplan/usePhotoPlanMutations';
import * as photoPlanActions from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.has = () => true;
    return t;
  },
  useLocale: () => 'en',
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/app/[locale]/property-tax/ptis/PhotoPlan.action', () => ({
  uploadPropertyPhotoAction: vi.fn(),
  replacePropertyPhotoAction: vi.fn(),
  deletePropertyPhotoAction: vi.fn(),
}));

describe('usePhotoPlanMutations', () => {
  const mockCategories = [
    {
      photoTypeId: 1,
      photoTypeCode: 'PROPERTY_PHOTO',
      photoTypeName: 'Property Photo',
      photoCount: 1,
      images: [
        {
          src: '/documents/guid-101/view',
          fullSrc: '/documents/guid-101/view',
          alt: 'Property Photo',
          title: 'Property Photo',
          propertyPhotoId: 101,
          photoTypeId: 1,
          photoTypeCode: 'PROPERTY_PHOTO',
          documentGuid: 'guid-101',
        },
      ],
    },
  ];

  const defaultProps = {
    propertyId: 42,
    categories: mockCategories,
    onCategoriesChange: vi.fn(),
    selectedCategoryIndex: 0,
    selectedImageIndex: 0,
    setSelectedImageIndex: vi.fn(),
    viewMode: 'viewer' as const,
    setViewMode: vi.fn(),
    setViewerIndexAndMode: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes default state and opens naming modal on handleAddPhoto', () => {
    const { result } = renderHook(() => usePhotoPlanMutations(defaultProps));

    expect(result.current.isNamingOpen).toBe(false);
    expect(result.current.isUploading).toBe(false);

    act(() => {
      result.current.handleAddPhoto();
    });

    expect(result.current.isNamingOpen).toBe(true);
    expect(result.current.isReplacement).toBe(false);
  });

  it('opens naming modal for replace mode on handleReplacePhoto', () => {
    const { result } = renderHook(() => usePhotoPlanMutations(defaultProps));

    act(() => {
      result.current.handleReplacePhoto(0);
    });

    expect(result.current.isNamingOpen).toBe(true);
    expect(result.current.isReplacement).toBe(true);
    expect(result.current.replaceImage?.propertyPhotoId).toBe(101);
  });

  it('handles photo upload submission via handleNamingSubmit', async () => {
    vi.mocked(photoPlanActions.uploadPropertyPhotoAction).mockResolvedValueOnce({
      success: true,
      data: { propertyPhotoId: 202, documentGuid: 'new-guid-202', viewUrl: '/view/202' },
    } as unknown as Awaited<ReturnType<typeof photoPlanActions.uploadPropertyPhotoAction>>);

    const onCategoriesChange = vi.fn();
    const { result } = renderHook(() =>
      usePhotoPlanMutations({ ...defaultProps, onCategoriesChange })
    );

    const validFile = new File(['dummy content'], 'new_photo.jpg', { type: 'image/jpeg' });

    await act(async () => {
      await result.current.handleNamingSubmit(
        'Property Photo',
        1,
        1,
        validFile,
        'Remarks sample'
      );
    });

    expect(photoPlanActions.uploadPropertyPhotoAction).toHaveBeenCalled();
    expect(onCategoriesChange).toHaveBeenCalled();
    expect(result.current.isNamingOpen).toBe(false);
  });

  it('handles photo replacement via handleSaveEditedPhoto', async () => {
    vi.mocked(photoPlanActions.replacePropertyPhotoAction).mockResolvedValueOnce({
      success: true,
      data: { propertyPhotoId: 101, documentGuid: 'guid-101-edited' },
    } as unknown as Awaited<ReturnType<typeof photoPlanActions.replacePropertyPhotoAction>>);

    const { result } = renderHook(() => usePhotoPlanMutations(defaultProps));

    const validFile = new File(['edited content'], 'edited.jpg', { type: 'image/jpeg' });

    let success = false;
    await act(async () => {
      success = await result.current.handleSaveEditedPhoto(0, validFile);
    });

    expect(success).toBe(true);
    expect(photoPlanActions.replacePropertyPhotoAction).toHaveBeenCalled();
  });
});

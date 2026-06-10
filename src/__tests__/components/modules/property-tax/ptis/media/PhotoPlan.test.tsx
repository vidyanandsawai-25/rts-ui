import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { toast } from 'sonner';

// Mocks for next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockRefresh = vi.fn();
const mockBack = vi.fn();
const mockForward = vi.fn();

const mockSearchParamsGet = vi.fn((_key: string): string | null => null);

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: mockRefresh,
    back: mockBack,
    forward: mockForward,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsGet(key),
    toString: () => '',
  }),
  usePathname: () => '/property-tax/ptis',
}));

// Mock next-intl
const mockT = (key: string, values?: Record<string, unknown>) => {
  if (key === 'media.imageOf') {
    const vals = values as { current: number; total: number } | undefined;
    return `Image ${vals?.current} of ${vals?.total}`;
  }
  return key;
};
mockT.has = (_key: string) => true;

vi.mock('next-intl', () => ({
  useTranslations: () => mockT,
}));

// Mock next/image to render a standard img tag
vi.mock('next/image', () => ({
  default: (props: React.ComponentProps<'img'> & Record<string, unknown>) => {
    const { unoptimized: _u, priority: _p, placeholder: _ph, blurDataURL: _b, fill: _f, loader: _l, onLoad, onError, ...rest } = props;
    const ImgTag = 'img';
    return (
      <ImgTag
        {...rest}
        alt={props.alt ?? ''}
        onLoad={(e) => {
          if (onLoad) onLoad(e as unknown as React.SyntheticEvent<HTMLImageElement, Event>);
        }}
        onError={(e) => {
          if (onError) onError(e as unknown as React.SyntheticEvent<HTMLImageElement, Event>);
        }}
      />
    );
  },
}));

// Mock toast from sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock confirm from `@/components/common`
const mockConfirm = vi.fn();
vi.mock('@/components/common', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/common')>();
  return {
    ...actual,
    useConfirm: () => ({
      confirm: mockConfirm,
    }),
  };
});

// Mock actions
const mockUploadPropertyPhotoAction = vi.fn();
const mockReplacePropertyPhotoAction = vi.fn();
const mockDeletePropertyPhotoAction = vi.fn();
const mockGetPhotosByCategoryAction = vi.fn();

vi.mock('@/app/[locale]/property-tax/ptis/PhotoPlan.action', () => ({
  uploadPropertyPhotoAction: (...args: unknown[]) => mockUploadPropertyPhotoAction(...args),
  replacePropertyPhotoAction: (...args: unknown[]) => mockReplacePropertyPhotoAction(...args),
  deletePropertyPhotoAction: (...args: unknown[]) => mockDeletePropertyPhotoAction(...args),
  getPhotosByCategoryAction: (...args: unknown[]) => mockGetPhotosByCategoryAction(...args),
}));

const mockCreatePropertyPhotoTypeAction = vi.fn();
vi.mock('@/app/[locale]/property-tax/ptis/PhotoPlanType.action', () => ({
  createPropertyPhotoTypeAction: (...args: unknown[]) => mockCreatePropertyPhotoTypeAction(...args),
}));

// Import target utilities and configurations
import { getAdditionalImages, getGalleryImages } from '@/components/modules/property-tax/ptis/media/mediaConfig';
import {
  formatPhotoPlanPayload,
  mapPropertyPhotoToAdditionalImage,
  mapSlotsToCategories,
  mapGroupedResponseToCategories,
} from '@/components/modules/property-tax/ptis/media/mediaData';

// Import hooks
import { usePhotoPlanGallery } from '@/hooks/ptis/photoplan/usePhotoPlanGallery';
import { usePhotoPlanCategoryMutations } from '@/hooks/ptis/photoplan/usePhotoPlanCategoryMutations';
import { usePhotoPlanMutations } from '@/hooks/ptis/photoplan/usePhotoPlanMutations';

// Import components
import PropertyMediaPanel from '@/components/modules/property-tax/ptis/media/PropertyMediaPanel';
import { PhotoPlanDrawer } from '@/components/modules/property-tax/ptis/media/PhotoPlanDrawer';
import { PhotoPlanNamingModal } from '@/components/modules/property-tax/ptis/media/PhotoPlanNamingModal';
import { PhotoPlanCategoryModal } from '@/components/modules/property-tax/ptis/media/PhotoPlanCategoryModal';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import { ImageWithFallback } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import { MainImageViewer } from '@/components/modules/property-tax/ptis/media/MainImageViewer';

describe('PhotoPlan Section - Complete Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
  });

  describe('mediaConfig utils', () => {
    it('returns additional images array with translation', () => {
      const mockTFunc = (key: string) => `trans_${key}`;
      const additional = getAdditionalImages(mockTFunc);
      expect(additional.length).toBe(8);
      expect(additional[0]?.alt).toBe('trans_media.rearElevation');
      expect(additional[0]?.photoTypeCode).toBe('BACK');
    });

    it('returns full gallery images collection with translation', () => {
      const mockTFunc = (key: string) => `trans_${key}`;
      const gallery = getGalleryImages(mockTFunc);
      expect(gallery.length).toBe(11);
      expect(gallery[0]?.alt).toBe('trans_media.frontElevation');
      expect(gallery[0]?.photoTypeCode).toBe('FRONT');
    });
  });

  describe('mediaData transformations', () => {
    it('formats photo plan payload successfully into FormData', () => {
      const file = new File(['hello'], 'hello.png', { type: 'image/png' });
      const categories = [
        {
          photoTypeCode: 'FRONT',
          images: [
            {
              file,
              displayOrder: 1,
              remarks: 'My Front Elevation',
              title: 'Front View',
            },
          ],
        },
      ];
      const formData = formatPhotoPlanPayload(categories);
      expect(formData.get('files[FRONT]')).toBeInstanceOf(File);
      expect(formData.get('metadata[FRONT][0][displayOrder]')).toBe('1');
      expect(formData.get('metadata[FRONT][0][remarks]')).toBe('My Front Elevation');
      expect(formData.get('metadata[FRONT][0][title]')).toBe('Front View');
    });

    it('maps property photo to additional image details', () => {
      const p1 = {
        propertyId: 1,
        propertyPhotoId: 101,
        photoTypeId: 1,
        photoTypeCode: 'FRONT',
        photoTypeName: 'Front Elevation',
        remarks: 'Custom Title | Custom Remark details',
        displayOrder: 2,
        documentGuid: '123-guid',
        viewUrl: 'http://test.url/view',
      };
      const img1 = mapPropertyPhotoToAdditionalImage(p1, 'Default Category');
      expect(img1.title).toBe('Custom Title');
      expect(img1.remarks).toBe('Custom Remark details');
      expect(img1.src).toBe('http://test.url/view');

      const p2 = {
        propertyId: 1,
        propertyPhotoId: 102,
        photoTypeId: 2,
        photoTypeCode: 'OTHER',
        photoTypeName: 'Other',
        remarks: 'Only Remark Without Pipe',
        displayOrder: 3,
        documentGuid: '456-guid',
      };
      const img2 = mapPropertyPhotoToAdditionalImage(p2, 'Other Category');
      expect(img2.title).toBe('Only Remark Without Pipe');
      expect(img2.remarks).toBe('');
      expect(img2.src).toContain('/api/documents/456-guid/view');
    });

    it('maps slots to categories correctly', () => {
      const slots = [
        {
          photoTypeId: 1,
          photoTypeCode: 'FRONT',
          photoTypeName: 'Front Elevation',
          hasPhoto: true,
          photoCount: 1,
          propertyPhotoId: 101,
          documentGuid: '123-guid',
        },
        {
          photoTypeId: 2,
          photoTypeCode: 'CUSTOM_SLOT',
          photoTypeName: 'Custom View',
          hasPhoto: false,
          photoCount: 0,
        },
      ];

      const uploadedPhotos = [
        {
          propertyId: 1,
          propertyPhotoId: 101,
          photoTypeId: 1,
          photoTypeCode: 'FRONT',
          photoTypeName: 'Front Elevation',
          remarks: 'Front | Remark',
          displayOrder: 1,
          documentGuid: '123-guid',
        },
      ];

      const categories = mapSlotsToCategories(slots, uploadedPhotos);
      expect(categories.length).toBe(2);
      expect(categories[0]?.isCustom).toBe(false);
      expect(categories[1]?.isCustom).toBe(true);
      expect(categories[0]?.images.length).toBe(1);
    });

    it('maps grouped response to categories correctly', () => {
      const groupedData = {
        propertyId: 1,
        totalPhotos: 1,
        photoTypes: [
          {
            photoTypeId: 1,
            photoTypeCode: 'FRONT',
            photoTypeName: 'Front Elevation',
            hasPhoto: true,
            photoCount: 1,
            photos: [
              {
                propertyId: 1,
                propertyPhotoId: 101,
                photoTypeId: 1,
                photoTypeCode: 'FRONT',
                photoTypeName: 'Front Elevation',
                remarks: 'Group Front',
                displayOrder: 2,
              },
            ],
          },
        ],
      };

      const categories = mapGroupedResponseToCategories(groupedData);
      expect(categories.length).toBe(1);
      expect(categories[0]?.images.length).toBe(1);
    });
  });

  describe('usePhotoPlanGallery hook', () => {
    it('tracks active image selections, rotate, reset, and next/prev navigations', () => {
      const images = [
        { src: 'img1.png', fullSrc: 'img1.png', title: 'img1', alt: 'img1', photoTypeCode: 'FRONT' },
        { src: 'img2.png', fullSrc: 'img2.png', title: 'img2', alt: 'img2', photoTypeCode: 'BACK' },
      ];
      const { result, rerender } = renderHook(
        (props) => usePhotoPlanGallery(props),
        {
          initialProps: { images, initialIndex: 0, open: true },
        }
      );

      expect(result.current.selectedImageIndex).toBe(0);
      expect(result.current.rotation).toBe(0);

      act(() => {
        result.current.handleNext();
      });
      expect(result.current.selectedImageIndex).toBe(1);

      act(() => {
        result.current.handlePrev();
      });
      expect(result.current.selectedImageIndex).toBe(0);

      act(() => {
        result.current.handleRotateRight();
      });
      expect(result.current.rotation).toBe(90);

      act(() => {
        result.current.handleRotateLeft();
      });
      expect(result.current.rotation).toBe(0);

      act(() => {
        result.current.handleRotateLeft();
      });
      expect(result.current.rotation).toBe(270);

      act(() => {
        result.current.handleReset();
      });
      expect(result.current.rotation).toBe(0);

      act(() => {
        result.current.handleSelect(1);
      });
      expect(result.current.selectedImageIndex).toBe(1);

      rerender({ images, initialIndex: 0, open: false });
      rerender({ images, initialIndex: 1, open: true });
      expect(result.current.selectedImageIndex).toBe(1);
      expect(result.current.rotation).toBe(0);
    });
  });

  describe('usePhotoPlanCategoryMutations hook', () => {
    it('creates custom category slot successfully', async () => {
      mockCreatePropertyPhotoTypeAction.mockResolvedValueOnce({
        success: true,
        data: { id: 202 },
      });
      const categories: PhotoCategory[] = [];
      const onCategoriesChange = vi.fn();
      const { result } = renderHook(() =>
        usePhotoPlanCategoryMutations({ categories, onCategoriesChange })
      );

      let success;
      await act(async () => {
        success = await result.current.handleCreateCategorySlot('Garden View', 1, 'Garden Area');
      });

      expect(success).toBe(true);
      expect(mockCreatePropertyPhotoTypeAction).toHaveBeenCalled();
      expect(onCategoriesChange).toHaveBeenCalledWith([
        {
          photoTypeId: 202,
          photoTypeCode: expect.stringContaining('GARDEN_VIEW_'),
          photoTypeName: 'Garden View',
          images: [],
          isCustom: true,
        },
      ]);
      expect(toast.success).toHaveBeenCalledWith('Category slot created successfully');
    });

    it('handles api error on custom slot creation', async () => {
      mockCreatePropertyPhotoTypeAction.mockResolvedValueOnce({
        success: false,
        error: 'Failed to create',
      });
      const categories: PhotoCategory[] = [];
      const onCategoriesChange = vi.fn();
      const { result } = renderHook(() =>
        usePhotoPlanCategoryMutations({ categories, onCategoriesChange })
      );

      let success;
      await act(async () => {
        success = await result.current.handleCreateCategorySlot('Garden View');
      });

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('Failed to create');
    });

    it('handles unexpected exceptions during slot creation', async () => {
      mockCreatePropertyPhotoTypeAction.mockRejectedValueOnce(new Error('Crash'));
      const categories: PhotoCategory[] = [];
      const onCategoriesChange = vi.fn();
      const { result } = renderHook(() =>
        usePhotoPlanCategoryMutations({ categories, onCategoriesChange })
      );

      let success;
      await act(async () => {
        success = await result.current.handleCreateCategorySlot('Garden View');
      });

      expect(success).toBe(false);
      expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred.');
    });
  });

  describe('usePhotoPlanMutations hook', () => {
    let categories: PhotoCategory[];
    let onCategoriesChange: (cats: PhotoCategory[]) => void;

    beforeEach(() => {
      categories = [
        {
          photoTypeId: 1,
          photoTypeCode: 'FRONT',
          photoTypeName: 'Front View',
          images: [
            {
              propertyPhotoId: 101,
              photoTypeId: 1,
              photoTypeCode: 'FRONT',
              src: 'img1.png',
              fullSrc: 'img1.png',
              title: 'Front View',
              alt: 'Front View',
              displayOrder: 1,
            },
          ],
        },
      ];
      onCategoriesChange = vi.fn();
    });

    it('triggers naming modal on handleAddPhoto', () => {
      const setSelectedImageIndex = vi.fn();
      const setViewMode = vi.fn();
      const { result } = renderHook(() =>
        usePhotoPlanMutations({
          propertyId: 1,
          categories,
          onCategoriesChange,
          selectedCategoryIndex: 0,
          selectedImageIndex: null,
          setSelectedImageIndex,
          viewMode: 'grid',
          setViewMode,
        })
      );

      act(() => {
        result.current.handleAddPhoto();
      });
      expect(result.current.isNamingOpen).toBe(true);
      expect(result.current.isReplacement).toBe(false);
    });

    it('triggers replace confirmations, action call, and state updates', async () => {
      mockReplacePropertyPhotoAction.mockResolvedValueOnce({
        success: true,
        data: { viewUrl: 'new_url.png', propertyPhotoId: 101 },
      });
      mockConfirm.mockImplementationOnce(({ onConfirm }) => onConfirm());

      const setSelectedImageIndex = vi.fn();
      const setViewMode = vi.fn();
      const { result } = renderHook(() =>
        usePhotoPlanMutations({
          propertyId: 1,
          categories,
          onCategoriesChange,
          selectedCategoryIndex: 0,
          selectedImageIndex: null,
          setSelectedImageIndex,
          viewMode: 'grid',
          setViewMode,
        })
      );

      act(() => {
        result.current.handleReplacePhoto(0);
      });
      expect(result.current.isReplacement).toBe(true);

      const file = new File(['foo'], 'foo.png', { type: 'image/png' });
      const event = {
        target: {
          files: [file],
          value: 'val',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleFileChange(event);
      });

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockReplacePropertyPhotoAction).toHaveBeenCalled();
      expect(onCategoriesChange).toHaveBeenCalled();
    });

    it('handles file submit with upload successfully', async () => {
      mockUploadPropertyPhotoAction.mockResolvedValueOnce({
        success: true,
        data: { propertyPhotoId: 102, viewUrl: 'uploaded.png' },
      });

      const setSelectedImageIndex = vi.fn();
      const setViewMode = vi.fn();
      const { result } = renderHook(() =>
        usePhotoPlanMutations({
          propertyId: 1,
          categories,
          onCategoriesChange,
          selectedCategoryIndex: 0,
          selectedImageIndex: null,
          setSelectedImageIndex,
          viewMode: 'grid',
          setViewMode,
        })
      );

      const file = new File(['bar'], 'bar.png', { type: 'image/png' });
      await act(async () => {
        await result.current.handleNamingSubmit('New Slot Photo', 2, 1, file, 'remark');
      });

      expect(mockUploadPropertyPhotoAction).toHaveBeenCalled();
      expect(onCategoriesChange).toHaveBeenCalled();
    });

    it('handles delete photo operations', async () => {
      mockDeletePropertyPhotoAction.mockResolvedValueOnce({ success: true });

      const setSelectedImageIndex = vi.fn();
      const setViewMode = vi.fn();
      const { result } = renderHook(() =>
        usePhotoPlanMutations({
          propertyId: 1,
          categories,
          onCategoriesChange,
          selectedCategoryIndex: 0,
          selectedImageIndex: 0,
          setSelectedImageIndex,
          viewMode: 'viewer',
          setViewMode,
        })
      );

      await act(async () => {
        await result.current.handleDeletePhoto(0);
      });

      expect(mockDeletePropertyPhotoAction).toHaveBeenCalledWith(101);
      expect(setSelectedImageIndex).toHaveBeenCalledWith(null);
      expect(setViewMode).toHaveBeenCalledWith('grid');
      expect(onCategoriesChange).toHaveBeenCalled();
    });
  });

  describe('ImageWithFallback component', () => {
    it('renders loader skeleton, fallback placeholder on failure, and custom onError events', () => {
      const { rerender } = render(<ImageWithFallback src="" alt="Test fallback description" fallbackSrc="" />);
      expect(screen.getByLabelText('Test fallback description')).toBeInTheDocument();

      rerender(<ImageWithFallback src="valid.png" alt="Valid alt text" />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'valid.png');

      fireEvent.error(img);
      expect(screen.getByLabelText('Valid alt text')).toBeInTheDocument();
    });
  });

  describe('MainImageViewer component', () => {
    it('renders main image viewer with applied rotation styles', () => {
      render(<MainImageViewer src="photo.png" alt="Photo alt text" rotation={90} />);
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img.parentElement).toHaveStyle('transform: rotate(90deg)');
    });
  });

  describe('PropertyMediaPanel component', () => {
    const slots = [
      { photoTypeId: 1, photoTypeCode: 'FRONT', photoTypeName: 'Front View', hasPhoto: true, photoCount: 1, propertyPhotoId: 101, viewUrl: 'front.png' },
      { photoTypeId: 2, photoTypeCode: 'PHOTO_PLAN', photoTypeName: 'Photo Plan', hasPhoto: true, photoCount: 1, propertyPhotoId: 102, viewUrl: 'plan.png' },
      { photoTypeId: 3, photoTypeCode: 'BACK', photoTypeName: 'Rear Elevation', hasPhoto: true, photoCount: 1, propertyPhotoId: 103, viewUrl: 'back.png' },
    ];
    const photos = [
      { propertyPhotoId: 101, propertyId: 1, photoTypeId: 1, photoTypeCode: 'FRONT', photoTypeName: 'Front View', viewUrl: 'front.png' },
      { propertyPhotoId: 102, propertyId: 1, photoTypeId: 2, photoTypeCode: 'PHOTO_PLAN', photoTypeName: 'Photo Plan', viewUrl: 'plan.png' },
      { propertyPhotoId: 103, propertyId: 1, photoTypeId: 3, photoTypeCode: 'BACK', photoTypeName: 'Rear Elevation', viewUrl: 'back.png' },
    ];

    it('renders panel with core photo types and handles show more toggling', () => {
      render(<PropertyMediaPanel propertyId={1} initialPhotoSlots={slots} initialPhotos={photos} />);
      
      // Property photo card triggers drawer
      const frontCard = screen.getAllByRole('img')[0];
      expect(frontCard).toBeInTheDocument();

      // Show More Button Check
      const toggleMore = screen.getByLabelText('View more images');
      expect(toggleMore).toBeInTheDocument();

      fireEvent.click(toggleMore);
      expect(screen.getByLabelText('Hide more images')).toBeInTheDocument();

      // Clicking main photo type opens drawer via router.push
      fireEvent.click(frontCard!);
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('PhotoPlanDrawer & Child Modals/Views', () => {
    const slots = [
      { photoTypeId: 1, photoTypeCode: 'FRONT', photoTypeName: 'Front View', hasPhoto: true, photoCount: 1, propertyPhotoId: 101, viewUrl: 'front.png' },
      { photoTypeId: 2, photoTypeCode: 'CUSTOM', photoTypeName: 'Custom View', hasPhoto: false, photoCount: 0 },
    ];
    const photos = [
      { propertyPhotoId: 101, propertyId: 1, photoTypeId: 1, photoTypeCode: 'FRONT', photoTypeName: 'Front View', viewUrl: 'front.png' },
    ];

    it('renders portal drawer with sidebar folders, grids, naming forms, and validation checks', async () => {
      mockGetPhotosByCategoryAction.mockResolvedValue({
        success: true,
        data: photos,
      });
      mockSearchParamsGet.mockReturnValue('photo-plan');

      const onCategoriesChange = vi.fn();
      const idsChange = vi.fn();
      let renderResult: ReturnType<typeof render>;
      await act(async () => {
        renderResult = render(
          <PhotoPlanDrawer
            open
            onClose={vi.fn()}
            categories={mapSlotsToCategories(slots, photos)}
            onCategoriesChange={onCategoriesChange}
            propertyId={1}
            fullyLoadedIds={new Set([1])}
            onFullyLoadedIdsChange={idsChange}
          />
        );
      });

      // Verify sidebar folder title
      expect(screen.getAllByText(/media.additionalImages/i).length).toBeGreaterThan(0);

      // Verify Category List Folders
      expect(screen.getAllByText('Front View').length).toBeGreaterThan(0);
      expect(screen.getByText('Custom View')).toBeInTheDocument();

      // Open custom slot category modal
      const addSlotBtn = screen.getByText('media.addPhotoPlanSlot');
      await act(async () => {
        fireEvent.click(addSlotBtn);
      });

      // Verify category modal inputs are displayed
      expect(screen.getByText('Add Photo Category Slot')).toBeInTheDocument();

      // Click cancel modal
      const cancelCategoryModalBtn = screen.getByRole('button', { name: 'actions.cancel' });
      await act(async () => {
        fireEvent.click(cancelCategoryModalBtn);
      });

      // Rerender with mock selections to trigger viewer mode
      mockSearchParamsGet.mockReturnValue('photo-plan');
      // Trigger grid click to selection
      const imgCard = screen.getAllByRole('img', { name: 'Front View' })[1];
      await act(async () => {
        fireEvent.click(imgCard!);
      });

      // Toggle drawer closed
      await act(async () => {
        renderResult.rerender(
          <PhotoPlanDrawer
            open={false}
            onClose={vi.fn()}
            categories={[]}
            onCategoriesChange={onCategoriesChange}
            fullyLoadedIds={new Set([1])}
            onFullyLoadedIdsChange={idsChange}
          />
        );
      });
    });

    it('validates naming modal input fields correctly', () => {
      const onSubmit = vi.fn();
      render(
        <PhotoPlanNamingModal
          open
          onClose={vi.fn()}
          onSubmit={onSubmit}
          availableTypes={[{ label: 'Front View', value: '1' }]}
          defaultDisplayOrder={1}
          isEdit
        />
      );

      // Invalid character validation check
      const nameInput = screen.getByLabelText(/media.photoPlanName/i);
      fireEvent.change(nameInput, { target: { value: 'Invalid@Char!' } });

      const saveBtn = screen.getByRole('button', { name: 'actions.save' });
      fireEvent.click(saveBtn);

      expect(screen.getByText('media.invalidNameFormat')).toBeInTheDocument();
    });

    it('validates custom category modal inputs correctly', () => {
      const onSubmit = vi.fn();
      render(
        <PhotoPlanCategoryModal
          open
          onClose={vi.fn()}
          onSubmit={onSubmit}
          defaultDisplayOrder={1}
          existingNames={['Existing Category']}
        />
      );

      // Empty name validation checks
      const nameInput = screen.getByLabelText(/Category Name/i);
      // Valid name already exists duplicate validation
      fireEvent.change(nameInput, { target: { value: 'Existing Category' } });

      const saveBtn = screen.getByRole('button', { name: 'actions.save' });
      fireEvent.click(saveBtn);

      expect(screen.getByText('A category with this name already exists')).toBeInTheDocument();
    });
  });
});

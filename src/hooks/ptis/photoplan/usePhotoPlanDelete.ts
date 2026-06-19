import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { deletePropertyPhotoAction } from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import { patchCategory } from '@/lib/utils/ptis-photo-plan-localization';
import type { AdditionalImage } from '@/components/modules/property-tax/ptis/media/MediaImageCards';

interface UsePhotoPlanDeleteProps {
  propertyId?: number;
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  selectedCategoryIndex: number;
  selectedImageIndex: number | null;
  viewMode: 'grid' | 'viewer' | 'compare';
  setViewerIndexAndModeValue: (idx: number | null, mode: 'grid' | 'viewer' | 'compare') => void;
  locale: string;
  t: (key: string) => string;
}

export function usePhotoPlanDelete({
  propertyId,
  categories,
  onCategoriesChange,
  selectedCategoryIndex,
  selectedImageIndex,
  viewMode,
  setViewerIndexAndModeValue,
  locale,
  t,
}: UsePhotoPlanDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const activeCategory = categories[selectedCategoryIndex];

  const handleDeletePhoto = useCallback(async (indexToDelete: number) => {
    if (!activeCategory) return;
    const imgToDelete = activeCategory.images[indexToDelete];
    if (propertyId && imgToDelete?.propertyPhotoId) {
      setIsDeleting(true);
      try {
        const res = await deletePropertyPhotoAction(imgToDelete.propertyPhotoId, locale);
        if (!res.success) {
          toast.error(res.error || t('media.failedToDelete') || 'Failed to delete photo');
          setIsDeleting(false);
          return;
        }
        toast.success(t('media.photoDeletedSuccess') || 'Photo deleted successfully');
      } catch {
        toast.error(t('media.unexpectedError') || 'An unexpected error occurred.');
        setIsDeleting(false);
        return;
      } finally {
        setIsDeleting(false);
      }
    }
    const updatedImages = activeCategory.images.filter((_: AdditionalImage, idx: number) => idx !== indexToDelete);
    onCategoriesChange(patchCategory(categories, selectedCategoryIndex, updatedImages));
    if (updatedImages.length === 0) {
      setViewerIndexAndModeValue(null, 'grid');
    } else if (selectedImageIndex === indexToDelete) {
      setViewerIndexAndModeValue(Math.min(indexToDelete, updatedImages.length - 1), 'viewer');
    } else if (selectedImageIndex !== null && selectedImageIndex > indexToDelete) {
      setViewerIndexAndModeValue(selectedImageIndex - 1, viewMode);
    }
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, selectedImageIndex, viewMode, setViewerIndexAndModeValue, t, locale]);

  return { isDeleting, handleDeletePhoto };
}

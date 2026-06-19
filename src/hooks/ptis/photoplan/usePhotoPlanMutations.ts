import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import {
  uploadPropertyPhotoAction,
  replacePropertyPhotoAction,
  deletePropertyPhotoAction,
} from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import { clearDocumentCacheEntry } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import type { AdditionalImage } from '@/components/modules/property-tax/ptis/media/MediaImageCards';
import { useConfirm } from '@/components/common';
import {
  getEnglishCategoryName,
  patchCategory,
  sortByOrder,
} from '@/lib/utils/ptis-photo-plan-localization';

export interface UsePhotoPlanMutationsProps {
  propertyId?: number;
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  selectedCategoryIndex: number;
  selectedImageIndex: number | null;
  setSelectedImageIndex?: (index: number | null) => void;
  viewMode: 'grid' | 'viewer' | 'compare';
  setViewMode?: (mode: 'grid' | 'viewer' | 'compare') => void;
  setViewerIndexAndMode?: (index: number | null, mode: 'grid' | 'viewer' | 'compare') => void;
}

export function usePhotoPlanMutations({
  propertyId, categories, onCategoriesChange,
  selectedCategoryIndex, selectedImageIndex, viewMode,
  setSelectedImageIndex, setViewMode,
  setViewerIndexAndMode,
}: UsePhotoPlanMutationsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { confirm } = useConfirm();
  const t = useTranslations('ptis');
  const locale = useLocale();
  const [isNamingOpen, setIsNamingOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplacement, setIsReplacement] = useState(false);
  const [activeIndexToReplace, setActiveIndexToReplace] = useState<number | null>(null);

  const isUploading = isAdding || isReplacing || isDeleting;

  const setViewerIndexAndModeValue = useCallback((idx: number | null, mode: 'grid' | 'viewer' | 'compare') => {
    if (setViewerIndexAndMode) setViewerIndexAndMode(idx, mode);
    else {
      setSelectedImageIndex?.(idx);
      setViewMode?.(mode);
    }
  }, [setViewerIndexAndMode, setSelectedImageIndex, setViewMode]);

  const activeCategory = categories[selectedCategoryIndex];

  const handleAddPhoto = useCallback(() => {
    setIsReplacement(false);
    setIsNamingOpen(true);
  }, []);

  const handleReplacePhoto = useCallback((index: number) => {
    setActiveIndexToReplace(index);
    setIsReplacement(true);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    const file = e.target.files?.[0];
    if (!file || activeIndexToReplace === null || !activeCategory) return;
    const targetImg = activeCategory.images[activeIndexToReplace];
    const propertyPhotoId = targetImg?.propertyPhotoId;
    if (!propertyPhotoId) return;
    e.target.value = '';
    if (!propertyId) return toast.error(t('media.propertyIdRequired') || 'PropertyId is required.');

    confirm({
      title: t('media.replaceImageTitle') || 'Replace Photo',
      description: t('media.replaceImageDescription', { name: targetImg.title }) || `Are you sure you want to replace "${targetImg.title}"?`,
      onConfirm: async () => {
        setIsReplacing(true);
        const formData = new FormData();
        formData.append('File', file);
        const isDefaultName = targetImg.title === activeCategory.photoTypeName;
        const englishTitle = isDefaultName ? getEnglishCategoryName(activeCategory.photoTypeCode, targetImg.title) : targetImg.title;
        const replaceRemarks = targetImg.remarks ? `${englishTitle} | ${targetImg.remarks}` : englishTitle;
        formData.append('Remarks', replaceRemarks);
        try {
          const res = await replacePropertyPhotoAction(propertyPhotoId, formData, locale);
          if (res.success && res.data) {
            clearDocumentCacheEntry(targetImg.src);
            const url = res.data.viewUrl || getViewDocumentUrl(res.data.documentGuid);
            const updated = activeCategory.images.map((img: AdditionalImage, i: number) => i === activeIndexToReplace ? { ...img, src: url, fullSrc: url } : img);
            onCategoriesChange(patchCategory(categories, selectedCategoryIndex, updated));
            toast.success(t('media.photoReplacedSuccess') || 'Photo replaced successfully');
            if (activeIndexToReplace !== null) setViewerIndexAndModeValue(activeIndexToReplace, 'viewer');
          } else toast.error(res.error || t('media.failedToReplace') || 'Failed to replace photo');
        } catch {
          toast.error(t('media.unexpectedError') || 'An unexpected error occurred.');
        } finally {
          setIsReplacing(false);
        }
      },
    });
  }, [activeIndexToReplace, activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, confirm, isUploading, t, locale, setViewerIndexAndModeValue]);

  const handleNamingSubmit = useCallback(async (
    name: string, displayOrder: number, photoTypeId: number, file?: File, remarks?: string,
  ) => {
    if (isUploading || !activeCategory) return;
    const isDefaultName = name.trim() === activeCategory.photoTypeName;
    const englishName = isDefaultName ? getEnglishCategoryName(activeCategory.photoTypeCode, name.trim()) : name.trim();
    const combinedRemarks = remarks ? `${englishName} | ${remarks}` : englishName;
    if (!file) return toast.error(t('media.fileRequired') || 'Photo file is required');
    if (!propertyId) {
      setIsNamingOpen(false);
      return toast.error(t('media.propertyIdRequired') || 'PropertyId is required.');
    }
    setIsAdding(true);
    const formData = new FormData();
    formData.append('File', file);
    formData.append('PropertyId', propertyId.toString());
    formData.append('PhotoTypeId', photoTypeId.toString());
    formData.append('DisplayOrder', displayOrder.toString());
    formData.append('Remarks', combinedRemarks);
    try {
      const res = await uploadPropertyPhotoAction(formData, locale);
      if (res.success && res.data) {
        const url = res.data.viewUrl || getViewDocumentUrl(res.data.documentGuid);
        const newImg: AdditionalImage = {
          src: url, fullSrc: url, alt: name, title: name,
          photoTypeId, propertyPhotoId: res.data.propertyPhotoId,
          photoTypeCode: activeCategory.photoTypeCode,
          hasPhoto: true, remarks: remarks || '', displayOrder,
        };
        const updatedImages = sortByOrder([...activeCategory.images, newImg]);
        onCategoriesChange(patchCategory(categories, selectedCategoryIndex, updatedImages));
        toast.success(t('media.photoUploadedSuccess') || 'Photo uploaded successfully');
        const targetPhotoId = res.data.propertyPhotoId;
        const newImgIndex = updatedImages.findIndex((img) => String(img.propertyPhotoId) === String(targetPhotoId));
        if (newImgIndex !== -1) setViewerIndexAndModeValue(newImgIndex, 'viewer');
      } else toast.error(res.error || t('media.failedToUpload') || 'Failed to upload photo');
    } catch {
      toast.error(t('media.unexpectedError') || 'An unexpected error occurred.');
    } finally {
      setIsAdding(false);
    }
    setIsNamingOpen(false);
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, isUploading, t, locale, setViewerIndexAndModeValue]);

  const handleDeletePhoto = useCallback(async (indexToDelete: number) => {
    if (isUploading || !activeCategory) return;
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
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, selectedImageIndex, viewMode, setViewerIndexAndModeValue, isUploading, t, locale]);

  return {
    fileInputRef, isNamingOpen, setIsNamingOpen, isUploading,
    isReplacement,
    isAdding, isReplacing, isDeleting,
    handleAddPhoto, handleReplacePhoto,
    handleFileChange, handleNamingSubmit, handleDeletePhoto,
  };
}

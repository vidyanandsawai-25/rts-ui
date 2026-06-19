import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations, useLocale } from 'next-intl';
import {
  uploadPropertyPhotoAction,
  replacePropertyPhotoAction,
} from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { usePhotoPlanDelete } from './usePhotoPlanDelete';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import { clearDocumentCacheEntry } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import type { AdditionalImage } from '@/components/modules/property-tax/ptis/media/MediaImageCards';
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
  const t = useTranslations('ptis');
  const locale = useLocale();
  const [isNamingOpen, setIsNamingOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isReplacement, setIsReplacement] = useState(false);
  const [activeIndexToReplace, setActiveIndexToReplace] = useState<number | null>(null);

  const setViewerIndexAndModeValue = useCallback((idx: number | null, mode: 'grid' | 'viewer' | 'compare') => {
    if (setViewerIndexAndMode) setViewerIndexAndMode(idx, mode);
    else {
      setSelectedImageIndex?.(idx);
      setViewMode?.(mode);
    }
  }, [setViewerIndexAndMode, setSelectedImageIndex, setViewMode]);

  const activeCategory = categories[selectedCategoryIndex];

  const { isDeleting, handleDeletePhoto } = usePhotoPlanDelete({
    propertyId,
    categories,
    onCategoriesChange,
    selectedCategoryIndex,
    selectedImageIndex,
    viewMode,
    setViewerIndexAndModeValue,
    locale,
    t,
  });

  const isUploading = isAdding || isReplacing || isDeleting;

  const handleAddPhoto = useCallback(() => {
    setIsReplacement(false);
    setIsNamingOpen(true);
  }, []);

  const handleReplacePhoto = useCallback((index: number) => {
    setActiveIndexToReplace(index);
    setIsReplacement(true);
    setIsNamingOpen(true);
  }, []);

  const executeReplaceApi = useCallback(async (
    propertyPhotoId: number,
    file: File,
    targetImg: AdditionalImage,
    index: number
  ): Promise<boolean> => {
    setIsReplacing(true);
    const formData = new FormData();
    formData.append('File', file);
    const isDefaultName = targetImg.title === activeCategory?.photoTypeName;
    const englishTitle = isDefaultName ? getEnglishCategoryName(activeCategory.photoTypeCode, targetImg.title) : targetImg.title;
    const replaceRemarks = targetImg.remarks ? `${englishTitle} | ${targetImg.remarks}` : englishTitle;
    formData.append('Remarks', replaceRemarks);
    try {
      const res = await replacePropertyPhotoAction(propertyPhotoId, formData, locale);
      if (res.success && res.data) {
        clearDocumentCacheEntry(targetImg.src);
        const url = res.data.viewUrl || getViewDocumentUrl(res.data.documentGuid);
        const updated = activeCategory.images.map((img: AdditionalImage, i: number) => i === index ? { ...img, src: url, fullSrc: url } : img);
        onCategoriesChange(patchCategory(categories, selectedCategoryIndex, updated));
        toast.success(t('media.photoReplacedSuccess') || 'Photo replaced successfully');
        setViewerIndexAndModeValue(index, 'viewer');
        return true;
      } else {
        toast.error(res.error || t('media.failedToReplace') || 'Failed to replace photo');
        return false;
      }
    } catch {
      toast.error(t('media.unexpectedError') || 'An unexpected error occurred.');
      return false;
    } finally {
      setIsReplacing(false);
    }
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, locale, t, setViewerIndexAndModeValue]);

  const handleSaveEditedPhoto = useCallback(async (index: number, file: File): Promise<boolean> => {
    if (isUploading || !activeCategory) return false;
    const targetImg = activeCategory.images[index];
    const propertyPhotoId = targetImg?.propertyPhotoId;
    if (!propertyPhotoId) return false;
    if (!propertyId) {
      toast.error(t('media.propertyIdRequired') || 'PropertyId is required.');
      return false;
    }
    return executeReplaceApi(propertyPhotoId, file, targetImg, index);
  }, [activeCategory, propertyId, isUploading, t, executeReplaceApi]);

  const handleNamingSubmit = useCallback(async (
    name: string, displayOrder: number, photoTypeId: number, file?: File, remarks?: string,
  ) => {
    if (isUploading || !activeCategory) return;
    if (!file) return toast.error(t('media.fileRequired') || 'Photo file is required');
    if (!propertyId) {
      setIsNamingOpen(false);
      return toast.error(t('media.propertyIdRequired') || 'PropertyId is required.');
    }

    if (isReplacement) {
      if (activeIndexToReplace === null) return;
      const targetImg = activeCategory.images[activeIndexToReplace];
      const propertyPhotoId = targetImg?.propertyPhotoId;
      if (!propertyPhotoId) return;
      const success = await executeReplaceApi(propertyPhotoId, file, {
        ...targetImg,
        title: name,
        remarks: remarks || '',
      }, activeIndexToReplace);
      if (success) {
        setIsNamingOpen(false);
      }
      return;
    }

    setIsAdding(true);
    const isDefaultName = name.trim() === activeCategory.photoTypeName;
    const englishName = isDefaultName ? getEnglishCategoryName(activeCategory.photoTypeCode, name.trim()) : name.trim();
    const combinedRemarks = remarks ? `${englishName} | ${remarks}` : englishName;
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
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, isUploading, t, locale, setViewerIndexAndModeValue, isReplacement, activeIndexToReplace, executeReplaceApi]);

  const replaceImage = activeIndexToReplace !== null ? activeCategory?.images[activeIndexToReplace] : null;

  return {
    isNamingOpen, setIsNamingOpen, isUploading,
    isReplacement,
    isAdding, isReplacing, isDeleting,
    handleAddPhoto, handleReplacePhoto,
    handleNamingSubmit, handleDeletePhoto,
    handleSaveEditedPhoto,
    replaceImage,
  };
}

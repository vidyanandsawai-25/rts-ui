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
import { validatePhotoFile } from '@/lib/validation/ptis/photo-plan-validation';
import { getPropertyDrawPlanStatus } from '@/lib/api/property.service';

export interface UsePhotoPlanMutationsProps {
  propertyId?: number;
  wingDetailId?: number | null;
  societyId?: number | null;
  wingName?: string | null;
  categories: PhotoCategory[];
  onCategoriesChange: (categories: PhotoCategory[]) => void;
  selectedCategoryIndex: number;
  selectedImageIndex: number | null;
  setSelectedImageIndex?: (index: number | null) => void;
  viewMode: 'grid' | 'viewer' | 'compare';
  setViewMode?: (mode: 'grid' | 'viewer' | 'compare') => void;
  setViewerIndexAndMode?: (index: number | null, mode: 'grid' | 'viewer' | 'compare') => void;
  onRequestTypeModal?: () => void;
  isMainProperty?: boolean;
}
export function usePhotoPlanMutations({
  propertyId, wingDetailId, societyId, wingName, categories, onCategoriesChange,
  selectedCategoryIndex, selectedImageIndex, viewMode,
  setSelectedImageIndex, setViewMode,
  setViewerIndexAndMode,
  onRequestTypeModal,
  isMainProperty = false,
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
    else { setSelectedImageIndex?.(idx); setViewMode?.(mode); }
  }, [setViewerIndexAndMode, setSelectedImageIndex, setViewMode]);

  const refreshAfterMediaMutation = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('ptis:media-updated', {
        detail: { propertyId },
      })
    );
  }, [propertyId]);

  const activeCategory = categories[selectedCategoryIndex];

  const { isDeleting, handleDeletePhoto } = usePhotoPlanDelete({
    propertyId, categories, onCategoriesChange,
    selectedCategoryIndex, selectedImageIndex, viewMode,
    setViewerIndexAndModeValue, locale, t,
    onMutationSuccess: refreshAfterMediaMutation,
  });

  const isUploading = isAdding || isReplacing || isDeleting;

  const handleAddPhoto = useCallback(
    async (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const activeCat = categories[selectedCategoryIndex];
      const code = activeCat?.photoTypeCode?.toUpperCase() || '';
      const name = activeCat?.photoTypeName?.toLowerCase() || '';
      const isPlanSlot =
        code === 'PROPERTY_PLAN' ||
        code === 'PHOTO_PLAN' ||
        code === 'PLAN' ||
        code === 'DRAW_PLAN' ||
        name.includes('photo plan') ||
        name.includes('property plan');

      // Only check type if user is uploading a Property Plan slot AND it's NOT a main society/wing property
      if (isPlanSlot && !isMainProperty && propertyId && propertyId > 0) {
        try {
          const apiRes = await getPropertyDrawPlanStatus(propertyId);
          const rawRes = (apiRes as unknown as Record<string, unknown>) || {};
          const rawData = (rawRes.data ?? rawRes.items ?? rawRes.Items ?? rawRes) as Record<string, unknown>;
          const data = (Array.isArray(rawData) ? rawData[0] : ((rawData.items ?? rawData.Items ?? rawData) as Record<string, unknown>)) as Record<string, unknown>;

          const catName = String(data?.categoryName ?? data?.CategoryName ?? '').toLowerCase();
          const isIndividualOrAmenity =
            data?.isIndividualOrAmenity === true ||
            data?.requiresTypeAssignment === false ||
            catName.includes('individual') ||
            catName.includes('amenity') ||
            catName.includes('society') ||
            catName.includes('wing') ||
            Number(data?.propertyTypeId) === 140;

          const rawTypeValue = data?.currentType ?? data?.CurrentType ?? data?.type ?? data?.Type;
          const hasTypeFlag = data?.hasType ?? data?.HasType;

          const hasTypeValue =
            hasTypeFlag === true ||
            isIndividualOrAmenity ||
            (hasTypeFlag !== false &&
              rawTypeValue !== null &&
              rawTypeValue !== undefined &&
              String(rawTypeValue).trim() !== '' &&
              String(rawTypeValue).trim().toLowerCase() !== 'null');

          if (!hasTypeValue) {
            if (onRequestTypeModal) {
              onRequestTypeModal();
            }
            return;
          }
        } catch (err) {
          console.error('Failed to check property draw plan type status:', err);
        }
      }

      setIsReplacement(false);
      setIsNamingOpen(true);
    },
    [propertyId, categories, selectedCategoryIndex, isMainProperty, onRequestTypeModal]
  );

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
    const fileErrKey = validatePhotoFile(file);
    if (fileErrKey) {
      const fallbacks: Record<string, string> = {
        'media.allowedFormats': 'Only JPEG, JPG, and PNG images are allowed',
        'media.maxFileSize': 'File size should not exceed 5 MB',
        'media.fileRequired': 'Photo file is required',
      };
      const msg = t.has(fileErrKey as Parameters<typeof t.has>[0]) ? t(fileErrKey as Parameters<typeof t>[0]) : (fallbacks[fileErrKey] || fileErrKey);
      toast.error(msg);
      return false;
    }

    setIsReplacing(true);
    const isWingCat = Boolean(activeCategory?.photoTypeCode?.toUpperCase().startsWith('WING_') || activeCategory?.photoTypeName?.toLowerCase().includes('wing'));
    const isSocietyCat = Boolean(
      activeCategory?.photoTypeCode?.toUpperCase().startsWith('SOCIETY_') ||
      activeCategory?.photoTypeCode?.toUpperCase().includes('AMENITY') ||
      activeCategory?.photoTypeName?.toLowerCase().includes('society') ||
      activeCategory?.photoTypeName?.toLowerCase().includes('amenity')
    );

    const formData = new FormData();
    formData.append('File', file);
    if (propertyId) formData.append('PropertyId', propertyId.toString());
    if (isWingCat && wingDetailId) formData.append('WingDetailId', wingDetailId.toString());
    if (isSocietyCat && societyId) formData.append('SocietyDetailId', societyId.toString());
    if (isWingCat && wingName) formData.append('WingName', wingName);
    if (activeCategory?.photoTypeId) formData.append('PhotoTypeId', activeCategory.photoTypeId.toString());
    if (activeCategory?.photoTypeCode) formData.append('PhotoTypeCode', activeCategory.photoTypeCode);
    formData.append('PropertyPhotoId', propertyPhotoId.toString());
    const isDefaultName = targetImg.title === activeCategory?.photoTypeName;
    const englishTitle = isDefaultName ? getEnglishCategoryName(activeCategory?.photoTypeCode || '', targetImg.title) : targetImg.title;
    const replaceRemarks = targetImg.remarks ? `${englishTitle} | ${targetImg.remarks}` : englishTitle;
    formData.append('Remarks', replaceRemarks);
    
    const oldDocumentGuid = targetImg.documentGuid || (() => {
      const match = targetImg.src.match(/\/documents\/([a-fA-F0-9-]{36})/);
      return match ? match[1] : '';
    })();

    try {
      const res = await replacePropertyPhotoAction(propertyPhotoId, oldDocumentGuid, formData, locale);
      if (res.success && res.data) {
        clearDocumentCacheEntry(targetImg.src);
        const data = res.data;
        const url = (data.documentGuid ? getViewDocumentUrl(data.documentGuid) : data.viewUrl) || '';
        const updated = activeCategory.images.map((img: AdditionalImage, i: number) => i === index ? { ...img, hasPhoto: true, src: url, fullSrc: url, propertyPhotoId: data.propertyPhotoId, documentGuid: data.documentGuid, downloadUrl: data.downloadUrl || img.downloadUrl, title: targetImg.title, remarks: targetImg.remarks, wingDetailId: wingDetailId ? Number(wingDetailId) : img.wingDetailId, wingName: wingName || img.wingName } : img);
        onCategoriesChange(patchCategory(categories, selectedCategoryIndex, updated));
        toast.success(t('media.photoReplacedSuccess') || 'Photo replaced successfully');
        refreshAfterMediaMutation();
        setViewerIndexAndModeValue(index, 'viewer');
        return true;
      }
      toast.error(res.error || t('media.failedToReplace') || 'Failed to replace photo');
      return false;
    } catch {
      toast.error(t('media.unexpectedError') || 'An unexpected error occurred.');
      return false;
    } finally {
      setIsReplacing(false);
    }
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, locale, t, setViewerIndexAndModeValue, propertyId, refreshAfterMediaMutation, societyId, wingDetailId, wingName]);

  const handleSaveEditedPhoto = useCallback(async (index: number, file: File): Promise<boolean> => {
    if (isUploading || !activeCategory) return false;
    const targetImg = activeCategory.images[index];
    const propertyPhotoId = targetImg?.propertyPhotoId;
    if (!propertyPhotoId || !propertyId) {
      if (!propertyId) toast.error(t('media.propertyIdRequired') || 'PropertyId is required.');
      return false;
    }
    return executeReplaceApi(propertyPhotoId, file, targetImg, index);
  }, [activeCategory, propertyId, isUploading, t, executeReplaceApi]);

  const handleNamingSubmit = useCallback(async (
    name: string, displayOrder: number, photoTypeId: number, file?: File, remarks?: string,
  ) => {
    if (isUploading || !activeCategory) return;
    if (!file) return toast.error(t('media.fileRequired') || 'Photo file is required');
    const fileErrKey = validatePhotoFile(file);
    if (fileErrKey) {
      const fallbacks: Record<string, string> = {
        'media.allowedFormats': 'Only JPEG, JPG, and PNG images are allowed',
        'media.maxFileSize': 'File size should not exceed 5 MB',
        'media.fileRequired': 'Photo file is required',
      };
      const msg = t.has(fileErrKey as Parameters<typeof t.has>[0]) ? t(fileErrKey as Parameters<typeof t>[0]) : (fallbacks[fileErrKey] || fileErrKey);
      return toast.error(msg);
    }
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
        ...targetImg, title: name, remarks: remarks || '',
      }, activeIndexToReplace);
      if (success) setIsNamingOpen(false);
      return;
    }

    setIsAdding(true);
    const isDefaultName = name.trim() === activeCategory.photoTypeName;
    const englishName = isDefaultName ? getEnglishCategoryName(activeCategory.photoTypeCode, name.trim()) : name.trim();
    const combinedRemarks = remarks ? `${englishName} | ${remarks}` : englishName;

    const isWingCat = Boolean(activeCategory.photoTypeCode?.toUpperCase().startsWith('WING_') || activeCategory.photoTypeName?.toLowerCase().includes('wing'));
    const isSocietyCat = Boolean(
      activeCategory.photoTypeCode?.toUpperCase().startsWith('SOCIETY_') ||
      activeCategory.photoTypeCode?.toUpperCase().includes('AMENITY') ||
      activeCategory.photoTypeName?.toLowerCase().includes('society') ||
      activeCategory.photoTypeName?.toLowerCase().includes('amenity')
    );

    const formData = new FormData();
    formData.append('File', file);
    formData.append('PropertyId', propertyId.toString());
    if (isWingCat && wingDetailId) formData.append('WingDetailId', wingDetailId.toString());
    if (isSocietyCat && societyId) formData.append('SocietyDetailId', societyId.toString());
    if (isWingCat && wingName) formData.append('WingName', wingName);
    formData.append('PhotoTypeId', photoTypeId.toString());
    formData.append('PhotoTypeCode', activeCategory.photoTypeCode);
    formData.append('DisplayOrder', displayOrder.toString());
    formData.append('Remarks', combinedRemarks);
    formData.append('ReferenceTableIdGuid', crypto.randomUUID());
    try {
      const res = await uploadPropertyPhotoAction(formData, locale);
      if (res.success && res.data) {
        const url = (res.data.documentGuid ? getViewDocumentUrl(res.data.documentGuid) : res.data.viewUrl) || '';
        const newImg: AdditionalImage = {
          src: url, fullSrc: url, alt: name, title: name,
          photoTypeId, propertyPhotoId: res.data.propertyPhotoId,
          photoTypeCode: activeCategory.photoTypeCode,
          hasPhoto: true, remarks: remarks || '', displayOrder,
          documentGuid: res.data.documentGuid,
          wingDetailId: isWingCat && wingDetailId ? Number(wingDetailId) : undefined,
          wingName: isWingCat && wingName ? wingName : undefined,
        };
        const updatedImages = sortByOrder([...activeCategory.images, newImg]);
        onCategoriesChange(patchCategory(categories, selectedCategoryIndex, updatedImages));
        toast.success(t('media.photoUploadedSuccess') || 'Photo uploaded successfully');
        refreshAfterMediaMutation();
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
  }, [activeCategory, categories, selectedCategoryIndex, onCategoriesChange, propertyId, isUploading, t, locale, setViewerIndexAndModeValue, isReplacement, activeIndexToReplace, executeReplaceApi, refreshAfterMediaMutation, societyId, wingDetailId, wingName]);

  const replaceImage = activeIndexToReplace !== null ? activeCategory?.images[activeIndexToReplace] : null;

  return {
    isNamingOpen, setIsNamingOpen, isUploading, isReplacement,
    isAdding, isReplacing, isDeleting,
    handleAddPhoto, handleReplacePhoto,
    handleNamingSubmit, handleDeletePhoto,
    handleSaveEditedPhoto, replaceImage,
  };
}

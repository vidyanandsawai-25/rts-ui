'use client';

import { useState, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useConfirm } from '@/components/common';
import {
  uploadPropertyPhotoAction,
  replacePropertyPhotoAction,
  deletePropertyPhotoAction,
} from '@/app/[locale]/property-tax/ptis/PhotoPlan.action';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';
import { clearDocumentCacheEntry } from '@/components/modules/property-tax/ptis/media/ImageWithFallback';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import type { AdditionalImage } from '@/components/modules/property-tax/ptis/media/MediaImageCards';

interface UseChangeDetectionUploadProps {
  activeCategory: PhotoCategory;
  propertyId?: number;
  onImagesChange: (newImages: AdditionalImage[]) => void;
}

export function useChangeDetectionUpload({
  activeCategory,
  propertyId,
  onImagesChange,
}: UseChangeDetectionUploadProps) {
  const t = useTranslations('ptis');
  const locale = useLocale();
  const { confirm } = useConfirm();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadOrReplaceImage = useCallback(async (file: File, type: 'before' | 'after') => {
    if (isUploading) return;
    if (!propertyId) return toast.error(t('media.propertyIdRequired') || 'PropertyId is required.');

    const displayOrder = type === 'before' ? 1 : 2;
    const idx = activeCategory.images.findIndex(img => img.displayOrder === displayOrder);
    const existingImg = idx !== -1 ? activeCategory.images[idx] : null;
    const isCustom = existingImg && existingImg.propertyPhotoId !== 9998 && existingImg.propertyPhotoId !== 9999;
    const name = type === 'before' ? 'Before (Old) Image' : 'After (New) Image';

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('File', file);
      formData.append('Remarks', name);

      if (isCustom && existingImg?.propertyPhotoId) {
        const res = await replacePropertyPhotoAction(existingImg.propertyPhotoId, formData, locale);
        if (res.success && res.data) {
          clearDocumentCacheEntry(existingImg.src);
          const url = res.data.viewUrl || getViewDocumentUrl(res.data.documentGuid);
          onImagesChange(activeCategory.images.map((img, i) => i === idx ? { ...img, src: url, fullSrc: url } : img));
          toast.success(t('media.photoReplacedSuccess') || 'Photo replaced successfully');
        } else {
          toast.error(res.error || t('media.failedToReplace') || 'Failed to replace photo');
        }
      } else {
        formData.append('PropertyId', propertyId.toString());
        formData.append('PhotoTypeId', activeCategory.photoTypeId.toString());
        formData.append('DisplayOrder', displayOrder.toString());
        const res = await uploadPropertyPhotoAction(formData, locale);
        if (res.success && res.data) {
          const url = res.data.viewUrl || getViewDocumentUrl(res.data.documentGuid);
          const newImg: AdditionalImage = {
            src: url, fullSrc: url, alt: name, title: name,
            photoTypeId: activeCategory.photoTypeId, propertyPhotoId: res.data.propertyPhotoId,
            photoTypeCode: activeCategory.photoTypeCode, hasPhoto: true, remarks: '', displayOrder,
          };
          onImagesChange(activeCategory.images.map(img => img.displayOrder === displayOrder ? newImg : img));
          toast.success(t('media.photoUploadedSuccess') || 'Photo uploaded successfully');
        } else {
          toast.error(res.error || t('media.failedToUpload') || 'Failed to upload photo');
        }
      }
    } catch {
      toast.error(t('media.unexpectedError') || 'An unexpected error occurred.');
    } finally {
      setIsUploading(false);
    }
  }, [isUploading, activeCategory, propertyId, locale, onImagesChange, t]);

  const handleDeleteImage = useCallback(async (type: 'before' | 'after') => {
    if (isUploading) return;
    const displayOrder = type === 'before' ? 1 : 2;
    const idx = activeCategory.images.findIndex(img => img.displayOrder === displayOrder);
    if (idx === -1) return;
    const img = activeCategory.images[idx];
    if (img.propertyPhotoId === 9998 || img.propertyPhotoId === 9999) return;

    confirm({
      title: t('media.deleteImageTitle') || 'Delete Photo',
      description: t('media.deleteImageDescription', { name: img.title }) || `Are you sure you want to delete "${img.title}"?`,
      onConfirm: async () => {
        setIsUploading(true);
        try {
          const res = await deletePropertyPhotoAction(img.propertyPhotoId!, locale);
          if (res.success) {
            toast.success(t('media.photoDeletedSuccess') || 'Photo deleted successfully');
            const defaultImg: AdditionalImage = {
              src: type === 'before' ? '/images/thane-earth-2018.jpg' : '/images/thane-earth-2026.jpg',
              fullSrc: type === 'before' ? '/images/thane-earth-2018.jpg' : '/images/thane-earth-2026.jpg',
              alt: type === 'before' ? '2018 Satellite View' : '2026 Satellite View',
              title: type === 'before' ? '2018 Satellite View' : '2026 Satellite View',
              photoTypeId: activeCategory.photoTypeId, photoTypeCode: 'CHANGE_DETECTION',
              propertyPhotoId: type === 'before' ? 9998 : 9999, hasPhoto: true, displayOrder,
            };
            onImagesChange(activeCategory.images.map((item, i) => i === idx ? defaultImg : item));
          } else {
            toast.error(res.error || t('media.failedToDelete') || 'Failed to delete photo');
          }
        } catch {
          toast.error(t('media.unexpectedError') || 'An unexpected error occurred.');
        } finally {
          setIsUploading(false);
        }
      }
    });
  }, [isUploading, activeCategory, confirm, locale, onImagesChange, t]);

  return {
    isUploading,
    handleUploadOrReplaceImage,
    handleDeleteImage,
  };
}

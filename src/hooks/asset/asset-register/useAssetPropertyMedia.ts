'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import type { PropertyPhotoDto } from '@/types/asset/asset-register/media.types';
import { getViewDocumentUrl } from '@/lib/utils/document-utils';

export interface UsePropertyMediaProps {
  initialPhotos?: PropertyPhotoDto[];
}

export function usePropertyMedia({
  initialPhotos = [],
}: UsePropertyMediaProps) {
  const tAsset = useTranslations('assetRegister');
  const [hoverPreview, setHoverPreview] = useState<{ src: string; src2?: string; title: string } | null>(null);

  // Directly locate primary photos from initialPhotos array
  const propertyPhoto = useMemo(() => {
    const p = initialPhotos.find(
      (img) =>
        img.photoTypeCode?.toUpperCase() === 'ASSET_PHOTO' ||
        img.photoTypeCode?.toUpperCase() === 'ASSET PHOTO'
    );
    if (!p) return null;
    const resolvedUrl = p.documentGuid ? getViewDocumentUrl(p.documentGuid) : p.viewUrl;
    return {
      src: resolvedUrl || '',
      fullSrc: resolvedUrl || '',
      alt: tAsset('Asset_Image') || 'Asset Photo',
      title: tAsset('Asset_Image') || 'Asset Photo',
    };
  }, [initialPhotos, tAsset]);

  const photoPlanPhoto = useMemo(() => {
    const p = initialPhotos.find(
      (img) =>
        img.photoTypeCode?.toUpperCase() === 'PHOTO_PLAN' ||
        img.photoTypeCode?.toUpperCase() === 'PHOTO PLAN'
    );
    if (!p) return null;
    const resolvedUrl = p.documentGuid ? getViewDocumentUrl(p.documentGuid) : p.viewUrl;
    return {
      src: resolvedUrl || '',
      fullSrc: resolvedUrl || '',
      alt: tAsset('Photo_Plan') || 'Photo Plan',
      title: tAsset('Photo_Plan') || 'Photo Plan',
    };
  }, [initialPhotos, tAsset]);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageHover = useCallback((src: string, title: string, src2?: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoverPreview({ src, src2, title });
  }, []);

  const handleImageLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverPreview(null);
      hoverTimeoutRef.current = null;
    }, 150);
  }, []);

  const cancelImageLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const t = useCallback((key: string) => {
    if (key === 'media.propertyPhoto') {
      return tAsset('Asset_Image') || 'Asset Photo';
    }
    if (key === 'media.photoPlan') {
      return tAsset('Photo_Plan') || 'Photo Plan';
    }
    return '';
  }, [tAsset]);

  return {
    hoverPreview,
    photoPlanPhoto,
    propertyPhoto,
    handleImageHover,
    handleImageLeave,
    cancelImageLeave,
    t,
  };
}

'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import {
  mapSlotsToCategories,
  findCategory,
} from '@/components/modules/property-tax/ptis/media/mediaData';

export interface UsePropertyMediaProps {
  initialPhotoSlots?: PropertyPhotoTypeWithStatusDto[];
  initialPhotos?: PropertyPhotoDto[];
  propertyId?: number;
}

function areSlotsEqual(a: PropertyPhotoTypeWithStatusDto[], b: PropertyPhotoTypeWithStatusDto[]) {
  if (a.length !== b.length) return false;
  return a.every((slot, i) => {
    const other = b[i];
    return (
      slot.photoTypeId === other?.photoTypeId &&
      slot.photoTypeCode === other?.photoTypeCode &&
      slot.hasPhoto === other?.hasPhoto &&
      slot.photoCount === other?.photoCount &&
      slot.propertyPhotoId === other?.propertyPhotoId &&
      slot.viewUrl === other?.viewUrl
    );
  });
}

function arePhotosEqual(a: PropertyPhotoDto[], b: PropertyPhotoDto[]) {
  if (a.length !== b.length) return false;
  return a.every((photo, i) => {
    const other = b[i];
    return (
      photo.propertyPhotoId === other?.propertyPhotoId &&
      photo.photoTypeId === other?.photoTypeId &&
      photo.viewUrl === other?.viewUrl &&
      photo.displayOrder === other?.displayOrder
    );
  });
}

export function usePropertyMedia({
  initialPhotoSlots = [],
  initialPhotos = [],
  propertyId,
}: UsePropertyMediaProps) {
  const t = useTranslations('ptis');
  const [showMoreImages, setShowMoreImages] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<{
    src: string;
    src2?: string;
    title: string;
    beforeLabel?: string;
    afterLabel?: string;
  } | null>(null);
  const [photos, setPhotos] = useState<PropertyPhotoDto[]>(initialPhotos);
  const [fullyLoadedIds, setFullyLoadedIds] = useState<Set<number>>(() => new Set());

  const prevPhotosRef = useRef<PropertyPhotoDto[]>(initialPhotos);
  const prevSlotsRef = useRef<PropertyPhotoTypeWithStatusDto[]>(initialPhotoSlots);

  useEffect(() => {
    if (!arePhotosEqual(initialPhotos, prevPhotosRef.current)) {
      setPhotos(initialPhotos);
      prevPhotosRef.current = initialPhotos;
    }
  }, [initialPhotos]);

  useEffect(() => {
    if (!areSlotsEqual(initialPhotoSlots, prevSlotsRef.current)) {
      setFullyLoadedIds(new Set());
      prevSlotsRef.current = initialPhotoSlots;
    }
  }, [initialPhotoSlots]);

  const categories = useMemo(
    () => mapSlotsToCategories(initialPhotoSlots, photos, fullyLoadedIds, t),
    [initialPhotoSlots, photos, fullyLoadedIds, t]
  );

  const handleCategoriesChange = useCallback(
    (newCats: PhotoCategory[]) => {
      const updated: PropertyPhotoDto[] = [];
      newCats.forEach((c) =>
        c.images.forEach((img) => {
          if (img.propertyPhotoId && img.hasPhoto) {
            updated.push({
              propertyPhotoId: img.propertyPhotoId,
              propertyId: propertyId || 0,
              photoTypeId: img.photoTypeId || 0,
              photoTypeCode: img.photoTypeCode || '',
              photoTypeName: c.photoTypeName,
              displayOrder: img.displayOrder,
              remarks: img.remarks ? `${img.title} | ${img.remarks}` : img.title,
              viewUrl: img.src,
            });
          }
        })
      );
      setPhotos(updated);
    },
    [propertyId]
  );

  const [photoPlanCategory, propertyPhotoCategory] = useMemo(
    () => [
      findCategory(categories, ['PHOTO_PLAN'], ['photo plan', 'plan']),
      findCategory(categories, ['PROPERTY_PHOTO', 'PROPERTY'], ['property']) ||
        findCategory(categories, ['FRONT', 'BUILDING_PHOTO', 'BUILDING'], ['front', 'building']),
    ],
    [categories]
  );

  const gisCategory = useMemo(
    () => findCategory(categories, ['GIS'], ['gis', 'satellite view']),
    [categories]
  );

  const gisPhoto = useMemo(() => {
    const photo = gisCategory?.images?.[0];
    return {
      src: '/gis_static.png',
      fullSrc: '/gis_static.png',
      alt: photo?.alt || t('media.satelliteView') || 'Satellite View',
      title: photo?.title || t('media.satelliteView') || 'Satellite View',
      photoTypeId: photo?.photoTypeId || gisCategory?.photoTypeId || 0,
      photoTypeCode: photo?.photoTypeCode || gisCategory?.photoTypeCode || 'GIS',
      propertyPhotoId: photo?.propertyPhotoId,
    };
  }, [gisCategory, t]);

  const photoPlanPhoto = photoPlanCategory?.images[0];
  const propertyPhoto = propertyPhotoCategory?.images[0];

  const remainingImages = useMemo(() => {
    const all = categories.flatMap((c) => c.images);
    return all.filter((img) => {
      const code = img.photoTypeCode?.toUpperCase() || '';
      if (code === 'FLOOR' || code === 'GIS' || code === 'CHANGE_DETECTION') return false;
      if (propertyPhoto && img.propertyPhotoId === propertyPhoto.propertyPhotoId) return false;
      if (photoPlanPhoto && img.propertyPhotoId === photoPlanPhoto.propertyPhotoId) return false;
      return true;
    });
  }, [categories, propertyPhoto, photoPlanPhoto]);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageHover = useCallback(
    (src: string, title: string, src2?: string, beforeLabel?: string, afterLabel?: string) => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setHoverPreview({ src, src2, title, beforeLabel, afterLabel });
    },
    []
  );

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

  return {
    showMoreImages,
    setShowMoreImages,
    hoverPreview,
    photos,
    setPhotos,
    fullyLoadedIds,
    setFullyLoadedIds,
    categories,
    handleCategoriesChange,
    photoPlanCategory,
    propertyPhotoCategory,
    gisCategory,
    gisPhoto,
    photoPlanPhoto,
    propertyPhoto,
    remainingImages,
    handleImageHover,
    handleImageLeave,
    cancelImageLeave,
    t,
  };
}

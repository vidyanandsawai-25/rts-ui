'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import { mapSlotsToCategories, findCategory } from '@/components/modules/property-tax/ptis/media/mediaData';

export interface UsePropertyMediaProps {
  initialPhotoSlots?: PropertyPhotoTypeWithStatusDto[];
  initialPhotos?: PropertyPhotoDto[];
  propertyId?: number;
}

export function usePropertyMedia({
  initialPhotoSlots = [],
  initialPhotos = [],
  propertyId,
}: UsePropertyMediaProps) {
  const t = useTranslations('ptis');
  const [showMoreImages, setShowMoreImages] = useState(false);
  const [hoverPreview, setHoverPreview] = useState<{ src: string; title: string } | null>(null);
  const [photos, setPhotos] = useState<PropertyPhotoDto[]>(initialPhotos);
  const [prevInitialPhotos, setPrevInitialPhotos] = useState<PropertyPhotoDto[]>(initialPhotos);
  const [fullyLoadedIds, setFullyLoadedIds] = useState<Set<number>>(() => new Set());
  const [prevInitialPhotoSlots, setPrevInitialPhotoSlots] = useState<PropertyPhotoTypeWithStatusDto[]>(initialPhotoSlots);

  if (initialPhotos !== prevInitialPhotos) {
    setPhotos(initialPhotos);
    setPrevInitialPhotos(initialPhotos);
  }

  if (initialPhotoSlots !== prevInitialPhotoSlots) {
    setFullyLoadedIds(new Set());
    setPrevInitialPhotoSlots(initialPhotoSlots);
  }

  const categories = useMemo(
    () => mapSlotsToCategories(initialPhotoSlots, photos, fullyLoadedIds, t),
    [initialPhotoSlots, photos, fullyLoadedIds, t]
  );

  const handleCategoriesChange = useCallback((newCats: PhotoCategory[]) => {
    const updated: PropertyPhotoDto[] = [];
    newCats.forEach(c => c.images.forEach(img => {
      if (img.propertyPhotoId) {
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
    }));
    setPhotos(updated);
  }, [propertyId]);

  const [photoPlanCategory, propertyPhotoCategory] = useMemo(() => [
    findCategory(categories, ['PHOTO_PLAN'], ['photo plan', 'plan']),
    findCategory(categories, ['PROPERTY_PHOTO', 'PROPERTY'], ['property']),
  ], [categories]);

  const gisCategory = useMemo(() =>
    findCategory(categories, ['GIS'], ['gis', 'satellite view']),
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
      if (code === 'FLOOR' || code === 'GIS') return false;
      if (propertyPhoto && img.propertyPhotoId === propertyPhoto.propertyPhotoId) return false;
      if (photoPlanPhoto && img.propertyPhotoId === photoPlanPhoto.propertyPhotoId) return false;
      return true;
    });
  }, [categories, propertyPhoto, photoPlanPhoto]);

  const handleImageHover = useCallback((src: string, title: string) => {
    setHoverPreview({ src, title });
  }, []);

  const handleImageLeave = useCallback(() => {
    setHoverPreview(null);
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
    t,
  };
}

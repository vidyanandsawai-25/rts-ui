/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import {
  mapSlotsToCategories,
  findCategory,
} from '@/components/modules/property-tax/ptis/media/mediaData';
import { propertyMediaCache, areSlotsEqual, arePhotosEqual, evictOldestCacheEntry } from './usePropertyPhotosQuery';
import { useImageHoverPreview } from './useImageHoverPreview';
import { type WaybackRelease, WAYBACK_STATIC_TILE_URL } from '@/lib/api/wayback.service';
import { latLngToTile } from '@/lib/utils/coordinate-utils';

export interface UsePropertyMediaProps {
  initialPhotoSlots?: PropertyPhotoTypeWithStatusDto[];
  initialPhotos?: PropertyPhotoDto[];
  propertyId?: number;
  initialLatitude?: number;
  initialLongitude?: number;
  initialWaybackReleases?: WaybackRelease[];
  onPhotosChange?: (photos: PropertyPhotoDto[]) => void;
  onPhotoSlotsChange?: (slots: PropertyPhotoTypeWithStatusDto[]) => void;
}



export function usePropertyMedia({
  initialPhotoSlots = [],
  initialPhotos = [],
  propertyId,
  initialLatitude,
  initialLongitude,
  initialWaybackReleases = [],
  onPhotosChange,
  onPhotoSlotsChange,
}: UsePropertyMediaProps) {
  const t = useTranslations('ptis');
  const [showMoreImages, setShowMoreImages] = useState(false);
  const { hoverPreview, handleImageHover, handleImageLeave, cancelImageLeave, resetHoverPreview } = useImageHoverPreview();
  const [photos, setPhotos] = useState<PropertyPhotoDto[]>(initialPhotos);
  const [fullyLoadedIds, setFullyLoadedIds] = useState<Set<number>>(() => new Set());

  const prevPropertyIdRef = useRef(propertyId);
  const prevPhotosRef = useRef<PropertyPhotoDto[]>(initialPhotos);
  const prevSlotsRef = useRef<PropertyPhotoTypeWithStatusDto[]>(initialPhotoSlots);
  useEffect(() => {
    if (propertyId !== prevPropertyIdRef.current) {
      prevPropertyIdRef.current = propertyId;
      resetHoverPreview();
      setFullyLoadedIds(new Set());
      if (propertyId && propertyMediaCache.has(propertyId)) {
        setPhotos(propertyMediaCache.get(propertyId)!.photos);
      } else {
        setPhotos(initialPhotos);
      }
    }
  }, [propertyId, initialPhotos, resetHoverPreview]);

  useEffect(() => {
    if (!arePhotosEqual(initialPhotos, prevPhotosRef.current)) {
      resetHoverPreview();
      setPhotos(initialPhotos);
      prevPhotosRef.current = initialPhotos;
    }
  }, [initialPhotos, resetHoverPreview]);

  useEffect(() => {
    if (!areSlotsEqual(initialPhotoSlots, prevSlotsRef.current)) {
      resetHoverPreview();
      setFullyLoadedIds(new Set());
      prevSlotsRef.current = initialPhotoSlots;
    }
  }, [initialPhotoSlots, resetHoverPreview]);

  const categories = useMemo(
    () => mapSlotsToCategories(initialPhotoSlots, photos, fullyLoadedIds, t),
    [initialPhotoSlots, photos, fullyLoadedIds, t]
  );

  const handleCategoriesChange = useCallback(
    (newCats: PhotoCategory[]) => {
      resetHoverPreview();
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

      // Revalidate/update slots locally to keep front-end state in sync
      const updatedSlots = initialPhotoSlots.map((slot) => {
        const cat = newCats.find((c) => c.photoTypeId === slot.photoTypeId);
        if (!cat) return slot;
        const catPhotos = updated.filter((p) => p.photoTypeId === slot.photoTypeId);
        const hasAnyPhoto = catPhotos.length > 0;
        const firstPhoto = catPhotos[0];
        return {
          ...slot,
          hasPhoto: hasAnyPhoto,
          photoCount: catPhotos.length,
          propertyPhotoId: firstPhoto?.propertyPhotoId,
          viewUrl: firstPhoto?.viewUrl,
        };
      });

      onPhotosChange?.(updated);
      onPhotoSlotsChange?.(updatedSlots);

      // Update client cache to avoid stale values if drawer is closed/reopened
      if (propertyId) {
        propertyMediaCache.set(propertyId, {
          photoSlots: updatedSlots,
          photos: updated,
          timestamp: Date.now(),
        });
        evictOldestCacheEntry();
      }
    },
    [propertyId, initialPhotoSlots, onPhotosChange, onPhotoSlotsChange, resetHoverPreview]
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

  const hasCoords =
    typeof initialLatitude === 'number' &&
    Number.isFinite(initialLatitude) &&
    typeof initialLongitude === 'number' &&
    Number.isFinite(initialLongitude);

  const gisPhoto = useMemo(() => {
    const photo = gisCategory?.images?.[0];
    let srcVal = '';
    if (hasCoords) {
      if (initialWaybackReleases && initialWaybackReleases.length > 0) {
        const latestRelease = initialWaybackReleases[initialWaybackReleases.length - 1];
        const tile = latLngToTile(initialLatitude!, initialLongitude!, 17);
        srcVal = WAYBACK_STATIC_TILE_URL(latestRelease.releaseId, tile.x, tile.y, tile.z);
      } else {
        srcVal = '/gis_static.png';
      }
    }
    return {
      src: srcVal,
      fullSrc: srcVal,
      alt: photo?.alt || t('media.satelliteView') || 'Satellite View',
      title: photo?.title || t('media.satelliteView') || 'Satellite View',
      photoTypeId: photo?.photoTypeId || gisCategory?.photoTypeId || 0,
      photoTypeCode: photo?.photoTypeCode || gisCategory?.photoTypeCode || 'GIS',
      propertyPhotoId: photo?.propertyPhotoId,
    };
  }, [gisCategory, t, hasCoords, initialLatitude, initialLongitude, initialWaybackReleases]);

  const photoPlanPhoto = photoPlanCategory?.images && photoPlanCategory.images.length > 0
    ? photoPlanCategory.images[photoPlanCategory.images.length - 1]
    : undefined;
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
    resetHoverPreview,
    t,
  };
}

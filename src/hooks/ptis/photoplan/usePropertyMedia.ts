/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';
import type { PhotoCategory } from '@/components/modules/property-tax/ptis/media/PhotoPlanSidebar';
import {
  mapSlotsToCategories,
  findCategory,
} from '@/components/modules/property-tax/ptis/media/mediaData';
import {
  propertyMediaCache,
  areSlotsEqual,
  arePhotosEqual,
  evictOldestCacheEntry,
} from './usePropertyPhotosQuery';
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
  wings?: unknown[];
  isMainProperty?: boolean;
  categoryId?: number | null;
  propertyTypeId?: number | null;
  entityType?: string;
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
  wings: _wings,
  isMainProperty = false,
  categoryId = null,
  propertyTypeId = null,
  entityType,
}: UsePropertyMediaProps) {
  const t = useTranslations('ptis');
  const [showMoreImages, setShowMoreImages] = useState(false);
  const { hoverPreview, handleImageHover, handleImageLeave, cancelImageLeave, resetHoverPreview } =
    useImageHoverPreview();
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

  const searchParams = useSearchParams();
  const selectedWingId = searchParams?.get('wingId');
  const selectedWingDetailId = searchParams?.get('wingDetailId') ? Number(searchParams.get('wingDetailId')) : null;

  const matchedWing = useMemo(() => {
    return (_wings as { wingDetailId?: number; wingMasterId?: number; wingName?: string; wingNo?: string }[] | undefined)?.find(
      (w) =>
        (selectedWingDetailId && w.wingDetailId === selectedWingDetailId) ||
        (selectedWingId && String(w.wingMasterId) === selectedWingId)
    );
  }, [_wings, selectedWingId, selectedWingDetailId]);

  const selectedWingName = matchedWing
    ? (matchedWing.wingName || `${matchedWing.wingNo} Wing`)
    : (searchParams?.get('wingName') || undefined);

  const categories = useMemo(
    () => mapSlotsToCategories(initialPhotoSlots, photos, fullyLoadedIds, t, selectedWingName, selectedWingDetailId, isMainProperty, categoryId, propertyTypeId, entityType),
    [initialPhotoSlots, photos, fullyLoadedIds, t, selectedWingName, selectedWingDetailId, isMainProperty, categoryId, propertyTypeId, entityType]
  );

  const handleCategoriesChange = useCallback(
    (newCats: PhotoCategory[]) => {
      resetHoverPreview();
      const updated: PropertyPhotoDto[] = [];
      newCats.forEach((c) =>
        c.images.forEach((img) => {
          if ((img.propertyPhotoId !== undefined || img.documentGuid || img.src) && img.hasPhoto) {
            updated.push({
              propertyPhotoId: img.propertyPhotoId || 0,
              propertyId: propertyId || 0,
              photoTypeId: img.photoTypeId || c.photoTypeId || 0,
              photoTypeCode: img.photoTypeCode || c.photoTypeCode || '',
              photoTypeName: c.photoTypeName,
              displayOrder: img.displayOrder,
              remarks: img.remarks ? `${img.title} | ${img.remarks}` : img.title,
              viewUrl: img.src,
              downloadUrl: img.downloadUrl,
              documentGuid: img.documentGuid,
              wingDetailId: img.wingDetailId,
              wingName: img.wingName,
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

  const isAmenityProperty = useMemo(() => {
    return categories.some(c => {
      const code = c.photoTypeCode?.toUpperCase() || '';
      return code === 'AMENITY_PHOTO' || code === 'AMENITY';
    });
  }, [categories]);

  const photoPlanCategory = useMemo(
    () =>
      findCategory(
        categories,
        ['PROPERTY_PLAN', 'PHOTO_PLAN'],
        ['property plan', 'photo plan']
      ),
    [categories]
  );

  // For propertyPhotoCategory, exclude plan categories to avoid matching PROPERTY_PLAN via includes('PROPERTY')
  const propertyPhotoCategory = useMemo(() => {
    const planCodes = ['PROPERTY_PLAN', 'PHOTO_PLAN', 'PLAN', 'DRAW_PLAN'];
    const amenityCodes = ['AMENITY_PHOTO', 'AMENITY'];
    const excluded = new Set([...planCodes, ...amenityCodes]);

    // Find a property photo category that is NOT a plan or amenity type
    const match = categories.find(c => {
      const code = c.photoTypeCode?.toUpperCase() || '';
      if (excluded.has(code)) return false;
      return code === 'PROPERTY_PHOTO' || code === 'PROPERTY';
    });

    if (match) return match;

    // Fallback to front/building
    return findCategory(categories, ['FRONT', 'BUILDING_PHOTO', 'BUILDING'], ['front', 'building']);
  }, [categories]);

  const amenityPhotoCategory = useMemo(
    () => findCategory(categories, ['AMENITY_PHOTO', 'AMENITY'], ['amenity photo', 'amenity']),
    [categories]
  );
  const amenityPhoto = amenityPhotoCategory?.images?.[0];

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

  const signatureCategory = useMemo(
    () =>
      findCategory(categories, ['SIGNATURE', 'OWNER_SIGNATURE'], ['signature', 'owner signature']),
    [categories]
  );

  const signaturePhoto = signatureCategory?.images?.[0];

  const photoPlanPhoto =
    photoPlanCategory?.images && photoPlanCategory.images.length > 0
      ? photoPlanCategory.images[photoPlanCategory.images.length - 1]
      : undefined;
  const propertyPhoto = propertyPhotoCategory?.images[0];

  const remainingImages = useMemo(() => {
    const all = categories.flatMap((c) => c.images);
    return all.filter((img) => {
      const code = img.photoTypeCode?.toUpperCase() || '';
      if (
        code === 'FLOOR' ||
        code === 'GIS' ||
        code === 'CHANGE_DETECTION' ||
        code.includes('SIGNATURE')
      )
        return false;
      if (propertyPhoto && img.propertyPhotoId === propertyPhoto.propertyPhotoId) return false;
      if (photoPlanPhoto && img.propertyPhotoId === photoPlanPhoto.propertyPhotoId) return false;
      return true;
    });
  }, [categories, propertyPhoto, photoPlanPhoto]);

  const societyPhotoCategory = useMemo(
    () => findCategory(categories, ['SOCIETY', 'SOCIETY_BUILDING'], ['society', 'society building']),
    [categories]
  );
  const societyPhoto = societyPhotoCategory?.images?.[0];

  const wingPhotoCategory = useMemo(
    () => findCategory(categories, ['WING_BUILDING', 'WING_PHOTO', 'WING'], ['wing building', 'wing photo', 'wing']),
    [categories]
  );
  const wingPhoto = wingPhotoCategory?.images?.[0];

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
    societyPhotoCategory,
    wingPhotoCategory,
    amenityPhotoCategory,
    gisCategory,
    gisPhoto,
    photoPlanPhoto,
    propertyPhoto,
    societyPhoto,
    wingPhoto,
    amenityPhoto,
    isAmenityProperty,
    remainingImages,
    handleImageHover,
    handleImageLeave,
    cancelImageLeave,
    resetHoverPreview,
    signatureCategory,
    signaturePhoto,
    t,
  };
}

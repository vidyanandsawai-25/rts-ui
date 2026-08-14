/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';

export interface UsePropertyPhotosQueryResult {
  loading: boolean;
  photoSlots: PropertyPhotoTypeWithStatusDto[];
  photos: PropertyPhotoDto[];
  error: string | null;
  refetch: () => Promise<void>;
  setPhotoSlots: React.Dispatch<React.SetStateAction<PropertyPhotoTypeWithStatusDto[]>>;
  setPhotos: React.Dispatch<React.SetStateAction<PropertyPhotoDto[]>>;
}

// Client-side module-level cache keyed by propertyId with LRU eviction
export const propertyMediaCache = new Map<number, {
  photoSlots: PropertyPhotoTypeWithStatusDto[];
  photos: PropertyPhotoDto[];
  timestamp: number;
}>();

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_SIZE = 10;

export function evictOldestCacheEntry(): void {
  if (propertyMediaCache.size <= MAX_CACHE_SIZE) return;
  let oldestKey: number | null = null;
  let oldestTime = Infinity;
  propertyMediaCache.forEach((entry, key) => {
    if (entry.timestamp < oldestTime) { oldestTime = entry.timestamp; oldestKey = key; }
  });
  if (oldestKey !== null) propertyMediaCache.delete(oldestKey);
}

export function isCacheValid(propertyId: number): boolean {
  if (!propertyMediaCache.has(propertyId)) return false;
  const entry = propertyMediaCache.get(propertyId)!;
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

export function areSlotsEqual(a: PropertyPhotoTypeWithStatusDto[], b: PropertyPhotoTypeWithStatusDto[]) {
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

export function arePhotosEqual(a: PropertyPhotoDto[], b: PropertyPhotoDto[]) {
  if (a.length !== b.length) return false;
  return a.every((photo, i) => {
    const other = b[i];
    return (
      photo.propertyPhotoId === other?.propertyPhotoId &&
      photo.photoTypeId === other?.photoTypeId &&
      photo.photoTypeCode === other?.photoTypeCode &&
      photo.viewUrl === other?.viewUrl &&
      photo.downloadUrl === other?.downloadUrl &&
      photo.documentGuid === other?.documentGuid &&
      photo.displayOrder === other?.displayOrder &&
      photo.remarks === other?.remarks &&
      photo.fileName === other?.fileName &&
      photo.mimeType === other?.mimeType
    );
  });
}

import { getPhotoSlotsAction, getPropertyPhotosAction } from '@/app/[locale]/property-tax/ptis/media-fetch.action';

export function usePropertyPhotosQuery(
  propertyId?: number,
  isPanelOpen?: boolean,
  isDrawerOpen?: boolean,
  initialPhotoSlots: PropertyPhotoTypeWithStatusDto[] = [],
  initialPhotos: PropertyPhotoDto[] = []
): UsePropertyPhotosQueryResult {
  const [photoSlots, setPhotoSlots] = useState<PropertyPhotoTypeWithStatusDto[]>(() => {
    if (propertyId && propertyMediaCache.has(propertyId)) {
      return propertyMediaCache.get(propertyId)!.photoSlots;
    }
    return initialPhotoSlots;
  });

  const [photos, setPhotos] = useState<PropertyPhotoDto[]>(() => {
    if (propertyId && propertyMediaCache.has(propertyId)) {
      return propertyMediaCache.get(propertyId)!.photos;
    }
    return initialPhotos;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setPhotoSlots([]);
      setPhotos([]);
      setLoading(false);
      setError(null);
      return;
    }

    if (propertyMediaCache.has(propertyId)) {
      const cached = propertyMediaCache.get(propertyId)!;
      setPhotoSlots(cached.photoSlots);
      setPhotos(cached.photos);
    } else {
      setPhotoSlots(initialPhotoSlots);
      setPhotos(initialPhotos);
    }
  }, [propertyId, initialPhotoSlots, initialPhotos]);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const shouldFetch = !!propertyId && (!!isPanelOpen || !!isDrawerOpen);
    if (!shouldFetch) return;

    const cacheValid = isCacheValid(propertyId!);
    let isSubscribed = true;

    if (!cacheValid) {
      setLoading(true);
      setError(null);

      Promise.all([
        getPhotoSlotsAction(propertyId!),
        getPropertyPhotosAction(propertyId!),
      ])
        .then(([slotsRes, photosRes]) => {
          if (!isSubscribed) return;

          if (!slotsRes.success || !photosRes.success) {
            const errMessage =
              (!slotsRes.success ? slotsRes.error : null) ||
              (!photosRes.success ? photosRes.error : null) ||
              'Failed to load property media';
            setError(errMessage);
            return;
          }

          const slots = slotsRes.data || [];
          const fetchedPhotos = photosRes.data || [];

          setPhotoSlots(slots);
          setPhotos(fetchedPhotos);

          propertyMediaCache.set(propertyId!, {
            photoSlots: slots,
            photos: fetchedPhotos,
            timestamp: Date.now(),
          });
          evictOldestCacheEntry();
        })
        .catch((err) => {
          if (isSubscribed) {
            setError(err instanceof Error ? err.message : 'Failed to load property media');
          }
        })
        .finally(() => {
          if (isSubscribed) setLoading(false);
        });
    }

    return () => {
      isSubscribed = false;
    };
  }, [propertyId, isPanelOpen, isDrawerOpen, initialPhotoSlots, initialPhotos]);

  const refetch = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const [slotsRes, photosRes] = await Promise.all([
        getPhotoSlotsAction(propertyId),
        getPropertyPhotosAction(propertyId),
      ]);

      if (!slotsRes.success || !photosRes.success) {
        const errMessage =
          (!slotsRes.success ? slotsRes.error : null) ||
          (!photosRes.success ? photosRes.error : null) ||
          'Failed to reload property media';
        setError(errMessage);
        return;
      }

      const fetchedSlots = slotsRes.data || [];
      const fetchedPhotos = photosRes.data || [];

      setPhotoSlots(fetchedSlots);
      setPhotos(fetchedPhotos);

      propertyMediaCache.set(propertyId, {
        photoSlots: fetchedSlots,
        photos: fetchedPhotos,
        timestamp: Date.now(),
      });
      evictOldestCacheEntry();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reload property media');
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  return {
    loading,
    photoSlots,
    photos,
    error,
    refetch,
    setPhotoSlots,
    setPhotos,
  };
}

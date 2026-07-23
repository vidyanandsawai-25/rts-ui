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

import { getPhotoSlotsAction } from '@/app/[locale]/property-tax/ptis/media-fetch.action';

export function usePropertyPhotosQuery(
  propertyId?: number,
  isPanelOpen?: boolean,
  _isDrawerOpen?: boolean,
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
    if (!propertyId || !isPanelOpen) return;

    const cacheValid = isCacheValid(propertyId);
    let isSubscribed = true;
    
    if (!cacheValid) {
      setLoading(true);
      getPhotoSlotsAction(propertyId)
        .then((res) => {
          if (!isSubscribed) return;
          if (res.success && res.data) {
            setPhotoSlots(res.data);
            propertyMediaCache.set(propertyId, {
              photoSlots: res.data,
              photos: propertyMediaCache.get(propertyId)?.photos || [],
              timestamp: Date.now(),
            });
            evictOldestCacheEntry();
          } else {
            setError(res.error || 'Failed to load photo categories');
          }
        })
        .catch(() => {
          if (isSubscribed) setError('Failed to load photo categories');
        })
        .finally(() => {
          if (isSubscribed) setLoading(false);
        });
    }

    return () => {
      isSubscribed = false;
    };
  }, [propertyId, isPanelOpen]);

  const refetch = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const slotsRes = await getPhotoSlotsAction(propertyId);

      if (slotsRes.success && slotsRes.data) {
        setPhotoSlots(slotsRes.data);
      } else {
        setError(slotsRes.error || 'Failed to load photo categories');
      }

      propertyMediaCache.set(propertyId, {
        photoSlots: slotsRes.success ? (slotsRes.data ?? photoSlots) : photoSlots,
        photos,
        timestamp: Date.now(),
      });
      evictOldestCacheEntry();
    } catch {
      setError('Failed to load photo categories');
    } finally {
      setLoading(false);
    }
  }, [propertyId, photoSlots, photos]);

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

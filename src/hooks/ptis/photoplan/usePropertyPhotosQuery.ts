'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { PropertyPhotoTypeWithStatusDto, PropertyPhotoDto } from '@/types/photoplan.types';

export interface UsePropertyPhotosQueryResult {
  loading: boolean;
  photoSlots: PropertyPhotoTypeWithStatusDto[];
  photos: PropertyPhotoDto[];
  error: string | null;
  refetch: () => Promise<void>;
}

// Client-side module-level cache keyed by propertyId
export const propertyMediaCache = new Map<number, {
  photoSlots: PropertyPhotoTypeWithStatusDto[];
  photos: PropertyPhotoDto[];
  timestamp: number;
}>();

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function isCacheValid(propertyId: number): boolean {
  if (!propertyMediaCache.has(propertyId)) return false;
  const entry = propertyMediaCache.get(propertyId)!;
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
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

/**
 * Hook to manage property photos and photo slots.
 * Fully SSR-based with client-side cache persistence to avoid redundant API calls.
 */
export function usePropertyPhotosQuery(
  propertyId?: number,
  isPanelOpen?: boolean,
  initialPhotoSlots: PropertyPhotoTypeWithStatusDto[] = [],
  initialPhotos: PropertyPhotoDto[] = []
): UsePropertyPhotosQueryResult {
  // Initialize states using cache if available, otherwise fallback to server props
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

  // Track previous inputs for render-phase sync
  const prevPropertyIdRef = useRef(propertyId);
  const prevSlotsRef = useRef(initialPhotoSlots);
  const prevPhotosRef = useRef(initialPhotos);

  // Sync state if propertyId or initial props change (derived state pattern)
  useEffect(() => {
    const isPropChange =
      propertyId !== prevPropertyIdRef.current ||
      !areSlotsEqual(initialPhotoSlots, prevSlotsRef.current) ||
      !arePhotosEqual(initialPhotos, prevPhotosRef.current);

    if (isPropChange) {
      let nextPhotoSlots = initialPhotoSlots;
      let nextPhotos = initialPhotos;

      if (propertyId && !isPanelOpen) {
        // When panel is closed, props are empty. Retrieve from cache if available.
        if (propertyMediaCache.has(propertyId)) {
          const cached = propertyMediaCache.get(propertyId)!;
          nextPhotoSlots = cached.photoSlots;
          nextPhotos = cached.photos;
        }
      }

      setPhotoSlots(nextPhotoSlots);
      setPhotos(nextPhotos);
      prevPropertyIdRef.current = propertyId;
      prevSlotsRef.current = initialPhotoSlots;
      prevPhotosRef.current = initialPhotos;
    }
  }, [propertyId, isPanelOpen, initialPhotoSlots, initialPhotos]);

  // Side-effect: Update the client-side cache when the panel is open and fresh props are loaded
  useEffect(() => {
    if (propertyId && isPanelOpen) {
      propertyMediaCache.set(propertyId, {
        photoSlots: initialPhotoSlots,
        photos: initialPhotos,
        timestamp: Date.now(),
      });
    }
  }, [propertyId, isPanelOpen, initialPhotoSlots, initialPhotos]);

  const noopRefetch = useCallback(async () => {
    // No-op as we rely on server/cookie sync and local cache
  }, []);

  return {
    loading: false,
    photoSlots,
    photos,
    error: null,
    refetch: noopRefetch,
  };
}

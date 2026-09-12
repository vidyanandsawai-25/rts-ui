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

class PropertyMediaCacheWrapper {
  private cache = new Map<string, {
    photoSlots: PropertyPhotoTypeWithStatusDto[];
    photos: PropertyPhotoDto[];
    timestamp: number;
  }>();

  private getKey(key: string | number): string {
    if (typeof key === 'number') {
      return `${key}_0`;
    }
    return key;
  }

  get size() {
    return this.cache.size;
  }

  has(key: string | number): boolean {
    return this.cache.has(this.getKey(key));
  }

  get(key: string | number) {
    return this.cache.get(this.getKey(key));
  }

  set(key: string | number, value: {
    photoSlots: PropertyPhotoTypeWithStatusDto[];
    photos: PropertyPhotoDto[];
    timestamp: number;
  }) {
    this.cache.set(this.getKey(key), value);
    return this;
  }

  delete(key: string | number): boolean {
    return this.cache.delete(this.getKey(key));
  }

  clear(): void {
    this.cache.clear();
  }

  forEach(callbackfn: (value: {
    photoSlots: PropertyPhotoTypeWithStatusDto[];
    photos: PropertyPhotoDto[];
    timestamp: number;
  }, key: string, map: Map<string, {
    photoSlots: PropertyPhotoTypeWithStatusDto[];
    photos: PropertyPhotoDto[];
    timestamp: number;
  }>) => void): void {
    this.cache.forEach(callbackfn);
  }
}

// Client-side module-level cache keyed by string (propertyId_wingId) with LRU eviction
export const propertyMediaCache = new PropertyMediaCacheWrapper();

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const MAX_CACHE_SIZE = 10;

export function evictOldestCacheEntry(): void {
  if (propertyMediaCache.size <= MAX_CACHE_SIZE) return;
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  propertyMediaCache.forEach((entry, key) => {
    if (entry.timestamp < oldestTime) { oldestTime = entry.timestamp; oldestKey = key; }
  });
  if (oldestKey !== null) propertyMediaCache.delete(oldestKey);
}

export function isCacheValid(key: string | number): boolean {
  if (!propertyMediaCache.has(key)) return false;
  const entry = propertyMediaCache.get(key)!;
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
      photo.mimeType === other?.mimeType &&
      photo.wingDetailId === other?.wingDetailId &&
      photo.wingName === other?.wingName
    );
  });
}

import { getPhotoSlotsAction, getPropertyPhotosAction } from '@/app/[locale]/property-tax/ptis/media-fetch.action';
import { getWingPhotoTypesWithStatusAction, getPhotosByWingAction } from '@/app/[locale]/property-tax/ptis/WingPhoto.action';
import { useSearchParams } from 'next/navigation';

export function usePropertyPhotosQuery(
  propertyId?: number,
  isPanelOpen?: boolean,
  isDrawerOpen?: boolean,
  initialPhotoSlots: PropertyPhotoTypeWithStatusDto[] = [],
  initialPhotos: PropertyPhotoDto[] = []
): UsePropertyPhotosQueryResult {
  const searchParams = useSearchParams();
  const wingIdParam = (searchParams?.get('wingId') || searchParams?.get('wingid')) ? Number(searchParams.get('wingId') || searchParams.get('wingid')) : null;
  const wingDetailIdParam = (searchParams?.get('wingDetailId') || searchParams?.get('wingdetailid')) ? Number(searchParams.get('wingDetailId') || searchParams.get('wingdetailid')) : null;
  const targetWingId = wingDetailIdParam && wingDetailIdParam > 0 ? wingDetailIdParam : wingIdParam;

  const cacheKey = propertyId ? `${propertyId}_${targetWingId || 0}` : '';

  const [photoSlots, setPhotoSlots] = useState<PropertyPhotoTypeWithStatusDto[]>(() => {
    if (propertyId && propertyMediaCache.has(cacheKey)) {
      return propertyMediaCache.get(cacheKey)!.photoSlots;
    }
    return initialPhotoSlots;
  });

  const [photos, setPhotos] = useState<PropertyPhotoDto[]>(() => {
    if (propertyId && propertyMediaCache.has(cacheKey)) {
      return propertyMediaCache.get(cacheKey)!.photos;
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

    if (propertyMediaCache.has(cacheKey)) {
      const cached = propertyMediaCache.get(cacheKey)!;
      setPhotoSlots(cached.photoSlots);
      setPhotos(cached.photos);
    } else {
      setPhotoSlots(initialPhotoSlots);
      setPhotos(initialPhotos);
    }
  }, [propertyId, initialPhotoSlots, initialPhotos, cacheKey]);

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

    const cacheValid = isCacheValid(cacheKey);
    let isSubscribed = true;

    if (!cacheValid) {
      setLoading(true);
      setError(null);

      const promises: Promise<unknown>[] = [
        getPhotoSlotsAction(propertyId!),
        getPropertyPhotosAction(propertyId!),
      ];

      if (targetWingId && targetWingId > 0) {
        promises.push(getWingPhotoTypesWithStatusAction(targetWingId));
        promises.push(getPhotosByWingAction(targetWingId));
      }

      Promise.all(promises)
        .then(([slotsRes, photosRes, wingSlotsRes, wingPhotosRes]) => {
          if (!isSubscribed) return;

          const sRes = slotsRes as { success: boolean; error?: string; data?: PropertyPhotoTypeWithStatusDto[] };
          const pRes = photosRes as { success: boolean; error?: string; data?: PropertyPhotoDto[] };

          if (!sRes.success || !pRes.success) {
            const errMessage =
              (!sRes.success ? sRes.error : null) ||
              (!pRes.success ? pRes.error : null) ||
              'Failed to load property media';
            setError(errMessage);
            return;
          }

          const slots = [...(sRes.data || [])];
          const fetchedPhotos = [...(pRes.data || [])];

          const wSlotsRes = wingSlotsRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
          if (wSlotsRes && wSlotsRes.success && wSlotsRes.data) {
            const mappedWingSlots = wSlotsRes.data.map((ws: Record<string, unknown>) => ({
              photoTypeId: Number(ws.photoTypeId),
              photoTypeCode: String(ws.photoTypeCode || ws.photoTypeSlotCode || ''),
              photoTypeName: String(ws.photoTypeName || ws.photoTypeSlotName || ''),
              displayOrder: Number(ws.displayOrder || 0),
              hasPhoto: Boolean(ws.hasPhoto),
              photoCount: Number(ws.photoCount || 0),
              propertyPhotoId: Number(ws.wingPhotoId || ws.propertyPhotoId || 0),
              remarks: ws.remarks ? String(ws.remarks) : undefined,
              documentBindingId: ws.documentBindingId ? Number(ws.documentBindingId) : undefined,
              documentGuid: ws.documentGuid ? String(ws.documentGuid) : undefined,
              fileName: ws.fileName ? String(ws.fileName) : undefined,
              mimeType: ws.mimeType ? String(ws.mimeType) : undefined,
              viewUrl: ws.viewUrl ? String(ws.viewUrl) : undefined
            }));
            mappedWingSlots.forEach(ws => {
              const existingIdx = slots.findIndex((s) => 
                (s.photoTypeCode && ws.photoTypeCode && s.photoTypeCode.toUpperCase() === ws.photoTypeCode.toUpperCase()) ||
                (s.photoTypeId === ws.photoTypeId && s.photoTypeCode?.toUpperCase().startsWith('WING_'))
              );
              if (existingIdx !== -1) {
                slots[existingIdx] = { ...slots[existingIdx], ...ws };
              } else {
                slots.push(ws as PropertyPhotoTypeWithStatusDto);
              }
            });
          }

          const wPhotosRes = wingPhotosRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
          if (wPhotosRes && wPhotosRes.success && wPhotosRes.data) {
            const mappedWingPhotos = wPhotosRes.data.map((wp: Record<string, unknown>) => ({
              propertyPhotoId: Number(wp.wingPhotoId || wp.propertyPhotoId || 0),
              propertyId: Number(wp.wingId || wp.propertyId || 0),
              photoTypeId: Number(wp.photoTypeId || 0),
              photoTypeCode: String(wp.photoTypeCode || ''),
              photoTypeName: String(wp.photoTypeName || ''),
              displayOrder: Number(wp.displayOrder || 0),
              remarks: wp.remarks ? String(wp.remarks) : undefined,
              documentBindingId: wp.documentBindingId ? Number(wp.documentBindingId) : undefined,
              documentGuid: wp.documentGuid ? String(wp.documentGuid) : undefined,
              fileName: wp.fileName ? String(wp.fileName) : undefined,
              mimeType: wp.mimeType ? String(wp.mimeType) : undefined,
              viewUrl: wp.viewUrl ? String(wp.viewUrl) : undefined,
              downloadUrl: wp.downloadUrl ? String(wp.downloadUrl) : undefined,
              wingDetailId: wp.wingDetailId ? Number(wp.wingDetailId) : undefined,
              wingName: wp.wingName ? String(wp.wingName) : undefined,
            }));
            mappedWingPhotos.forEach(wp => {
              const existingIdx = fetchedPhotos.findIndex((p) => 
                p.propertyPhotoId === wp.propertyPhotoId && 
                (p.wingDetailId === wp.wingDetailId || (!p.wingDetailId && !wp.wingDetailId))
              );
              if (existingIdx !== -1) {
                fetchedPhotos[existingIdx] = { ...fetchedPhotos[existingIdx], ...wp };
              } else {
                fetchedPhotos.push(wp as PropertyPhotoDto);
              }
            });
          }

          setPhotoSlots(slots);
          setPhotos(fetchedPhotos);

          propertyMediaCache.set(cacheKey, {
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
  }, [propertyId, targetWingId, isPanelOpen, isDrawerOpen, initialPhotoSlots, initialPhotos, cacheKey]);

  const refetch = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const promises: Promise<unknown>[] = [
        getPhotoSlotsAction(propertyId),
        getPropertyPhotosAction(propertyId),
      ];

      if (targetWingId && targetWingId > 0) {
        promises.push(getWingPhotoTypesWithStatusAction(targetWingId));
        promises.push(getPhotosByWingAction(targetWingId));
      }

      const [slotsRes, photosRes, wingSlotsRes, wingPhotosRes] = await Promise.all(promises);

      const sRes = slotsRes as { success: boolean; error?: string; data?: PropertyPhotoTypeWithStatusDto[] };
      const pRes = photosRes as { success: boolean; error?: string; data?: PropertyPhotoDto[] };

      if (!sRes.success || !pRes.success) {
        const errMessage =
          (!sRes.success ? sRes.error : null) ||
          (!pRes.success ? pRes.error : null) ||
          'Failed to reload property media';
        setError(errMessage);
        return;
      }

      const fetchedSlots = [...(sRes.data || [])];
      const fetchedPhotos = [...(pRes.data || [])];

      const wSlotsRes = wingSlotsRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
      if (wSlotsRes && wSlotsRes.success && wSlotsRes.data) {
        const mappedWingSlots = wSlotsRes.data.map((ws: Record<string, unknown>) => ({
          photoTypeId: Number(ws.photoTypeId),
          photoTypeCode: String(ws.photoTypeCode || ws.photoTypeSlotCode || ''),
          photoTypeName: String(ws.photoTypeName || ws.photoTypeSlotName || ''),
          displayOrder: Number(ws.displayOrder || 0),
          hasPhoto: Boolean(ws.hasPhoto),
          photoCount: Number(ws.photoCount || 0),
          propertyPhotoId: Number(ws.wingPhotoId || ws.propertyPhotoId || 0),
          remarks: ws.remarks ? String(ws.remarks) : undefined,
          documentBindingId: ws.documentBindingId ? Number(ws.documentBindingId) : undefined,
          documentGuid: ws.documentGuid ? String(ws.documentGuid) : undefined,
          fileName: ws.fileName ? String(ws.fileName) : undefined,
          mimeType: ws.mimeType ? String(ws.mimeType) : undefined,
          viewUrl: ws.viewUrl ? String(ws.viewUrl) : undefined
        }));
        mappedWingSlots.forEach(ws => {
          const existingIdx = fetchedSlots.findIndex((s) => 
            (s.photoTypeCode && ws.photoTypeCode && s.photoTypeCode.toUpperCase() === ws.photoTypeCode.toUpperCase()) ||
            (s.photoTypeId === ws.photoTypeId && s.photoTypeCode?.toUpperCase().startsWith('WING_'))
          );
          if (existingIdx !== -1) {
            fetchedSlots[existingIdx] = { ...fetchedSlots[existingIdx], ...ws };
          } else {
            fetchedSlots.push(ws as PropertyPhotoTypeWithStatusDto);
          }
        });
      }

      const wPhotosRes = wingPhotosRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
      if (wPhotosRes && wPhotosRes.success && wPhotosRes.data) {
        const mappedWingPhotos = wPhotosRes.data.map((wp: Record<string, unknown>) => ({
          propertyPhotoId: Number(wp.wingPhotoId || wp.propertyPhotoId || 0),
          propertyId: Number(wp.wingId || wp.propertyId || 0),
          photoTypeId: Number(wp.photoTypeId || 0),
          photoTypeCode: String(wp.photoTypeCode || ''),
          photoTypeName: String(wp.photoTypeName || ''),
          displayOrder: Number(wp.displayOrder || 0),
          remarks: wp.remarks ? String(wp.remarks) : undefined,
          documentBindingId: wp.documentBindingId ? Number(wp.documentBindingId) : undefined,
          documentGuid: wp.documentGuid ? String(wp.documentGuid) : undefined,
          fileName: wp.fileName ? String(wp.fileName) : undefined,
          mimeType: wp.mimeType ? String(wp.mimeType) : undefined,
          viewUrl: wp.viewUrl ? String(wp.viewUrl) : undefined,
          downloadUrl: wp.downloadUrl ? String(wp.downloadUrl) : undefined,
          wingDetailId: wp.wingDetailId ? Number(wp.wingDetailId) : undefined,
          wingName: wp.wingName ? String(wp.wingName) : undefined,
        }));
        mappedWingPhotos.forEach(wp => {
          const existingIdx = fetchedPhotos.findIndex((p) => 
            p.propertyPhotoId === wp.propertyPhotoId && 
            (p.wingDetailId === wp.wingDetailId || (!p.wingDetailId && !wp.wingDetailId))
          );
          if (existingIdx !== -1) {
            fetchedPhotos[existingIdx] = { ...fetchedPhotos[existingIdx], ...wp };
          } else {
            fetchedPhotos.push(wp as PropertyPhotoDto);
          }
        });
      }

      setPhotoSlots(fetchedSlots);
      setPhotos(fetchedPhotos);

      propertyMediaCache.set(cacheKey, {
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
  }, [propertyId, targetWingId, cacheKey]);

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

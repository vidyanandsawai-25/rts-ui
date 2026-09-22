/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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

  invalidateProperty(propertyId?: number | string | null, societyId?: number | string | null): void {
    const keysToDelete: string[] = [];
    const propStr = propertyId ? String(propertyId) : null;
    const socStr = societyId ? String(societyId) : null;
    this.cache.forEach((_, key) => {
      if (propStr && (key === propStr || key.startsWith(`${propStr}_`))) {
        keysToDelete.push(key);
      } else if (socStr && key.endsWith(`_${socStr}`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((k) => this.cache.delete(k));
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

const isPlanPhotoItem = (item: { photoTypeCode?: string; photoTypeName?: string; photoTypeId?: number }) =>
  item.photoTypeId === 13 ||
  Boolean(item.photoTypeCode?.toUpperCase().includes('PLAN')) ||
  Boolean(item.photoTypeName?.toLowerCase().includes('plan'));


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
      photo.wingName === other?.wingName &&
      photo.societyDetailId === other?.societyDetailId
    );
  });
}

import { getPhotoSlotsAction, getPropertyPhotosAction } from '@/app/[locale]/property-tax/ptis/media-fetch.action';
import { getPropertyPhotoTypesByScopeAction } from '@/app/[locale]/property-tax/ptis/PhotoPlanType.action';
import { getWingPhotoTypesWithStatusAction, getPhotosByWingAction } from '@/app/[locale]/property-tax/ptis/WingPhoto.action';
import { getPhotosBySocietyAction, getSocietyPhotoTypesWithStatusAction } from '@/app/[locale]/property-tax/ptis/SocietyPhoto.action';
import { getViewDocumentUrl, getDownloadDocumentUrl } from '@/lib/utils/document-utils';
import { useSearchParams } from 'next/navigation';

export function usePropertyPhotosQuery(
  propertyId?: number,
  isPanelOpen?: boolean,
  isDrawerOpen?: boolean,
  initialPhotoSlots: PropertyPhotoTypeWithStatusDto[] = [],
  initialPhotos: PropertyPhotoDto[] = [],
  societyId?: number | null,
  societyPhotoFallbackGuid?: string,
  societyPhotoFallbackUrl?: string
): UsePropertyPhotosQueryResult {
  const searchParams = useSearchParams();
  const [activeWingParams, setActiveWingParams] = useState<{
    wingId: number | null;
    wingDetailId: number | null;
    societyId: number | null;
  } | null>(null);

  useEffect(() => {
    const handleParamsChange = (e: Event) => {
      const detail = (e as CustomEvent<Record<string, string | null>>).detail;
      if (!detail) return;
      const wId = detail.wingId ? Number(detail.wingId) : null;
      const wdId = detail.wingDetailId ? Number(detail.wingDetailId) : null;
      const sId = (detail.societyDetailId || detail.societyId) ? Number(detail.societyDetailId || detail.societyId) : null;
      setActiveWingParams({ wingId: wId, wingDetailId: wdId, societyId: sId });
    };
    window.addEventListener('ptis:wing-params-changed', handleParamsChange);
    return () => window.removeEventListener('ptis:wing-params-changed', handleParamsChange);
  }, []);

  const wingIdParam = (searchParams?.get('wingId') || searchParams?.get('wingid')) ? Number(searchParams.get('wingId') || searchParams.get('wingid')) : null;
  const wingDetailIdParam = (searchParams?.get('wingDetailId') || searchParams?.get('wingdetailid')) ? Number(searchParams.get('wingDetailId') || searchParams.get('wingdetailid')) : null;
  const effectiveWingDetailId = activeWingParams?.wingDetailId !== undefined ? activeWingParams.wingDetailId : wingDetailIdParam;
  const effectiveWingId = activeWingParams?.wingId !== undefined ? activeWingParams.wingId : wingIdParam;
  const targetWingId = effectiveWingDetailId && effectiveWingDetailId > 0 ? effectiveWingDetailId : effectiveWingId;

  const searchSocietyId = (searchParams?.get('societyDetailId') || searchParams?.get('societydetailid') || searchParams?.get('societyId') || searchParams?.get('societyid'))
    ? Number(searchParams.get('societyDetailId') || searchParams.get('societydetailid') || searchParams.get('societyId') || searchParams.get('societyid'))
    : null;
  const targetSocietyId = activeWingParams?.societyId !== undefined ? activeWingParams.societyId : (societyId && societyId > 0 ? societyId : searchSocietyId);

  const cacheKey = propertyId ? `${propertyId}_${targetWingId || 0}_${targetSocietyId || 0}` : '';

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

  const hasLoadedDataRef = useRef(
    Boolean(
      (propertyId && propertyMediaCache.has(cacheKey)) ||
      initialPhotoSlots?.length ||
      initialPhotos?.length
    )
  );

  useEffect(() => {
    if (photoSlots.length > 0 || photos.length > 0) {
      hasLoadedDataRef.current = true;
    }
  }, [photoSlots.length, photos.length]);

  const prevQueryPropIdRef = useRef(propertyId);
  useEffect(() => {
    if (propertyId !== prevQueryPropIdRef.current) {
      prevQueryPropIdRef.current = propertyId;
      hasLoadedDataRef.current = Boolean(
        (propertyId && propertyMediaCache.has(cacheKey)) ||
        initialPhotoSlots?.length ||
        initialPhotos?.length
      );
    }
  }, [propertyId, cacheKey, initialPhotoSlots, initialPhotos]);

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
    } else if (initialPhotoSlots.length > 0 || initialPhotos.length > 0) {
      setPhotoSlots(initialPhotoSlots);
      setPhotos((prevPhotos) => {
        const isSocietyPhoto = (p: PropertyPhotoDto) => Boolean(
          p.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
          p.photoTypeName?.toLowerCase().includes('society')
        );
        const currentSocPhotos = prevPhotos.filter(isSocietyPhoto);
        const mergedInitialPhotos = [...initialPhotos];
        currentSocPhotos.forEach(sp => {
          if (!mergedInitialPhotos.some(ip => (ip.documentGuid && ip.documentGuid === sp.documentGuid) || (ip.propertyPhotoId && ip.propertyPhotoId === sp.propertyPhotoId))) {
            mergedInitialPhotos.push(sp);
          }
        });
        return mergedInitialPhotos;
      });
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
      if (!hasLoadedDataRef.current) {
        setLoading(true);
      }
      setError(null);

      const promises: Promise<unknown>[] = [
        getPhotoSlotsAction(propertyId!),
        getPropertyPhotosAction(propertyId!),
        getPropertyPhotoTypesByScopeAction('PROPERTY'),
      ];

      if (targetWingId && targetWingId > 0) {
        promises.push(getWingPhotoTypesWithStatusAction(targetWingId));
        promises.push(getPhotosByWingAction(targetWingId));
      } else {
        promises.push(Promise.resolve({ success: true, data: [] }));
        promises.push(Promise.resolve({ success: true, data: [] }));
      }

      if (targetSocietyId && targetSocietyId > 0) {
        promises.push(getSocietyPhotoTypesWithStatusAction(targetSocietyId));
        promises.push(getPhotosBySocietyAction(targetSocietyId));
      } else {
        promises.push(Promise.resolve({ success: true, data: [] }));
        promises.push(Promise.resolve({ success: true, data: [] }));
      }

      Promise.all(promises)
        .then(([slotsRes, photosRes, propTypesRes, wingSlotsRes, wingPhotosRes, socSlotsRes, socPhotosRes]) => {
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

          // Dynamically ensure all active slots from ptis.PropertyPhotoType for PROPERTY scope exist
          const pTypesRes = propTypesRes as { success: boolean; data?: import('@/types/photoplan.types').PropertyPhotoTypeRecord[] } | undefined;
          if (pTypesRes?.success && Array.isArray(pTypesRes.data)) {
            pTypesRes.data.forEach((pt) => {
              if (pt.isActive === false) return;
              const ptCode = (pt.photoTypeCode || '').toUpperCase();
              const existingIdx = slots.findIndex(
                (s) =>
                  (s.photoTypeCode && s.photoTypeCode.toUpperCase() === ptCode) ||
                  s.photoTypeId === pt.id
              );
              if (existingIdx === -1) {
                slots.push({
                  photoTypeId: pt.id,
                  photoTypeCode: pt.photoTypeCode,
                  photoTypeName: pt.photoTypeName,
                  photoScope: pt.photoScope || 'PROPERTY',
                  displayOrder: pt.displayOrder || 1,
                  hasPhoto: false,
                  photoCount: 0,
                });
              } else {
                if (!slots[existingIdx].photoScope) {
                  slots[existingIdx].photoScope = pt.photoScope || 'PROPERTY';
                }
              }
            });
          }

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
            mappedWingPhotos.filter(wp => !isPlanPhotoItem(wp)).forEach(wp => {
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

          const sSlotsRes = socSlotsRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
          if (sSlotsRes && sSlotsRes.success && sSlotsRes.data) {
            const mappedSocSlots = sSlotsRes.data.map((ss: Record<string, unknown>) => ({
              photoTypeId: Number(ss.photoTypeId),
              photoTypeCode: String(ss.photoTypeCode || ss.photoTypeSlotCode || ''),
              photoTypeName: String(ss.photoTypeName || ss.photoTypeSlotName || ''),
              displayOrder: Number(ss.displayOrder || 0),
              hasPhoto: Boolean(ss.hasPhoto),
              photoCount: Number(ss.photoCount || 0),
              propertyPhotoId: Number(ss.societyPhotoId || ss.propertyPhotoId || 0),
              remarks: ss.remarks ? String(ss.remarks) : undefined,
              documentBindingId: ss.documentBindingId ? Number(ss.documentBindingId) : undefined,
              documentGuid: ss.documentGuid ? String(ss.documentGuid) : undefined,
              fileName: ss.fileName ? String(ss.fileName) : undefined,
              mimeType: ss.mimeType ? String(ss.mimeType) : undefined,
              viewUrl: ss.viewUrl ? String(ss.viewUrl) : undefined,
            }));
            mappedSocSlots.filter(ss => !isPlanPhotoItem(ss)).forEach(ss => {
              const existingIdx = slots.findIndex((s) => 
                (s.photoTypeCode && ss.photoTypeCode && s.photoTypeCode.toUpperCase() === ss.photoTypeCode.toUpperCase()) ||
                (s.photoTypeId === ss.photoTypeId && s.photoTypeCode?.toUpperCase().startsWith('SOCIETY_'))
              );
              if (existingIdx !== -1) {
                slots[existingIdx] = { ...slots[existingIdx], ...ss };
              } else {
                slots.push(ss as PropertyPhotoTypeWithStatusDto);
              }
            });
          }

          const sPhotosRes = socPhotosRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
          if (sPhotosRes && sPhotosRes.success && sPhotosRes.data) {
            const mappedSocPhotos = sPhotosRes.data.map((sp: Record<string, unknown>) => ({
              propertyPhotoId: Number(sp.societyPhotoId || sp.propertyPhotoId || 0),
              propertyId: Number(sp.societyId || sp.propertyId || 0),
              photoTypeId: Number(sp.photoTypeId || 0),
              photoTypeCode: String(sp.photoTypeCode || ''),
              photoTypeName: String(sp.photoTypeName || ''),
              displayOrder: Number(sp.displayOrder || 0),
              remarks: sp.remarks ? String(sp.remarks) : undefined,
              documentBindingId: sp.documentBindingId ? Number(sp.documentBindingId) : undefined,
              documentGuid: sp.documentGuid ? String(sp.documentGuid) : undefined,
              fileName: sp.fileName ? String(sp.fileName) : undefined,
              mimeType: sp.mimeType ? String(sp.mimeType) : undefined,
              viewUrl: sp.viewUrl ? String(sp.viewUrl) : undefined,
              downloadUrl: sp.downloadUrl ? String(sp.downloadUrl) : undefined,
              societyDetailId: targetSocietyId || undefined,
            }));
            mappedSocPhotos.filter(sp => !isPlanPhotoItem(sp)).forEach(sp => {
              const existingIdx = fetchedPhotos.findIndex((p) => 
                p.propertyPhotoId === sp.propertyPhotoId && 
                p.photoTypeCode?.toUpperCase() === sp.photoTypeCode?.toUpperCase()
              );
              if (existingIdx !== -1) {
                fetchedPhotos[existingIdx] = { ...fetchedPhotos[existingIdx], ...sp };
              } else {
                fetchedPhotos.push(sp as PropertyPhotoDto);
              }
            });
          }

          // Retain existing society photos across wing transitions so society photos are never lost
          const isSocietyPhoto = (p: PropertyPhotoDto) => Boolean(
            p.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
            p.photoTypeName?.toLowerCase().includes('society')
          );
          const existingSocPhotos = initialPhotos.filter(isSocietyPhoto);
          existingSocPhotos.forEach(ep => {
            const alreadyExists = fetchedPhotos.some(fp => 
              (fp.documentGuid && ep.documentGuid && fp.documentGuid === ep.documentGuid) ||
              (fp.propertyPhotoId && ep.propertyPhotoId && fp.propertyPhotoId === ep.propertyPhotoId)
            );
            if (!alreadyExists) {
              fetchedPhotos.push(ep);
            }
          });

          // Inject fallback society photo if provided and not yet in fetchedPhotos
          if (societyPhotoFallbackGuid || societyPhotoFallbackUrl) {
            const hasSoc = fetchedPhotos.some(isSocietyPhoto);
            if (!hasSoc) {
              const resolvedFallbackUrl = societyPhotoFallbackUrl || (societyPhotoFallbackGuid ? getViewDocumentUrl(societyPhotoFallbackGuid) : undefined);
              fetchedPhotos.push({
                propertyPhotoId: 0,
                propertyId: propertyId || 0,
                photoTypeId: 5,
                photoTypeCode: 'SOCIETY_PLACE',
                photoTypeName: 'Society Place Photo',
                displayOrder: 1,
                documentGuid: societyPhotoFallbackGuid,
                viewUrl: resolvedFallbackUrl,
                downloadUrl: societyPhotoFallbackGuid ? getDownloadDocumentUrl(societyPhotoFallbackGuid) : undefined,
                societyDetailId: targetSocietyId || undefined,
              });
            }
          }

          // For each society photo, mark its matching society slot as hasPhoto: true
          fetchedPhotos.filter(isSocietyPhoto).forEach((sp) => {
            const idx = slots.findIndex(
              (s) =>
                (s.photoTypeId && sp.photoTypeId && Number(s.photoTypeId) === Number(sp.photoTypeId)) ||
                (s.photoTypeCode && sp.photoTypeCode && s.photoTypeCode.toUpperCase() === sp.photoTypeCode.toUpperCase())
            );
            if (idx !== -1) {
              slots[idx] = {
                ...slots[idx],
                hasPhoto: true,
                documentGuid: sp.documentGuid || slots[idx].documentGuid,
                viewUrl: sp.viewUrl || slots[idx].viewUrl,
                propertyPhotoId: sp.propertyPhotoId || slots[idx].propertyPhotoId,
              };
            }
          });

          setPhotoSlots(slots);
          setPhotos((prevPhotos) => {
            const merged = [...fetchedPhotos];
            const prevSoc = prevPhotos.filter(isSocietyPhoto);
            prevSoc.forEach(ep => {
              const alreadyExists = merged.some(fp => 
                (fp.documentGuid && ep.documentGuid && fp.documentGuid === ep.documentGuid) ||
                (fp.propertyPhotoId && ep.propertyPhotoId && fp.propertyPhotoId === ep.propertyPhotoId)
              );
              if (!alreadyExists) {
                merged.push(ep);
              }
            });
            propertyMediaCache.set(cacheKey, {
              photoSlots: slots,
              photos: merged,
              timestamp: Date.now(),
            });
            evictOldestCacheEntry();
            return merged;
          });
        })
        .catch((err) => {
          if (isSubscribed) {
            setError(err instanceof Error ? err.message : 'Failed to load property media');
          }
        })
        .finally(() => {
          hasLoadedDataRef.current = true;
          if (isSubscribed) setLoading(false);
        });
    }

    return () => {
      isSubscribed = false;
    };
  }, [propertyId, targetWingId, targetSocietyId, isPanelOpen, isDrawerOpen, initialPhotoSlots, initialPhotos, cacheKey, societyPhotoFallbackGuid, societyPhotoFallbackUrl]);

  const refetch = useCallback(async () => {
    if (!propertyId) return;
    if (!hasLoadedDataRef.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const promises: Promise<unknown>[] = [
        getPhotoSlotsAction(propertyId),
        getPropertyPhotosAction(propertyId),
        getPropertyPhotoTypesByScopeAction('PROPERTY'),
      ];

      if (targetWingId && targetWingId > 0) {
        promises.push(getWingPhotoTypesWithStatusAction(targetWingId));
        promises.push(getPhotosByWingAction(targetWingId));
      } else {
        promises.push(Promise.resolve({ success: true, data: [] }));
        promises.push(Promise.resolve({ success: true, data: [] }));
      }

      if (targetSocietyId && targetSocietyId > 0) {
        promises.push(getSocietyPhotoTypesWithStatusAction(targetSocietyId));
        promises.push(getPhotosBySocietyAction(targetSocietyId));
      } else {
        promises.push(Promise.resolve({ success: true, data: [] }));
        promises.push(Promise.resolve({ success: true, data: [] }));
      }

      const [slotsRes, photosRes, propTypesRes, wingSlotsRes, wingPhotosRes, socSlotsRes, socPhotosRes] = await Promise.all(promises);

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

      const pTypesRes = propTypesRes as { success: boolean; data?: import('@/types/photoplan.types').PropertyPhotoTypeRecord[] } | undefined;
      if (pTypesRes?.success && Array.isArray(pTypesRes.data)) {
        pTypesRes.data.forEach((pt) => {
          if (pt.isActive === false) return;
          const ptCode = (pt.photoTypeCode || '').toUpperCase();
          const existingIdx = fetchedSlots.findIndex(
            (s) =>
              (s.photoTypeCode && s.photoTypeCode.toUpperCase() === ptCode) ||
              s.photoTypeId === pt.id
          );
          if (existingIdx === -1) {
            fetchedSlots.push({
              photoTypeId: pt.id,
              photoTypeCode: pt.photoTypeCode,
              photoTypeName: pt.photoTypeName,
              photoScope: pt.photoScope || 'PROPERTY',
              displayOrder: pt.displayOrder || 1,
              hasPhoto: false,
              photoCount: 0,
            });
          } else {
            if (!fetchedSlots[existingIdx].photoScope) {
              fetchedSlots[existingIdx].photoScope = pt.photoScope || 'PROPERTY';
            }
          }
        });
      }

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
        mappedWingPhotos.filter(wp => !isPlanPhotoItem(wp)).forEach(wp => {
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

      const sSlotsRes = socSlotsRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
      if (sSlotsRes && sSlotsRes.success && sSlotsRes.data) {
        const mappedSocSlots = sSlotsRes.data.map((ss: Record<string, unknown>) => ({
          photoTypeId: Number(ss.photoTypeId),
          photoTypeCode: String(ss.photoTypeCode || ss.photoTypeSlotCode || ''),
          photoTypeName: String(ss.photoTypeName || ss.photoTypeSlotName || ''),
          displayOrder: Number(ss.displayOrder || 0),
          hasPhoto: Boolean(ss.hasPhoto),
          photoCount: Number(ss.photoCount || 0),
          propertyPhotoId: Number(ss.societyPhotoId || ss.propertyPhotoId || 0),
          remarks: ss.remarks ? String(ss.remarks) : undefined,
          documentBindingId: ss.documentBindingId ? Number(ss.documentBindingId) : undefined,
          documentGuid: ss.documentGuid ? String(ss.documentGuid) : undefined,
          fileName: ss.fileName ? String(ss.fileName) : undefined,
          mimeType: ss.mimeType ? String(ss.mimeType) : undefined,
          viewUrl: ss.viewUrl ? String(ss.viewUrl) : undefined,
        }));
        mappedSocSlots.filter(ss => !isPlanPhotoItem(ss)).forEach(ss => {
          const existingIdx = fetchedSlots.findIndex((s) => 
            (s.photoTypeCode && ss.photoTypeCode && s.photoTypeCode.toUpperCase() === ss.photoTypeCode.toUpperCase()) ||
            (s.photoTypeId === ss.photoTypeId && s.photoTypeCode?.toUpperCase().startsWith('SOCIETY_'))
          );
          if (existingIdx !== -1) {
            fetchedSlots[existingIdx] = { ...fetchedSlots[existingIdx], ...ss };
          } else {
            fetchedSlots.push(ss as PropertyPhotoTypeWithStatusDto);
          }
        });
      }

      const sPhotosRes = socPhotosRes as { success: boolean; data?: Record<string, unknown>[] } | undefined;
      if (sPhotosRes && sPhotosRes.success && sPhotosRes.data) {
        const mappedSocPhotos = sPhotosRes.data.map((sp: Record<string, unknown>) => ({
          propertyPhotoId: Number(sp.societyPhotoId || sp.propertyPhotoId || 0),
          propertyId: Number(sp.societyId || sp.propertyId || 0),
          photoTypeId: Number(sp.photoTypeId || 0),
          photoTypeCode: String(sp.photoTypeCode || ''),
          photoTypeName: String(sp.photoTypeName || ''),
          displayOrder: Number(sp.displayOrder || 0),
          remarks: sp.remarks ? String(sp.remarks) : undefined,
          documentBindingId: sp.documentBindingId ? Number(sp.documentBindingId) : undefined,
          documentGuid: sp.documentGuid ? String(sp.documentGuid) : undefined,
          fileName: sp.fileName ? String(sp.fileName) : undefined,
          mimeType: sp.mimeType ? String(sp.mimeType) : undefined,
          viewUrl: sp.viewUrl ? String(sp.viewUrl) : undefined,
          downloadUrl: sp.downloadUrl ? String(sp.downloadUrl) : undefined,
          societyDetailId: targetSocietyId || undefined,
        }));
        mappedSocPhotos.filter(sp => !isPlanPhotoItem(sp)).forEach(sp => {
          const existingIdx = fetchedPhotos.findIndex((p) => 
            p.propertyPhotoId === sp.propertyPhotoId && 
            p.photoTypeCode?.toUpperCase() === sp.photoTypeCode?.toUpperCase()
          );
          if (existingIdx !== -1) {
            fetchedPhotos[existingIdx] = { ...fetchedPhotos[existingIdx], ...sp };
          } else {
            fetchedPhotos.push(sp as PropertyPhotoDto);
          }
        });
      }

      // Retain existing society photos across wing transitions
      const isSocietyPhoto = (p: PropertyPhotoDto) => Boolean(
        p.photoTypeCode?.toUpperCase().includes('SOCIETY') ||
        p.photoTypeName?.toLowerCase().includes('society')
      );
      const existingSocPhotos = [...photos, ...initialPhotos].filter(isSocietyPhoto);
      existingSocPhotos.forEach(ep => {
        const alreadyExists = fetchedPhotos.some(fp => 
          (fp.documentGuid && ep.documentGuid && fp.documentGuid === ep.documentGuid) ||
          (fp.propertyPhotoId && ep.propertyPhotoId && fp.propertyPhotoId === ep.propertyPhotoId)
        );
        if (!alreadyExists) {
          fetchedPhotos.push(ep);
        }
      });

      // Inject fallback society photo if provided and not yet in fetchedPhotos
      if (societyPhotoFallbackGuid || societyPhotoFallbackUrl) {
        const hasSoc = fetchedPhotos.some(isSocietyPhoto);
        if (!hasSoc) {
          const resolvedFallbackUrl = societyPhotoFallbackUrl || (societyPhotoFallbackGuid ? getViewDocumentUrl(societyPhotoFallbackGuid) : undefined);
          fetchedPhotos.push({
            propertyPhotoId: 0,
            propertyId: propertyId || 0,
            photoTypeId: 5,
            photoTypeCode: 'SOCIETY_PLACE',
            photoTypeName: 'Society Place Photo',
            displayOrder: 1,
            documentGuid: societyPhotoFallbackGuid,
            viewUrl: resolvedFallbackUrl,
            downloadUrl: societyPhotoFallbackGuid ? getDownloadDocumentUrl(societyPhotoFallbackGuid) : undefined,
            societyDetailId: targetSocietyId || undefined,
          });
        }
      }

      // For each society photo, mark its matching society slot as hasPhoto: true
      fetchedPhotos.filter(isSocietyPhoto).forEach((sp) => {
        const idx = fetchedSlots.findIndex(
          (s) =>
            (s.photoTypeId && sp.photoTypeId && Number(s.photoTypeId) === Number(sp.photoTypeId)) ||
            (s.photoTypeCode && sp.photoTypeCode && s.photoTypeCode.toUpperCase() === sp.photoTypeCode.toUpperCase())
        );
        if (idx !== -1) {
          fetchedSlots[idx] = {
            ...fetchedSlots[idx],
            hasPhoto: true,
            documentGuid: sp.documentGuid || fetchedSlots[idx].documentGuid,
            viewUrl: sp.viewUrl || fetchedSlots[idx].viewUrl,
            propertyPhotoId: sp.propertyPhotoId || fetchedSlots[idx].propertyPhotoId,
          };
        }
      });

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
      hasLoadedDataRef.current = true;
      setLoading(false);
    }
  }, [propertyId, targetWingId, targetSocietyId, cacheKey, societyPhotoFallbackGuid, societyPhotoFallbackUrl, photos, initialPhotos]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMediaUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ propertyId?: number; societyDetailId?: number; societyId?: number }>;
      const updatedPropId = customEvent.detail?.propertyId;
      const updatedSocId = customEvent.detail?.societyDetailId || customEvent.detail?.societyId;
      if (updatedPropId && propertyId && updatedPropId !== propertyId) return;

      if (propertyId) {
        propertyMediaCache.invalidateProperty(propertyId, targetSocietyId || updatedSocId);
        void refetch();
      }
    };

    window.addEventListener('ptis:media-updated', handleMediaUpdated);
    return () => window.removeEventListener('ptis:media-updated', handleMediaUpdated);
  }, [propertyId, cacheKey, targetWingId, targetSocietyId, refetch]);

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

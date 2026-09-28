'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { fetchApartmentQCTopSectionBelowFlexAction } from '@/app/[locale]/property-tax/ptis/apartment/action';
import {
  PtisStatusBadgeItem,
  buildBadgesFromPayload,
} from '@/lib/utils/ptis/ptisStatusMetrics.utils';
import {
  ApartmentQCTopSectionBelowFlexResponseDto,
  ApartmentQCTopSectionBelowFlexItemsDto,
} from '@/types/property-tax/apartment';

export interface UseApartmentStatusMetricsParams {
  propertyId?: number | string | null;
  wardId?: number | string | null;
  propertyNo?: string | null;
  partitionNo?: string | null;
  wingDetailsId?: number | string | null;
  societyId?: number | string | null;
  upic?: string | null;
  badges?: PtisStatusBadgeItem[];
  initialData?: ApartmentQCTopSectionBelowFlexResponseDto | ApartmentQCTopSectionBelowFlexItemsDto | Record<string, unknown> | null;
}

export function useApartmentStatusMetrics({
  propertyId,
  wardId,
  propertyNo,
  partitionNo,
  wingDetailsId,
  societyId,
  upic,
  badges: initialBadges,
  initialData,
}: UseApartmentStatusMetricsParams) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const parsedPropId = useMemo<number | null>(() => {
    if (propertyId === null || propertyId === undefined || propertyId === '') return null;
    const n = Number(propertyId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [propertyId]);

  const cleanWardId = wardId !== null && wardId !== undefined ? String(wardId).trim() : '';
  const cleanPropertyNo = propertyNo ? String(propertyNo).trim() : '';
  const cleanPartitionNo = partitionNo ? String(partitionNo).trim() : '';
  const cleanUpic = upic ? String(upic).trim() : '';

  const fetchKey = useMemo(() => {
    if (parsedPropId) return `prop-${parsedPropId}`;
    if (cleanWardId && cleanPropertyNo) return `ward-${cleanWardId}-prop-${cleanPropertyNo}${cleanPartitionNo ? `-part-${cleanPartitionNo}` : ''}`;
    if (cleanUpic) return `upic-${cleanUpic}`;
    return null;
  }, [parsedPropId, cleanWardId, cleanPropertyNo, cleanPartitionNo, cleanUpic]);

  const ssrBadges = useMemo<PtisStatusBadgeItem[]>(() => {
    if (initialBadges && initialBadges.length > 0) return initialBadges;
    if (initialData) return buildBadgesFromPayload(initialData);
    return [];
  }, [initialBadges, initialData]);

  const [initialKey] = useState<string | null>(fetchKey);
  const lastFetchedKeyRef = useRef<string | null>(null);

  const [fetchedBadges, setFetchedBadges] = useState<PtisStatusBadgeItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isInitialProperty = fetchKey === initialKey;
  const badges = fetchedBadges ?? (isInitialProperty ? ssrBadges : []);

  const fetchMetrics = useCallback(() => {
    if (!parsedPropId && !cleanPropertyNo && !cleanUpic) {
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchApartmentQCTopSectionBelowFlexAction({
      propertyId: parsedPropId ?? undefined,
      ward: cleanWardId || undefined,
      propertyNo: cleanPropertyNo || undefined,
      partitionNo: cleanPartitionNo || undefined,
      wingDetailsId: wingDetailsId ?? undefined,
      societyId: societyId ?? undefined,
      upic: cleanUpic || undefined,
    })
      .then((response) => {
        setIsLoading(false);
        const payloadCandidate = response?.items || response?.data || response;
        if (payloadCandidate) {
          const mappedBadges = buildBadgesFromPayload(payloadCandidate as unknown as Record<string, unknown>);
          if (mappedBadges.length > 0) {
            setFetchedBadges(mappedBadges);
            return;
          }
        }
        if (response && !response.success && response.message) {
          setError(response.message);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'Failed to fetch workflow metrics');
      });
  }, [parsedPropId, cleanWardId, cleanPropertyNo, cleanPartitionNo, cleanUpic, wingDetailsId, societyId]);

  useEffect(() => {
    if (!fetchKey) return;

    // If SSR already provided badges for the initial key on mount, keep them
    if (fetchKey === initialKey && ssrBadges.length > 0 && lastFetchedKeyRef.current === null) {
      lastFetchedKeyRef.current = fetchKey;
      return;
    }

    // Trigger auto-call if key has changed or if initial fetch was not yet done
    if (lastFetchedKeyRef.current !== fetchKey) {
      lastFetchedKeyRef.current = fetchKey;
      setFetchedBadges(null);
      fetchMetrics();
    }
  }, [fetchKey, fetchMetrics, ssrBadges.length, initialKey]);

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -250 : 250,
        behavior: 'smooth',
      });
    }
  }, []);

  return {
    badges,
    scrollContainerRef,
    handleScroll,
    isLoading,
    error,
    refetchMetrics: fetchMetrics,
  };
}

export { useApartmentStatusMetrics as usePtisStatusMetrics };

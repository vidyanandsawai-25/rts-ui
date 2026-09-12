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
  propertyId?: number | null;
  badges?: PtisStatusBadgeItem[];
  initialData?: ApartmentQCTopSectionBelowFlexResponseDto | ApartmentQCTopSectionBelowFlexItemsDto | Record<string, unknown> | null;
}

export function useApartmentStatusMetrics({
  propertyId,
  badges: initialBadges,
  initialData,
}: UseApartmentStatusMetricsParams) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const initialPropertyIdRef = useRef<number | null | undefined>(propertyId);

  const ssrBadges = useMemo<PtisStatusBadgeItem[]>(() => {
    if (initialBadges && initialBadges.length > 0) return initialBadges;
    if (initialData) return buildBadgesFromPayload(initialData);
    return [];
  }, [initialBadges, initialData]);

  const [fetchedBadges, setFetchedBadges] = useState<PtisStatusBadgeItem[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const badges = fetchedBadges ?? ssrBadges;

  const fetchMetricsForProperty = useCallback((targetPropertyId: number) => {
    setIsLoading(true);
    setError(null);

    fetchApartmentQCTopSectionBelowFlexAction(targetPropertyId)
      .then((response) => {
        setIsLoading(false);
        const items = (response?.items || response?.data) as Record<string, unknown> | null;
        const mappedBadges = buildBadgesFromPayload(items);
        setFetchedBadges(mappedBadges);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'Failed to fetch workflow metrics');
      });
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    if (propertyId === initialPropertyIdRef.current && ssrBadges.length > 0) return;
    initialPropertyIdRef.current = propertyId;
    fetchMetricsForProperty(propertyId);
  }, [propertyId, fetchMetricsForProperty, ssrBadges.length]);

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
    refetchMetrics: fetchMetricsForProperty,
  };
}

export { useApartmentStatusMetrics as usePtisStatusMetrics };

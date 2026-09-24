'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import type {
  OldFloorDetailsData,
  OldDetailsData,
  OldTaxesData,
  MappedPropertyItem,
} from '@/types/ptis.types';
import {
  getIndividualOldDetailsAction,
  getIndividualOldFloorDetailsAction,
  getIndividualOldTaxesDetailsAction,
  getIndividualMappedPropertiesAction,
} from '@/app/[locale]/property-tax/ptis/individual/action';
import type {
  UseIndividualOldDetailsTabParams,
  UseIndividualOldDetailsTabReturn,
} from './useIndividualOldDetailsTab.types';
import { runOnDemandFetch } from './old-details-fetch.utils';

export function useIndividualOldDetailsTab({
  propertyId: propPropertyId,
  showOldFloorInfo,
  setShowOldFloorInfo,
  showOldTaxInfo,
  setShowOldTaxInfo,
  showOldMapInfo,
  setShowOldMapInfo,
  oldFloorTableData = [],
  oldDetailsData,
  oldTaxesData,
  mappedPropertiesData = [],
}: UseIndividualOldDetailsTabParams): UseIndividualOldDetailsTabReturn {
  const searchParams = useSearchParams();

  const [localShowFloor, setLocalShowFloor] = useState(false);
  const [localShowTax, setLocalShowTax] = useState(false);
  const [localShowMap, setLocalShowMap] = useState(false);

  const effectiveShowFloor = showOldFloorInfo !== undefined ? showOldFloorInfo : localShowFloor;
  const effectiveShowTax = showOldTaxInfo !== undefined ? showOldTaxInfo : localShowTax;
  const effectiveShowMap = showOldMapInfo !== undefined ? showOldMapInfo : localShowMap;

  const resolvedPropertyId = useMemo(() => {
    if (propPropertyId !== undefined && propPropertyId !== null && propPropertyId !== '') {
      return propPropertyId;
    }
    return searchParams?.get('propertyId') || null;
  }, [propPropertyId, searchParams]);

  const [fetchedData, setFetchedData] = useState<{
    propId: number | string | null;
    details: OldDetailsData | null;
    floors: OldFloorDetailsData[] | null;
    taxes: OldTaxesData | null;
    mapped: MappedPropertyItem[] | null;
  }>({
    propId: null,
    details: null,
    floors: null,
    taxes: null,
    mapped: null,
  });

  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingTaxes, setIsLoadingTaxes] = useState(false);
  const [isLoadingMapped, setIsLoadingMapped] = useState(false);

  const attemptedFloorsPropRef = useRef<number | string | null>(null);
  const attemptedTaxesPropRef = useRef<number | string | null>(null);
  const attemptedMappedPropRef = useRef<number | string | null>(null);

  const isCurrentProp = fetchedData.propId === resolvedPropertyId;
  const currentDetails = (isCurrentProp ? fetchedData.details : null) ?? oldDetailsData;
  const currentFloors = (isCurrentProp ? fetchedData.floors : null) ?? oldFloorTableData;
  const currentTaxes = (isCurrentProp ? fetchedData.taxes : null) ?? oldTaxesData;
  const currentMapped = (isCurrentProp ? fetchedData.mapped : null) ?? mappedPropertiesData;

  const lastFetchedIdRef = useRef<number | string | null>(null);
  useEffect(() => {
    if (!resolvedPropertyId) return;

    const hasData = Boolean(
      currentDetails?.oldZoneName ||
      currentDetails?.oldWardNo ||
      currentDetails?.oldPropertyNo ||
      currentDetails?.oldRV ||
      currentDetails?.oldALV
    );

    if (hasData || lastFetchedIdRef.current === resolvedPropertyId) {
      if (hasData) lastFetchedIdRef.current = resolvedPropertyId;
      return;
    }

    lastFetchedIdRef.current = resolvedPropertyId;
    let isMounted = true;

    getIndividualOldDetailsAction(resolvedPropertyId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setFetchedData((prev) => ({
            ...prev,
            propId: resolvedPropertyId,
            details: res.data ?? null,
          }));
        }
      })
      .catch(() => {
        // Handled gracefully without polluting console
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedPropertyId, currentDetails]);

  const handleToggleMapDetails = useCallback(async () => {
    const nextState = !effectiveShowMap;
    setLocalShowMap(nextState);
    setShowOldMapInfo?.(nextState);
    if (nextState && currentMapped.length === 0) {
      await runOnDemandFetch(
        resolvedPropertyId,
        attemptedMappedPropRef,
        setIsLoadingMapped,
        getIndividualMappedPropertiesAction,
        (data) =>
          setFetchedData((prev) => ({
            ...prev,
            propId: resolvedPropertyId,
            mapped: data,
          })),
        'Failed to load mapped properties'
      );
    }
  }, [effectiveShowMap, setShowOldMapInfo, currentMapped.length, resolvedPropertyId]);

  const handleToggleFloorDetails = useCallback(async () => {
    const nextState = !effectiveShowFloor;
    setLocalShowFloor(nextState);
    setShowOldFloorInfo?.(nextState);
    if (nextState && currentFloors.length === 0) {
      await runOnDemandFetch(
        resolvedPropertyId,
        attemptedFloorsPropRef,
        setIsLoadingFloors,
        getIndividualOldFloorDetailsAction,
        (data) =>
          setFetchedData((prev) => ({
            ...prev,
            propId: resolvedPropertyId,
            floors: data,
          })),
        'Failed to load old floor details'
      );
    }
  }, [effectiveShowFloor, setShowOldFloorInfo, currentFloors.length, resolvedPropertyId]);

  const handleToggleOldTax = useCallback(async () => {
    const nextState = !effectiveShowTax;
    setLocalShowTax(nextState);
    setShowOldTaxInfo?.(nextState);
    if (nextState && !currentTaxes) {
      await runOnDemandFetch(
        resolvedPropertyId,
        attemptedTaxesPropRef,
        setIsLoadingTaxes,
        getIndividualOldTaxesDetailsAction,
        (data) =>
          setFetchedData((prev) => ({
            ...prev,
            propId: resolvedPropertyId,
            taxes: data,
          })),
        'Failed to load old taxes details'
      );
    }
  }, [effectiveShowTax, setShowOldTaxInfo, currentTaxes, resolvedPropertyId]);

  return {
    effectiveShowFloor,
    effectiveShowTax,
    effectiveShowMap,
    currentDetails,
    currentFloors,
    currentTaxes,
    currentMapped,
    isLoadingFloors,
    isLoadingTaxes,
    isLoadingMapped,
    handleToggleMapDetails,
    handleToggleFloorDetails,
    handleToggleOldTax,
  };
}

export * from './useIndividualOldDetailsTab.types';
export * from './old-details-fetch.utils';

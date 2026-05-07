'use client';

import { useMemo, useEffect, useRef } from 'react';
import { FloorData } from '@/types/room-details.types';
import { EditSidebarProps } from '@/types/floor-details.types';
import { LookupData } from '@/types/common-details.types';
import { normalizeFloorData } from '@/lib/utils/floorSubmission/floor-normalization';
import { getCookieValue } from '@/lib/utils/cookie';
import { ReadonlyURLSearchParams } from 'next/navigation';

export const useFloorSync = (params: {
  props: EditSidebarProps;
  isAddingNewFloor: boolean;
  setEditingFloorForm: (val: FloorData | ((prev: FloorData) => FloorData)) => void;
  localFloors: FloorData[];
  setLocalFloors: (val: FloorData[]) => void;
  setSelectedFloor: (val: FloorData | null) => void;
  updateUrlParams: (params: Record<string, string | null>) => void;
  searchParams: ReadonlyURLSearchParams;
  INITIAL_FORM_STATE: FloorData;
}) => {
  const hasSyncedRef = useRef<string | number | null>(null);
  const {
    props,
    isAddingNewFloor,
    setEditingFloorForm,
    setLocalFloors,
    setSelectedFloor,
    searchParams,
    INITIAL_FORM_STATE,
  } = params;

  const { initialFloors = [], initialFloorDetails = null, initialPropertyID } = props;

  // 1. Map Initial Floors (Derived State)
  const mappedInitialFloors = useMemo(() => {
    return initialFloors.map((f) =>
      normalizeFloorData(f as Record<string, unknown>, {
        floor: props.floorData as LookupData[],
        subFloor: props.subFloorData as LookupData[],
        construction: props.constructionTypeData as LookupData[],
        use: props.useData as LookupData[],
        subType: props.subTypeData as LookupData[],
      })
    );
  }, [initialFloors, props.floorData, props.subFloorData, props.constructionTypeData, props.useData, props.subTypeData]);

  // 2. Sync localFloors with mappedInitialFloors (useEffect)
  useEffect(() => {
    setLocalFloors(mappedInitialFloors);
  }, [mappedInitialFloors, setLocalFloors]);

  // 3. Sync initialFloorDetails with form state (useEffect)
  const currentDetailsId = useMemo(() => {
    return typeof initialFloorDetails === 'object' && initialFloorDetails !== null
      ? (initialFloorDetails as Record<string, unknown>).id as string | number | undefined
      : undefined;
  }, [initialFloorDetails]);

  useEffect(() => {
    if (initialFloorDetails) {
      if (hasSyncedRef.current !== currentDetailsId) {
      const floorDataMapped = normalizeFloorData(initialFloorDetails as Record<string, unknown>, {
        floor: props.floorData as LookupData[],
        subFloor: props.subFloorData as LookupData[],
        construction: props.constructionTypeData as LookupData[],
        use: props.useData as LookupData[],
        subType: props.subTypeData as LookupData[],
      });

      // Check for renter cookie during sync
      const renterCookie = getCookieValue('renter_data');
      if (renterCookie) {
        try {
          const renterData = JSON.parse(renterCookie);
          if (String(renterData.propertyId) === String(initialPropertyID) && String(renterData.floorId) === String(floorDataMapped.id)) {
            floorDataMapped.renter = 'Yes';
            floorDataMapped.renterMast = renterData.renterMast || [];
          }
        } catch (_e) {
          // Cookie parsing failed - silently continue with default values
        }
      }

        setEditingFloorForm(floorDataMapped);
        setSelectedFloor(floorDataMapped);
        hasSyncedRef.current = currentDetailsId ?? null;
      }
    } else if (!hasSyncedRef.current) {
      // Only reset if we haven't synced any details yet
      if (!isAddingNewFloor) {
        setEditingFloorForm(INITIAL_FORM_STATE);
        setSelectedFloor(null);
      }
    }
  }, [
    currentDetailsId, 
    initialFloorDetails, 
    isAddingNewFloor, 
    initialPropertyID, 
    props.floorData, 
    props.subFloorData, 
    props.constructionTypeData, 
    props.useData, 
    props.subTypeData, 
    setEditingFloorForm, 
    setSelectedFloor, 
    INITIAL_FORM_STATE
  ]);

  // 4. Sync URL Param Renter Cookie (useEffect Sync)
  const currentFloorIdUrl = searchParams.get('floorId');

  useEffect(() => {
    if (currentFloorIdUrl) {
      const cookieKey = `renter_${currentFloorIdUrl}`;
      const renterCookie = getCookieValue(cookieKey);
      if (renterCookie) {
        try {
          const renterData = JSON.parse(renterCookie);
          setEditingFloorForm((prev) => ({
            ...prev,
            renter: 'Yes',
            renterName: renterData.renterName || '',
            agreementFromDate: renterData.agreementDateFrom || null,
            agreementToDate: renterData.agreementDateTo || null,
            agreementDate: renterData.agreementDate || null,
            rentMonthly: renterData.rentAmount || 0,
            rentYearly: (Number(renterData.rentAmount) || 0) * 12,
            renterDetails: renterData.renterDetails || [],
            renterMast: renterData.renterMast || [],
          }));
        } catch (_e) {
          // Cookie parsing failed - silently continue with default values
        }
      }
    }
  }, [currentFloorIdUrl, setEditingFloorForm]);

  return { mappedInitialFloors };
};

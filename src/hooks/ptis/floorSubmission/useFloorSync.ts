'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { FloorData } from '@/types/room-details.types';
import { EditSidebarProps } from '@/types/floor-details.types';
import { LookupData } from '@/types/common-details.types';
import { normalizeFloorData } from '@/lib/utils/floorSubmission/floor-normalization';
import { getCookieValue } from '@/lib/utils/cookie';
import { ReadonlyURLSearchParams } from 'next/navigation';

export const useFloorSync = (params: {
  props: EditSidebarProps;
  isAddingNewFloor: boolean;
  setIsAddingNewFloor: (val: boolean) => void;
  editingFloorForm: FloorData;
  setEditingFloorForm: Dispatch<SetStateAction<FloorData>>;
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
    setIsAddingNewFloor,
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

        // Check for renter sessionStorage or cookie during sync
        let renterData: any = null;
        try {
          const sessionRenter = sessionStorage.getItem(`renter_data_${floorDataMapped.id}`);
          if (sessionRenter) {
            renterData = JSON.parse(sessionRenter);
          }
        } catch (_e) { }

        if (!renterData) {
          const renterCookie = getCookieValue('renter_data');
          if (renterCookie) {
            try {
              const parsed = JSON.parse(renterCookie);
              if (String(parsed.propertyId) === String(initialPropertyID) && String(parsed.floorId) === String(floorDataMapped.id)) {
                renterData = parsed;
              }
            } catch (_e) { }
          }
        }

        // Check if there is an in-progress saved form in sessionStorage for this floor
        let savedForm: any = null;
        try {
          const sessionForm = sessionStorage.getItem('editingFloorForm');
          if (sessionForm) {
            const parsed = JSON.parse(sessionForm);
            if (String(parsed.id) === String(floorDataMapped.id)) {
              savedForm = parsed;
              sessionStorage.removeItem('editingFloorForm'); // Clear immediately so it does not persist across page reloads
            }
          }
        } catch (_e) { }

        let finalForm = savedForm ? { ...savedForm } : { ...floorDataMapped };

        if (renterData) {
          const mergedRenterFields = {
            renter: 'Yes',
            renterName: renterData.renterName || renterData.renterNameEnglish || finalForm.renterName || '',
            agreementFromDate: renterData.agreementDateFrom || renterData.agreementFromDate || finalForm.agreementFromDate || null,
            agreementToDate: renterData.agreementDateTo || renterData.agreementToDate || finalForm.agreementToDate || null,
            agreementDate: renterData.agreementDate || finalForm.agreementDate || null,
            rentMonthly: renterData.rentAmount || renterData.rentMonthly || finalForm.rentMonthly || 0,
            rentYearly: (Number(renterData.rentAmount || renterData.rentMonthly) || 0) * 12,
            renterDetails: renterData.renterDetails || finalForm.renterDetails || [],
            renterMast: renterData.renterMast || finalForm.renterMast || [],
          };
          finalForm = {
            ...finalForm,
            ...mergedRenterFields,
          };
        }

        setEditingFloorForm(finalForm);
        setSelectedFloor(finalForm);
        hasSyncedRef.current = currentDetailsId ?? null;
      }
    } else {
      hasSyncedRef.current = null;
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
    INITIAL_FORM_STATE,
  ]);

  // Real-time autosave disabled to prevent unsaved changes from persisting across manual browser refreshes

  // 4. Sync URL Param Renter Cookie (useEffect Sync)
  const currentFloorIdUrl = searchParams.get('floorId');
  const currentDrawerUrl = searchParams.get('drawer');

  useEffect(() => {
    if (currentFloorIdUrl === 'new' || currentDrawerUrl === 'add') {
      setIsAddingNewFloor(true);
      setSelectedFloor(null);

      let savedForm: any = null;
      try {
        const sessionForm = sessionStorage.getItem('editingFloorForm');
        if (sessionForm) {
          const parsed = JSON.parse(sessionForm);
          if (!parsed.id || parsed.id === 'new') {
            savedForm = parsed;
            sessionStorage.removeItem('editingFloorForm'); // Clear immediately
          }
        }
      } catch (_e) { }

      let renterData: any = null;
      try {
        const sessionRenter = sessionStorage.getItem('renter_data_new');
        if (sessionRenter) {
          renterData = JSON.parse(sessionRenter);
        }
      } catch (_e) { }

      let finalForm = savedForm ? { ...savedForm } : null;

      if (renterData) {
        const mergedRenterFields = {
          renter: 'Yes',
          renterName: renterData.renterName || renterData.renterNameEnglish || (finalForm?.renterName || ''),
          agreementFromDate: renterData.agreementDateFrom || renterData.agreementFromDate || (finalForm?.agreementFromDate || null),
          agreementToDate: renterData.agreementDateTo || renterData.agreementToDate || (finalForm?.agreementToDate || null),
          agreementDate: renterData.agreementDate || (finalForm?.agreementDate || null),
          rentMonthly: renterData.rentAmount || renterData.rentMonthly || (finalForm?.rentMonthly || 0),
          rentYearly: (Number(renterData.rentAmount || renterData.rentMonthly) || 0) * 12,
          renterDetails: renterData.renterDetails || (finalForm?.renterDetails || []),
          renterMast: renterData.renterMast || (finalForm?.renterMast || []),
        };

        if (finalForm) {
          finalForm = {
            ...finalForm,
            ...mergedRenterFields,
          };
        } else {
          finalForm = {
            ...renterData,
            ...mergedRenterFields,
          };
        }
      }

      if (finalForm) {
        setEditingFloorForm((prev) => ({
          ...prev,
          ...finalForm,
          id: undefined, // It's a new floor, keep id undefined
        }));
      }
    } else if (currentFloorIdUrl && currentFloorIdUrl !== 'new' && !isAddingNewFloor) {
      let renterData: any = null;
      try {
        const sessionRenter = sessionStorage.getItem(`renter_data_${currentFloorIdUrl}`);
        if (sessionRenter) {
          renterData = JSON.parse(sessionRenter);
        }
      } catch (_e) { }

      if (!renterData) {
        const cookieKey = `renter_${currentFloorIdUrl}`;
        const renterCookie = getCookieValue(cookieKey);
        if (renterCookie) {
          try {
            renterData = JSON.parse(renterCookie);
          } catch (_e) { }
        }
      }

      // Check if there is an in-progress saved form in sessionStorage for this floor
      let savedForm: any = null;
      try {
        const sessionForm = sessionStorage.getItem('editingFloorForm');
        if (sessionForm) {
          const parsed = JSON.parse(sessionForm);
          if (String(parsed.id) === String(currentFloorIdUrl)) {
            savedForm = parsed;
            sessionStorage.removeItem('editingFloorForm'); // Clear immediately
          }
        }
      } catch (_e) { }

      let finalForm = savedForm ? { ...savedForm } : null;

      if (renterData) {
        const mergedRenterFields = {
          renter: 'Yes',
          renterName: renterData.renterName || renterData.renterNameEnglish || (finalForm?.renterName || ''),
          agreementFromDate: renterData.agreementDateFrom || renterData.agreementFromDate || (finalForm?.agreementFromDate || null),
          agreementToDate: renterData.agreementDateTo || renterData.agreementToDate || (finalForm?.agreementToDate || null),
          agreementDate: renterData.agreementDate || (finalForm?.agreementDate || null),
          rentMonthly: renterData.rentAmount || renterData.rentMonthly || (finalForm?.rentMonthly || 0),
          rentYearly: (Number(renterData.rentAmount || renterData.rentMonthly) || 0) * 12,
          renterDetails: renterData.renterDetails || (finalForm?.renterDetails || []),
          renterMast: renterData.renterMast || (finalForm?.renterMast || []),
        };

        if (finalForm) {
          finalForm = {
            ...finalForm,
            ...mergedRenterFields,
          };
        } else {
          finalForm = {
            ...renterData,
            ...mergedRenterFields,
            id: renterData.id || renterData.propertyDetailsId || currentFloorIdUrl,
          };
        }
      }

      if (finalForm) {
        setEditingFloorForm((prev) => ({
          ...prev,
          ...finalForm,
        }));
        setSelectedFloor(finalForm);
      }
    }
  }, [currentFloorIdUrl, currentDrawerUrl, isAddingNewFloor, setEditingFloorForm, setSelectedFloor, setIsAddingNewFloor]);

  return { mappedInitialFloors };
};

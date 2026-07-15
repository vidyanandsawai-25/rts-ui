/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
'use client';

import { useCallback, useRef, useState } from 'react';
import { type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { toast } from 'sonner';
import { FloorData } from '@/types/room-details.types';
import { FloorSubmissionPayload, EditSidebarProps } from '@/types/floor-details.types';
import { LookupData } from '@/types/common-details.types';
import { ConfirmOptions } from '@/components/common';
import { mapFormToPayload } from '@/lib/utils/floorSubmission/floor-mappers';
import { createOptimisticFloor, getOptimisticFloorsList, parseServerError } from '@/lib/utils/floorSubmission/floor-optimistic.utils';
import { submitFloorSubmissionNoRedirectAction, updateFloorSubmissionNoRedirectAction, } from '@/app/[locale]/property-tax/ptis/QuickDataEntry/[propertyId]/FloorSubmission/actions';
import { useFloorDeletion } from './useFloorDeletion';
import { isPlotCategory as checkIsPlotCategory } from '@/lib/utils/ptis/category-helpers';

// Use deletion hook

export const useFloorDataHandlers = (params: {
  props: EditSidebarProps;
  editingFloorForm: FloorData;
  selectedFloor: FloorData | null;
  isAddingNewFloor: boolean;
  setIsAddingNewFloor: (val: boolean) => void;
  setSelectedFloor: (val: FloorData | null) => void;
  setEditingFloorForm: (val: FloorData) => void;
  localFloors: FloorData[];
  setLocalFloors: (val: FloorData[]) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  validateForm: () => boolean;
  startTransition: React.TransitionStartFunction;
  router: AppRouterInstance;
  locale: string;
  propertyId: string;
  confirm: (payload: ConfirmOptions) => void;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  INITIAL_FORM_STATE: FloorData;
  selectedFloorType?: 'Construction' | 'OpenPlot';
  // Area validation fields
  isOpenSpaceAreaExceeded?: boolean;
  isFloorAreaExceeded?: boolean;
  availableRemainingOpenSpaceAreaSqM?: number;
  availableRemainingConstructionAreaSqM?: number;
  isGroundFloorAreaExceeded?: boolean;
  isOpenSpaceNegative?: boolean;
}) => {
  const {
    props, editingFloorForm, selectedFloor, isAddingNewFloor,
    setIsAddingNewFloor, setSelectedFloor, setEditingFloorForm, localFloors, setLocalFloors, setFormErrors,
    startTransition,
    router, locale, propertyId, confirm, t, INITIAL_FORM_STATE, selectedFloorType,
    isOpenSpaceAreaExceeded = false,
    isFloorAreaExceeded = false,
    availableRemainingOpenSpaceAreaSqM = 0,
    availableRemainingConstructionAreaSqM = 0,
    isGroundFloorAreaExceeded = false,
    isOpenSpaceNegative = false
  } = params;

  const { floorData: floorLookup, constructionTypeData: constructionLookup, useData: useLookup, subFloorData: subFloorLookup, subTypeData } = props;

  // Separate loading states
  const [isSaving, setIsSaving] = useState(false);
  const isSavingRef = useRef(false);

  // Use deletion hook
  const { handleDeleteFloor, isDeleting } = useFloorDeletion({
    localFloors,
    setLocalFloors,
    setSelectedFloor,
    setEditingFloorForm,
    router,
    startTransition,
    locale,
    propertyId,
    confirm,
    t,
    INITIAL_FORM_STATE,
  });

  const handleSave = useCallback(async () => {
    if (isSavingRef.current) return;

    if (selectedFloorType === 'OpenPlot' && isOpenSpaceAreaExceeded) {
      toast.error(t('floor.openSpaceAreaExceeded', { area: parseFloat(Number(availableRemainingOpenSpaceAreaSqM || 0).toFixed(2)) }), { duration: 6000 });
      return;
    }

    if (selectedFloorType === 'Construction' && isFloorAreaExceeded) {
      toast.error(t('floor.floorAreaExceeded', { area: parseFloat(Number(availableRemainingConstructionAreaSqM || 0).toFixed(2)) }), { duration: 6000 });
      return;
    }

    if (!selectedFloorType && isGroundFloorAreaExceeded) {
      toast.error(t('floor.groundFloorAreaExceeded'), { duration: 6000 });
      return;
    }

    if (isOpenSpaceNegative) {
      toast.error(t('floor.openSpaceNegative'), { duration: 6000 });
      return;
    }

    const enteredRooms = parseInt(String(editingFloorForm.rooms || editingFloorForm.noOfRooms || 0), 10);
    const roomDetailsCount = Array.isArray(editingFloorForm.roomWiseSubmissionDetails)
      ? editingFloorForm.roomWiseSubmissionDetails.length
      : 0;

    if (enteredRooms > 0 && roomDetailsCount > 0 && enteredRooms !== roomDetailsCount) {
      setFormErrors((prev) => ({
        ...prev,
        rooms: t('floor.errors.roomCountMismatch') || `Expected details for ${enteredRooms} rooms, but found ${roomDetailsCount}. Please update room details.`
      }));
      toast.error(t('floor.errors.roomCountMismatch') || `Expected details for ${enteredRooms} rooms, but found ${roomDetailsCount}. Please update room details.`);
      return;
    }

    if (selectedFloorType === 'OpenPlot') {
      const openPlotCon = constructionLookup?.find(
        (c: any) =>
          String(c.constructionCode || '').toLowerCase() === 'op' ||
          String(c.description || '').toLowerCase() === 'open plot'
      );
      if (!openPlotCon) {
        setFormErrors((prev) => ({
          ...prev,
          constructionTypeId: t('floor.errors.openPlotConstructionTypeNotFound') || 'Construction Type for Open Plot not found in master data'
        }));
        toast.error(t('floor.errors.openPlotConstructionTypeNotFound') || 'Construction Type for Open Plot (op) not found in master data.');
        return;
      }
    }

    confirm({
      variant: isAddingNewFloor ? 'add' : 'update',
      title: isAddingNewFloor ? t('floor.addConfirmTitle') : t('floor.updateConfirmTitle'),
      description: isAddingNewFloor ? t('floor.addConfirmText') : t('floor.updateConfirmText'),
      confirmText: isAddingNewFloor ? t('floor.addConfirmButton') : t('floor.updateConfirmButton'),
      onConfirm: async () => {

        isSavingRef.current = true;
        setIsSaving(true);
        const previousFloors = [...localFloors];
        try {
          const isPlotCategory = checkIsPlotCategory(props.initialPropertyData?.categoryName as string);
          const payload: FloorSubmissionPayload = mapFormToPayload({
            formData: editingFloorForm,
            floorLookup: floorLookup as LookupData[],
            subFloorLookup: subFloorLookup as LookupData[],
            constructionLookup: constructionLookup as LookupData[],
            useLookup: useLookup as LookupData[],
            subTypeLookup: (subTypeData as LookupData[]) || [],
            propertyId: Number(props.initialPropertyID || 0),
            isAddingNew: isAddingNewFloor,
            existingFloorId: selectedFloor?.id,
            selectedFloorType: selectedFloorType,
            isPlotCategory: isPlotCategory,
          });

          // Optimistic Update
          const optimisticFloor = createOptimisticFloor(editingFloorForm, isAddingNewFloor, selectedFloor?.id);
          setLocalFloors(getOptimisticFloorsList(localFloors, optimisticFloor, isAddingNewFloor));

          const response = isAddingNewFloor
            ? await submitFloorSubmissionNoRedirectAction(payload, locale, propertyId)
            : await updateFloorSubmissionNoRedirectAction(Number(selectedFloor?.id || 0), payload, locale, propertyId);

          if (!response.success) {
            setLocalFloors(previousFloors);
            throw new Error(parseServerError(response.error, t));
          }

          // Clear session storage for saved floor
          try {
            const savedFloorId = selectedFloor?.id || 'new';
            sessionStorage.removeItem(`renter_data_${savedFloorId}`);
            sessionStorage.removeItem('renter_data_new');
            sessionStorage.removeItem('editingFloorForm');
          } catch (_e) { }

          if (isAddingNewFloor) {
            setIsAddingNewFloor(false);
            setSelectedFloor(null);
            setEditingFloorForm(INITIAL_FORM_STATE);
          } else {
            setSelectedFloor(null);
            setEditingFloorForm(INITIAL_FORM_STATE);
          }
          toast.success(t(isAddingNewFloor ? 'floor.floorAddedSuccess' : 'floor.floorUpdatedSuccess'));

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('floorSaved'));
          }

          startTransition(() => {
            router.refresh();
            if (typeof window !== 'undefined') {
              try {
                const url = new URL(window.location.href);
                url.searchParams.delete('floorId');
                url.searchParams.delete('drawer');
                router.replace(url.pathname + url.search);
              } catch (_e) {
                // Safe fallback for mock test environments (like JSDOM/Vitest)
                router.replace(window.location.pathname || '/');
              }
            }
          });
        } catch (error: unknown) {
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
          setLocalFloors(previousFloors);
          toast.error(error instanceof Error ? error.message : t('floor.unexpectedError'));
        } finally {
          isSavingRef.current = false;
          setIsSaving(false);
        }
      },
    });
  }, [isAddingNewFloor, editingFloorForm, selectedFloor, props.initialPropertyID, floorLookup, subFloorLookup, constructionLookup, useLookup, subTypeData, router, t, confirm, INITIAL_FORM_STATE, setIsAddingNewFloor, setSelectedFloor, setEditingFloorForm, startTransition, localFloors, setLocalFloors, locale, propertyId, setFormErrors, selectedFloorType]);

  const handleOpenRenterManagement = useCallback(async (formToUse?: FloorData) => {
    const currentForm = formToUse || editingFloorForm;
    if (!currentForm.floor) {
      setFormErrors((prev) => ({ ...prev, floor: t('floor.selectFloorFirst') }));
      toast.error(t('floor.selectFloorFirst'));
      return;
    }

    try {
      sessionStorage.setItem('editingFloorForm', JSON.stringify(currentForm));
    } catch {
      // Session staging is best-effort before navigating to renter screen.
    }

    const floorIdParam = currentForm.id ? String(currentForm.id) : 'new';
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    params.set('floorId', floorIdParam);
    const renterManagementUrl = `/${locale}/property-tax/ptis/QuickDataEntry/${propertyId}/FloorSubmission/Renter?${params.toString()}`;
    router.push(renterManagementUrl);
  }, [editingFloorForm, t, setFormErrors, router, locale, propertyId]);

  return {
    handleSave,
    handleDeleteFloor,
    handleOpenRenterManagement,
    isSaving,
    isDeleting,
  };
};
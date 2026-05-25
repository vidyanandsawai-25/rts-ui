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
  t: (key: string) => string;
  INITIAL_FORM_STATE: FloorData;
}) => {
  const {
    props, editingFloorForm, selectedFloor, isAddingNewFloor,
    setIsAddingNewFloor, setSelectedFloor, setEditingFloorForm, localFloors, setLocalFloors, setFormErrors,
    startTransition,
    router, locale, propertyId, confirm, t, INITIAL_FORM_STATE
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
          }
          toast.success(t(isAddingNewFloor ? 'floor.floorAddedSuccess' : 'floor.floorUpdatedSuccess'));
          startTransition(() => { router.refresh(); });
        } catch (error: unknown) {
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
          setLocalFloors(previousFloors);
          toast.error(error instanceof Error ? error.message : 'An unexpected error occurred.');
        } finally {
          isSavingRef.current = false;
          setIsSaving(false);
        }
      },
    });
  }, [isAddingNewFloor, editingFloorForm, selectedFloor, props.initialPropertyID, floorLookup, subFloorLookup, constructionLookup, useLookup, subTypeData, router, t, confirm, INITIAL_FORM_STATE, setIsAddingNewFloor, setSelectedFloor, setEditingFloorForm, startTransition, localFloors, setLocalFloors, locale, propertyId, setFormErrors]);

  const handleOpenRenterManagement = useCallback(async (formToUse?: FloorData) => {
    const currentForm = formToUse || editingFloorForm;
    if (!currentForm.floor) {
      setFormErrors((prev) => ({ ...prev, floor: t('floor.selectFloorFirst') }));
      toast.error(t('floor.selectFloorFirst'));
      return;
    }

    try {
      sessionStorage.setItem('editingFloorForm', JSON.stringify(currentForm));
    } catch (e) {
      console.warn("Failed to save floor state", e);
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

